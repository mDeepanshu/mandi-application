import { forwardRef } from "react";
import styles from "./partyPrint.module.css";

const PartyPrint = forwardRef((props, ref) => {

  return (
    <div ref={ref} className={styles.container}>
      <h1 className="heading">VYAPARI PENDING PAYMENT</h1>
      <table border="1">
        <thead>
          <tr>
            <th>PARTY NAME</th>
            <th>CONTACT</th>
            <th>PENDING AMOUNT</th>
            <th>DAYS EXCEEDED</th>
          </tr>
        </thead>
        <tbody>
          {props.tableData?.map((row, index) => (
            <tr key={index}>
              <td align="left">{row.name}</td>
              <td align="left">{row.contact}</td>
              <td align="left">{row.owedAmount}</td>
              <td align="left">{row.daysExceded}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">-----------------------------------------------------------------------------------------------------------------------------------------</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

export default PartyPrint;
