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
    if (localTable.length) {
      if (props.restructureTable) {
        let arr = [];
        let basicArr = [];
        if (props.fromPreviousBill) {
          arr.push(localTable?.[0]);
          basicArr=localTable;
        } else {
          arr.push(localTable?.[0]?.[0]);
          localTable.forEach(element => {
            basicArr.push(element[element.length-1]);
          });
        }
        if (arr.length) {
          let flag = true;
          for (let index = 1; index < basicArr.length; index++) {
            for (const element of arr) {
              if (element.rate == basicArr[index].rate && element.itemName == basicArr[index].itemName) {
                element.quantity += basicArr[index].quantity;
                element.itemTotal += basicArr[index].itemTotal;
                element.bag += basicArr[index].bag;
                flag = false;
                break;
              }
            }
            if (flag) {
              arr.push(basicArr[index]);
            }
            flag = true;
          }
        }
        setPrintTable(arr);
      } else setPrintTable(props.tableDataPrint);
    }

  }, [localTable]);


  return (
    <div ref={ref} className={styles.container}>
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
              <TableRow key={index} sx={{ '& > *': { padding: '4px 8px' } }}>
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
