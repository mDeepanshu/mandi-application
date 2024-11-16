import React, { forwardRef, useEffect } from 'react';
import { Grid } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import "./vyapari-bill-print.css";
const VyapariBillPrint = forwardRef((props, ref) => {

  return (
    <div ref={ref}>
      <h1 className='heading'>Haji Sabzi Mandi Bill</h1>
      <div className='constants'>
        <div>Vyapari Name: {props.formData?.vyapari_name?.name}</div>
        <div>Date: {props.formData?.date}</div>
      </div>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Bag</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Item Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.tableData?.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.itemName}
                </TableCell>
                <TableCell align="right">{row.bag}</TableCell>
                <TableCell align="right">{row.rate}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.rate*row.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});

export default VyapariBillPrint;
