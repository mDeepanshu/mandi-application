import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { TableContainer, Paper, InputAdornment, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getKisanBill, saveKisanBill, getKisanPendingStockApi, markPendingStockAsCleared } from "../../gateway/kisan-bill-apis";
import { getAllPartyList, getItem } from "../../gateway/comman-apis";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import ReactToPrint from "react-to-print";
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import "./kisan-bill.module.css";
import MasterTable from "../../shared/ui/master-table/master-table";
// import PreviousBills from "../../shared/ui/previous-bill/previousBill";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { useOutletContext } from "react-router-dom";
import styles from "./kisan-bill.module.css";
import formFields from "./kisan-bill-fields.json";

function KisanBill() {
  const { snackbarChange, syncComplete } = useOutletContext();
  const { itemAddFields, totalFields, fieldDefinitions, KisanBillTableColumns, KisanBIllKeyArray } = formFields;

  const componentRef = useRef();
  const selectRef = useRef();
  const triggerRef = useRef();
  const kisanInputRef = useRef();
  const itemInputRef = useRef(null);
  const constantRefs = useRef({});
  const printButtonRef = useRef(null);
  const qtyRef = useRef(null);
  const itemSelectRef = useRef(null);

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
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
  } = useForm({
    defaultValues: {
      kisanType: ""
    }
  });

  const [kisanList, setKisanList] = useState([]);
  const [kisanFilteredList, setFilteredKisanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState();
  const [noEntries, setNoEntries] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [remaininglist, setRemainingList] = useState([]);
  const [addRemaininglist, setAddRemainingList] = useState([]);
  const [qtyRemaining, setRemainingQty] = useState("");

  const [kisanBillColumnsColumns, setKisanBillColumnsColumns] = useState(KisanBillTableColumns);
  const [keyArray, setKeyArray] = useState(KisanBIllKeyArray);

  const [open, setOpen] = useState(false);
  const todayd = new Date();
  const today = new Date(todayd.getTime() - todayd.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  const [itemsList, setItemsList] = useState([]);
  const [fetchedBill, setFetchedBill] = useState(false);

  const fetchList = async () => {
    const list = await getItem("items");
    setItemsList(list?.responseBody);
  };

  const onPrintBtn = async (e) => {
    const isValid = await trigger(["kisan", "date", "kaccha_total", "kharcha_total", "pakki_bikri", "mandi_kharcha", "bhada", "driver_inaam", "nagdi", "hammali", "nagar_palika_tax"]);
    if (isValid) setFormData(getValues());
  };

  const fetchBill = async () => {
    // const isValid = await trigger(["kisan", "date"]);
    const isValid = await trigger(["billId"]);
    if (isValid) {
      setNoEntries(false);
      let formValues = getValues();
      resetFullBill();

      const billData = await getKisanBill(formValues.billId);
      if (!billData?.responseBody?.items) {
        snackbarChange({ open: true, alertType: "error", alertMsg: "BILL NOT FOUND" });
        return;
      }
      if (billData) {
        setFetchedBill(true);
        snackbarChange({ open: true, alertType: "success", alertMsg: "BILL FETCHED" });
        if (billData?.responseBody?.pendingStock?.length) {
          setRemainingList(billData?.responseBody?.pendingStock);
        }
        if (billData?.responseBody?.bill?.length === 0) {
          setNoEntries(true);
        }
        setTableData(billData?.responseBody?.items);
        if (billData?.responseBody?.bill) {
          const billConstant = billData?.responseBody?.bill;
          const selectedKisan = kisanList.find(
            (party) => party.partyId == billConstant.kisan_id
          );
          setValue("kisan", selectedKisan);
          setValue("billId", billConstant.kisan_bill_id, { shouldValidate: true });
          reset({ ...getValues(), ...billConstant });
        } else {
          reset({ kisan: null });
        }
      }
    }
  };

  const getKisanNames = async () => {
    const allKisan = await getAllPartyList("KISAN");
    if (allKisan?.responseBody) setKisanList(allKisan?.responseBody);
  };

  useEffect(() => {
    getKisanNames();
    fetchList();
    selectRef.current.focus();
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
    deleteFromTable(index);
    setValue("item_name", rowToEdit.item_name, { shouldValidate: true });
    setValue("bag", rowToEdit.bag, { shouldValidate: true });
    setValue("qty", rowToEdit.quantity, { shouldValidate: true });
    setValue("rate", rowToEdit.rate, { shouldValidate: true });
  };

  const deleteFromTable = (index) => {
    //update constants
    const values = getValues();
    const itemTotal = tableData[index].quantity * tableData[index].rate;
    const updatedKacchaTotal = Number(values.kaccha_total) - itemTotal;
    const updatedHammali = Number(values.hammali) - 5 * tableData[index].bag;
    const updatedBhada = Number(values.bhada) - Number(values.bhada_rate) * tableData[index].bag;
    const updatedNagarTax = Number(values.nagar_palika_tax) - tableData[index].bag;
    const updatedCommission = Number(values.mandi_kharcha) - (Number(values.commission_rate) * itemTotal) / 100;

    const kharchaTotal =
      updatedCommission +
      updatedHammali +
      updatedNagarTax +
      updatedBhada +
      values.driver_inaam +
      values.nagdi +
      0;

    const pakkiBikri = updatedKacchaTotal - kharchaTotal;

    reset({
      ...values,
      kaccha_total: updatedKacchaTotal,
      hammali: updatedHammali,
      bhada: updatedBhada,
      nagar_palika_tax: updatedNagarTax,
      mandi_kharcha: updatedCommission,
      kharcha_total: kharchaTotal,
      pakki_bikri: pakkiBikri,
    });
    //


    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  const saveBill = async () => {
    const isValid = await trigger(["kisan", "date", "kaccha_total", "kharcha_total", "pakki_bikri", "mandi_kharcha", "bhada", "driver_inaam", "nagdi", "hammali", "nagar_palika_tax"]);
    if (!isValid) return;
    const formValues = getValues();
    const bill = {
      mandi_kharcha: formValues.mandi_kharcha,
      hammali: formValues.hammali,
      nagar_palika_tax: formValues.nagar_palika_tax,
      bhada: formValues.bhada,
      driver_inaam: formValues.driver_inaam,
      nagdi: formValues.nagdi,
      bhada_rate: formValues.bhada_rate,
      kisanBillItems: tableData,
      pendingStockItems: addRemaininglist,
      kharcha_total: formValues.kharcha_total,
      kaccha_total: formValues.kaccha_total,
      pakki_bikri: formValues.pakki_bikri,
      kisanId: getValues().kisan.partyId,
      kisan_name: getValues().kisan.name,
      bill_date: getValues().date,
    };

    const saveRes = await saveKisanBill(bill);
    if (saveRes?.responseCode == "200") {
      setOpen(true);
      setFormData(getValues());
      resetFullBill();
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
    const isValid = await trigger(["item_name", "qty", "bag", "rate"]);
    if (!isValid) return;

    const values = getValues();

    const {
      item_name,
      qty,
      bag,
      rate,
      hammali,
      nagar_palika_tax,
      kaccha_total,
      mandi_kharcha,
      commission_rate,
      driver_inaam,
      nagdi,
    } = values;

    // Normalize numbers once
    const nQty = Number(qty);
    const nBag = Number(bag);
    const nRate = Number(rate);

    const nHammali = Number(hammali || 0);
    const nNagarTax = Number(nagar_palika_tax || 0);
    const nKacchaTotal = Number(kaccha_total);
    const nMandiKharcha = Number(mandi_kharcha || 0);

    const nCommissionRate = Number(commission_rate);
    const nDriverInaam = Number(driver_inaam);
    const nNagdi = Number(nagdi);

    // Derived calculations
    const itemTotal = nQty * nRate;

    const updatedHammali = nHammali + 5 * nBag;
    const updatedNagarTax = nNagarTax + nBag;
    const updatedKacchaTotal = nKacchaTotal + itemTotal;

    const updatedCommission =
      nMandiKharcha + (nCommissionRate * itemTotal) / 100;

    const kharchaTotal =
      updatedCommission +
      updatedHammali +
      updatedNagarTax +
      nDriverInaam +
      nNagdi;

    const pakkiBikri = updatedKacchaTotal - kharchaTotal;

    // Add row to table
    setTableData((prev) => [
      ...prev,
      {
        item_name,
        bag: nBag,
        rate: nRate,
        quantity: nQty,
        item_total: itemTotal,
      },
    ]);

    // Reset form with updated totals
    reset({
      ...values,
      item_name: "",
      qty: "",
      bag: "",
      rate: "",
      kaccha_total: updatedKacchaTotal,
      hammali: updatedHammali,
      mandi_kharcha: updatedCommission,
      nagar_palika_tax: updatedNagarTax,
    });

    // Set dependent calculated fields
    setValue("kharcha_total", kharchaTotal, { shouldValidate: true });
    setValue("pakki_bikri", pakkiBikri, { shouldValidate: true });
  };


  const nextActionItemName = async (e) => {
    setTimeout(() => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!itemInputRef.current.value) {
          constantRefs.current["bhada_rate"]?.focus();
          return;
        } else {
          setFocus('bag');
        }
      }
    }, 100);
  };

  const nextAction = async (e, field) => {

    if (e.key === 'Enter') {
      e.preventDefault();
      switch (field) {
        case 'Quantity':
          setFocus('rate');
          break;
        case 'Bag':
          setFocus('qty');
          break;
        case 'Rate':
          await addToTable();
          itemInputRef.current?.focus();
          break;
        case 'bhada_rate':
          calculateBhada();
          constantRefs.current["bhada"]?.focus();
          break;
        case 'bhada':
          constantRefs.current["driver_inaam"]?.focus();
          break;
        case 'driver_inaam':
          constantRefs.current["nagdi"]?.focus();
          break;
        case 'nagdi':
          printButtonRef.current.focus();
          // itemSelectRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  const calculateBhada = () => {
    if (!getValues().bhada_rate) return;
    const values = getValues();
    const newBhada = Number(values.bhada_rate) * (Number(values.nagar_palika_tax) || 0);
    setValue("bhada", newBhada, { shouldValidate: true });
  }

  const kisanTypeChange = (event) => {
    setValue("kisanType", event.target.value, { shouldValidate: true });
    const filteredList = kisanList?.filter((kisan) => kisan.kisanType === event.target.value);
    setFilteredKisanList(filteredList);

    if (kisanInputRef.current) {
      setTimeout(() => kisanInputRef.current?.focus(), 0);
    }
  }

  const getKisanPendingStock = async (partyId) => {
    setRemainingList([]);
    if (!partyId) return;
    const billData = await getKisanPendingStockApi(partyId);
    if (billData?.responseBody?.length) {
      setRemainingList(billData?.responseBody);
    } else {
      setRemainingList([{ item_name: "NO PENDING STOCK", quantity: "" }]);
    }
  };

  const getCommisionRate = (commission_rate) => {
    if (!commission_rate) {
      console.error("Commission rate not found for this kisan");
    }
    else setValue("commission_rate", Number(commission_rate), { shouldValidate: true });
  };

  const moveToAddItem = async (index, pendingId) => {
    const markItemSoldRes = await markPendingStockAsCleared(pendingId);
    if (!markItemSoldRes?.responseBody?.sold) return;

    const itemToMove = remaininglist[index];
    // setAddRemainingList([...addRemaininglist, { name: itemToMove.item_name, quantity: itemToMove.quantity }]);
    setValue("item_name", itemToMove.item_name, { shouldValidate: true });
    setValue("qty", itemToMove.quantity, { shouldValidate: true });
    const updatedRemainingList = [...remaininglist];
    updatedRemainingList.splice(index, 1);
    setRemainingList(updatedRemainingList);
  };

  const remainingItemAdd = () => {
    if (!selectedItem || !qtyRemaining) return;
    itemSelectRef.current?.focus();
    setAddRemainingList([...addRemaininglist, { name: selectedItem, quantity: qtyRemaining }]);
    setSelectedItem("");
    setRemainingQty("");
  };

  const resetFullBill = () => {
    setTableData([]);
    setAddRemainingList([]);
    setRemainingList([]);
    reset();
    reset({
      kisan: null,
      kisanType: null,
      hammali: null,
      nagar_palika_tax: null,
      mandi_kharcha: null,
      bhada: null,
      commission_rate: null,
      driver_inaam: null,
      nagdi: null,
      bhada_rate: null,
      kaccha_total: null,
      kharcha_total: null,
      pakki_bikri: null,
      billId: null,
    });
    setFetchedBill(false);
  };

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
          <Grid item xs={3}>
            <Grid container direction="column" justifyContent="center" alignItems="center">
              {fieldDefinitions?.map(
                (fieldDef) =>
                  !fieldDef.hidden && (
                    <Controller
                      key={fieldDef.name}
                      name={fieldDef.name}
                      control={control}
                      rules={fieldDef.validation}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={fieldDef.label}
                          variant="outlined"
                          disabled={fieldDef.disable}
                          size="small"
                          fullWidth
                          sx={{ mb: 2 }}
                          inputRef={(el) => (constantRefs.current[fieldDef.name] = el)}
                          onKeyDown={(e) => nextAction(e, fieldDef.name)}
                          error={!!errors[field.name]}
                          helperText={errors[field.name] ? errors[field.name].message : ""}
                        />
                      )}
                    />
                  )
              )}
            </Grid>
            <Grid container justifyContent="center" alignItems="center">
              {/* <PreviousBills billData={{ id: getValues()?.kisan?.partyId, date: getValues()?.date }} partyType={"kisan"} /> */}

              <div className={styles.itemlist}>
                <b>PURANA BAKAYA STOCK</b>
                <div className={styles.listheader}>
                  ITEM NAME / QTY
                </div>

                <ul className={styles.listBodyPrevPending}>
                  {remaininglist.map((item, index) => (
                    <li key={index}>
                      <span className="item-name">{item.item_name}</span>
                      <span className="item-qty">{item.quantity}</span>
                      <span className="move-button"><button type="button" onClick={() => moveToAddItem(index, item.id)}>➔</button></span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.itemlist}>
                <b>BAKAYA STOCK JODE</b>
                <div className={styles.listheader}>
                  <span>ITEM NAME</span>
                  <span>QTY</span>
                </div>

                <div className={styles.additem}>
                  <select
                    ref={itemSelectRef}
                    value={selectedItem}
                    onChange={e => {
                      setSelectedItem(e.target.value);
                      setTimeout(() => qtyRef.current?.focus(), 0);
                    }}
                  >
                    <option value="">Select item</option>
                    {itemsList.map(item => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    ref={qtyRef}
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={qtyRemaining}
                    onChange={e => setRemainingQty(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        if (!qtyRemaining) {
                          printButtonRef.current.focus();
                          return;
                        }
                        remainingItemAdd();
                      }
                    }}
                  />
                  <button type="button" onClick={remainingItemAdd}>Add</button>
                </div>

                <ul className={styles.listbody}>
                  {addRemaininglist.map((item, index) => (
                    <li key={index}>
                      <span className="itemname">{item.name}</span>
                      <span className="itemqty">{item.quantity}</span>
                    </li>
                  ))}
                </ul>

              </div>

            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Controller
                  name="billId"
                  control={control}
                  rules={{ required: "Enter Bill Number" }}
                  render={({ field }) =>
                    <TextField
                      style={{ width: '100%' }}
                      {...field}
                      label="Kisan Bill"
                      variant="outlined"
                      error={!!errors[field.name]}
                      helperText={errors[field.name] ? errors[field.name].message : ""}
                      size="small" />
                  }
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name="kisan"
                  control={control}
                  rules={{ required: "Enter Kisan Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value || null}
                      options={kisanFilteredList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Kisan Name"
                          inputRef={(input) => {
                            params.InputProps.ref(input);
                            kisanInputRef.current = input;
                          }}
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
                        getKisanPendingStock(value?.partyId);
                        getCommisionRate(value?.commission);
                        itemInputRef.current?.focus();
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
                    <FormControl
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.kisanType}
                    >
                      <InputLabel id="party-type-label">TYPE</InputLabel>
                      <Select
                        {...field}
                        label="TYPE"
                        inputRef={selectRef}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);       // 🔥 REQUIRED
                          kisanTypeChange(e);      // your logic
                        }}
                      >
                        <MenuItem value="">None</MenuItem> {/* optional */}
                        <MenuItem value="A">BPL</MenuItem>
                        <MenuItem value="B">Kisan Bill</MenuItem>
                        <MenuItem value="C">Aalo</MenuItem>
                        <MenuItem value="D">Local Bill</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <p className={styles.errMsg}>{errors.kisanType?.message}</p>
              </Grid>
              <Grid item xs={3}>
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
                  name="item_name"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      disableClearable
                      options={itemsList?.map((o) => o.name)}
                      onChange={(_, value) => field.onChange(value || "")}
                      value={field.value || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Item Name"
                          error={!!errors[field.name]}
                          helperText={errors[field.name] ? errors[field.name].message : ""}
                          type="search"
                          onKeyDown={(e) => nextActionItemName(e)}
                          inputRef={itemInputRef}
                          size="small"
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              {itemAddFields.slice(1)?.map((field) => (
                <Grid item xs={2} key={field.name}>
                  <TextField
                    size="small"
                    type="number"
                    label={field.label}
                    InputLabelProps={{ shrink: true }}
                    placeholder={field.label}
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
                {totalFields?.map((field) => (
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
                <Grid item xs={2}>
                  <Button variant="outlined" color="primary" fullWidth onClick={resetFullBill}>
                    Refresh
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button variant="contained" color="primary" fullWidth onClick={onPrintBtn}>
                    Print
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" disabled={fetchedBill} color="success" type="button" onClick={saveBill} ref={printButtonRef} fullWidth>
                    Save & Print
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
        <KisanBillPrint ref={componentRef} remainingStock={remaininglist} tableDataPrint={structuredClone(tableData)} restructureTable={false} formData={formData} />
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
