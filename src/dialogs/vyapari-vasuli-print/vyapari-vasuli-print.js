import React, { forwardRef, useEffect } from "react";
import styles from "./vyapari-vasuli-print.module.css";
const VyapariVasuliPrint = forwardRef((props, ref) => {
  return (
    <div ref={ref} className={styles.container}>
      <h1 className={styles.heading}>Vyapari Vasuli Sheet</h1>
      <div className={styles.constants}>
        <div> Date: {props.formData?.fromDate}</div>
      </div>
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }} className={styles.table}>
        <thead>
          <tr>
            <td colspan="5">------------------------------------------------------------------------------------------------------</td>
          </tr>
        </thead>
        <thead>
          <tr>
            <th>NAME</th>
            <th>OPN AMT</th>
            <th>TTL</th>
            <th>CLS AMT</th>
            <th>DAY BILL</th>
          </tr>
        </thead>
        <tbody>
          {props.tableData?.map((row, index) => (
            <tr key={index}>
              <td className={styles.partyName}>{row.partyName}</td>
              <td align="left" className={styles.openingAmount}>
                {row.openingAmount}
              </td>
              <td align="left">{row.ttl}</td>
              <td align="right">{row.closingAmount}</td>
              <td align="left" className={styles.daybill}>
                {row.dayBill}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">------------------------------------------------------------------------------------------------------</td>
          </tr>
          <tr>
            <td colspan="5">------------------------------------------------------------------------------------------------------</td>
          </tr>
        </tfoot>
      </table>
      <div className={styles.totals}>
        <div>OPENING TOTAL: {props.formData?.openingAmountSum}</div>
        <div>DAY TOTAL: {props.formData?.daybill}</div>
        <div>CLOSING TOTAL: {props.formData?.closingAmountSum}</div>
      </div>
      <hr />
    </div>
  );
});

export default VyapariVasuliPrint;
