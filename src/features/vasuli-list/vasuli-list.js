import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { getVasuliList } from '../../gateway/vasuli-list-api';
import MasterTable from "../../shared/ui/master-table/master-table";
import ReactToPrint from 'react-to-print';
import styles from "./vasuli-list.module.css";

function VasuliList() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [vasuliListColumns, setVasuliListColumns] = useState(["INDEX", "AMOUNT", "DATE","NAME", "REMARK"]);
  const [keyArray, setKeyArray] = useState(["index","amount" ,"date", "vyapariName", "remark"]);
  const [vasuliList, setVasuliList] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

  const { register, control, handleSubmit, formState: { errors }, getValues, trigger, setValue } = useForm({
    defaultValues: {
      toDate: currentDate, // Set the default value to current date
      fromDate: currentDate, // Default to 2 days prior date
    },
  });

  const fetch_vasuliList = async (data) => {
    const isValid = await trigger(); // Validates all fields
    if (isValid) {
      getVasulies();
    } else {
      console.log('Validation failed');
    }
  }

  const getVasulies = async() => {
    const { fromDate, toDate } = getValues();
    const vasuliList = await getVasuliList(fromDate, toDate);
    if (vasuliList) {
      setTableData(vasuliList.responseBody);
    }
  }

  const printLedger = () => {
    triggerRef.current.click();
  }

  return (
    <>
      <div className={styles.container}>
        <h1>VASULI LIST</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.dateFields}>
            <div className={styles.date}>
              <Controller
                name="fromDate"
                control={control}
                rules={{ required: "Enter From Date" }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="FROM DATE"
                    variant="outlined"
                    type='date'
                  />
                )}
              />
              <p className="error">{errors.fromDate?.message}</p>
            </div>
            <div className={styles.date}>
              <Controller
                name="toDate"
                control={control}
                rules={{ required: "Enter To Date" }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="TO DATE"
                    variant="outlined"
                    type='date'
                  />
                )}
              />
              <p className="error">{errors.toDate?.message}</p>
            </div>
          </div>
          <div>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_vasuliList(getValues())} >FETCH</Button>&nbsp;
            {/* <Button variant="contained" color="success" type='button' onClick={() => printLedger()} className={styles.print_btn}>PRINT LEDGER</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            /> */}
          </div>
        </form>
        <MasterTable columns={vasuliListColumns} tableData={tableData} keyArray={keyArray} />
      </div>
      <div style={{ display: 'none' }}>
        {/* <LedgerPrint ref={componentRef} tableData={tableData} formData={getValues()} /> */}
      </div>
    </>
  );
}

export default VasuliList;
