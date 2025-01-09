import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import ReactToPrint from 'react-to-print';

import { getVyapariVasuliSheet } from '../../gateway/vyapari-vasuli-sheet-apis';
import MasterTable from "../../shared/ui/master-table/master-table";
import VyapariVasuliPrint from "../../dialogs/vyapari-vasuli-print/vyapari-vasuli-print";

import styles from "./vyapari-vasuli-sheet.module.css";

function VyapariVasuliSheet() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState(["INDEX", "PARTY NAME", "OPENING AMOUNT", "DAY BILL", "TTL", "CLOSING AMOUNT"]);
  const [keyArray, setKeyArray] = useState(["index", "partyName", "openingAmount", "dayBill", "ttl", "closingAmount"]);

  const { register, formState: { errors }, getValues } = useForm();

  const fetch_vasuli_sheet = async (data) => {
    const { fromDate, toDate } = data;
    getLedgerData(fromDate, toDate);
  }


  const getLedgerData = async (fromDate, toDate = null) => {
    let data;
    if (toDate) {
      data = {
        startDate: fromDate,
        endDate: toDate,
      }
    } else data = { startDate: fromDate }

    const ledger = await getVyapariVasuliSheet(data);
    ledger.responseBody.forEach(element => {
      const total = element.dayBill
        .split(",")
        .map(Number)
        .reduce((sum, num) => sum + num, 0);
      element.ttl = total;
      // element.dayBill=element.dayBill.split(",").map(String);
    });

    if (ledger) {
      setTableData(ledger.responseBody);
    }

  }

  useEffect(() => {
    const init = async () => {
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
        <h1>VASULI SHEET</h1>
        <form className={styles.dateFields} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.date}>
            DATE: <input type='date'{...register('fromDate', { required: 'From date is required' })} /><br />
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_vasuli_sheet(getValues())}  >Fetch Vasuli Sheet</Button>&nbsp;
            <Button variant="contained" color="success" type="button" onClick={() => printLedger()} className={styles.print_btn}>PRINT VASULI SHEET</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </div>
        </form>
        <div className={styles.totals}>
          <div>OPENING TOTAL:</div>
          <div>DAY TOTAL:</div>
          <div>CLOSING TOTAL:</div>
        </div>
        <MasterTable columns={ledgerColumns} tableData={tableData} keyArray={keyArray} />
      </div>
      <div style={{ display: 'none' }}>
        <VyapariVasuliPrint ref={componentRef} tableData={tableData} formData={getValues()} />
      </div>
    </>
  );
}

export default VyapariVasuliSheet;
