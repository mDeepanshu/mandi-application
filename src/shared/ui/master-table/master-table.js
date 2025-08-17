import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from "@mui/icons-material";
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import styles from "./masterTable.module.css";
import Pagination from "@mui/material/Pagination";
import { useForm, Controller } from "react-hook-form";
import { getAllPartyList } from "../../../gateway/comman-apis";
import { dateFormat, dateTimeFormat } from "../../../constants/config";
import { useMediaQuery } from "@mui/material";
import VyapariField from "../../elements/VyapariField";

function MasterTable(props) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vyapariList, setVyapariList] = useState([]);
  const [auctionEntryTransactionId, setAuctionEntryTransactionId] = useState({
    auctionId: null,
    count: 0,
  });
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [allTableData, setAllTableData] = useState([]);
  const [keyArray, setKeyArray] = useState([]);
  const [fieldDefinitions, setFieldDefinitions] = useState([]);
  const [paginationLength, setPaginationLength] = useState(100);
  const [qty, setQty] = useState([]);
  const [qtyTotal, setQtyTotal] = useState(0);
  const excludeArr = [
    "edit",
    "delete",
    "index",
    "navigation",
    "date",
    "auctionDate",
    "deviceName",
    "bagWiseQuantity",
    "bagWiseQuantityArray",
    "lastVasuliDate",
    "idNo",
    "daysExceded",
    "owedAmount",
    "partyType",
  ];
  const [adjustHeight, setAdjustHeight] = useState("370px");
  const isSmallScreen = useMediaQuery("(max-width:495px)");

  const {
    control,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useForm();

  const handleClose = () => setOpen(false);

  const [checkedItems, setCheckedItems] = useState({});

  // Reset checked checkboxes when table data changes
  useEffect(() => {
    if (props.customHeight) setAdjustHeight(props.customHeight);
    if (isSmallScreen) setAdjustHeight(`370px`);
    setCheckedItems({});
  }, [props.tableData]);

  const handleCheckboxChange = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const sum = qty?.reduce((accumulator, currentValue) => {
      return accumulator + Number(currentValue);
    }, 0);
    setQtyTotal(sum);
  }, [qty]);

  const editFromTable = (index) => {
    setEditingIndex(index);
    if (index != -1) {
      let fields = [];
      for (let int = 0; int < props.keyArray?.length; int++) {
        if (!excludeArr.includes(props.keyArray[int])) {
          if (
            (props.keyArray[int] == "bag" && allTableData?.[index]?.bag == null) ||
            (props.keyArray[int] == "chungi" && allTableData?.[index]?.bag != null)
          )
            continue;
          else {
            if (props.keyArray[int] == "quantity") setQtyTotal();
            fields.push({
              name: props.keyArray[int],
              label: columns[int],
              defaultValue: "",
              validation: { required: `${columns[int]} is required` },
            });
          }
        }
      }
      setFieldDefinitions(fields);
    }
  };

  const deleteFromTable = (index) => {
    if (props.deleteEntry) props.deleteEntry(index);
  };

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  };

  useEffect(() => {
    if (keyArray.includes("vyapariName")) getVyapariNames();
  }, [keyArray]);

  useEffect(() => {
    setTableData(props.tableData?.slice(0, paginationLength));
    setAllTableData(props.tableData);
    setTotalPages(Math.ceil(props.tableData?.length / paginationLength));
    if (props.keyArray.includes("checkbox")) unCheckAllBoxes();
    setPage(1);
  }, [props.tableData]);

  useEffect(() => {
    setColumns(props.columns);
    setKeyArray(props.keyArray);
  }, [props]);

  useEffect(() => {
    if (editingIndex == -1) return;
    for (let int = 0; int < props.keyArray?.length; int++) {
      if (!excludeArr.includes(props.keyArray[int])) {
        if (keyArray[int] == "vyapariName") {
          const defaultOption = vyapariList.find((option) => option.name == allTableData[editingIndex]?.vyapariName);
          setValue("vyapariName", defaultOption || null);
        } else if (keyArray[int] == "quantity") {
          if (allTableData?.[editingIndex]?.bag == null) {
            setQty([allTableData?.[editingIndex]?.[keyArray[int]]]);
          } else setQty(allTableData?.[editingIndex]?.bagWiseQuantityArray);
        } else setValue(keyArray[int], allTableData?.[editingIndex]?.[keyArray[int]]);
      }
    }
    setOpen(true);
  }, [fieldDefinitions]);

  const handleChange = (event, value) => {
    setPage(value);
    setTableData(allTableData.slice((value - 1) * paginationLength, (value - 1) * paginationLength + paginationLength));
    setCheckedItems({});
  };

  const handleSelectChange = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPaginationLength(selectedValue);
    setTotalPages(Math.ceil(props.tableData?.length / selectedValue));
    setPage(1);
    setTableData(props.tableData?.slice(0, selectedValue));
  };

  const updateRecord = async () => {
    if (props.editParty) {
      const editedData = {
        ...allTableData[editingIndex],
        ...getValues(),
      };
      editedData.id = editedData.partyId;

      delete editedData.lastVasuliDate;
      delete editedData.daysExceded;
      delete editedData.idNo;
      delete editedData.partyId;
      delete editedData.owedAmount;

      props.editParty(editedData);
      handleClose();
      return;
    }
    const isValid = await trigger(["partyName", "rate"]);
    if (!isValid) return;
    let editedData = getValues();
    let finalEdit;
    if (editedData.vyapariName) {
      editedData.vyapariId = editedData.vyapariName.partyId;
      editedData.vyapariName = editedData.vyapariName.name;
      editedData.bagWiseQuantityArray = qty;
      editedData.quantity = qtyTotal;
    }
    // delete editedData.vyapariName;
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
    if (props.editEntry) {
      props.editEntry(editingIndex, finalEdit);
    }

    handleClose();
  };

  const auctionEntryChecked = (e, index, auctionId) => {
    props.onSelectEntry(e, index);
    if (!e.target.checked) {
      setAuctionEntryTransactionId((prevState) => ({
        auctionId: auctionId,
        count: prevState.count - 1,
      }));
    } else {
      setAuctionEntryTransactionId((prevState) => ({
        auctionId: auctionId,
        count: prevState.count + 1,
      }));
    }
  };

  const unCheckAllBoxes = () => {
    setAuctionEntryTransactionId({ auctionId: null, count: 0 });
    const checkboxes = document.querySelectorAll('.table_cell input[type="checkbox"]');
    checkboxes?.forEach((checkbox) => {
      checkbox.checked = false;
    });
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
    <div>
      <TableContainer component={Paper} className={styles.table}>
        <div className={styles.tableBody} style={{ height: `calc(100vh - ${adjustHeight})` }}>
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
              {tableData?.map((rowData, index) => (
                <TableRow key={index} className="table_cell">
                  {keyArray?.map((key, i) => (
                    <TableCell key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1.2rem" }}>
                      {(() => {
                        switch (key) {
                          case "edit":
                            return (
                              <Button onClick={() => editFromTable((page - 1) * paginationLength + index)}>
                                <Edit />
                              </Button>
                            );
                          case "delete":
                            return (
                              <Button onClick={() => deleteFromTable((page - 1) * paginationLength + index)}>
                                <Delete />
                              </Button>
                            );
                          case "grant":
                            return (
                              <Button
                                disabled={rowData?.status === `APPROVED`}
                                sx={{ borderRadius: "15px" }}
                                onClick={() => props.changeStatus(`APPROVED`, rowData?.id)}
                                className={styles.deviceControlBtn}
                                variant="contained"
                                color="success"
                              >
                                GRANT
                              </Button>
                            );
                          case "revoke":
                            return (
                              <Button
                                disabled={rowData?.status === `REJECTED`}
                                sx={{ borderRadius: "15px" }}
                                onClick={() => props.changeStatus(`REJECTED`, rowData?.id)}
                                className={styles.deviceControlBtn}
                                variant="contained"
                                color="error"
                              >
                                REJECT
                              </Button>
                            );
                          case "index":
                            return (page - 1) * paginationLength + index + 1;
                          case "checkbox":
                            return (
                              <input
                                type="checkbox"
                                checked={props.checkedEntries[(page - 1) * paginationLength + index]}
                                key={(page - 1) * paginationLength + index}
                                onChange={(e) => auctionEntryChecked(e, (page - 1) * paginationLength + index, rowData?.auctionId)}
                                disabled={rowData?.auctionId != auctionEntryTransactionId.auctionId && auctionEntryTransactionId.count > 0}
                              />
                            );
                          case "date":
                            if (rowData[key] === "TOTAL") {
                              return <b>TOTAL</b>;
                            } else if (!rowData[key]) {
                              return ""; // or return null; if you want nothing to render
                            } else {
                              return new Date(rowData[key] + "Z").toLocaleString("en-IN", dateFormat);
                            }
                          case "auctionDate":
                            return rowData[key] === "TOTAL" ? (
                              <b>TOTAL</b>
                            ) : (
                              new Date(rowData[key] + "Z").toLocaleString("en-IN", dateTimeFormat)
                            );
                          case "navigation":
                            return (
                              <>
                                <Button>
                                  <ArrowBackIos />
                                </Button>
                                <Button>
                                  <ArrowForwardIos />
                                </Button>
                              </>
                            );
                          case "daysExceded":
                            return (
                              <div className={`${styles.myClass} ${rowData[key] > 0 ? styles.daysExceded : styles.daysNotExceded}`}>
                                {rowData[key]}
                              </div>
                            );
                          case "itemNameWithCheckbox":
                            return rowData.itemName ? (
                              <>
                                <input type="checkbox" checked={!!checkedItems[index]} onChange={() => handleCheckboxChange(index)} />{" "}
                                {rowData.itemName}
                              </>
                            ) : (
                              ""
                            );
                          default:
                            return rowData.date === "TOTAL" ? <b>{rowData[key]}</b> : rowData[key];
                        }
                      })()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={styles.paninator}>
          <select value={paginationLength} onChange={handleSelectChange} id="paginationLengthSelect" className={styles.selectLength}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <Pagination count={totalPages} page={page} onChange={handleChange} />
        </div>
      </TableContainer>
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>EDIT DATA</DialogTitle>
          <DialogContent>
            <div className={styles.editForm}>
              {fieldDefinitions.map((fieldDef) => {
                if (fieldDef.name === "vyapariName")
                  return <VyapariField name="vyapariName" control={control} errors={errors} size="small" />;
                else {
                  return (
                    <>
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
                            // type="number"
                            variant="outlined"
                            sx={{ mb: 3 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                            // error={!!errors[fieldDef.name]}
                            // helperText={
                            //   errors[fieldDef.name]
                            //     ? errors[fieldDef.name].message
                            //     : ""
                            // }
                            size="small"
                          />
                        )}
                      />
                      {fieldDef.name === "quantity" && (
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            marginTop: -20,
                          }}
                        >
                          <div className={styles.quantitylist}>
                            <ul className={styles.horizontallist}>
                              {qty.map((item, index) => (
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
            <Button onClick={updateRecord} color="success" variant="contained">
              Save
            </Button>
            <Button onClick={handleClose} variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default MasterTable;
