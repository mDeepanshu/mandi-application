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

    const [open, setOpen] = useState(false);
    const [openErr, setOpenErr] = useState(false);
    const [billData, setBillData] = useState(false);

    useEffect(() => {
        console.log(props);
        
      }, [props]);

    const handleClickToOpen = async () => {
        // getBillVersions(props.id,"2024-11-07",0);
        console.log(props.billData?.id,props.billData?.date);
        
        const billDetails = await getBillVersions(props.billData?.id,props.billData?.date,0);
        if (billDetails.responseBody) {
            console.log(billDetails);
            setOpen(true);
            setBillData(billDetails.responseBody);
        } else {
            setOpenErr(true);
        }
    };

    const handleToClose = () => {
        setOpen(false);
        setOpenErr(false);
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
                    <PreviousBillsDialog billData={billData}/>
                </Dialog>
                <Dialog open={openErr} onClose={handleToClose}>
                    <div className={styles.noBills}>No Previous Bills</div>
                </Dialog>
            </div>
        </div>
    );
}

export default PreviousBills;
