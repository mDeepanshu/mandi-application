import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import styles from "./table.module.css";
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { updateAuctionTransaction } from "../../../gateway/comman-apis";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getAllPartyList } from "../../../gateway/comman-apis";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';

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

    const { control, formState: { errors }, setValue, getValues } = useForm();
    const [rowVariables, setRowVariables] = useState([]);

    const excludeArr = ["edit", "delete", "index", "navigation", "auctionDate"];

    useEffect(() => {
        getVyapariNames();
    }, []);

    const handleNavigationClick = (rowIndex, direction) => {
        setRowVariables(prev => {
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
    }


    const editFromTable = (index, tranIdx) => {
        setEditingIndex(index);
        setOpen(true);
        for (let int = 0; int < props.keyArray.length; int++) {
            if (!excludeArr.includes(props.keyArray[int]))
                if (keyArray[int]=="partyName") {
                    const defaultOption = vyapariList.find(option =>  option.name == tableData[index]?.[tranIdx]?.partyName);
                    setValue("partyName", defaultOption || null);
                    
                }else setValue(keyArray[int], tableData[index]?.[tranIdx]?.[keyArray[int]]);
        }

    }

    const deleteFromTable = (index) => {
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }


    useEffect(() => {

        if (props.tableData.length) {
            setColumns(props.columns);
            setRowVariables(Array(props.tableData.length).fill(0));
            setTableData(props.tableData);
            setAllTableData(props.tableData);
            setTotalPages(Math.floor(props.tableData.length / 10));
            setKeyArray(props.keyArray);

            let fields = [];
            for (let int = 0; int < props.keyArray.length; int++) {
                // if (!(props.keyArray[int] === "edit" || props.keyArray[int] === "delete" || props.keyArray[int] === "index" || props.keyArray[int] === "navigation")) {
                if (!excludeArr.includes(props.keyArray[int])) {
                    fields.push({
                        name: props.keyArray[int],
                        label: columns[int],
                        defaultValue: '',
                        validation: { required: `${columns[int]} is required` },
                    })
                }
            }
            setFieldDefinitions(fields);
        }else{
            setTableData([]);
            setAllTableData([]);
        }
    }, [props]);


    const handleChange = (event, value) => {
        setPage(value);
        setTableData(allTableData.slice(value * 10, value * 10 + 10));
    };

    const updateRecord = async (saveAndReflect) => {
        if (saveAndReflect) {
            let changedValues = { ...tableData[editingIndex][tableData[editingIndex].length - 1], ...getValues(), auctionDate: new Date(), vyapariId:getValues().partyName.partyId };
            const updateRes = await updateAuctionTransaction(changedValues);
            props.refreshBill();
            handleClose();
            setSync({
                syncSeverity: true ? 'success' : 'error',
                syncStatus: true ? 'EDIT SUCCESSFUL' : 'EDIT UNSUCCESSFUL'
            });
            setOpenSync(true);

        } else {
            let editedData = getValues();
            let finalEdit;
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

            const updatedObject = { ...tableData[editingIndex][tableData[editingIndex].length - 1], ...finalEdit };
            let previousTableData = tableData[editingIndex].push(updatedObject);
            // previousTableData[editingIndex][tableData[editingIndex].length - 1] = updatedObject;
            // setTableData(previousTableData);
            handleClose();
        }

    };

    const closeSnackbar = (event, reason) => {
        setOpenSync(false);
    };

    const handleConvertDate = (specificDate) => {
        const date = new Date(specificDate);
        // console.log(specificDate.toISOString());
        // return specificDate.toISOString();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div>
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {columns.map((row, index) => (
                            <TableCell align="left" key={index}>{row}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData?.map((rowData, index) => {
                        return (<TableRow key={index}>
                            {keyArray.map((key, i) =>
                                <TableCell key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1rem" }}>
                                    {(() => {
                                        switch (key) {
                                            case "edit":
                                                return <Button onClick={() => editFromTable(index, rowData.length - 1)}><Edit /></Button>;
                                            case "delete":
                                                return <Button onClick={() => deleteFromTable(index)}><Delete /></Button>;
                                            case "index":
                                                return (page - 1) * 10 + index + 1;
                                            case "navigation":
                                                if (rowData.length > 1) {
                                                    return <>
                                                        <Button disabled={rowVariables[index] === 0} onClick={() => handleNavigationClick(index, -1)}><ArrowBackIos /></Button>
                                                        <Button disabled={rowVariables[index] === rowData.length - 1} onClick={() => handleNavigationClick(index, +1)}><ArrowForwardIos /></Button>
                                                    </>;
                                                } else {
                                                    return "No Edit History";
                                                }
                                            case "auctionDate":
                                                return handleConvertDate(rowData?.[rowData.length - 1 - rowVariables?.[index]]?.[key]);
                                            default:
                                                return rowData?.[rowData.length - 1 - rowVariables?.[index]]?.[key];
                                        }
                                    })()}
                                </TableCell>
                            )}
                        </TableRow>)
                    })}
                </TableBody>
            </Table>
            <div>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>EDIT DATA</DialogTitle>
                    <DialogContent>
                        <DialogContentText></DialogContentText>
                        <div className={styles.editForm}>
                            {fieldDefinitions.map((fieldDef) => {
                                if (fieldDef.name === "partyName") {
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
                                                    sx={{ width: '100%' }} // Ensures Autocomplete is 100% wide
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
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={() => updateRecord(false)}>Save</Button>
                        <Button onClick={() => updateRecord(true)}>Save And Reflect</Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div>
                <Snackbar
                    open={openSync}
                    autoHideDuration={5000}
                    onClose={closeSnackbar}
                >
                    <Alert
                        onClose={closeSnackbar}
                        severity={sync.syncSeverity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {sync.syncStatus}
                    </Alert>
                </Snackbar>
            </div>
        </div>

    );
}

export default SharedTable;