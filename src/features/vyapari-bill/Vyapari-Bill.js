import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from '@mui/material';
import { submitVyapariBill, getVyapariBill } from '../../gateway/vyapari-bill-apis';
import { useForm, Controller } from 'react-hook-form';
import { getAllPartyList } from "../../gateway/comman-apis";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import "./vyapari-bill.css";
function VyapariBill() {


  const { register, handleSubmit, control, formState: { errors }, getValues, trigger } = useForm();
  const [vyapariList, setVyapariList] = useState([]);
  const [tableData, setTableData] = useState([]);


  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      tableData
    };
    console.log("billDetails", billDetails);
    // let a = await submitVyapariBill(billDetails);
    window.print();
  };

  const fetchBill = async () => {
    const isValid = await trigger(['vyapari_name', 'date']);
    if (isValid) {
      const formValues = getValues();
      const billData = await getVyapariBill(formValues.vyapari_name.partyId, formValues.date);
      setTableData(billData?.responseBody);
    }
  }

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    setVyapariList(allVyapari?.responseBody);
  }

  useEffect(() => {
    getVyapariNames();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid item xs={8} p={3}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={5}>
                <Controller
                  name="vyapari_name"
                  control={control}
                  rules={{ required: "Enter Patry Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={vyapariList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vyapari Name"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      onChange={(event, value) => field.onChange(value)}
                      disablePortal
                      id="combo-box-demo"
                    />
                  )}
                />
                <p className='err-msg'>{errors.vyapari_name?.message}</p>
              </Grid>
              <Grid item xs={5}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Enter Date" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      type='date'
                    />
                  )}
                />
                <p className='err-msg'>{errors.date?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" color="success" onClick={fetchBill} fullWidth>Fetch Bill</Button>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <TextField
                {...register("previous_remaining", { required: "This field is required" })}
                error={!!errors.previous_remaining}
                helperText={errors.previous_remaining ? errors.previous_remaining.message : ""}
                size="small"
                sx={{ mb: 3 }}
                defaultValue="1"
                fullWidth
                label="Previous Remaining"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <TableContainer component={Paper} className='bill-table'>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Bag</TableCell>
                  <TableCell align="right">Rate&nbsp;(g)</TableCell>
                  <TableCell align="right">Quantity&nbsp;(g)</TableCell>
                  <TableCell align="right">Item Total&nbsp;(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.itemName}
                    </TableCell>
                    <TableCell align="right">{row.bag}</TableCell>
                    <TableCell align="right">{row.rate}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="right">{row.rate * row.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Grid container spacing={2} paddingTop={2}>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <TextField
                  {...register("total", { required: "This field is required" })}
                  error={!!errors.total}
                  helperText={errors.total ? errors.total.message : ""}
                  size="small"
                  sx={{ mb: 3 }}
                  defaultValue="1"
                  fullWidth
                  label="Total"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <Button variant="contained" color="success" type='submit' fullWidth>Save And Print</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default VyapariBill;
