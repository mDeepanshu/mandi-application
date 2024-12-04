import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Delete, AddCircleOutline } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import { addPartyGlobal, getPartyGlobal } from "../../gateway/party-master-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import styles from "./party-master.module.css";
import PartyPrint from "../../dialogs/party-print/party-print-dialog";
import ReactToPrint from 'react-to-print';

const PartyMaster = () => {
  // const { handleSubmit, control, getValues } = useForm();
  const triggerRef = useRef();
  const componentRef = useRef();

  const [open, setOpen] = useState(false);
  const { handleSubmit, control, watch, getValues, formState: { errors } } = useForm({
    defaultValues: {
      partyType: 'KISAN', // Ensure this matches one of the MenuItem values
    },
  });
  const [tableData, setTableData] = useState([]);
  const [printTableData, setPrintTableData] = useState([]);
  const [filterVyapariText, setFilterVyapariText] = useState(true);

  const [tableDataFiltered, setTableDataFiltered] = useState([]);

  const [partyColumns, setPartyColumns] = useState(["INDEX", "CONTACT", "ID NO", "PARTY NAME", "OWED AMOUNT", "PARTY ID", "MAX LOAN DAYS", "Last Vasuli Date", "Days Exceded", "PARTY TYPE"]);
  const [keyArray, setKeyArray] = useState(["index", "contact", "idNo", "name", "owedAmount", "partyId", "maxLoanDays", "lastVasuliDate", "daysExceded", "partyType"]);
  const currentPartyType = watch("partyType", "KISAN");

  const sortOnId = () => {
    const sortedData = [...tableDataFiltered].sort((a, b) => a.idNo - b.idNo);
    setTableDataFiltered(sortedData); // Update the state with the sorted array
  };

  const sortOnDaysExceded = () => {
    const sortedData = [...tableDataFiltered].sort((a, b) => b.daysExceded - a.daysExceded);
    setTableDataFiltered(sortedData); // Update the state with the sorted array
  };

  const filterVyapari = () => {
    if (!filterVyapariText) setTableDataFiltered(tableData.filter(elem => elem.name.toLowerCase().includes(getValues().name)));
    else {
      const sortedData = [...tableDataFiltered].filter(elem => elem.partyType === "1");
      setTableDataFiltered(sortedData); // Update the state with the sorted array
    }
    setFilterVyapariText((prev) => !prev);
  };

  const fetchItems = async () => {
    try {
      const partiesList = await getPartyGlobal();
      setTableData([...partiesList.responseBody]);
      setTableDataFiltered([...partiesList.responseBody]);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  const onPartyInput = (event, field) => {
    field.onChange(event);  // Update the value in react-hook-form
    setTableDataFiltered(tableData.filter(elem => elem.name.toLowerCase().includes(event.target.value.toLowerCase())));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    tableData.map((elem) => {
      const newLastVasuliDate = new Date(elem.lastVasuliDate);
      const todayDate = new Date();
      const diffInMs = Math.abs(todayDate - newLastVasuliDate);
      // Convert milliseconds to days
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) - elem.maxLoanDays;
      elem.daysExceded = diffInDays;
    })
  }, [tableData]);

  const onSubmit = async (data) => {
    const values = getValues();
    if (tableData.some(elem => elem.name == values.name && elem.partyType == values.partyType)) {
      setOpen(true);
      return;
    }
    let newTableData = [
      {
        partyId: Date.now().toString(16),
        ...values
      }
    ];
    try {
      const result = await addPartyGlobal(newTableData);
      if (result.responseCode == 201) {
        setTableData([...tableData, newTableData[0]]);
        setTableDataFiltered([...tableDataFiltered, newTableData[0]]);
      }
    } catch (error) {
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const print = () => {
    const table = tableDataFiltered.filter(elem => elem.daysExceded>0);
    setPrintTableData(table);
  }

  useEffect(() => {
    if (printTableData.length) triggerRef.current.click();
  }, [printTableData]);


  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <>
      <Grid container spacing={2} p={3}>
        <Grid item xs={0} md={12}>
          <Typography variant="h4" component="h1" align="left">
            PARTY MASTER
          </Typography>
        </Grid>
        <Grid item xs={0} md={12}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Enter Name" }}
                  defaultValue=""

                  render={({ field }) => <TextField {...field} fullWidth label="PARTY NAME" variant="outlined" InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                    onChange={(e) => onPartyInput(e, field)}
                  />}
                />
                <p className='err-msg'>{errors.name?.message}</p>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller
                  name="partyType"
                  control={control}
                  rules={{ required: "Enter Party Type" }}
                  defaultValue="KISAN"
                  render={({ field }) => (
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>PARTY TYPE</InputLabel>
                      <Select
                        {...field}
                        label="PARTY TYPE"
                      >
                        <MenuItem value="KISAN">KISAAN</MenuItem>
                        <MenuItem value="VYAPARI">VYAPARI</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <p className='err-msg'>{errors.partyType?.message}</p>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller
                  name="vasuliDayLimit"
                  control={control}
                  rules={{ required: "Enter Vasuli Day Limit" }}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="VASULI DAY LIMIT" variant="outlined" disabled={currentPartyType == "KISAN"} />}
                />
                <p className='err-msg'>{errors.vasuliDayLimit?.message}</p>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller
                  name="maxLoanDays"
                  control={control}
                  rules={{ required: "Max Loan Days" }}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="MAX LOAN DAYS" variant="outlined" />}
                />
                <p className='err-msg'>{errors.contact?.message}</p>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller
                  name="contact"
                  control={control}
                  rules={{ required: "Enter Contact" }}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="CONTACT" variant="outlined" />}
                />
                <p className='err-msg'>{errors.contact?.message}</p>
              </Grid>
              <Grid item xs={1}>
                <Button variant="contained" color="primary" fullWidth type="submit" sx={{ height: '3.438rem' }}>
                  <AddCircleOutline /> ADD
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid item xs={0} md={12} style={{ paddingTop: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={0} md={2}>
              <Button variant="contained" color="primary" fullWidth sx={{ height: '2.438rem' }} onClick={sortOnId}>
                Sort By Id
              </Button>
            </Grid>
            <Grid item xs={0} md={2}>
              <Button variant="contained" color="primary" fullWidth sx={{ height: '2.438rem' }} onClick={sortOnDaysExceded}>
                Sort By Days Exceded
              </Button>
            </Grid>
            <Grid item xs={0} md={2}>
              <Button variant="contained" color="primary" fullWidth sx={{ height: '2.438rem' }} onClick={filterVyapari}>
                {filterVyapariText}
                {filterVyapariText ? 'Show Vyapari Only' : 'Show All'}
              </Button>
            </Grid>
            <Grid item xs={0} md={2}>
              <Button type='button' variant="contained" color="primary" fullWidth sx={{ height: '2.438rem' }} onClick={print}>
                Print
              </Button>
              <ReactToPrint
                trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
                content={() => componentRef.current}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <MasterTable columns={partyColumns} tableData={tableDataFiltered} keyArray={keyArray} className={styles.sharedTable} />
        </Grid>
      </Grid>
      <div>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          message="ALREADY EXISTS"
          action={action}
          onClose={handleClose}
        />
      </div>
      <div style={{ display: 'none' }}>
        <PartyPrint ref={componentRef} columns={["INDEX", "PARTY NAME", "OWED AMOUNT"]} tableData={printTableData} keyArray={["index", "name", "owedAmount"]} />
      </div>
    </>
  );
};

export default PartyMaster;