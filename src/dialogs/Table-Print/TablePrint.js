import { forwardRef } from "react";
import styles from "./TablePrint.module.css";

const TablePrint = forwardRef((props, ref) => {

  return (
    <div ref={ref} className={styles.container}>
      <h1 className="heading">{props.title}</h1>
      <table border="1">
        <thead>
          <tr>
            {
                props.headers.map((header, index) => (
                    <th key={index}>{header}</th>
                ))   
            }
          </tr>
        </thead>
        <tbody>
          {props.tableData?.map((row, index) => (
            <tr key={index}>
              {
                props.headers.map((header, index) => (
                  <td key={index} align="left">
                    {row[header.toLowerCase().replace(/\s+/g, '')]}
                  </td>
                ))
              }
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

export default TablePrint;
