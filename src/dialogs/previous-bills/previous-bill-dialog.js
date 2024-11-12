import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import styles from "./previousBillsDialog.module.css";
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';
import  KisanBillPrint  from "../../dialogs/kisan-bill/kisan-bill-print";

function PreviousBillsDialog(props) {

    const [formData, setFormData] = useState();
    const [tableData, setTableData] = useState();


    useEffect(() => {
        // setTableData(props)
        setTableData(props?.billData?.[0]?.kisanBillItems);
        console.log(props);
        if (props?.billData?.[0]) {
            const { kisanBillItems, ...newObj } = props?.billData[0];
            setFormData(newObj);
        }

        
      }, [props]);

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div><Button><ArrowBackIos/></Button></div>
                <div></div>
                <div><Button><ArrowForwardIos/></Button></div>
            </div>
            <div>
                <KisanBillPrint formData={formData} tableData={tableData}/>
            </div>
            <div></div>
        </div>
    );
}

export default PreviousBillsDialog;