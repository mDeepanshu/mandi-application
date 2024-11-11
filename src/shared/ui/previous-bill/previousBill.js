import React, { useEffect, useState } from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import styles from "./previousBill.module.css";
import Pagination from '@mui/material/Pagination';
import PreviousBillsDialog from "../../../dialogs/previous-bills/previous-bill-dialog";
import {getBillVersions} from "../../../gateway/previous-bills-apis";

function PreviousBills(props) {

    const fetchBill = () => {}

    const [open, setOpen] = React.useState(false);

    const handleClickToOpen = () => {
        setOpen(true);
        getBillVersions("string","2024-11-07",0);
    };

    const handleToClose = () => {
        setOpen(false);
    };

    return (
        <div className={styles.container}>
            {/* <div>
                <label for="cars">View Previous Printed Bill: </label>
            </div> */}
            <div>
                <Button variant="contained" color="success" onClick={handleClickToOpen} fullWidth>View Previous Printed Bill</Button>
            </div>
            <div>
                <Dialog open={open} onClose={handleToClose}>
                    <PreviousBillsDialog/>
                </Dialog>
            </div>
        </div>
    );
}

export default PreviousBills;
