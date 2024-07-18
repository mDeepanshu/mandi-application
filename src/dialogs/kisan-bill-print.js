import React, { forwardRef,useEffect  } from 'react';
import { Grid } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';

const KisanBillPrint = forwardRef((props, ref) =>{

    let tableData = [];

    useEffect(() => {
        console.log(props);
      }, []);

    return (
        <div ref={ref}>
          <h1>Haji Sabzi Mandi Bill</h1>
          <Grid container>
            <Grid item xs={6}>Mandi Kharch: {props.props.formData.mandi_kharch}</Grid>
            <Grid item xs={6}>Hammali: {props.props.formData.hammali}</Grid>
            <Grid item xs={6}>Nagar Palika Tax: {props.props.formData.nagar_palika_tax}</Grid>
            <Grid item xs={6}>Bhada: {props.props.formData.bhada}</Grid>
            <Grid item xs={4}>Driver Inaam: {props.props.formData.driver_inaam}</Grid>
            <Grid item xs={4}>Nagdi: {props.props.formData.nagdi}</Grid>
            <Grid item xs={4}>Commision: {props.props.formData.commision}</Grid>
          </Grid>
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
                  {tableData.map((row,index) => (
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
