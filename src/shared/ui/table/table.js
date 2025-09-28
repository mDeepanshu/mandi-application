import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from "@mui/icons-material";
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import styles from "./table.module.css";
import { useForm, Controller } from "react-hook-form";
import { updateAuctionTransaction } from "../../../gateway/comman-apis";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { getAllPartyList, getItem } from "../../../gateway/comman-apis";
import VyapariField from "../../elements/VyapariField";

function SharedTable(props) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [allTableData, setAllTableData] = useState([]);
  const [keyArray, setKeyArray] = useState([]);
  const [fieldDefinitions, setFieldDefinitions] = useState([]);
  const [sync, setSync] = useState({});
  const [openSync, setOpenSync] = useState(false);
  const [vyapariList, setVyapariList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [qty, setQty] = useState([]);
  const [qtyTotal, setQtyTotal] = useState(0);
  const [chungiTxn, setChungiTxn] = useState();

  const {
    control,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useForm();
  const [rowVariables, setRowVariables] = useState([]);

  const excludeArr = [
    "edit",
    "delete",
    "index",
    "navigation",
    "auctionDate",
    "bagWiseQuantity",
    "bagWiseQuantityArray",
    "deviceName",
    "itemName",
  ];

  useEffect(() => {
    getVyapariNames();
    getItemNames();
  }, []);

  useEffect(() => {
    const sum = qty?.reduce((accumulator, currentValue) => {
      return accumulator + Number(currentValue);
    }, 0);
    setQtyTotal(sum);
  }, [qty]);

  const handleNavigationClick = (rowIndex, direction) => {
    setRowVariables((prev) => {
      const newVariables = [...prev];
      newVariables[rowIndex] += direction; // Increment or decrement based on direction
      return newVariables;
    });
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  };

  const getItemNames = async () => {
    const allItems = await getItem();
    if (allItems?.responseBody) setItemList(allItems?.responseBody);
  };

  const editFromTable = (index, tranIdx) => {
    let fieldIndex;
    if (tableData[index][0].bag == null) {
      fieldIndex = fieldDefinitions.findIndex(obj => obj.name === "bag");
      setChungiTxn(true);
      const findQtyIdx = fieldDefinitions.findIndex(obj => obj.name === "quantity");
      const copiedFieldDefinitions = [...fieldDefinitions];
      copiedFieldDefinitions[findQtyIdx].label = "NAG";
      const updatedFieldDefinitions = copiedFieldDefinitions;
      setFieldDefinitions(updatedFieldDefinitions);
    }
    else {
      fieldIndex = fieldDefinitions.findIndex(obj => obj.name === "chungi");
      setChungiTxn(false);
    }
    if (fieldIndex !== -1) {
      setFieldDefinitions(prev =>
        prev.filter((_, i) => i !== fieldIndex)
      );
    }

    for (let i = 0; i < tableData[index].length; i++) {
      const element = tableData[index][i];
      if (element?.isOld == "N") tranIdx = i;
    }

    setEditingIndex(index);
    setOpen(true);
    for (let int = 0; int < props.keyArray.length; int++) {
      if (!excludeArr.includes(props.keyArray[int]))
        if (keyArray[int] == "partyName") {
          let defaultOption;
          if (props.bill_vyapari_id) defaultOption = vyapariList.find((option) => option.partyId == props.bill_vyapari_id);
          else defaultOption = vyapariList.find((option) => option.name == tableData[index]?.[tranIdx]?.partyName);
          setValue("partyName", defaultOption || null);
        } else if (keyArray[int] == "quantity" && !chungiTxn) {
          setQtyTotal(tableData?.[index]?.[tranIdx]?.[keyArray[int]]);
          setQty(tableData?.[index]?.[tranIdx]?.bagWiseQuantityArray);
        } else setValue(keyArray[int], tableData[index]?.[tranIdx]?.[keyArray[int]]);
    }
  };

  const deleteFromTable = (index) => {
    // const newRows = [...buyItemsArr];
    // newRows.splice(index, 1);
    // setTableData(newRows);
  };

  useEffect(() => {
    if (props.tableData?.length) {
      setColumns(props.columns);
      setRowVariables(Array(props.tableData.length).fill(0));
      setTableData(props.tableData);
      setAllTableData(props.tableData);
      setTotalPages(Math.floor(props.tableData.length / 10));
      setKeyArray(props.keyArray);

      let fields = [];
      for (let int = 0; int < props.keyArray.length; int++) {
        if (!excludeArr.includes(props.keyArray[int])) {
          fields.push({
            name: props.keyArray[int],
            label: props.columns[int],
            defaultValue: "",
            validation: { required: `${props.columns[int]} is required` },
          });
        }
      }
      setFieldDefinitions(fields);
    } else {
      setTableData([]);
      setAllTableData([]);
    }
  }, [props]);

  const handleChange = (event, value) => {
    setPage(value);
    setTableData(allTableData.slice(value * 10, value * 10 + 10));
  };

  let throttleUpdateRecord = true;
  const updateRecord = async (saveAndReflect) => {
    if (!throttleUpdateRecord) return;
    throttleUpdateRecord = false;
    setTimeout(() => {
      throttleUpdateRecord = true;
    }, 3000);
    if(props.toggleLoading) props.toggleLoading(true, "UPDATING RECORD...");
    const isValid = await trigger(["partyName", "rate", "quantity"]);
    if (!isValid) return;
    if (saveAndReflect) {
      let changedValues = {
        ...tableData[editingIndex][tableData[editingIndex]?.length - 1],
        ...getValues(),
        vyapariId: getValues().partyName.partyId,
      };
      changedValues.bagWiseQuantity = [];
      if (changedValues.chungi && changedValues.chungi !=0 ) changedValues.chungi = Number(changedValues.chungi);
      if (!chungiTxn) {
        changedValues.bagWiseQuantity = qty;
        changedValues.quantity = qtyTotal;
      }
      delete changedValues.auctionDate;
      await updateAuctionTransaction(changedValues);
      props.refreshBill();
      handleClose();
      props.toggleLoading({ isLoading: false, message: "" });
      setSync({
        syncSeverity: true ? "success" : "error",
        syncStatus: true ? "EDIT SUCCESSFUL" : "EDIT UNSUCCESSFUL",
      });
      setOpenSync(true);
    } else {
      let editedData = getValues();
      let finalEdit;
      if (editedData.itemTotal) {
        finalEdit = {
          ...editedData,
          itemTotal: Number(editedData.rate) * Number(editedData.quantity),
        };
      } else {
        finalEdit = {
          ...editedData,
          total: Number(editedData.rate) * Number(editedData.quantity),
        };
      }

      const updatedObject = {
        ...tableData[editingIndex][tableData[editingIndex]?.length - 1],
        ...finalEdit,
      };
      let previousTableData = tableData[editingIndex].push(updatedObject);
      // previousTableData[editingIndex][tableData[editingIndex].length - 1] = updatedObject;
      // setTableData(previousTableData);
      handleClose();
    }
    if(props.toggleLoading) props.toggleLoading(false, "");
  };

  const closeSnackbar = (event, reason) => {
    setOpenSync(false);
  };

  const handleConvertDate = (specificDate) => {
    const date = new Date(specificDate);
    // console.log(specificDate.toISOString());
    // return specificDate.toISOString();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const newQty = (event) => {
    event.preventDefault();
    const value = getValues("quantity");
    const rateValue = getValues("rate");
    setQty([...qty, Number(value)]);
    const currentVal = getValues("bag");
    setValue("bag", Number(currentVal) + 1, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("quantity", "", { shouldValidate: false, shouldDirty: true });
  };

  const removeQty = (event, index) => {
    event.preventDefault();
    const newQty = [...qty];
    newQty.splice(index, 1);
    setQty(newQty);
    const currentVal = getValues("bag");
    setValue("bag", Number(currentVal) - 1, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className={styles.tableBody}>
      <Table stickyHeader aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((row, index) => (
              <TableCell align="left" key={index}>
                <b>{row}</b>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData?.map((rowData, index) => {
            return (
              <TableRow key={index}>
                {keyArray.map((key, i) => (
                  <TableCell key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1rem" }}>
                    {(() => {
                      switch (key) {
                        case "edit":
                          return (
                            <Button onClick={() => editFromTable(index, rowData?.length - 1)}>
                              <Edit />
                            </Button>
                          );
                        case "delete":
                          return (
                            <Button onClick={() => deleteFromTable(index)}>
                              <Delete />
                            </Button>
                          );
                        case "index":
                          return (page - 1) * 10 + index + 1;
                        case "navigation":
                          if (rowData?.length > 1) {
                            return (
                              <>
                                <Button disabled={rowVariables[index] === 0} onClick={() => handleNavigationClick(index, -1)}>
                                  <ArrowBackIos />
                                </Button>
                                <Button
                                  disabled={rowVariables[index] === rowData?.length - 1}
                                  onClick={() => handleNavigationClick(index, +1)}
                                >
                                  <ArrowForwardIos />
                                </Button>
                              </>
                            );
                          } else {
                            return "No Edit History";
                          }
                        case "auctionDate":
                          return handleConvertDate(rowData?.[rowData?.length - 1 - rowVariables?.[index]]?.[key]);
                        default:
                          return rowData?.[rowData?.length - 1 - rowVariables?.[index]]?.[key];
                      }
                    })()}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>EDIT DATA</DialogTitle>
          <DialogContent>
            <div className={styles.editForm}>
              {fieldDefinitions.map((fieldDef, index) => {
                if (fieldDef.name === "partyName") return <VyapariField name="partyName" control={control} errors={errors} size="small" />;
              })}
              {fieldDefinitions.map((fieldDef, index) => {
                if (fieldDef.name !== "partyName") {
                  return (
                    <>
                      <Controller
                        key={index}
                        name={fieldDef.name}
                        control={control}
                        defaultValue={fieldDef.defaultValue}
                        // rules={fieldDef.validation}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={fieldDef.label.toUpperCase()}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            type="number"
                            fullWidth
                            // error={!!errors[fieldDef.name]}
                            // helperText={
                            //   errors[fieldDef.name]
                            //     ? errors[fieldDef.name].message
                            //     : ""
                            // }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && fieldDef.name === "quantity") {
                                //   e.preventDefault();
                                newQty(e);
                              }
                            }}
                            size="small"
                          />
                        )}
                      />
                      {fieldDef.name === "quantity" && !chungiTxn && (
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            marginTop: -20,
                          }}
                        >
                          <div className={styles.quantitylist}>
                            <ul className={styles.horizontallist}>
                              {qty?.map((item, index) => (
                                <li key={index}>
                                  {item}
                                  <button className={styles.qtybtn} onClick={(event) => removeQty(event, index)}>
                                    x
                                  </button>
                                </li>
                              ))}
                            </ul>
                            <div className={styles.qtytotal}>{qtyTotal}</div>
                          </div>
                          <button className={styles.addqtybtn} onClick={newQty}>
                            ADD{" "}
                          </button>
                        </div>
                      )}
                    </>
                  );
                }
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => updateRecord(false)}>Save</Button>
            <Button onClick={() => updateRecord(true)}>Save And Reflect</Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <Snackbar open={openSync} autoHideDuration={5000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={sync.syncSeverity} variant="filled" sx={{ width: "100%" }}>
            {sync.syncStatus}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default SharedTable;
