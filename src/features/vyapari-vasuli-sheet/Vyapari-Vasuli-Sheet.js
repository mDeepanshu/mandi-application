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
  const [totals, setTotals] = useState({
    openingAmountSum: 0,
    closingAmountSum: 0,
    daybill: 0,
  });


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
    let dayBillTotal=0;
    ledger?.responseBody?.vasuliList?.forEach(element => {
      let total = element.dayBill
        .split(",")
        .map(Number)
        .reduce((sum, num) => sum + num, 0);
      element.ttl = total;
      dayBillTotal+=total;
    });
    setTotals({
      openingAmountSum:ledger?.responseBody?.openingAmountSum,
      daybill:dayBillTotal,
      closingAmountSum:ledger?.responseBody?.closingAmountSum
    });
    if (ledger) {
      setTableData(ledger?.responseBody?.vasuliList);
    }

  }

  useEffect(() => {
    const init = async () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      getLedgerData(formattedDate);
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
          <div>OPENING TOTAL:{totals.openingAmountSum}</div>
          <div>DAY TOTAL:{totals.daybill}</div>
          <div>CLOSING TOTAL:{totals.closingAmountSum}</div>
        </div>
        <MasterTable columns={ledgerColumns} tableData={tableData} keyArray={keyArray} />
      </div>
      <div style={{ display: 'none' }}>
        <VyapariVasuliPrint ref={componentRef} tableData={tableData} formData={{...getValues(),...totals}} />
      </div>
    </>
  );
}

export default VyapariVasuliSheet;
