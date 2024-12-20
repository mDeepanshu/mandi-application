import React, { forwardRef, useEffect } from 'react';
import styles from "./vyapari-vasuli-print.module.css";
const VyapariVasuliPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref} className={styles.container}>
            <h1 className={styles.heading}>Vyapari Vasuli Sheet</h1>
            <div className={styles.constants}>
                <div> Date: {props.formData?.fromDate}</div>
            </div>
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>OPN AMT</th>
                        <th>DAY BILL</th>
                        <th>TTL</th>
                        <th>CLS AMT</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((row, index) => (
                        <tr key={index}>
                            <td className={styles.partyName}>{row.partyName}</td>
                            <td align='left'>{row.openingAmount}</td>
                            <td align='left'>{row.dayBill}</td>
                            <td align='left'>{row.ttl}</td>
                            <td align='right'>{row.closingAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
});

export default VyapariVasuliPrint;




