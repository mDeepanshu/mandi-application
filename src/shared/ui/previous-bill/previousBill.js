import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Dialog } from '@mui/material';
import styles from "./previousBill.module.css";
import PreviousBillsDialog from "../../../dialogs/previous-bills/previous-bill-dialog";
import { getKisanBillVersions, getVyapariBillVersions } from "../../../gateway/previous-bills-apis";

function PreviousBills(props) {

    // const fetchBill = () => {}

    const [open, setOpen] = useState(false);
    const [openErr, setOpenErr] = useState(false);
    const [billData, setBillData] = useState(false);
    const [totalPreviousBills, setTotalPreviousBills] = useState(0);

    const handleClickToOpen = async () => {
        // getBillVersions(props.id,"2024-11-07",0);

        let billDetails;
        if (props.partyType == "kisan") {
            billDetails = await getKisanBillVersions(props.billData?.id, props.billData?.date, 0);
        }
        else {
            billDetails = await getVyapariBillVersions(props.billData?.id, props.billData?.date, 0);
        }

        if (billDetails?.responseBody) {
            setTotalPreviousBills(billDetails?.responseBody?.totalPages);
            setOpen(true);
            setBillData(billDetails?.responseBody);
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
                <Button variant="contained" color="success" onClick={handleClickToOpen} fullWidth>Previous Bill</Button>
            </div>
            <div>
                <Dialog open={open} onClose={handleToClose}>
                    <PreviousBillsDialog billData={billData} partyType={props.partyType} totalPreviousBills={totalPreviousBills}/>
                </Dialog>
                <Dialog open={openErr} onClose={handleToClose}>
                    <div className={styles.noBills}>No Previous Bills</div>
                </Dialog>
            </div>
        </div>
    );
}

export default PreviousBills;
