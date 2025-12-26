import { useEffect, useState, useRef, lazy } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { getLedger, makeVasuli, sendLedgerNotiApi, markVyapariAllowedTransactions, sendAllLedgerNotiApi } from "../../gateway/ledger-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import ReactToPrint from "react-to-print";
import styles from "./ledger.module.css";
import { useMediaQuery } from "@mui/material";
import PrintAllLedger from "../../dialogs/todays-all-ledger/todays-ledger";
import DuplicateVasuli from "../../dialogs/duplicate-vasuli/duplicate-vasuli";
import VyapariField from "../../shared/elements/VyapariField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

function Ledger() {
  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState(["DATE", "ITEM NAME", "DEBIT", "CREDIT", "REMARK"]);
  const [keyArray, setKeyArray] = useState(["date", "itemNameWithCheckbox", "dr", "cr", "remark"]);
  const [showAllLedgerPrint, setShowAllLedgerPrint] = useState(false);
  const [showDuplicateVasuli, setShowDuplicateVasuli] = useState({ display: false, message: "" });
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  const twoDaysPrior = new Date();
  twoDaysPrior.setDate(twoDaysPrior.getDate() - 2);
  const priorDate = twoDaysPrior.toISOString().split("T")[0];
  const isSmallScreen = useMediaQuery("(max-width:495px)");
  let customTableHeight = "120px";

  const [alertData, setAlertData] = useState({
    open: false,
    alertType: "",
    alertMsg: "",
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    setValue,
  } = useForm({
    defaultValues: {
      toDate: currentDate, // Set the default value to current date
      fromDate: priorDate, // Default to 2 days prior date
      // vyapariId: "",
      // vyapari_id: null
    },
  });

  const fetch_ledger = async (data) => {
    const isValid = await trigger(); // Validates all fields
    if (isValid) {
      const { fromDate, toDate } = data;
      getLedgerData(data.vyapari_id.partyId, fromDate, toDate);
      // setValue("vyapariId", data.vyapari_id.idNo);
    } else {
      console.log("Validation failed");
    }
  };

  const getLedgerData = async (vyapari_id, fromDate, toDate) => {
    const ledger = await getLedger(vyapari_id, fromDate, toDate);
    if (ledger) {
      if (ledger.responseBody?.transactions.length) {
        const transactionWithTotals = insertDateWiseTotal([...ledger.responseBody?.transactions]);
        setTableData(transactionWithTotals);
      } else {
        setTableData([{ date: null, itemName: "", dr: "NO DATA", cr: "", remark: "" }]);
      }
      setValue("closingAmount", ledger.responseBody?.closingAmount);
      setValue("openingAmount", ledger.responseBody?.openingAmount);
    }
  };

  const printLedger = () => {
    triggerRef.current.click();
  };

  const enterAction = () => {
    setTimeout(() => {
      fetch_ledger(getValues());
    }, 0);
  };

  const insertDateWiseTotal = (transactions) => {
    let date = transactions?.[0]?.date;
    let dateTotal = transactions?.[0]?.dr;
    for (let i = 1; i < transactions.length; i++) {
      if (transactions[i].date == date) {
        dateTotal += transactions[i].dr;
      } else {
        date = transactions?.[i]?.date;
        const amt = transactions?.[i]?.dr;
        transactions.splice(i, 0, {
          date: "TOTAL",
          itemName: "",
          cr: "",
          dr: dateTotal,
        });
        dateTotal = amt;
        i++;
      }
    }
    transactions.push({
      date: "TOTAL",
      itemName: "",
      cr: "",
      dr: dateTotal,
    });
    return transactions;
  };

  const toggleState = (state) => setShowAllLedgerPrint(state);

  const onVyapariKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enterAction();
    }
  };

  const make_vasuli = async (allowDuplicate = false) => {
    const vyapariValid = await trigger(`vyapari_id`);
    if (!vyapariValid) return;
    let vasuliData = [
      {
        amount: null,
        date: new Date(),
        vyapariId: getValues().vyapari_id?.partyId,
        remark: null,
        name: getValues()?.vyapari_id?.name,
      },
    ];
    const vasuliRes = await makeVasuli(vasuliData, allowDuplicate);

    if (vasuliRes?.responseCode == "400") {
      setShowDuplicateVasuli({ display: true, message: vasuliRes.responseBody });
      return;
    }
    if (vasuliRes) {
      setAlertData({
        open: true,
        alertType: "success",
        alertMsg: "SUCCESS",
      });
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertData({
      open: false,
      alertType: "",
      alertMsg: "",
    });
  };

  const closeDuplicateVasuli = () => setShowDuplicateVasuli({ display: false, message: "" });

  const continueDuplicateVasuli = () => {
    make_vasuli(true);
    setShowDuplicateVasuli({ display: false, message: "" });
  };

  const sendLedgerNoti = async (data) => {
    const isValid = await trigger();
    if (isValid) {
      const { fromDate, toDate } = data;
      markVyapariAllowedTransactions(data.vyapari_id.partyId, fromDate, toDate).then((res) => {
        if (res !== "error") {
          sendLedgerNotiApi(data.vyapari_id.partyId);
        }
      });
    } else {
      console.log("Validation failed");
    }
  };

  const sendAllLedgerNoti = async () => {
    sendAllLedgerNotiApi(currentDate, currentDate).then((res) => {
      if (res !== "error") {
        setAlertData({
          open: true,
          alertType: "success",
          alertMsg: "All Ledger Notifications Sent Successfully",
        });
      } else {
        setAlertData({
          open: true,
          alertType: "error",
          alertMsg: "Error in Sending Notifications",
        });
      }
    });
  };


  const smsMessage = `
Good Prize Industries
Receipt of the Payment Done by You.
आपके द्वारा किए गए भुगतान की रसीद।

Name   -  Deepanshu
ID     -  122
Amount -  322
Date   -  10-10-2023
Remark -  remarks

THANK YOU
  `;

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.LedgerContainer}>
          <h1>LEDGER</h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.dateFields}>
              <div className={styles.vyapariName}>
                <div>
                  <VyapariField
                    name="vyapari_id"
                    control={control}
                    errors={errors}
                    size={isSmallScreen ? "small" : "medium"}
                    onKeyDownFunc={onVyapariKeyDown}
                    customOnSelect={handleClose}
                  />
                </div>
              </div>
              <div className={styles.date}>
                <Controller
                  name="fromDate"
                  control={control}
                  rules={{ required: "Enter From Date" }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="FROM DATE"
                      size={isSmallScreen ? "small" : "medium"}
                      fullWidth
                      variant="outlined"
                      type="date"
                    />
                  )}
                />
                <p className="error">{errors.fromDate?.message}</p>
              </div>
              <div className={styles.date}>
                <Controller
                  name="toDate"
                  control={control}
                  rules={{ required: "Enter To Date" }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="TO DATE"
                      size={isSmallScreen ? "small" : "medium"}
                      fullWidth
                      variant="outlined"
                      type="date"
                    />
                  )}
                />
                <p className="error">{errors.toDate?.message}</p>
              </div>
            </div>
            <div className={styles.btns}>
              <div className={`${styles.btns} ${styles.actionBtns}`}>
                <Button className={styles.fetch} variant="contained" color="success" type="button" onClick={() => fetch_ledger(getValues())}>
                  FETCH
                </Button>
                <Button className={styles.vasuliBtn} variant="contained" color="success" type="button" onClick={() => make_vasuli()}>
                  VASULI
                </Button>
                <Button className={styles.send_ledger_btn} variant="contained" color="success" type="button" onClick={() => sendLedgerNoti(getValues())}>
                  SEND LEDGER<PhoneAndroidIcon />
                </Button>
                {/* <Button variant="contained" color="success" type="button">
                  <a href={`sms:+918349842228?body=${encodeURIComponent(smsMessage)}`}>Send SMS</a>
                </Button> */}
              </div>
              <div className={styles.print_btns}>
                <Button className={styles.print_btn} variant="contained" color="success" type="button" onClick={() => printLedger()}>
                  PRINT
                </Button>
                <Button
                  className={styles.print_all_btn}
                  variant="contained"
                  color="success"
                  type="button"
                  onClick={() => toggleState(true)}
                >
                  PRINT ALL
                </Button>
              </div>
              <Button variant="contained" color="success" type="button" className={styles.send_all_ledger_btn} onClick={() => sendAllLedgerNoti()}>
                SEND ALL LEDGER<PhoneAndroidIcon />
              </Button>
              <ReactToPrint
                trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>}
                content={() => componentRef.current}
              />
            </div>
            <div className={styles.constants}>
              <div>
                <b>
                  <span className={styles.fulllabel}>OPENING BALANCE: </span>
                  <span className={styles.shortlabel}>OPN: </span>
                  {getValues().openingAmount}
                </b>
              </div>
              <div>
                <b>
                  <span className={styles.fulllabel}>CLOSING BALANCE: </span>
                  <span className={styles.shortlabel}>CLS: </span>
                  {getValues().closingAmount}
                </b>
              </div>
            </div>
          </form>
        </div>
        <div className={styles.table_section}>
          <MasterTable columns={ledgerColumns} tableData={tableData} keyArray={keyArray} customHeight={customTableHeight} />
        </div>
      </div>
      <div style={{ display: "none" }}>
        <LedgerPrint ref={componentRef} tableData={[...tableData]} formData={getValues()} />
      </div>
      <div>
        <PrintAllLedger open={showAllLedgerPrint} onClose={() => toggleState(false)} formData={getValues()} />
      </div>
      <div>
        <DuplicateVasuli open={showDuplicateVasuli} continue={continueDuplicateVasuli} onClose={closeDuplicateVasuli} />
      </div>
      <div>
        <Snackbar
          open={alertData.open}
          anchorOrigin={{ vertical: "top", horizontal: "right" }} // Change position
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity={alertData.alertType} variant="filled" sx={{ width: "100%" }}>
            {alertData.alertMsg}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}

export default Ledger;
