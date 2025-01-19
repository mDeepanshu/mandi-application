import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { getVasuliList, editVasuli } from '../../gateway/vasuli-list-api';
import MasterTable from "../../shared/ui/master-table/master-table";
import ReactToPrint from 'react-to-print';
import styles from "./vasuli-list.module.css";
import { useOutletContext } from 'react-router-dom';

function VasuliList() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [vasuliListColumns, setVasuliListColumns] = useState(["INDEX", "AMOUNT", "DATE", "NAME", "REMARK", "EDIT"]);
  const [keyArray, setKeyArray] = useState(["index", "amount", "date", "vyapariName", "remark", "edit"]);
  const [vasuliList, setVasuliList] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0];
  const [vasuliTotal, setVasuliTotal] = useState([]);
  const { snackbarChange } = useOutletContext();

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

  const getVasulies = async () => {
    const { fromDate, toDate } = getValues();
    const vasuliList = await getVasuliList(fromDate, toDate);
    if (vasuliList) {
      setTableData(vasuliList.responseBody?.vasuliList);
      setVasuliTotal(vasuliList.responseBody?.totalVasuli);
    } else {
      setTableData([]);
      setVasuliTotal(`NA`);
    }
  }

  const printLedger = () => {
    triggerRef.current.click();
  }

  const editEntry = async (editingIndex, finalEdit) => {
    console.log(tableData[editingIndex],finalEdit);
    
    const editObject = {
      ...tableData[editingIndex],
      ...finalEdit,
    }
    const editRes = await editVasuli(editObject);
    if (editRes) {
      getVasulies();
      snackbarChange({
        open: true,
        alertType: "success",
        alertMsg: "EDIT SUCCESS"
      });
    }

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
          <div className={styles.btns}>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_vasuliList(getValues())} >FETCH</Button>&nbsp;
            {/* <Button variant="contained" color="success" type='button' onClick={() => printLedger()} className={styles.print_btn}>PRINT LEDGER</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            /> */}
            <div>
              <b>VASULI TOTAL:</b> {vasuliTotal}
            </div>
          </div>
        </form>
        <MasterTable columns={vasuliListColumns} tableData={tableData} keyArray={keyArray} editEntry={(editingIndex, finalEdit) => editEntry(editingIndex, finalEdit)} />
      </div>
      <div style={{ display: 'none' }}>
        {/* <LedgerPrint ref={componentRef} tableData={tableData} formData={getValues()} /> */}
      </div>
    </>
  );
}

export default VasuliList;
