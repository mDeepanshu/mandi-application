import React, { forwardRef, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import styles from "./kisan-bill-print.module.css";
const KisanBillPrint = forwardRef((props, ref) => {

  const [printTable, setPrintTable] = useState([]);
  const [localTable, setLocalTable] = useState([]);

  useEffect(() => {
    setLocalTable(props.tableDataPrint);
  }, [props]);

  useEffect(() => {
    if (props.restructureTable) {
      let arr = [];
      if (props.fromPreviousBill) {
        arr = localTable?.[0];
      } else {
        arr.push(localTable?.[0]?.[0]);
      }
      console.log(arr);
      let flag = true;
      for (let index = 1; index < localTable.length; index++) {
        for (const element of arr) {
          if (element.rate == localTable[index][0].rate && element.itemName == localTable[index][0].itemName) {
            console.log(element,localTable[index]);
            element.quantity += localTable[index][0].quantity;
            element.itemTotal += localTable[index][0].itemTotal;
            element.bag += localTable[index][0].bag;
            flag=false;
            break;
          }
        }
        if (flag) {
          arr.push(localTable[index][0]);
          flag=!flag;
        }
      }
      console.log(arr);

      setPrintTable(arr);
    } else setPrintTable(props.tableDataPrint);

  }, [localTable]);


  return (
    <div ref={ref}>
      <h1 className={styles.heading}>Haji Sabzi Mandi Bill</h1>
      <div className={styles.constants}>
        <div>Bhada: {props.formData?.bhada}</div>
        <div>Bill Date: {props.formData?.billDate}</div>
        <div>Bill Id: {props.formData?.billId}</div>
        <div>Commission: {props.formData?.commission}</div>
        <div>Driver Inaam: {props.formData?.driverInaam}</div>
        <div>Hammali: {props.formData?.hammali}</div>
        <div>Kisan Name: {props.formData?.kisanName}</div>
        <div>Mandi Kharcha: {props.formData?.mandiKharcha}</div>
        <div>Nagar Palika Tax: {props.formData?.nagarPalikaTax}</div>
        <div>Nagdi: {props.formData?.nagdi}</div>
        <div></div>
        <div></div>
        <div><b>KHARCHA TOTAL: {props.formData?.kharchaTotal}</b></div>
        <div><b>TOTAL: {props.formData?.totalBikri}</b></div>
        <div><b>TOTAL BIKRI: {props.formData?.total}</b></div>
      </div>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Bag</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Item Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {printTable?.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row?.itemName}
                </TableCell>
                <TableCell align="right">{row?.bag}</TableCell>
                <TableCell align="right">{row?.rate}</TableCell>
                <TableCell align="right">{row?.quantity}</TableCell>
                <TableCell align="right">{row?.itemTotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});

export default KisanBillPrint;
