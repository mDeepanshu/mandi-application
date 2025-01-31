import React, { forwardRef, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
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
          basicArr = localTable;
        } else {
          arr.push(localTable?.[0]?.[0]);
          localTable.forEach((element) => {
            basicArr.push(element[element.length - 1]);
          });
        }
        if (arr.length) {
          let flag = true;
          for (let index = 1; index < basicArr.length; index++) {
            for (const element of arr) {
              if (
                element.rate == basicArr[index].rate &&
                element.itemName == basicArr[index].itemName
              ) {
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
        arr.sort((a, b) => {
          const nameComparison = a.itemName.localeCompare(b.itemName);
          if (nameComparison !== 0) return nameComparison; // If names are different, return the result
          return a.total - b.total;
        });
        setPrintTable(arr);
      } else setPrintTable(props.tableDataPrint);
    }
  }, [localTable]);

  return (
    <div ref={ref} className={styles.container}>
      <h1 className={styles.heading}>Haji Sabzi Mandi Bill</h1>
      <div className={styles.constants}>
        <div>BHADA: {props.formData?.bhada}</div>
        <div>BILL DATE: {props.formData?.billDate}</div>
        <div>BILL ID: {props.formData?.billId}</div>
        <div>COMMISSION: {props.formData?.commission}</div>
        <div>DRIVER INAAM: {props.formData?.driverInaam}</div>
        <div>HAMMALI: {props.formData?.hammali}</div>
        <div>KISAN NAME: {props.formData?.kisanName}</div>
        <div>MANDI KHARCHA: {props.formData?.mandiKharcha}</div>
        <div>NAGAR PALIKA TAX: {props.formData?.nagarPalikaTax}</div>
        <div>NAGDI: {props.formData?.nagdi}</div>
        <div></div>
        <div></div>
        <div>
          <b>KHARCHA TOTAL: {props.formData?.kharchaTotal}</b>
        </div>
        <div>
          <b>TOTAL: {props.formData?.totalBikri}</b>
        </div>
        <div>
          <b>TOTAL BIKRI: {props.formData?.total}</b>
        </div>
      </div>
      <TableContainer>
        <table
          border="1"
          style={{ borderCollapse: "collapse", width: "100%" }}
          className={styles.table}
        >
          {" "}
          <thead>
            <tr>
              <th>ITEM NAME</th>
              <th align="right">BAG</th>
              <th align="right">RATE</th>
              <th align="right">QUANTITY</th>
              <th align="right">ITEM TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {printTable?.map((row, index) => (
              <tr key={index} sx={{ padding: "4px 8px", lineHeight: "1.2rem" }}>
                <td component="th" scope="row">
                  {row?.itemName}
                </td>
                <td align="right">{row?.bag}</td>
                <td align="right">{row?.rate}</td>
                <td align="right">{row?.quantity}</td>
                <td align="right">{row?.itemTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
});

export default KisanBillPrint;
