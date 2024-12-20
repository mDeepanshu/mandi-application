import React, { forwardRef, useEffect } from 'react';
import styles from "./ledgerPrint.module.css";

const LedgerPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref}>
            <h1 className='heading'>Ledger</h1>
            <div className={styles.constants}>
                <div>From Date: {props.formData?.fromDate}</div>
                <div>To Date: {props.formData?.toDate}</div>
            </div>
            <div>
                Opening Balance:{props.formData?.openingAmount}
            </div>
            <table border="1">
                <thead>
                    <tr>
                        <th>IDX</th>
                        <th>DATE</th>
                        <th>ITEM NAME</th>
                        <th>CR</th>
                        <th>DE</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((row, index) => (
                        <tr key={index} style={{ lineHeight: '0.8', padding: '0', fontSize:'10px' }}>
                            <td component="th" scope="row">
                                {index + 1}
                            </td>
                            <td align="right">{row.date}</td>
                            <td align="right">{row.itemName}</td>
                            <td align="right">{row.cr}</td>
                            <td align="right">{row.dr}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                Closing Balance:{props.formData?.closingAmount}
            </div>
        </div>
    );
});

export default LedgerPrint;




