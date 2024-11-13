import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import styles from "./previousBillsDialog.module.css";
import { Delete, Edit, ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';
import  KisanBillPrint  from "../../dialogs/kisan-bill/kisan-bill-print";
import {getBillVersions} from "../../gateway/previous-bills-apis";

function PreviousBillsDialog(props) {

    const [formData, setFormData] = useState();
    const [tableData, setTableData] = useState();
    const [billIndex, setBillIndex] = useState(0);
    const [totalBills, setTotalBills] = useState(0);

    const navigateBill = async(direction) => {
        const billDetails = await getBillVersions(props.billData?.id,props.billData?.date,totalBills-billIndex+direction);
        setBillIndex(billIndex+direction);
        PrintBill();
    }

    useEffect(() => {
        PrintBill();
        setBillIndex(0);
      }, [props]);


    const PrintBill = () => {
        
        setTableData(props?.billData?.content?.[0]?.kisanBillItems);
        setTotalBills(props?.billData?.size);

        if (props?.billData?.content?.[0]) {
            const { kisanBillItems, ...newObj } = props?.billData?.content?.[0];
            setFormData(newObj);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div><Button onClick={()=>navigateBill(-1)}  disabled={billIndex==0}><ArrowBackIos/></Button></div>
                <div></div>
                <div><Button onClick={()=>navigateBill(+1)}  disabled={billIndex==totalBills-1}><ArrowForwardIos/></Button></div>
            </div>
            <div>
                <KisanBillPrint formData={formData} tableData={tableData}/>
            </div>
            <div></div>
        </div>
    );
}

export default PreviousBillsDialog;