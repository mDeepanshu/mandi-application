import React, { forwardRef, useEffect, useState } from 'react';
import styles from "./ledgerPrint.module.css";
import { dateFormat } from "../../constants/config";

const LedgerPrint = forwardRef((props, ref) => {
    const [tableData, setTableData] = useState([]);
    const checkArr = ["OPN AMOUNT", "CLS AMOUNT", "TOTAL"];

    useEffect(() => {
        if (props.tableData.length) {
            props.tableData.unshift({
                date: "OPN AMOUNT",
                dr: props.formData?.openingAmount,
            });
            props.tableData.push({
                date: "CLS AMOUNT",
                dr: props.formData?.closingAmount,
            });
            setTableData(props.tableData);
        }
    }, [props.tableData])

    return (
        <div ref={ref} className={styles.container}>
            <div className={styles.constants} style={{ fontSize: '11px' }}>
                <div><b>{props.formData?.vyapari_id?.name}{props.formData?.vyapariName} | </b>ID: <b>{props.formData?.vyapari_id?.idNo}{props.formData?.vyapariIdNo}</b></div>
            </div>
            <table border="1" style={{fontSize: '10px'}}>
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>ITEM</th>
                        <th>CR</th>
                        <th>DE</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData?.map((row, index) => {
                        return checkArr.includes(row.date) ?
                            <tr key={index} style={{ lineHeight: '0.8', padding: '0' }}>
                                <td colSpan={2} align="left"><b>{row.date}</b></td>
                                <td colSpan={2} align="right"><b>{row.dr}</b></td>
                            </tr> :
                            <tr key={index} style={{ lineHeight: '0.8', padding: '0' }}>
                                <td align="left">{new Date(row.date).toLocaleString('en-IN', dateFormat)}</td>
                                <td align="right">{row.itemName}</td>
                                <td align="right">{row.cr}</td>
                                <td align="right">{row.dr}</td>
                            </tr>
                    })}
                </tbody>
            </table>
        </div>
    );
});

export default LedgerPrint;




