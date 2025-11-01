import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { TableContainer, Paper, InputAdornment, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getKisanBill, saveKisanBill } from "../../gateway/kisan-bill-apis";
import { getAllPartyList, getItem } from "../../gateway/comman-apis";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import ReactToPrint from "react-to-print";
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import "./kisan-bill.module.css";
import SharedTable from "../../shared/ui/table/table";
import MasterTable from "../../shared/ui/master-table/master-table";
import PreviousBills from "../../shared/ui/previous-bill/previousBill";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { useOutletContext } from "react-router-dom";
import styles from "./kisan-bill.module.css";

function KisanBill() {
  const { snackbarChange, syncComplete } = useOutletContext();

  const componentRef = useRef();
  const triggerRef = useRef();
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  const itemInputRef = useRef(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    trigger,
    reset,
    setFocus,
    register,
    setValue,
    watch,
    resetField
  } = useForm();
  const [kisanList, setKisanList] = useState([]);
  const [kisanFilteredList, setFilteredKisanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState();
  const [noEntries, setNoEntries] = useState(false);
  const selectedItem = watch("itemName");

  const [kisanBillColumnsColumns, setKisanBillColumnsColumns] = useState([
    "Item Name",
    "Bag",
    "Rate",
    "Quantity",
    "Item Total",
    // "Date",
    // "Vyapari Name",
    // "Edit",
    // "Previuos Edits",
  ]);
  const [keyArray, setKeyArray] = useState([
    "itemName",
    "bag",
    "rate",
    "quantity",
    "itemTotal",
    // "auctionDate",
    // "partyName",
    // "edit",
    // "navigation",
  ]);
  const [open, setOpen] = useState(false);
  // const today = new Date().toISOString().split('T')[0];
  const todayd = new Date();
  const today = new Date(todayd.getTime() - todayd.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  const [fieldDefinitions] = useState([
    {
      name: "mandiKharcha",
      disabled: false,
      label: "Mandi Kharch",
      defaultValue: "",
      validation: { required: "Mandi Kharch is required" },
    },
    {
      name: "hammali",
      disabled: false,
      label: "Hammali",
      defaultValue: "",
      validation: {
        required: "Hammali is required",
      },
    },
    {
      name: "nagarPalikaTaxRate",
      disabled: false,
      label: "Nagar Palika Tax Rate",
      defaultValue: "",
      validation: {
        required: "Nagar Palika Tax is required",
      },
    },
    {
      name: "nagarPalikaTax",
      disabled: false,
      label: "Nagar Palika Tax",
      defaultValue: "",
      validation: {
        required: "Nagar Palika Tax is required",
      },
    },
    {
      name: "bhada",
      disabled: false,
      label: "Bhada",
      defaultValue: "",
      validation: {
        required: "Bhada is required",
      },
    },
    {
      name: "driver",
      disabled: false,
      label: "Driver Inaam",
      defaultValue: "",
      validation: {
        required: "Driver Inaam is required",
      },
    },
    {
      name: "nagdi",
      disabled: false,
      label: "Nagdi",
      defaultValue: "",
      validation: {
        required: "Nagdi is required",
      },
    },
    {
      name: "commissionRate",
      disabled: true,
      label: "Commission Rate",
      defaultValue: "",
      validation: {
        required: "Commission is required",
      },
    },
    {
      name: "commission",
      disabled: true,
      label: "Commission",
      defaultValue: "",
      validation: {
        required: "Commission is required",
      },
    },
    {
      name: "bags",
      disabled: false,
      label: "Bags",
      defaultValue: "",
      validation: {
        required: "Bags is required",
      },
    },
  ]);
  const [itemsList, setItemsList] = useState([]);
  const fetchList = async () => {
    const list = await getItem("items");
    // const uniqueArray = list.filter((item, index, self) => index === self.findIndex((obj) => obj.name === item.name));
    setItemsList(list.responseBody);
  };
  const onSubmit = async (data) => {
    setFormData(getValues());
    if (triggerRef.current) {
      triggerRef.current.click();
    }
  };

  const fetchBill = async () => {
    setNoEntries(false);
    const isValid = await trigger(["kisan", "date"]);
    if (isValid) {
      let formValues = getValues();
      const billData = await getKisanBill(formValues.kisan.partyId, formValues.date);
      if (billData) {
        const auctionList = billData?.responseBody?.bills;

        if (billData?.responseBody?.bills?.length === 0) {
          setNoEntries(true);
        }
        setTableData(auctionList);
        if (billData?.responseBody?.bills?.length) {
          const billConstant = billData?.responseBody;
          delete billConstant.bills;
          reset({ ...getValues(), ...billConstant });
        } else {
          reset({ kisan: null });
        }
      }
    }
  };

  const getKisanNames = async () => {
    const allKisan = await getAllPartyList("KISAN");
    if (allKisan?.responseBody) {
      setKisanList(allKisan?.responseBody);
      const filteredList = kisanList.filter((kisan) => kisan.kisanType === "A");
      setFilteredKisanList(filteredList);
    }
  };

  useEffect(() => {
    getKisanNames();
    fetchList();
  }, [syncComplete]);

  useEffect(() => {
    if (formData) {
      if (triggerRef.current) {
        triggerRef.current.click();
      }
    }
  }, [formData]);

  const editFromTable = (index) => { };

  const deleteFromTable = (index) => { };

  const saveBill = async () => {
    // const saveRes = saveKisanBill();
    let tableSnapshot = [];
    tableData.forEach((element) => {
      tableSnapshot.push({ ...element[element.length - 1] });
    });
    //
    let mergedTable = [];
    mergedTable.push({ ...tableSnapshot[0] });
    if (tableSnapshot.length) {
      let flag = true;
      for (let index = 1; index < tableSnapshot.length; index++) {
        for (const element of mergedTable) {
          if (element.rate == tableSnapshot[index].rate && element.itemName == tableSnapshot[index].itemName) {
            element.quantity += tableSnapshot[index].quantity;
            element.itemTotal += tableSnapshot[index].itemTotal;
            element.bag += tableSnapshot[index].bag;
            flag = false;
            break;
          }
        }
        if (flag) {
          mergedTable.push({ ...tableSnapshot[index] });
        }
        flag = true;
      }
    }
    //
    const bill = {
      ...getValues(),
      kisanBillItems: mergedTable,
      kisanId: getValues().kisan.partyId,
      kisanName: getValues().kisan.name,
      billDate: getValues().date,
    };
    delete bill.kisan;
    delete bill.date;
    const saveRes = await saveKisanBill(bill);
    if (saveRes.responseCode == "200") {
      setOpen(true);
    }
  };

  const refreshBill = async () => {
    let formValues = getValues();
    const billData = await getKisanBill(formValues.kisan.partyId, formValues.date);
    if (billData) {
      setTableData(billData?.responseBody?.bills);
      const billConstant = billData?.responseBody;
      delete billConstant.bills;
      reset({ ...getValues(), ...billConstant });
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const addToTable = async () => {
    const isValid = await trigger(["itemName", "qty", "bag", "rate"]);

    if (isValid) {
      const values = getValues();
      const itemTotal = values.qty * values.rate;
      const newRow = {
        itemName: values.itemName,
        bag: values.qty,
        rate: values.rate,
        quantity: values.qty,
        itemTotal: itemTotal,
      };


      setTableData([...tableData, newRow]);
      // itemInputRef.current.value = null;
      reset({ ...values, itemName: "", qty: "", bag: "", rate: "" });
    }
  };

  const nextAction = async (e, field) => {

    if (e.key === 'Enter') {
      e.preventDefault();
      switch (field) {
        case 'itemName':
          setFocus('qty');
          break;
        case 'Quantity':
          setFocus('bag');
          break;
        case 'Bag':
          setFocus('rate');
          break;
        case 'Rate':
          // Add to table
          await addToTable();
          itemInputRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  const kisanTypeChange = (event) => {
    setValue("kisanType", event.target.value, { shouldValidate: true });
    const filteredList = kisanList.filter((kisan) => kisan.kisanType === event.target.value);
    setFilteredKisanList(filteredList);
  }


  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={1} pb={0}>
          <Grid item xs={2}>
            <Grid container direction="column" justifyContent="center" alignItems="center">
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
                      helperText={errors[field.name] ? errors[field.name].message : ""}
                      size="small"
                    />
                  )}
                />
              ))}
            </Grid>
          </Grid>
          <Grid item xs={10}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="kisan"
                  control={control}
                  rules={{ required: "Enter Kisan Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value || null}
                      options={kisanList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Kisan Name"
                          size="small"
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
                      // onChange={(event, value) => field.onChange(value)}
                      onChange={(event, value) => {
                        // Handle both selected and typed values
                        if (typeof value === "string") {
                          field.onChange({ name: value }); // typed manually
                        } else if (value && value.inputValue) {
                          field.onChange({ name: value.inputValue });
                        } else {
                          field.onChange(value); // selected from list
                        }
                      }}
                      onInputChange={(event, newInputValue, reason) => {
                        if (reason === "input") {
                          field.onChange({ name: newInputValue });
                        }
                      }}
                      disablePortal
                      id="combo-box-demo"
                    />
                  )}
                />
                <p className="err-msg">{errors.kisan?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name="kisanType"
                  control={control}
                  rules={{ required: "TYPE" }}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel id="party-type-label">TYPE</InputLabel>
                      <Select
                        {...field}
                        label="TYPE"
                        onChange={kisanTypeChange}
                      >
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <p className="err-msg">{errors.partyType?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Enter Date" }}
                  defaultValue={today}
                  render={({ field }) => <TextField style={{ width: '100%' }} {...field} variant="outlined" type="date" size="small" />}
                />
                <p className="err-msg">{errors.date?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" color="success" onClick={fetchBill} fullWidth>
                  Fetch Bill
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {/* <PreviousBills billData={{ id: getValues()?.kisan?.partyId, date: getValues()?.date }} partyType={"kisan"} /> */}
              <Grid item xs={4}>
                <Controller
                  name="itemName"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      options={itemsList.map((o) => o.name)} // list of strings
                      onChange={(_, value) => field.onChange(value || "")}
                      value={field.value || ""} // value must be a string
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Item Name"
                          type="search"
                          onKeyDown={(e) => nextAction(e, "itemName")}
                          inputRef={itemInputRef}
                          size="small"
                        />
                      )}
                    />
                  )}
                />
                <p className="err-msg">{errors.itemName?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <TextField size="small" type="number" label="Quantity" {...register("qty")} onKeyDown={(e) => nextAction(e, 'Quantity')} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <TextField size="small" type="number" label="Bag" {...register("bag")} onKeyDown={(e) => nextAction(e, 'Bag')} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <TextField size="small" type="number" label="Rate" {...register("rate")} onKeyDown={(e) => nextAction(e, 'Rate')} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" color="primary" fullWidth onClick={addToTable}>
                  ADD
                </Button>
              </Grid>
            </Grid>
            <TableContainer component={Paper} >
              {noEntries && `NO ENTRIES FOUND`}
              <MasterTable
                columns={kisanBillColumnsColumns}
                tableData={structuredClone(tableData)}
                keyArray={keyArray}
                refreshBill={refreshBill}
                customHeight="45vh"
              />
            </TableContainer>
            <Grid container spacing={2} justifyContent="flex-end" p={2}>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={2}>
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
                <Grid item xs={2}>
                  <Controller
                    key="totalBikri"
                    name="totalBikri"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Total is Required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Total"
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
                <Grid item xs={2}>
                  <Controller
                    key="total"
                    name="total"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Total Bikri is Required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Total Bikri"
                        variant="outlined"
                        fullWidth
                        error={!!errors.total}
                        helperText={errors.total ? errors.total.message : ""}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={4}>
                  <Button variant="contained" color="primary" fullWidth onClick={saveBill}>
                    Save Bill
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" color="success" type="submit" fullWidth>
                    Print
                  </Button>
                  <ReactToPrint
                    trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>}
                    content={() => componentRef.current}
                    pageStyle="@page { size: 10cm 17cm;}"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <div style={{ display: "none" }}>
        <KisanBillPrint ref={componentRef} tableDataPrint={structuredClone(tableData)} restructureTable={false} formData={formData} />
      </div>
      <div>
        <Snackbar open={open} autoHideDuration={2500} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: "100%" }}>
            BILL SAVED
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default KisanBill;
