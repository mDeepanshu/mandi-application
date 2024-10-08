import React, { forwardRef,useEffect  } from 'react';
import { Grid } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import "./kisan-bill-print.css";
const KisanBillPrint = forwardRef((props, ref) =>{

    return (
        <div ref={ref}>
          <h1 className='heading'>Haji Sabzi Mandi Bill</h1>
          <div className='constants'>
            <div>Mandi Kharch: {props.formData?.mandiKharcha}</div>
            <div>Driver Inaam: {props.formData?.driver}</div>
            <div>Hammali: {props.formData?.hammali}</div>
            <div>Bhada: {props.formData?.bhada}</div>
            <div>Nagar Palika Tax: {props.formData?.nagarPalikaTax}</div>
            <div>Nagdi: {props.formData?.nagdi}</div>
            <div>Commision: {props.formData?.commission}</div>
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
                  {props.tableData.map((row,index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.itemName}
                      </TableCell>
                      <TableCell align="right">{row.bag}</TableCell>
                      <TableCell align="right">{row.rate}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </div>
      );
});

export default KisanBillPrint;
