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
          {props.tableData?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex + 1}</td>
              {props.keyArray.map((key, colIndex) => {
                switch (key) {
                  case "date":
                    return <td key={colIndex}>{new Date(row?.date).toLocaleDateString("en-Gb")}</td>;
                  default:
                    return <td key={colIndex}>{row[key]}</td>;
                }
              })}
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
