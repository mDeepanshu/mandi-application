import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import styles from "./masterTable.module.css";
import Pagination from '@mui/material/Pagination';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

function MasterTable(props) {

    const [open, setOpen] = useState(false);
    // const [editingIndex, setEditingIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [allTableData, setAllTableData] = useState([]);
    const [keyArray, setKeyArray] = useState([]);
    const [fieldDefinitions, setFieldDefinitions] = useState([]);
    const [paginationLength, setPaginationLength] = useState(10);

    const { control, handleSubmit, register, reset, formState: { errors }, setValue, getValues } = useForm();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const editFromTable = (index) => {
        // setEditingIndex(index);
        setOpen(true);
        for (let int = 0; int < props.keyArray.length; int++) {
            if (!(props.keyArray[int] === "edit" || props.keyArray[int] === "delete" || props.keyArray[int] === "index" || props.keyArray[int] === "navigation")) {
                setValue(keyArray[int], tableData?.[index]?.[0]?.[keyArray[int]]);
            }
        }

    }

    const deleteFromTable = (index) => {
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }


    useEffect(() => {
        setColumns(props.columns);
        setTableData(props.tableData?.slice(0, paginationLength));
        setAllTableData(props.tableData);
        setTotalPages(Math.floor(props.tableData?.length / paginationLength) + 1);
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
        setTableData(allTableData.slice(value * paginationLength, value * paginationLength + paginationLength));
    };


    const handleSelectChange = (event) => {
        const selectedValue = parseInt(event.target.value, 10);
        setPaginationLength(selectedValue);
        setTotalPages(Math.floor(props.tableData?.length / selectedValue) + 1);
        setPage(1);
        setTableData(props.tableData?.slice(0, selectedValue));
    };

    const updateRecord = (event, value) => { };

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
                                <TableRow key={index}>
                                    {keyArray.map((key, i) => (
                                        <TableCell key={i} align="left" sx={{ padding: "4px 8px", lineHeight: "1.5rem" }}>
                                            {(() => {
                                                switch (key) {
                                                    case "edit":
                                                        return <Button onClick={() => editFromTable(index)}><Edit /></Button>;
                                                    case "delete":
                                                        return <Button onClick={() => deleteFromTable(index)}><Delete /></Button>;
                                                    case "grant":
                                                        return <Button disabled={rowData?.status===`APPROVED`} sx={{ borderRadius: "15px" }} onClick={()=>props.changeStatus(`APPROVED`,rowData?.id)} className={styles.deviceControlBtn} variant="contained" color="success">GRANT</Button>;
                                                    case "revoke":
                                                        return <Button disabled={rowData?.status===`REJECTED`} sx={{ borderRadius: "15px" }} onClick={()=>props.changeStatus(`REJECTED`,rowData?.id)} className={styles.deviceControlBtn} variant="contained" color="error">REJECT</Button>;
                                                    case "index":
                                                        return (page - 1) * paginationLength + index + 1;
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
                                                        return rowData[key];
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
                        <Button onClick={updateRecord}>Save</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default MasterTable;