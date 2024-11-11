import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import styles from "./previousBillsDialog.module.css";
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';

function PreviousBillsDialog(props) {


    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div><Button><ArrowBackIos/></Button></div>
                <div></div>
                <div><Button><ArrowForwardIos/></Button></div>
            </div>
        </div>
    );
}

export default PreviousBillsDialog;
