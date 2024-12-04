import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@mui/material";
import styles from "./previousBillsDialog.module.css";
import { ArrowForwardIos, ArrowBackIos } from '@mui/icons-material';
import KisanBillPrint from "../../dialogs/kisan-bill/kisan-bill-print";
import VyapariBillPrint from "../../dialogs/vyapari-bill/vyapari-bill-print";
import { getKisanBillVersions, getVyapariBillVersions } from "../../gateway/previous-bills-apis";
import ReactToPrint from 'react-to-print';

function PreviousBillsDialog(props) {

    const [formData, setFormData] = useState();
    const [tableData, setTableData] = useState();
    const [billIndex, setBillIndex] = useState(0);
    const [totalBills, setTotalBills] = useState(0);
    const [partyType, setPartyType] = useState("");

    const componentRef = useRef();
    const triggerRef = useRef();

    const navigateBill = async (direction) => {
        let billDetails;
        if (props.billData?.content[0]?.kisanId) {
            billDetails = await getKisanBillVersions(props.billData?.content[0]?.kisanId, props.billData?.content[0]?.billDate, totalBills-billIndex);
            if (billDetails?.responseBody?.content&&billDetails?.responseBody?.content[0]) {
                setFormData(billDetails?.responseBody?.content[0]);
            }
        }
        else {
            const billStructure = structuredClone(props.billData?.content[0]);
            setFormData(billStructure);
        }
        setBillIndex(billIndex + direction);
        // PrintBill();
    }

    useEffect(() => {
        setPartyType(props.partyType);
        if (props.partyType == "kisan") PrintKisanBill();
        else PrintVyapariBill();
        setBillIndex(0);
        setTotalBills(props.totalPreviousBills);
    }, [props]);


    const PrintKisanBill = () => {
        setTableData(props?.billData?.content?.[0]?.kisanBillItems);
        setTotalBills(props?.billData?.size);

        if (props?.billData?.content?.[0]) {
            const { kisanBillItems, ...newObj } = props?.billData?.content?.[0];
            setFormData(newObj);
        }
    }

    const Print = () => {
        triggerRef.current.click();
    }

    const PrintVyapariBill = () => {

        setTableData(props?.billData?.content?.[0]?.vyapariBillItems);
        setTotalBills(props?.billData?.size);

        if (props?.billData?.content?.[0]) {
            const { vyapariBillItems, ...newObj } = props?.billData?.content?.[0];
            setFormData({ vyapari_name: { name: props?.billData?.content?.[0].vyapariName }, date: props?.billData?.content?.[0].billDate });
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div><Button onClick={() => navigateBill(-1)} disabled={billIndex === 0}><ArrowBackIos /></Button></div>
                <div><Button onClick={() => Print()}>Print Bill</Button></div>
                <ReactToPrint
                    trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
                    content={() => componentRef.current}
                />
                <div><Button onClick={() => navigateBill(+1)} disabled={billIndex == totalBills - 1}><ArrowForwardIos /></Button></div>
            </div>
            <div>
                {partyType === "kisan" ? (
                    <KisanBillPrint ref={componentRef} formData={formData} tableDataPrint={tableData} restructureTable={true} fromPreviousBill={true} />
                ) : (
                    <VyapariBillPrint tableData={tableData} formData={formData} />
                )}
            </div>
            <div></div>
        </div>
    );
}

export default PreviousBillsDialog;