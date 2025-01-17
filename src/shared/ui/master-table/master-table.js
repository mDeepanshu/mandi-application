import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import styles from "./masterTable.module.css";
import Pagination from '@mui/material/Pagination';
import { useForm, Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import { getAllPartyList } from "../../../gateway/comman-apis";
import { dateFormat, dateTimeFormat } from "../../../constants/config";

function MasterTable(props) {

    const [open, setOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [vyapariList, setVyapariList] = useState([]);
    const [auctionEntryKisanId, setAuctionEntryKisanId] = useState({ kisanId: null, count: 0 });
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [allTableData, setAllTableData] = useState([]);
    const [keyArray, setKeyArray] = useState([]);
    const [fieldDefinitions, setFieldDefinitions] = useState([]);
    const [paginationLength, setPaginationLength] = useState(10);

    const { control, formState: { errors }, setValue, getValues } = useForm();

    const handleClose = () => setOpen(false);

    const editFromTable = (index) => {
        setEditingIndex(index);
        for (let int = 0; int < props.keyArray.length; int++) {
            if (!(props.keyArray[int] === "edit" || props.keyArray[int] === "delete" || props.keyArray[int] === "index" || props.keyArray[int] === "navigation")) {
                if (keyArray[int] == "vyapariName") {
                    const defaultOption = vyapariList.find(option => option.name == tableData[index]?.vyapariName);
                    setValue("vyapariName", defaultOption || null);
                } else setValue(keyArray[int], tableData?.[index]?.[keyArray[int]]);
            }
        }
        setOpen(true);
    }

    const deleteFromTable = (index) => {
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }

    const getVyapariNames = async () => {
        const allVyapari = await getAllPartyList("VYAPARI");
        if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
    }

    useEffect(() => {
        getVyapariNames();
    }, []);

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
        let fields = [];
        for (let int = 0; int < props.keyArray.length; int++) {
            if (!(props.keyArray[int] === "edit" || props.keyArray[int] === "delete" || props.keyArray[int] === "index" || props.keyArray[int] === "navigation")) {
                fields.push({
                    name: props.keyArray[int],
                    label: columns[int],
                    defaultValue: '',
                    validation: { required: `${columns[int]} is required` },
                })
            }
        }
        setFieldDefinitions(fields);
    }, [props]);


    const handleChange = (event, value) => {
        setPage(value);
        setTableData(allTableData.slice((value - 1) * paginationLength, (value - 1) * paginationLength + paginationLength));
    };


    const handleSelectChange = (event) => {
        const selectedValue = parseInt(event.target.value, 10);
        setPaginationLength(selectedValue);
        setTotalPages(Math.ceil(props.tableData?.length / selectedValue));
        setPage(1);
        setTableData(props.tableData?.slice(0, selectedValue));
    };

    const updateRecord = () => {
        let editedData = getValues();
        let finalEdit;
        if (editedData.vyapariName) {
            editedData.vyapariId = editedData.vyapariName.partyId;
            editedData.vyapariName = editedData.vyapariName.name;
        }
        // delete editedData.vyapariName;
        if (editedData.itemTotal) {
            finalEdit = {
                ...editedData,
                itemTotal: Number(editedData.rate) * Number(editedData.quantity),
            }
        } else {
            finalEdit = {
                ...editedData,
                total: Number(editedData.rate) * Number(editedData.quantity),
            }
        }
        if (props.editEntry) {
            props.editEntry(editingIndex, finalEdit);
        }

        handleClose();
    };

    const auctionEntryChecked = (e, index, kisanId) => {
        props.onSelectEntry(e, index);
        if (!e.target.checked) {
            setAuctionEntryKisanId((prevState) => ({
                kisanId: kisanId,
                count: prevState.count - 1,
            }));
        } else {
            setAuctionEntryKisanId((prevState) => ({
                kisanId: kisanId,
                count: prevState.count + 1,
            }));
        }
    }

    const unCheckAllBoxes = () => {
        setAuctionEntryKisanId({ kisanId: null, count: 0 });
        const checkboxes = document.querySelectorAll('.table_cell input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
    }

    return (
        <div>
            <TableContainer component={Paper} className={styles.table}>
                <div className={styles.tableBody}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {columns.map((row, index) => (
                                    <TableCell align="left" key={index}><b>{row}</b></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData?.map((rowData, index) => (
                                <TableRow key={index} className='table_cell'>
                                    {keyArray?.map((key, i) => (
                                        <TableCell key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1.2rem" }}>
                                            {(() => {
                                                switch (key) {
                                                    case "edit":
                                                        return <Button onClick={() => editFromTable(index)}><Edit /></Button>;
                                                    case "delete":
                                                        return <Button onClick={() => deleteFromTable(index)}><Delete /></Button>;
                                                    case "grant":
                                                        return <Button disabled={rowData?.status === `APPROVED`} sx={{ borderRadius: "15px" }} onClick={() => props.changeStatus(`APPROVED`, rowData?.id)} className={styles.deviceControlBtn} variant="contained" color="success">GRANT</Button>;
                                                    case "revoke":
                                                        return <Button disabled={rowData?.status === `REJECTED`} sx={{ borderRadius: "15px" }} onClick={() => props.changeStatus(`REJECTED`, rowData?.id)} className={styles.deviceControlBtn} variant="contained" color="error">REJECT</Button>;
                                                    case "index":
                                                        return (page - 1) * paginationLength + index + 1;
                                                    case "checkbox":
                                                        return <input type='checkbox' checked={props.checkedEntries[(page - 1) * paginationLength + index]} key={(page - 1) * paginationLength + index} onChange={(e) => auctionEntryChecked(e, (page - 1) * paginationLength + index, rowData?.kisanId)} disabled={rowData?.kisanId != auctionEntryKisanId.kisanId && auctionEntryKisanId.count > 0} />;
                                                    case "date":
                                                        return rowData[key] === "TOTAL" ? <b>TOTAL</b> : new Date(rowData[key]).toLocaleString('en-IN', dateFormat);
                                                    case "auctionDate":
                                                        return rowData[key] === "TOTAL" ? <b>TOTAL</b> : new Date(rowData[key]).toLocaleString('en-IN', dateTimeFormat);
                                                    case "navigation":
                                                        return (
                                                            <>
                                                                <Button><ArrowBackIos /></Button>
                                                                <Button><ArrowForwardIos /></Button>
                                                            </>
                                                        );
                                                    case "daysExceded":
                                                        return (
                                                            <div className={`${styles.myClass} ${rowData[key] > 0 ? styles.daysExceded : styles.daysNotExceded}`}>
                                                                {rowData[key]}
                                                            </div>
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
                                if (fieldDef.name === "vyapariName") {
                                    return (
                                        <Controller
                                            key={fieldDef.partyId}
                                            name={fieldDef.name}
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
                                                                shrink: true,
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <SearchIcon />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            size='small'
                                                        />
                                                    )}
                                                    onChange={(event, value) => field.onChange(value)}
                                                    disablePortal
                                                    id="combo-box-demo"
                                                    sx={{ width: '100%', paddingBottom: '10px' }} // Ensures Autocomplete is 100% wide
                                                />
                                            )}
                                        />
                                    );
                                } else {
                                    return (
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
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    fullWidth
                                                    error={!!errors[fieldDef.name]}
                                                    helperText={errors[fieldDef.name] ? errors[fieldDef.name].message : ''}
                                                    size="small"
                                                />
                                            )}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={updateRecord} color='success' variant="contained">Save</Button>
                        <Button onClick={handleClose} variant="contained">Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default MasterTable;