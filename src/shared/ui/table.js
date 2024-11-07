import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import styles from "./table.module.css";
import Pagination from '@mui/material/Pagination';

function SharedTable(props) {

    const [open, setOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [allTableData, setAllTableData] = useState([]);
    const [keyArray, setKeyArray] = useState([]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const editFromTable = (index) => {
        setEditingIndex(index);
        setOpen(true);
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }

    const deleteFromTable = (index) => {
        // const newRows = [...buyItemsArr];
        // newRows.splice(index, 1);
        // setTableData(newRows);
    }


    useEffect(() => {
        setColumns(props.columns);
        setTableData(props.tableData.slice(0,10));
        setAllTableData(props.tableData);
        setTotalPages(Math.floor(props.tableData.length/10));
        setKeyArray(props.keyArray);
    }, [props]);

    
  const handleChange = (event, value) => {
    setPage(value);
    console.log(value);
    
    setTableData(allTableData.slice(value*10,value*10+10));
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
                        {tableData.map((rowData, index) => (
                            <TableRow key={index}>
                                {keyArray.map((key, i) =>
                                    <TableCell key={i} align="left">
                                        {(() => {
                                            switch (key) {
                                                case "edit":
                                                    return <Button onClick={() => editFromTable(index)}><Edit /></Button>;
                                                case "delete":
                                                    return <Button onClick={() => deleteFromTable(index)}><Delete /></Button>;
                                                case "index":
                                                    return (page-1)*10 + index + 1;
                                                default:
                                                    return rowData[key];
                                            }
                                        })()}
                                    </TableCell>
                                )}
                            </TableRow>

                        ))}
                    </TableBody>
                </Table>
                <div className={styles.paninator}>
                  <Pagination count={totalPages} page={page} onChange={handleChange} />
                </div>
            </TableContainer>
            <div>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Edit Data</DialogTitle>
                    <DialogContent>
                        <DialogContentText></DialogContentText>
                        <div className={styles.editForm}>
                            {keyArray.map((key, i) => {
                                if (key === "edit" || key === "delete" || key === "index") {
                                    return null;
                                }
                                return (
                                    <div className={styles.formControl} key={key}>
                                        <label>{columns[i]}</label>
                                        <input value={tableData[editingIndex]?.[key]}/>
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button>Save</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default SharedTable;
