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
import MasterTable from "../../shared/ui/master-table/master-table";
import PreviousBills from "../../shared/ui/previous-bill/previousBill";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { useOutletContext } from "react-router-dom";
import styles from "./kisan-bill.module.css";
import formFields from "./kisan-bill-fields.json";

function KisanBill() {
  const { snackbarChange, syncComplete } = useOutletContext();
  const { itemAddFields, totalFields, fieldDefinitions,KisanBillTableColumns,KisanBIllKeyArray } = formFields;

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

  const [kisanBillColumnsColumns, setKisanBillColumnsColumns] = useState(KisanBillTableColumns);

  const [keyArray, setKeyArray] = useState(KisanBIllKeyArray);

  const [open, setOpen] = useState(false);


  // const today = new Date().toISOString().split('T')[0];
  const todayd = new Date();
  const today = new Date(todayd.getTime() - todayd.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  const [itemsList, setItemsList] = useState([]);

  const fetchList = async () => {
    const list = await getItem("items");
    // const uniqueArray = list.filter((item, index, self) => index === self.findIndex((obj) => obj.name === item.name));
    setItemsList(list.responseBody);
  };

  const onPrintBtn = async (e) => {
    const isValid = await trigger(["kisan", "date", "totalBikri", "kharchaTotal", "total", "mandiKharcha", "bhada", "driver", "nagdi", "hammali", "nagarPalikaTax"]);
    if (isValid) setFormData(getValues());
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

  const editKisanTable = (index) => {
    const rowToEdit = tableData[index];
    setValue("itemName", rowToEdit.itemName, { shouldValidate: true });
    setValue("bag", rowToEdit.bag, { shouldValidate: true });
    setValue("qty", rowToEdit.quantity, { shouldValidate: true });
    setValue("rate", rowToEdit.rate, { shouldValidate: true });
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  const deleteFromTable = (index) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

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
    const isValid = await trigger(["itemName", "qty", "bag", "rate", "bhadaRate"]);
    const values = getValues();

    if (isValid) {
      const itemTotal = values.qty * values.rate;
      const newRow = {
        itemName: values.itemName,
        bag: Number(values.bag),
        rate: values.rate,
        quantity: values.qty,
        itemTotal: itemTotal,
      };

      setTableData([...tableData, newRow]);

      const newHammali = Number(values.hammali) + 5 * Number(values.bag);
      const newBhada = Number(values.bhada) + Number(values.bhadaRate) * Number(values.bag);
      const newNagarPalikaTax = Number(values.nagarPalikaTax) + Number(values.bag);
      const newTotalBikri = Number(values.totalBikri) + itemTotal;

      let kharchaTotal = Number(values.mandiKharcha) + newBhada + Number(values.driver) + Number(values.nagdi) + newHammali + newNagarPalikaTax;

      reset({
        ...values,
        itemName: "",
        qty: "",
        bag: "",
        rate: "",
        totalBikri: Number(values.totalBikri) + itemTotal,
        hammali: Number(values.hammali) + 5 * Number(values.bag),
        bhada: Number(values.bhada) + Number(values.bhadaRate) * Number(values.bag),
        nagarPalikaTax: Number(values.nagarPalikaTax) + Number(values.bag),
        kharchaTotal: kharchaTotal,
        total: newTotalBikri - kharchaTotal,
      });
    }
  };

  const nextAction = async (e, field) => {

    if (e.key === 'Enter') {
      e.preventDefault();
      switch (field) {
        case 'itemName':
          setFocus('bag');
          break;
        case 'Quantity':
          setFocus('rate');
          break;
        case 'Bag':
          setFocus('qty');
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
      <form>
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
                      type="number"
                      variant="outlined"
                      sx={{ mb: 3, display: fieldDef.hidden ? 'none' : 'block' }}
                      hidden={true}
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
                          error={!!errors[field.name]}
                          helperText={errors[field.name] ? errors[field.name].message : ""}
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
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name="kisanType"
                  control={control}
                  rules={{ required: "TYPE" }}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel id="party-type-label">TYPE</InputLabel>
                      <Select
                        {...field}
                        label="TYPE"
                        onChange={kisanTypeChange}
                        error={!!errors[field.name]}
                        helperText={errors[field.name] ? errors[field.name].message : ""}
                      >
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <p className={styles.errMsg}>{errors.kisanType?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Enter Date" }}
                  defaultValue={today}
                  render={({ field }) => <TextField style={{ width: '100%' }} {...field} variant="outlined" type="date" size="small" error={!!errors[field.name]} helperText={errors[field.name] ? errors[field.name].message : ""} />}
                />
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
                      disableClearable
                      options={itemsList.map((o) => o.name)} // list of strings
                      onChange={(_, value) => field.onChange(value || "")}
                      value={field.value || ""} // value must be a string
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Item Name"
                          error={!!errors[field.name]}
                          helperText={errors[field.name] ? errors[field.name].message : ""}
                          type="search"
                          onKeyDown={(e) => nextAction(e, "itemName")}
                          inputRef={itemInputRef}
                          size="small"
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              {itemAddFields.slice(1).map((field) => (
                <Grid item xs={2} key={field.name}>
                  <TextField
                    size="small"
                    type="number"
                    label={field.label}
                    {...register(field.name, {
                      required: field.label + " Required"
                    })}
                    error={errors[field.name]}
                    helperText={errors[field.name] ? field.label + " Required" : ""}
                    onKeyDown={(e) => nextAction(e, field.label)}
                    fullWidth
                  />
                </Grid>
              ))}
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
                editKisanTable={(idx) => editKisanTable(idx)}
                deleteEntry={(idx) => deleteFromTable(idx)}
                keyArray={keyArray}
                refreshBill={refreshBill}
                customHeight="43vh"
              />
            </TableContainer>
            <Grid container spacing={2} justifyContent="flex-end" p={2}>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                {totalFields.map((field) => (
                  <Grid item xs={2} key={field.name}>
                    <TextField
                      key={watch(field.name)}
                      size="small"
                      type="number"
                      label={field.label}
                      error={!!errors[field.name]}
                      helperText={errors[field.name] ? errors[field.name].message : ""}
                      {...register(field.name, {
                        required: field.label + " is Required"
                      })}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={4}>
                  <Button variant="contained" color="primary" fullWidth onClick={saveBill}>
                    Save Bill
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" color="success" type="button" onClick={onPrintBtn} fullWidth>
                    Print
                  </Button>
                  <ReactToPrint
                    trigger={() => <button type="button" style={{ display: "none" }} ref={triggerRef}></button>}
                    content={() => componentRef.current}
                    pageStyle="@page { size: 14cm 20cm}"
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
