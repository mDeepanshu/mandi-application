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
            <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>INDEX	</TableCell>
                            <TableCell align="right">PARTY NAME	</TableCell>
                            <TableCell align="right">OPENING AMOUNT	</TableCell>
                            <TableCell align="right">DAY BILL	</TableCell>
                            <TableCell align="right">CLOSING AMOUNT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.tableData?.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {index+1}
                                </TableCell>
                                <TableCell align="right">{row.partyName}</TableCell>
                                <TableCell align="right">{row.openingAmount}</TableCell>
                                <TableCell align="right">{row.dayBill}</TableCell>
                                <TableCell align="right">{row.closingAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
});

export default LedgerPrint;




