import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from '@mui/material';
import { submitKisanBill, getKisanBill } from '../../gateway/kisan-bill-apis';
import { getAllPartyList } from "../../gateway/comman-apis";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import ReactToPrint from 'react-to-print';
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import "./kisan-bill.css";

function KisanBill() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const { register, handleSubmit, control, formState: { errors }, getValues, trigger, reset } = useForm();
  const [kisanList, setKisanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState();

  const [fieldDefinitions, setFieldDefinitions] = useState([
    {
      name: 'mandiKharcha',
      label: 'Mandi Kharch',
      defaultValue: '',
      validation: { required: 'Mandi Kharch is required' },
    },
    {
      name: 'hammali',
      label: 'Hammali',
      defaultValue: '',
      validation: {
        required: 'Hammali is required',
      },
    },
    {
      name: 'nagarPalikaTax',
      label: 'Nagar Palika Tax',
      defaultValue: '',
      validation: {
        required: 'Nagar Palika Tax is required',
      },
    },
    {
      name: 'bhada',
      label: 'Bhada',
      defaultValue: '',
      validation: {
        required: 'Bhada is required',
      },
    },
    {
      name: 'driver',
      label: 'Driver Inaam',
      defaultValue: '',
      validation: {
        required: 'Driver Inaam is required',
      },
    },
    {
      name: 'nagdi',
      label: 'Nagdi',
      defaultValue: '',
      validation: {
        required: 'Nagdi is required',
      },
    },
    {
      name: 'commission',
      label: 'Commission',
      defaultValue: '',
      validation: {
        required: 'Commission is required',
      },
    },

  ]);

  const onSubmit = async (data) => {
    console.log("here");
    setFormData(getValues());
    // if (triggerRef.current) {
    //   triggerRef.current.click();
    // }
  };

  const fetchBill = async () => {
    const isValid = await trigger(['kisan', 'date']);
    if (isValid) {
      let formValues = getValues();
      const billData = await getKisanBill(formValues.kisan.partyId, formValues.date);
      setTableData(billData?.responseBody?.bills);
      const billConstant = billData?.responseBody;
      delete billConstant.bills;
      reset({...getValues(),...billConstant});
    }
  }

  const getKisanNames = async () => {
    const allKisan = await getAllPartyList("KISAN");
    setKisanList(allKisan?.responseBody);
  }

  useEffect(() => {
    getKisanNames();
  }, []);

  useEffect(() => {
    if (formData) {
      if (triggerRef.current) {
        triggerRef.current.click();
      }
    }
  }, [formData]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={3}>
          <Grid item xs={4}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              {fieldDefinitions.map((fieldDef) => (
                <Controller
                  key={fieldDef.name}
                  name={fieldDef.name}
                  control={control}
                  defaultValue={fieldDef.defaultValue}
                  rules={fieldDef.validation}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={fieldDef.label}
                      variant="outlined"
                      sx={{ mb: 3 }}
                      fullWidth
                      error={!!errors[field.name]}
                      helperText={errors[field.name] ? errors[field.name].message : ''}
                      size="small"
                    />
                  )}
                />
              ))}
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={2} paddingBottom={2}>
              <Grid item xs={5}>
                <Controller
                  name="kisan"
                  control={control}
                  rules={{ required: "Enter Kisan Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={kisanList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Kisan Name"
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
                <p className='err-msg'>{errors.kisan?.message}</p>
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Enter Date" }}
                  defaultValue=""
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
            <TableContainer component={Paper} className='bill-table'>
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
                  {tableData.map((row, index) => (
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
            <Grid container spacing={2} justifyContent="flex-end" p={2}>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={3}>
                  <Controller
                    key="kharchaTotal"
                    name="kharchaTotal"
                    control={control}
                    defaultValue=""
                    rules={{validation:"Kharcha Total is Required"}}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Kharcha Total"
                        variant="outlined"
                        sx={{ mb: 3 }}
                        fullWidth
                        error={!!errors.kharcha_total}
                        helperText={errors.kharcha_total ? errors.kharcha_total.message : ""}
                        size="small"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    key="totalBikri"
                    name="totalBikri"
                    control={control}
                    defaultValue=""
                    rules={{required:"Toal Bikri is Required"}}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pakki Bikri"
                        variant="outlined"
                        sx={{ mb: 3 }}
                        fullWidth
                        error={!!errors.totalBikri}
                        helperText={errors.totalBikri ? errors.totalBikri.message : ""}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={3}>
                  <Button variant="contained" color="success" type='submit' fullWidth>Save And Print</Button>
                  <ReactToPrint
                    trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
                    content={() => componentRef.current}
                  // onBeforeGetContent={() => setFormData(getValues())}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <div style={{ display: 'none' }}>
        <KisanBillPrint ref={componentRef} tableData={tableData} formData={formData} />
      </div>
    </div>
  );
}

export default KisanBill;
