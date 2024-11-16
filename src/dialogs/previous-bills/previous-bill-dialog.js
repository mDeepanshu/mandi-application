import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import styles from "./previousBillsDialog.module.css";
import { ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import VyapariBillPrint from "../../dialogs/vyapari-bill/vyapari-bill-print";
import { getKisanBillVersions, getVyapariBillVersions } from "../../gateway/previous-bills-apis";

function PreviousBillsDialog(props) {

    const [formData, setFormData] = useState();
    const [tableData, setTableData] = useState();
    const [billIndex, setBillIndex] = useState(0);
    const [totalBills, setTotalBills] = useState(0);
    const [partyType, setPartyType] = useState("");

    const navigateBill = async (direction) => {
        let billDetails;
        if (props.billData?.partyType == "kisan") billDetails = await getKisanBillVersions(props.billData?.id, props.billData?.date, 0);
        else billDetails = await getVyapariBillVersions(props.billData?.id, props.billData?.date, 0);
        setBillIndex(billIndex + direction);
        // PrintBill();
    }

    useEffect(() => {
        // PrintBill();
        console.log(props);
        setPartyType(props.partyType);
        if (props.partyType=="kisan") PrintKisanBill();
        else PrintVyapariBill();

        setBillIndex(0);
    }, [props]);


    const PrintKisanBill = () => {

        setTableData(props?.billData?.content?.[0]?.kisanBillItems);
        setTotalBills(props?.billData?.size);

        if (props?.billData?.content?.[0]) {
            const { kisanBillItems, ...newObj } = props?.billData?.content?.[0];
            setFormData(newObj);
        }
    }

    const PrintVyapariBill = () => {

        setTableData(props?.billData?.content?.[0]?.vyapariBillItems);
        setTotalBills(props?.billData?.size);

        if (props?.billData?.content?.[0]) {
            const { vyapariBillItems, ...newObj } = props?.billData?.content?.[0];
            setFormData({vyapari_name:{name:props?.billData?.content?.[0].vyapariName},date:props?.billData?.content?.[0].billDate});
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div><Button onClick={() => navigateBill(-1)} disabled={billIndex === 0}><ArrowBackIos /></Button></div>
                <div></div>
                <div><Button onClick={() => navigateBill(+1)} disabled={billIndex === totalBills - 1}><ArrowForwardIos /></Button></div>
            </div>
            <div>
                {partyType === "kisan" ? (
                    <KisanBillPrint formData={formData} tableData={tableData} />
                ) : (
                    <VyapariBillPrint tableData={tableData} formData={formData}/>
                )}
            </div>
            <div></div>
        </div>
    );
}

export default PreviousBillsDialog;