import React, { forwardRef, useEffect } from 'react';
import "./ledgerPrint.module.css";
const LedgerPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref}>
            <h1 className='heading'>Ledger</h1>
            <div className='constants'>
                <div>From Date: {props.formData?.fromDate}</div>
                <div>To Date: {props.formData?.toDate}</div>
            </div>
            <table border="1">
                <thead>
                    <tr>
                        <th>INDEX</th>
                        <th>DATE</th>
                        <th>ITEM NAME</th>
                        <th>CREDIT</th>
                        <th>DEBIT</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((row, index) => (
                        <tr key={index}>
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
        </div>
    );
});

export default LedgerPrint;




