import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { getLedger } from '../../gateway/ledger-apis';
import MasterTable from "../../shared/ui/master-table/master-table";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import ReactToPrint from 'react-to-print';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import styles from "./ledger.module.css";
import { getAllPartyList } from "../../gateway/comman-apis";

function Ledger() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState(["INDEX", "DATE", "ITEM NAME", "CREDIT", "DEBIT"]);
  const [keyArray, setKeyArray] = useState(["index", "date", "itemName", "cr", "dr"]);
  const [vyapariList, setVyapariList] = useState([]);

  const { register, control, handleSubmit, formState: { errors }, getValues } = useForm();

  const fetch_ledger = async (data) => {
    const { fromDate, toDate } = data;
    getLedgerData(data.vyapari_id.partyId, fromDate, toDate);

  }

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  }

  const getLedgerData = async (vyapari_id, fromDate, toDate) => {
    const ledger = await getLedger(vyapari_id, fromDate, toDate);
    if (ledger) {
      setTableData(ledger.responseBody?.transactions);
    }

  }

  useEffect(() => {
    const init = async () => {
      getVyapariNames();
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      const ledgerData = await getLedgerData(formattedDate);
    };

    init();
  }, []);

  const printLedger = () => {
    triggerRef.current.click();
  }

  return (
    <>
      <div className={styles.container}>
        <h1>LEDGER</h1>
        <form className={styles.dateFields} onSubmit={handleSubmit(fetch_ledger)}>
          <div className={styles.vyapariName}>
            <div>
              <Controller
                name="vyapari_id"
                control={control}
                rules={{ required: "Enter Patry Name" }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={vyapariList}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.partyId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vyapari Name"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    onChange={(event, value) => field.onChange(value)}
                    disablePortal
                    id="combo-box-demo"
                  />
                )}
              />
              <p className='err-msg'>{errors.vyapari_id?.message}</p>
            </div>
          </div>
          <div className={styles.date}>
          <div>FROM: <input type='date'{...register('fromDate', { required: 'From date is required' })} /></div><br />
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div className={styles.date}>
            <div>TO: <input type='date'  {...register('toDate', { required: 'To date is required' })} /></div><br />
            {errors.fromDate && <span className="error">{errors.toDate.message}</span>}
          </div>
          <div>
            <Button variant="contained" color="success" type='submit' >FETCH LEDGER</Button>&nbsp;
            <Button variant="contained" color="success" onClick={() => printLedger()} className={styles.print_btn}>PRINT LEDGER</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </div>
        </form>
        <MasterTable columns={ledgerColumns} tableData={tableData} keyArray={keyArray} />
      </div>
      <div style={{ display: 'none' }}>
        <LedgerPrint ref={componentRef} tableData={tableData} formData={getValues()} />
      </div>
    </>
  );
}

export default Ledger;
