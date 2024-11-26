import React, { forwardRef, useEffect } from 'react';
import { Grid } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import "./ledgerPrint.module.css";
const LedgerPrint = forwardRef((props, ref) => {

    useEffect(() => {
        console.log(props);

    }, []);

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
                        <th>PARTY NAME</th>
                        <th>OPENING AMOUNT</th>
                        <th>DAY BILL</th>
                        <th>CLOSING AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((row, index) => (
                        <tr key={index}>
                            <td component="th" scope="row">
                                {index + 1}
                            </td>
                            <td align="right">{row.partyName}</td>
                            <td align="right">{row.openingAmount}</td>
                            <td align="right">{row.dayBill}</td>
                            <td align="right">{row.closingAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default LedgerPrint;




