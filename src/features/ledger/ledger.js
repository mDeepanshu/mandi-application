import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { getLedger } from '../../gateway/ledger-apis';
import SharedTable from "../../shared/ui/table";

import styles from "./ledger.module.css";

function Ledger() {

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState(["INDEX","PARTY NAME","OPENING AMOUNT","DAY BILL","CLOSING AMOUNT"]);
  const [keyArray, setKeyArray] = useState(["index","partyName","openingAmount","dayBill","closingAmount"]);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const fetch_ledger = async (data) => {
    const { fromDate, toDate } = data;
    getLedgerData(fromDate, toDate);
  }

  const getLedgerData = async (fromDate, toDate = null) => {
    console.log(fromDate, toDate);
    let data;
    if (toDate) {
      data = {
        startDate: fromDate,
        endDate: toDate,
      }
    } else data = { startDate: fromDate }

    const ledger = await getLedger(data);
    if (ledger) {
      console.log(ledger);
      setTableData(ledger.responseBody);
    }

  }

  useEffect(() => {
    const init = async () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      const ledgerData = await getLedgerData(formattedDate);
      console.log(ledgerData);
    };

    init();
  }, []);

  const printLedger = () => {
    console.log("Hey Print");
    
  }

  return (
    <>
      <div className={styles.container}>
        <h1>LEDGER</h1>
        <form className={styles.dateFields} onSubmit={handleSubmit(fetch_ledger)}>
          <div className={styles.date}>
            FROM: <input type='date'{...register('fromDate', { required: 'From date is required' })} /><br />
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div className={styles.date}>TO: <input type='date'  {...register('toDate')} /></div>
          <div>
            <Button variant="contained" color="success" type='submit' >Fetch Ledger</Button>
            <Button variant="contained" color="success" onClick={()=> printLedger()} className={styles.printBtn}>PRINT LEDGER</Button>
          </div>
        </form>
        <SharedTable columns={ledgerColumns} tableData={tableData} keyArray={keyArray}/>
      </div>
    </>
  );
}

export default Ledger;
