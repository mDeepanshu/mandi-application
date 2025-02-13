import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { getLedger } from "../../gateway/ledger-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import ReactToPrint from "react-to-print";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import styles from "./ledger.module.css";
import { getAllPartyList } from "../../gateway/comman-apis";
import { useMediaQuery } from "@mui/material";
import PrintAllLedger from "../../dialogs/todays-all-ledger/todays-ledger";

function Ledger() {
  const componentRef = useRef();
  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState([
    "DATE",
    "ITEM NAME",
    "CREDIT",
    "REMARK",
    "DEBIT",
  ]);
  const [keyArray, setKeyArray] = useState([
    "date",
    "itemName",
    "cr",
    "remark",
    "dr",
  ]);

  const [showAllLedgerPrint, setShowAllLedgerPrint] = useState(false);

  const [vyapariList, setVyapariList] = useState([]);
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  const twoDaysPrior = new Date();
  twoDaysPrior.setDate(twoDaysPrior.getDate() - 2);
  const priorDate = twoDaysPrior.toISOString().split("T")[0];
  const vyapariRef = useRef(null); // Create a ref
  const isSmallScreen = useMediaQuery("(max-width:485px)");

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

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  };

  const getLedgerData = async (vyapari_id, fromDate, toDate) => {
    const ledger = await getLedger(vyapari_id, fromDate, toDate);
    if (ledger) {
      if (ledger.responseBody?.transactions?.length) {
        const transactionWithTotals = insertDateWiseTotal([
          ...ledger.responseBody?.transactions,
        ]);
        setTableData(transactionWithTotals);
      } else setTableData([]);
      setValue("closingAmount", ledger.responseBody?.closingAmount);
      setValue("openingAmount", ledger.responseBody?.openingAmount);
    }
  };

  useEffect(() => {
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
    getVyapariNames();
  }, []);

  const printLedger = () => {
    triggerRef.current.click();
  };

  // const printAllLedger = () => {
  //   const contentToPrintArray = [];
  //   const contentToPrint = componentRef.current.innerHTML;
  //   for (let index = 0; index < allLedgerData.length; index++) {
  //     const element = array[index];
  //   }

  //   if (window.electron && window.electron.ipcRenderer) {
  //     // Invoke a print action
  //     window.electron.ipcRenderer
  //       .invoke("print-all-ledger", contentToPrint)
  //       .then(() => {
  //         console.log(`done`);
  //       })
  //       .catch((err) => console.error("Print failed:", err));
  //   } else {
  //     console.warn("Electron IPC is not available.");
  //   }
  // };

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

  return (
    <>
      <div className={styles.container}>
        <h1>LEDGER</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.dateFields}>
            <div className={styles.vyapariName}>
              <div>
                <Controller
                  name="vyapari_id"
                  control={control}
                  rules={{ required: "Enter Patry Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={vyapariList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vyapari Name"
                          size={isSmallScreen ? "small" : "medium"}
                          InputProps={{
                            ...params.InputProps,
                            inputRef: vyapariRef,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              enterAction();
                            }
                          }}
                        />
                      )}
                      onChange={(event, value) => field.onChange(value)}
                      disablePortal
                      id="combo-box-demo"
                    />
                  )}
                />
                <p className={styles.errMsg}>{errors.vyapari_id?.message}</p>
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
          <div>
            <Button
              variant="contained"
              color="success"
              type="button"
              onClick={() => fetch_ledger(getValues())}
            >
              FETCH LEDGER
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color="success"
              type="button"
              onClick={() => printLedger()}
              className={styles.print_btn}
            >
              PRINT LEDGER
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color="success"
              type="button"
              onClick={() => toggleState(true)}
              className={styles.print_all_btn}
            >
              PRINT ALL LEDGER
            </Button>
            <ReactToPrint
              trigger={() => (
                <button style={{ display: "none" }} ref={triggerRef}></button>
              )}
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
        {/* <div className={styles.tableLedger}> */}
          <MasterTable
            columns={ledgerColumns}
            tableData={tableData}
            keyArray={keyArray}
          />
        {/* </div> */}
      </div>
      <div style={{ display: "none" }}>
        <LedgerPrint
          ref={componentRef}
          tableData={[...tableData]}
          formData={getValues()}
        />
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
