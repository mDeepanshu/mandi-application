import React, { forwardRef, useEffect, useState } from "react";
import styles from "./partyPrint.module.css";
import { use } from "react";

const PartyPrint = forwardRef((props, ref) => {

  const [data,setData]=useState([]);

  useEffect(() => {
    setData(props.tableData?.sort((a, b) => a.name.localeCompare(b.name)));
  }, [props.tableData]);

  return (
    <div ref={ref} className={styles.container}>
      <h1 className="heading">Party Print</h1>
      <table border="1">
        <thead>
          <tr>
            <th>PARTY NAME</th>
            <th>CONTACT</th>
            <th>PENDING AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={index}>
              <td align="left">{row.name}</td>
              <td align="left">{row.contact}</td>
              <td align="left">{row.owedAmount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">-----------------------------------------------------------------------------------------------------------------------------------------</td>
          </tr>
          <tr>
            <td colspan="5">-----------------------------------------------------------------------------------------------------------------------------------------</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

export default PartyPrint;
