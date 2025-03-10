import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { kisanBillSummary } from '../../gateway/kisan-bill-apis';
import ReactToPrint from 'react-to-print';

import styles from "./kisan-bill-summary.module.css";

function KisanBillSummary() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [apiResponse, setResponseData] = useState();
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

  const { register, formState: { errors }, getValues } = useForm({
    defaultValues: {
      toDate: currentDate, // Set the default value to current date
      fromDate: currentDate, // Default to 2 days prior date
    },
  });

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
      const allKisanBills = billSummary.responseBody?.kisanBills;
      if (allKisanBills.length) {
        setTableData(allKisanBills);
        setResponseData(billSummary.responseBody);
      } else {
        setTableData([]);
        setResponseData({});
      }
    }

  }

  const printLedger = () => triggerRef.current.click();

  return (
    <>
      <div className={styles.container}>
        <h1>KISAN BILL SUMMARY</h1>
        <form className={styles.dateFields} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.date}>
            FROM: <input type='date'{...register('fromDate', { required: 'From date is required' })} /><br />
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div className={styles.date}>TO: <input type='date'  {...register('toDate')} /></div>
          <div>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_ledger(getValues())} >Fetch</Button>&nbsp;
            <Button variant="contained" color="success" type='button' onClick={() => printLedger()} className={styles.print_btn}>PRINT</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </div>
        </form>
        <br />
        <div ref={componentRef} className={styles.print_section}>
          {/* <div className={styles.totals}> */}
          {/* <div><b>Kaccha Total:</b> {apiResponse?.kacchaTotal}</div> */}
          {/* <div><b>Commission:</b> {apiResponse?.commission}</div>
            <div><b>Hammali:</b> {apiResponse?.hammali}</div>
            <div><b>Bhada:</b> {apiResponse?.bhada}</div>
            <div><b>Nagar PalikaTax:</b> {apiResponse?.nagarPalikaTax}</div>
            <div><b>Nagdi:</b> {apiResponse?.nagdi}</div>
            <div><b>Mandi Kharcha:</b> {apiResponse?.mandiKharcha}</div>
            <div><b>Driver:</b> {apiResponse?.driver}</div> */}
          <div><b>PAKKA TOTAL: {apiResponse?.pakkaTotal}</b></div>
          {/* </div> */}
          <div>
            <table border="1">
              <thead>
                <tr>
                  {/* <th>BILL DATE</th> */}
                  {/* <th>BILL NO.</th> */}
                  <th>PARTY NAME</th>
                  {/* <th>KACH. TOTAL</th>
                  <th>COMM.</th>
                  <th>HUMM.</th>
                  <th>BHADA</th>
                  <th>N.TAX</th>
                  <th>NAGDI</th>
                  <th>DRIV. ENAM</th> */}
                  <th>PAKKA TOTAL</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '10px' }}>
                {tableData?.map((row, index) => (
                  <>
                    <tr key={index}>
                      {/* <td align="left">{row.date}</td> */}
                      {/* <td align="left">{row.billId}</td> */}
                      <td align="left"><b>{row.kisanName}</b></td>
                      <td align="left"><b>{row.totalBikri}</b></td>
                      {/* <td align="center">{row.commission}</td>
                      <td align="center">{row.hammali}</td>
                      <td align="center">{row.bhada}</td>
                      <td align="center">{row.nagarPalikaTax}</td>
                      <td align="center">{row.nagdi}</td>
                      <td align="center">{row.driver}</td>
                      <td align="center"><b>{row.total}</b></td> */}
                    </tr>
                    {row.summaryBills?.map((bill, billIndex) => (
                      <tr key={billIndex} style={{ lineHeight: '0.6', padding: '0' }}>
                        <td colSpan="12" style={{ textAlign: 'left', padding: '5px' }}>
                          <div className={styles.itemDetails}>
                            <span style={{ display: 'inline-block', width: '150px' }}>{bill.itemName}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>R</b>|{bill.rate}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>Q</b>|{bill.quantity}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>B</b>|{bill.bag}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>T</b>|{bill.itemTotal}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="2">
                        <hr className={styles.seprator}/>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
              <tfoot>
                    <tr>
                        <td colspan="2">------------------------------------------------------------------------------------------------------</td>
                    </tr>
                </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div style={{ display: 'none' }}>
      </div>
    </>
  );
}

export default KisanBillSummary;

