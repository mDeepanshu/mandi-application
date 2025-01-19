import React, { forwardRef, useEffect } from 'react';
import styles from "./auction-print.module.css";
import { dateTimeFormat } from "../../constants/config";

const AuctionPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref} className={styles.container}>
            <div className={styles.constants}>
                <div> Date: {new Date().toLocaleDateString()}</div>
            </div>
            <table
                border="1"
                style={{ borderCollapse: "collapse", width: "100%" }}
                className={styles.table}
            >
                <thead>
                    <tr>
                        {props.columns.map((row, index) => (
                            <th align="left" key={index}><b>{row}</b></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((rowData, index) => (
                        <tr key={index}>
                            {props.keyArray?.map((key, i) => (
                                <td key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1.2rem" }}>
                                    {(() => {
                                        switch (key) {
                                            case "auctionDate":
                                                return new Date(rowData[key]).toLocaleString('en-IN', dateTimeFormat);
                                            default:
                                                return rowData[key];
                                            }
                                    })()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
        </div>
    );
});

export default AuctionPrint;




