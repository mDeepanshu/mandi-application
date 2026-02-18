import { forwardRef, useEffect, useState } from "react";
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
    <>
      <div ref={ref} className={styles.kisanBillPrintContainer}>
        <div className={styles.graphic}></div>
        <div className={styles.headingOne}>
          <div>बिल आईडी: {props.formData?.billId}</div>
        </div>
        <div className={styles.heading}>
          <div>किसान नाम: {props.formData?.kisan?.name}</div>
          <div>तिथि: {props.formData?.date}</div>
        </div>
        <div className={styles.levelTwo}>
          <div className={styles.constants}>
            <div><div>मंडी खर्चा: </div><div>{props.formData?.mandi_kharcha}</div></div>
            <div><div>हम्माली: </div><div>{props.formData?.hammali}</div></div>
            <div><div>न. पा. टैक्स: </div><div>{props.formData?.nagar_palika_tax}</div></div>
            <div><div>भाड़ा: </div><div>{props.formData?.bhada}</div></div>
            <div><div>ड्राइवर इनाम: </div><div>{props.formData?.driver_inaam}</div></div>
            <div><div>नगद: </div><div>{props.formData?.nagdi}</div></div>
            <div><div><b>खर्चा कुल:</b></div><div><b>{props.formData?.kharcha_total}</b></div></div>
            {props.remainingStock?.length > 0 && <div><div><b>पुराना बकाया स्टॉक</b></div><div><b></b></div></div>}
            {props.remainingStock?.map((row,index) => (
            <div><div>{row?.item_name}</div><div><b>{row?.quantity}</b></div></div>
            ))}
          </div>
          <div className={styles.tableContainer}>
            <table
              border="1"
              style={{ borderCollapse: "collapse", width: "100%", border: "0.5px solid black", }}
              className={styles.table}
            >
              <thead>
                <tr>
                  <th>ITEM NAME</th>
                  <th align="right">BAG</th>
                  <th align="right">QTY</th>
                  <th align="right">RATE</th>
                  <th align="right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {printTable?.map((row, index) => (
                  <tr key={index} sx={{ padding: "4px 8px", lineHeight: "1.2rem" }}>
                    <td component="th" scope="row">
                      {row?.item_name}
                    </td>
                    <td align="right">{row?.bag}</td>
                    <td align="right">{row?.quantity}</td>
                    <td align="right">{row?.rate}</td>
                    <td align="right">{row?.item_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.lastRow}>
          <div className={styles.constantsTotal}>
          </div>
          <div className={styles.totals}>
            <div>
              <div>कुल बिक्र: </div> <div>{props.formData?.kaccha_total}</div>
            </div>
            <div>
              <div>खर्चा कुल: </div> <div>{props.formData?.kharcha_total}</div>
            </div>
            <div>
              <div> कुल: </div> <div>{props.formData?.pakki_bikri}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default KisanBillPrint;
