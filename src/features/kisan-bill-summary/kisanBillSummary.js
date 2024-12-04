import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { kisanBillSummary } from '../../gateway/kisan-bill-apis';
import MasterTable from "../../shared/ui/master-table/master-table";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import ReactToPrint from 'react-to-print';

import styles from "./kisan-bill-summary.module.css";

function KisanBillSummary() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [apiResponse, setResponseData] = useState();
  // const [ledgerColumns, setledgerColumns] = useState(["INDEX", "PARTY NAME", "OPENING AMOUNT", "DAY BILL", "CLOSING AMOUNT"]);
  // const [keyArray, setKeyArray] = useState(["index", "partyName", "openingAmount", "dayBill", "closingAmount"]);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const fetch_ledger = async (data) => {
    const { fromDate, toDate } = data;
    getSummaryData(fromDate, toDate);
  }

  const getSummaryData = async (fromDate, toDate = null) => {
    let data;
    if (toDate) {
      data = {
        startDate: fromDate,
        endDate: toDate,
      }
    } else data = { startDate: fromDate }

    const billSummary = await kisanBillSummary(fromDate, toDate);
    if (billSummary) {
      setTableData(billSummary.responseBody?.kisanBills);
      setResponseData(billSummary.responseBody);
    }

  }

  useEffect(() => {
    const init = async () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      const billsData = await getSummaryData(formattedDate);
    };

    init();
  }, []);

  const printLedger = () => {
    triggerRef.current.click();
  }

  return (
    <>
      <div className={styles.container}>
        <h1>Kisan Bill Payment Summry</h1>
        <form className={styles.dateFields} onSubmit={handleSubmit(fetch_ledger)}>
          <div className={styles.date}>
            FROM: <input type='date'{...register('fromDate', { required: 'From date is required' })} /><br />
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div className={styles.date}>TO: <input type='date'  {...register('toDate')} /></div>
          <div>
            <Button variant="contained" color="success" type='submit' >Fetch</Button>&nbsp;
            <Button variant="contained" color="success" onClick={() => printLedger()} className={styles.print_btn}>PRINT</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </div>
        </form>
        <br />
        <div>
          <div className={styles.totals}>
            <div><b>Kaccha Total:</b> {apiResponse?.kacchaTotal}</div>
            <div><b>Commission:</b> {apiResponse?.commission}</div>
            <div><b>Hammali:</b> {apiResponse?.hammali}</div>
            <div><b>Bhada:</b> {apiResponse?.bhada}</div>
            <div><b>Nagar PalikaTax:</b> {apiResponse?.nagarPalikaTax}</div>
            <div><b>Nagdi:</b> {apiResponse?.nagdi}</div>
            <div><b>Mandi Kharcha:</b> {apiResponse?.mandiKharcha}</div>
            <div><b>Driver:</b> {apiResponse?.driver}</div>
            <div><b>Pakka Total:</b> {apiResponse?.pakkaTotal}</div>
          </div>
          <div ref={componentRef}>
            <table border="1">
              <thead>
                <tr>
                  <th>Bill Date</th>
                  <th>Bill No.</th>
                  <th>Party Name</th>
                  <th>KACH. TOTAL</th>
                  <th>COMM.</th>
                  <th>HUMM.</th>
                  <th>BHADA</th>
                  <th>N.TAX</th>
                  <th>NAGDI</th>
                  <th>STAT CHAR</th>
                  <th>DRIV. ENAM</th>
                  <th>PAKKA TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <>
                    <tr key={index}>
                      {/* <td component="th" scope="row">
                      {index + 1}
                    </td> */}
                      <td align="right">{row.billId}</td>
                      <td align="right">{row.openingAmount}</td>
                      <td align="right">{row.dayBill}</td>
                      <td align="right">{row.closingAmount}</td>
                      <td align="right">{row.kharchaTotal}</td>
                      <td align="right">{row.commissionRate}</td>
                      <td align="right">{row.bhada}</td>
                      <td align="right">{row.nagarPalikaTax}</td>
                      <td align="right">{row.nagdi}</td>
                      <td align="right">{row.openingAmount}</td>
                      <td align="right">{row.dayBill}</td>
                      <td align="right">{row.closingAmount}</td>
                    </tr>
                    {row.summaryBills?.map((bill, index) => (
                      <tr>
                        <td align="right">{bill.itemName}</td>
                        <td align="right">rate.{bill.rate}</td>
                        <td align="right">qan.{bill.quantity}</td>
                        <td align="right">bag.{bill.bag}</td>
                        <td align="right">total.{bill.itemTotal}</td>
                        {/* <td align="right">{row.partyName}</td> */}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style={{ display: 'none' }}>
        {/* <LedgerPrint ref={componentRef} tableData={tableData} formData={getValues()} /> */}

      </div>
    </>
  );
}

export default KisanBillSummary;

