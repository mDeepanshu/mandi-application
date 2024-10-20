import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from '@mui/material';
import { getLedger } from '../../gateway/ledger-apis';

import styles from "./ledger.module.css";

function Ledger() {

  const [tableData, setTableData] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const fetch_ledger = async (data) => {
    const { fromDate, toDate } = data;
    getLedgerData(fromDate, toDate);
  }

  const getLedgerData = async (fromDate, toDate = null) => {
    console.log(fromDate, toDate);
    let data;
    if (toDate) {
      data = {
        startDate:fromDate,
        endDate:toDate,
      }
    }else data={startDate:fromDate}

    const ledger = await getLedger(data);
    if (ledger) {
      console.log(ledger);
      setTableData(ledger.responseBody);
    }

  }

  useEffect(() => {
    const init = async () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      const ledgerData = await getLedgerData(formattedDate);
      console.log(ledgerData);
    };

    init();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <h1>LEDGER</h1>
        {/* <div className={styles.dateFields}> */}
        <form className={styles.dateFields} onSubmit={handleSubmit(fetch_ledger)}>
          <div className={styles.date}>
            FROM: <input type='date'{...register('fromDate', { required: 'From date is required' })} /><br/>
            {errors.fromDate && <span className="error">{errors.fromDate.message}</span>}
          </div>
          <div className={styles.date}>TO: <input type='date'  {...register('toDate')} /></div>
          <div><Button variant="contained" color="success" type='submit' >Fetch Ledger</Button></div>
        </form>
        {/* </div> */}
        <div className={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>INDEX</TableCell>
                <TableCell>PARTY NAME</TableCell>
                <TableCell>OPENING AMOUNT</TableCell>
                <TableCell>DAY BILL</TableCell>
                <TableCell>CLOSING AMOUNT</TableCell>
                {/* <TableCell>DELETE</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.partyName}</TableCell>
                  <TableCell>{row.openingAmount}</TableCell>
                  <TableCell>{row.dayBill}</TableCell>
                  <TableCell>{row.closingAmount}</TableCell>
                  {/* <TableCell onClick={() => deleteFromTable(index)}><Button><Delete /></Button></TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default Ledger;
