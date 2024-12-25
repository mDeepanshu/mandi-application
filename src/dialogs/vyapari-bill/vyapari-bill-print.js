import React, { forwardRef, useEffect,useState } from 'react';
import { Grid } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import styles from "./vyapari-bill-print.module.css";

const VyapariBillPrint = forwardRef((props, ref) => {

  const [printTable,setPrintTable] = useState([]);
  
  useEffect(() => {

    if(props.restructureTable){
      
      let arr=[];
      props.tableData.forEach(element => {
        arr.push(element[0]);
      });
      setPrintTable(arr);
    }else{
      setPrintTable(props.tableData);
    } 
  }, [props]);

  return (
    <div ref={ref} className={styles.container}>
      <h1 className={styles.heading}>Haji Sabzi Mandi Bill</h1>
      <div className={styles.constants}>
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
            {printTable?.map((row, index) => (
              <TableRow key={index}  sx={{ '& > *': { padding: '4px 8px' } }}>
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
