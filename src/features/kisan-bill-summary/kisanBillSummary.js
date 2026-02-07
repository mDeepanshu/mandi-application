import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { kisanBillSummary } from '../../gateway/kisan-bill-apis';
import ReactToPrint from 'react-to-print';
import { getActiveDevices } from "../../gateway/auction-entries-api";

import styles from "./kisan-bill-summary.module.css";

function KisanBillSummaryComponent() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [apiResponse, setResponseData] = useState();
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

  const { register, formState: { errors }, getValues } = useForm({
    defaultValues: {
      date: currentDate, // Set the default value to current date
    },
  });

  const fetch_ledger = async () => {
    const { date } = getValues();
    getSummaryData(date);
  }

  const getSummaryData = async (date) => {
    const billSummary = await kisanBillSummary(date);
    if (billSummary) {
      const allKisanBills = billSummary.responseBody;
      if (allKisanBills.bills.length) {
        setTableData(allKisanBills.bills);
        setResponseData(billSummary.responseBody.totals);
      } else {
        setTableData([]);
        setResponseData({});
      }
    }

  }

  const printLedger = () => triggerRef.current.click();

  const filter_by_device = () => {
    const { device } = getValues();
    const filteredData = tableData.filter((row) => row?.bill?.device === device);
    setTableData(filteredData);
  }

  const getDevicelist = async () => {
    const decivelist = await getActiveDevices();
    setDeviceList(decivelist?.responseBody);
  };

  useEffect(() => {
    getDevicelist();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <h1>KISAN BILL SUMMARY</h1>
        <form className={styles.dateFields} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.date}>
            DATE: <input type='date'{...register('date', { required: 'Date is required' })} /><br />
            {errors.date && <span className="error">{errors.date.message}</span>}
          </div>
          <div>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_ledger()} >Fetch</Button>&nbsp;
            <Button variant="contained" color="success" type='button' onClick={() => printLedger()} className={styles.print_btn}>PRINT</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </div>
          <div className={styles.deviceSelect}>
            DEVICE: <select {...register('device')}>
              <option value="">All</option>
              {deviceList.map((device) => (
                <option key={device?.id} value={device?.id}>{device?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Button variant="contained" color="success" type='button' onClick={() => filter_by_device()} >FILTER</Button>&nbsp;
          </div>
        </form>
        <br />
        <div ref={componentRef} className={styles.print_section}>
          <div className={styles.totals}>
            <div><b>Kaccha Total:</b> {apiResponse?.kaccha_total}</div>
            <div><b>Commission:</b> {apiResponse?.mandi_kharcha}</div>
            <div><b>Hammali:</b> {apiResponse?.hammali}</div>
            <div><b>Bhada:</b> {apiResponse?.bhada}</div>
            <div><b>Nagar PalikaTax:</b> {apiResponse?.nagar_palika_tax}</div>
            <div><b>Nagdi:</b> {apiResponse?.nagdi}</div>
            {/* <div><b>Mandi Kharcha:</b> {apiResponse?.mandiKharcha}</div> */}
            <div><b>Driver:</b> {apiResponse?.driver_inaam}</div>
            <div><b>PAKKA TOTAL: {apiResponse?.pakki_bikri}</b></div>
          </div>
          <div>
            <table border="1">
              <thead>
                <tr>
                  <th>BILL DATE</th>
                  <th>DEVICE</th>
                  <th>BILL NO.</th>
                  <th>PARTY NAME</th>
                  <th>KACH. TOTAL</th>
                  <th>COMM.</th>
                  <th>HUMM.</th>
                  <th>BHADA</th>
                  <th>N.TAX</th>
                  <th>NAGDI</th>
                  <th>DRIV. ENAM</th>
                  <th>PAKKA TOTAL</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px' }}>
                {tableData?.map((row, index) => (
                  <>
                    <tr key={index}>
                      <td align="left">{row?.bill.bill_date}</td>
                      <td align="left">{row?.bill.device}</td>
                      <td align="left">{row?.bill.kisan_bill_id}</td>
                      <td align="left"><b>{row?.bill.kisan_name}</b></td>
                      <td align="left"><b>{row?.bill.kaccha_total}</b></td>
                      <td align="center">{row?.bill.mandi_kharcha}</td>
                      <td align="center">{row?.bill.hammali}</td>
                      <td align="center">{row?.bill.bhada}</td>
                      <td align="center">{row?.bill.nagar_palika_tax}</td>
                      <td align="center">{row?.bill.nagdi}</td>
                      <td align="center">{row?.bill.driver_inaam}</td>
                      <td align="center"><b>{row?.bill.pakki_bikri}</b></td>
                    </tr>
                    {row.items?.map((bill, billIndex) => (
                      <tr key={billIndex} style={{ lineHeight: '0.6', padding: '0' }}>
                        <td colSpan="12" style={{ textAlign: 'left', padding: '5px' }}>
                          <div className={styles.itemDetails}>
                            <span style={{ display: 'inline-block', width: '150px' }}>{bill.itemName}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>R</b>|{bill.rate}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>Q</b>|{bill.quantity}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>B</b>|{bill.bag}</span>
                            <span style={{ display: 'inline-block', width: '50px' }}><b>T</b>|{bill.item_total}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      {/* <td colSpan="2">
                        <hr className={styles.seprator} />
                      </td> */}
                    </tr>
                  </>
                ))}
              </tbody>
              <tfoot>
                {/* <tr>
                  <td colspan="2">------------------------------------------------------------------------------------------------------</td>
                </tr> */}
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

export default KisanBillSummaryComponent;

