import { forwardRef, useEffect, useState } from "react";
import { TableContainer } from "@mui/material";
import styles from "./kisan-bill-print.module.css";
const KisanBillPrint = forwardRef((props, ref) => {
  const [printTable, setPrintTable] = useState([]);
  const [localTable, setLocalTable] = useState([]);

  useEffect(() => {
    console.log(props);
    
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
    <>
      <div ref={ref} className={styles.container}>
        <div className={styles.heading}>
          <div>किसान नाम: {props.formData?.kisan.name}</div>
          <div>बिल तिथि: {props.formData?.date}</div>
          <div>बिल आईडी: {props.formData?.billId}</div>
        </div>
        <div className={styles.levelTwo}>
          <div className={styles.constants}>
            <div>मंडी खर्चा:</div>
            <div>{props.formData?.mandiKharcha}{""}</div>
            <div>हम्माली:</div>
            <div>{props.formData?.hammali}{""}</div>
            <div>न. पा. टैक्स:</div>
            <div>{props.formData?.nagarPalikaTax}{""}</div>
            <div>भाड़ा:</div>
            <div>{props.formData?.bhada}{""}</div>
            <div>ड्राइवर इनाम:</div>
            <div>{props.formData?.driver}{}</div>
            <div>नगद:</div>
            <div>{props.formData?.nagdi}{""}</div>
          </div>
          <div className={styles.tableContainer}>
            {/* <TableContainer> */}
              <table
                border="1"
                style={{ borderCollapse: "collapse", width: "100%",border: "0.5px solid black", }}
                className={styles.table}
              >
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
            {/* </TableContainer> */}
            <div className={styles.totals}>
              <div>
              </div>
              <div>
              </div>
              <div>
              </div>
              <div>
                खर्चा कुल: {props.formData?.kharchaTotal}
              </div>
              <div>
                कुल: {props.formData?.totalBikri}
              </div>
              <div>
                कुल बिक्र: {props.formData?.total}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default KisanBillPrint;
