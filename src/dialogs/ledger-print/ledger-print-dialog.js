import React, { forwardRef, useEffect, useState } from 'react';
import styles from "./ledgerPrint.module.css";

const LedgerPrint = forwardRef((props, ref) => {
    const [tableData, setTableData] = useState([]);
    const checkArr = ["OPENING AMOUNT","CLOSING AMOUNT","TOTAL"];

    useEffect(() => {
        if (props.tableData.length) {
            props.tableData.unshift({
                date: "OPENING AMOUNT",
                itemName: "",
                cr: "",
                dr: props.formData?.openingAmount,
            });
            props.tableData.push({
                date: "CLOSING AMOUNT",
                itemName: "",
                cr: "",
                dr: props.formData?.closingAmount,
            });
            setTableData(props.tableData);
        }
    }, [props.tableData])

    return (
        <div ref={ref} className={styles.container}>
            <div className={styles.constants}>
                <div>FROM: {props.formData?.fromDate}</div>
                <div>TILL: {props.formData?.toDate}</div>
            </div>
            <table border="1">
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>ITEM NAME</th>
                        <th>CR</th>
                        <th>DE</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData?.map((row, index) => (
                        <tr key={index} style={{ lineHeight: '0.8', padding: '0', fontSize: '12px' }}>
                            <td align="left">{checkArr.includes(row.date) ? <b>{row.date}</b> : row.date}</td>
                            <td align="right">{row.itemName}</td>
                            <td align="right">{row.cr}</td>
                            <td align="right">{checkArr.includes(row.date) ? <b>{row.dr}</b> : row.dr}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default LedgerPrint;




