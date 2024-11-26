import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import styles from "./table.module.css";
import Pagination from '@mui/material/Pagination';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { updateAuctionTransaction } from "../../../gateway/comman-apis";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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

    const { control, handleSubmit, register, reset, formState: { errors }, setValue, getValues } = useForm();
    const [rowVariables, setRowVariables] = useState([]);

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

    const editFromTable = (index) => {
        setEditingIndex(index);
        setOpen(true);
        for (let int = 0; int < props.keyArray.length; int++) {
            if (!(props.keyArray[int] === "edit" || props.keyArray[int] === "delete" || props.keyArray[int] === "index" || props.keyArray[int] === "navigation"))
                setValue(keyArray[int], tableData[index]?.[rowVariables[index]]?.[keyArray[int]]);
        }

    }

    const deleteFromTable = (index) => {
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }


    useEffect(() => {
        if (props.tableData.length) {
            console.log(props);

            setColumns(props.columns);
            setRowVariables(Array(props.tableData.length).fill(0));
            setTableData(props.tableData.slice(0, 10));
            setAllTableData(props.tableData);
            setTotalPages(Math.floor(props.tableData.length / 10));
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
        }
    }, [props]);


    const handleChange = (event, value) => {
        setPage(value);
        console.log(value);
        setTableData(allTableData.slice(value * 10, value * 10 + 10));
    };

    const updateRecord = async (saveAndReflect) => {

        if (saveAndReflect) {
            let changedValues = { ...tableData[editingIndex][tableData[editingIndex].length - 1], ...getValues(), auctionDate:new Date() };
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
                    itemTotal:Number(editedData.rate)*Number(editedData.quantity),
                }
            } else {
                finalEdit = {
                    ...editedData,
                    total:Number(editedData.rate)*Number(editedData.quantity),
                }
            }
            
            const updatedObject = { ...tableData[editingIndex][tableData[editingIndex].length - 1], ...finalEdit };
            console.log(updatedObject);
            let previousTableData = tableData[editingIndex].push(updatedObject);
            // previousTableData[editingIndex][tableData[editingIndex].length - 1] = updatedObject;
            console.log(previousTableData);
            // setTableData(previousTableData);
            handleClose();
        }

    };

    const closeSnackbar = (event, reason) => {
        setOpenSync(false);
    };

    return (
        <div>
            <TableContainer component={Paper} className={styles.table}>
                <Table aria-label="simple table">
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
                                    <TableCell key={i} align="left">
                                        {(() => {
                                            switch (key) {
                                                case "edit":
                                                    return <Button onClick={() => editFromTable(index)}><Edit /></Button>;
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
                                                default:
                                                    return rowData[rowVariables[index]][key];
                                            }
                                        })()}
                                    </TableCell>
                                )}
                            </TableRow>)
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className={styles.paninator}>
                <Pagination count={totalPages} page={page} onChange={handleChange} />
            </div>
            <div>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>EDIT DATA</DialogTitle>
                    <DialogContent>
                        <DialogContentText></DialogContentText>
                        <div className={styles.editForm}>
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