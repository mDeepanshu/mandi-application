import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { getLedger, makeVasuli } from "../../gateway/ledger-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import ReactToPrint from "react-to-print";
import styles from "./ledger.module.css";
import { useMediaQuery } from "@mui/material";
import PrintAllLedger from "../../dialogs/todays-all-ledger/todays-ledger";
import VyapariField from "../../shared/elements/VyapariField";
import { useOutletContext } from "react-router-dom";
function Ledger() {
  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState(["DATE", "ITEM NAME", "DEBIT", "CREDIT", "REMARK"]);
  const [keyArray, setKeyArray] = useState(["date", "itemNameWithCheckbox", "dr", "cr", "remark"]);
  const [showAllLedgerPrint, setShowAllLedgerPrint] = useState(false);
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  const twoDaysPrior = new Date();
  twoDaysPrior.setDate(twoDaysPrior.getDate() - 2);
  const priorDate = twoDaysPrior.toISOString().split("T")[0];
  const isSmallScreen = useMediaQuery("(max-width:495px)");
  let customTableHeight = "120px";
  const { snackbarChange } = useOutletContext();
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
      vyapariId: "",
    },
  });

  const fetch_ledger = async (data) => {
    const isValid = await trigger(); // Validates all fields
    if (isValid) {
      const { fromDate, toDate } = data;
      getLedgerData(data.vyapari_id.partyId, fromDate, toDate);
      setValue("vyapariId", data.vyapari_id.idNo);
    } else {
      console.log("Validation failed");
    }
  };

  const getLedgerData = async (vyapari_id, fromDate, toDate) => {
    const ledger = await getLedger(vyapari_id, fromDate, toDate);
    if (ledger) {
      if (ledger.responseBody?.transactions) {
        const transactionWithTotals = insertDateWiseTotal([...ledger.responseBody?.transactions]);
        setTableData(transactionWithTotals);
      } else setTableData([]);
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

  const make_vasuli = async () => {
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

    const vasuliRes = await makeVasuli(vasuliData);
    if (vasuliRes) {
      snackbarChange({
        open: true,
        alertType: "success",
        alertMsg: "SUCCESS",
      });
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h1>LEDGER</h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.dateFields}>
              <div className={styles.vyapariName}>
                <div>
                  <VyapariField name="vyapari_id" control={control} errors={errors} size={isSmallScreen ? "small" : "medium"} onKeyDownFunc={onVyapariKeyDown} />
                </div>
              </div>
              <div className={styles.date}>
                <Controller
                  name="fromDate"
                  control={control}
                  rules={{ required: "Enter From Date" }}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} label="FROM DATE" size={isSmallScreen ? "small" : "medium"} fullWidth variant="outlined" type="date" />}
                />
                <p className="error">{errors.fromDate?.message}</p>
              </div>
              <div className={styles.date}>
                <Controller
                  name="toDate"
                  control={control}
                  rules={{ required: "Enter To Date" }}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} label="TO DATE" size={isSmallScreen ? "small" : "medium"} fullWidth variant="outlined" type="date" />}
                />
                <p className="error">{errors.toDate?.message}</p>
              </div>
            </div>
            <div className={styles.btns}>
              <div className={`${styles.btns} ${styles.actionBtns}`}>
                <Button variant="contained" color="success" type="button" onClick={() => fetch_ledger(getValues())}>
                  FETCH
                </Button>
                <Button className={styles.vasuliBtn} variant="contained" color="success" type="button" onClick={() => make_vasuli()}>
                  VASULI
                </Button>
              </div>
              <div className={styles.print_btns}>
                <Button className={styles.print_btn} variant="contained" color="success" type="button" onClick={() => printLedger()}>
                  PRINT
                </Button>
                <Button className={styles.print_all_btn} variant="contained" color="success" type="button" onClick={() => toggleState(true)}>
                  PRINT ALL
                </Button>
              </div>
              <ReactToPrint trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>} content={() => componentRef.current} />
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
        {/* {showAuctionEdit && <AuctionEdit/>} */}
        <PrintAllLedger
          open={showAllLedgerPrint}
          onClose={() => toggleState(false)}
          formData={getValues()}
          // auctionToEdit={auctionToEdit}
        />
      </div>
    </>
  );
}

export default Ledger;
