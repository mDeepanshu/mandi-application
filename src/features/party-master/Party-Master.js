import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addPartyGlobal, getPartyGlobal } from "../../gateway/party-master-apis";
import SearchIcon from '@mui/icons-material/Search';
// import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import { Delete, AddCircleOutline } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import SharedTable from "../../shared/ui/table/table";
import MasterTable from "../../shared/ui/master-table/master-table";
import styles from "./party-master.module.css";

const PartyMaster = () => {
  // const { handleSubmit, control, getValues } = useForm();
  const [open, setOpen] = useState(false);
  const { handleSubmit, control, getValues, formState: { errors } } = useForm({
    defaultValues: {
      partyType: 'KISAN', // Ensure this matches one of the MenuItem values
    },
  });
  const [tableData, setTableData] = useState([]);
  const [tableDataFiltered, setTableDataFiltered] = useState([]);

  const [partyColumns, setPartyColumns] = useState(["INDEX", "CONTACT", "ID NO", "PARTY NAME", "OWED AMOUNT", "PARTY ID","MAX LOAN DAYS", "PARTY TYPE"]);
  const [keyArray, setKeyArray] = useState(["index","contact", "idNo", "name", "owedAmount", "partyId","maxLoanDays", "partyType"]);

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
    setTableDataFiltered(tableData.filter(elem => elem.name.includes(event.target.value)));
  }

  useEffect(() => {
    fetchItems();
  }, []);

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
      console.log(result);
      if (result.responseCode == 201) {
        setTableData([...tableData, newTableData[0]]);
        setTableDataFiltered([...tableDataFiltered, newTableData[0]]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={0} md={12}>
          <Typography variant="h4" component="h1" align="left">
            PARTY MASTER
          </Typography>
        </Grid>

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
            render={({ field }) => <TextField {...field} fullWidth label="VASULI DAY LIMIT" variant="outlined"/>}
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

        <Grid item xs={12}>
          <MasterTable columns={partyColumns} tableData={tableData} keyArray={keyArray} className={styles.sharedTable}/>
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
    </form>
  );
};

export default PartyMaster;