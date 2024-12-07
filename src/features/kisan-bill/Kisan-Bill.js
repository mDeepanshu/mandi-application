import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { TableContainer, Paper, InputAdornment } from '@mui/material';
import { getKisanBill, saveKisanBill } from '../../gateway/kisan-bill-apis';
import { getAllPartyList } from "../../gateway/comman-apis";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import ReactToPrint from 'react-to-print';
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import "./kisan-bill.module.css";
import SharedTable from "../../shared/ui/table/table";
import PreviousBills from "../../shared/ui/previous-bill/previousBill";


function KisanBill() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const { handleSubmit, control, formState: { errors }, getValues, trigger, reset } = useForm();
  const [kisanList, setKisanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState();

  const [kisanBillColumnsColumns, setKisanBillColumnsColumns] = useState(["Item Name", "Bag", "Rate", "Quantity", "Item Total","Date","Vyapari Name", "Edit", "Previuos Edits"]);
  const [keyArray, setKeyArray] = useState(["itemName", "bag", "rate", "quantity", "itemTotal","auctionDate","partyName", "edit", "navigation"]);


  const [fieldDefinitions] = useState([
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
      name: 'nagarPalikaTaxRate',
      label: 'Nagar Palika Tax Rate',
      defaultValue: '',
      validation: {
        required: 'Nagar Palika Tax is required',
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
      name: 'commissionRate',
      label: 'Commission Rate',
      defaultValue: '',
      validation: {
        required: 'Commission is required',
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
    setFormData(getValues());
    if (triggerRef.current) {
      triggerRef.current.click();
    }
  };

  const fetchBill = async () => {
    const isValid = await trigger(['kisan', 'date']);
    if (isValid) {
      let formValues = getValues();
      const billData = await getKisanBill(formValues.kisan.partyId, formValues.date);
      if (billData) {
        const auctionList = billData?.responseBody?.bills;
        setTableData(auctionList);
        const billConstant = billData?.responseBody;
        delete billConstant.bills;
        reset({ ...getValues(), ...billConstant });
      }
    }
  }

  const getKisanNames = async () => {
    const allKisan = await getAllPartyList("KISAN");
    if (allKisan?.responseBody) setKisanList(allKisan?.responseBody);

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

  const editFromTable = (index) => {
  }

  const deleteFromTable = (index) => {
  }

  const saveBill = async () => {
    // const saveRes = saveKisanBill();
    let tableSnapshot=[];
    tableData.forEach(element => {
      
      tableSnapshot.push(element[0]);
    });
    const bill = {...getValues(), kisanBillItems:tableSnapshot,kisanId:getValues().kisan.partyId,kisanName:getValues().kisan.name,billDate:getValues().date};
    delete bill.kisan;
    delete bill.date;
    saveKisanBill(bill);
  }

  const refreshBill = async () => {
    let formValues = getValues();
    const billData = await getKisanBill(formValues.kisan.partyId, formValues.date);
    if (billData) {
      setTableData(billData?.responseBody?.bills);
      const billConstant = billData?.responseBody;
      delete billConstant.bills;
      reset({ ...getValues(), ...billConstant });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={3}>
          <Grid item xs={2}>
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
          <Grid item xs={10}>
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
            <Grid container spacing={2} paddingBottom={2}>
              <Grid item xs={11}>
                <PreviousBills billData={{id:getValues()?.kisan?.partyId,date:getValues()?.date}} partyType={"kisan"}/>
              </Grid>
            </Grid>
            <TableContainer component={Paper} className='bill-table'>
              <SharedTable columns={kisanBillColumnsColumns} tableData={structuredClone(tableData)} keyArray={keyArray}  refreshBill={refreshBill}/>
            </TableContainer>
            <Grid container spacing={2} justifyContent="flex-end" p={2}>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={3}>
                  <Controller
                    key="kharchaTotal"
                    name="kharchaTotal"
                    control={control}
                    defaultValue=""
                    rules={{ validation: "Kharcha Total is Required" }}
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
                    rules={{ required: "Toal Bikri is Required" }}
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
                  <Button variant="contained" color="primary" fullWidth onClick={saveBill}>Save Bill</Button>
                </Grid>
                <Grid item xs={3}>
                  <Button variant="contained" color="success" type='submit' fullWidth>Print</Button>
                  <ReactToPrint
                    trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
                    content={() => componentRef.current}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <div style={{ display: 'none' }}>
        <KisanBillPrint ref={componentRef} tableDataPrint={structuredClone(tableData)} restructureTable={true} formData={formData} />
      </div>
    </div>
  );
}

export default KisanBill;
