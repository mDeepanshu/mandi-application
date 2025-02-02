import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment } from "@mui/material";
import ReactToPrint from "react-to-print";
import SearchIcon from "@mui/icons-material/Search";
import { getVyapariVasuliSheet } from "../../gateway/vyapari-vasuli-sheet-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import VyapariVasuliPrint from "../../dialogs/vyapari-vasuli-print/vyapari-vasuli-print";

import styles from "./vyapari-vasuli-sheet.module.css";

function VyapariVasuliSheet() {
  const componentRef = useRef();
  const triggerRef = useRef();
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

  const [tableData, setTableData] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [tableDataFiltered, setTableDataFiltered] = useState([]);
  const [ledgerColumns, setledgerColumns] = useState([
    "ID",
    "PARTY NAME",
    "OPENING AMOUNT",
    "DAY BILL",
    "TTL",
    "CLOSING AMOUNT",
  ]);
  const [keyArray, setKeyArray] = useState([
    "vyapariIdNo",
    "partyName",
    "openingAmount",
    "dayBill",
    "ttl",
    "closingAmount",
  ]);
  const [totals, setTotals] = useState({
    openingAmountSum: 0,
    closingAmountSum: 0,
    daybill: 0,
  });

  const {
    register,
    formState: { errors },
    getValues,
  } = useForm();

  const fetch_vasuli_sheet = async (data) => {
    const { fromDate, toDate } = data;
    getLedgerData(fromDate, toDate);
  };

  const getLedgerData = async (fromDate, toDate = null) => {
    let data;
    if (toDate) {
      data = {
        startDate: fromDate,
        endDate: toDate,
      };
    } else data = { startDate: fromDate };

    const ledger = await getVyapariVasuliSheet(data);
    let dayBillTotal = 0;
    ledger?.responseBody?.vasuliList?.forEach((element) => {
      let total = element.dayBill
        .split(",")
        .map(Number)
        .reduce((sum, num) => sum + num, 0);
      element.ttl = total;
      dayBillTotal += total;
    });
    setTotals({
      openingAmountSum: ledger?.responseBody?.openingAmountSum,
      daybill: dayBillTotal,
      closingAmountSum: ledger?.responseBody?.closingAmountSum,
    });
    if (ledger) {
      setTableData(ledger?.responseBody?.vasuliList);
      setTableDataFiltered(ledger?.responseBody?.vasuliList);
    }
  };

  useEffect(() => {
    const init = async () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      getLedgerData(formattedDate);
    };

    init();
  }, []);

  const printLedger = () => {
    triggerRef.current.click();
  };

  const find = (event) => {
    const search = event.target.value;
    setTableDataFiltered(
      tableData.filter(
        (elem) =>
          elem?.partyName?.toLowerCase().includes(search.toLowerCase()) ||
          elem?.vyapariIdNo?.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const findById = (event) => {
    const search = event.target.value;
    // Check if either id is a substring of the other
    setTableDataFiltered(
      tableData.filter((elem) => elem?.vyapariIdNo?.toString().includes(search.toString()))
    );
  };

  return (
    <>
      <h1 className={styles.heading}>VASULI SHEET</h1>
      <div className={styles.container}>
        <form
          className={styles.dateFields}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.date}>
            <TextField
              defaultValue={currentDate}
              size="small"
              type="date"
              {...register("fromDate", { required: "Date is required" })}
            />
            <br />
            {errors.fromDate && (
              <span className="error">{errors.fromDate.message}</span>
            )}
          </div>
          <div>
            <Button
              variant="contained"
              color="success"
              type="button"
              onClick={() => fetch_vasuli_sheet(getValues())}
            >
              Fetch
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color="success"
              type="button"
              onClick={() => printLedger()}
              className={styles.print_btn}
            >
              PRINT
            </Button>
            <ReactToPrint
              trigger={() => (
                <button style={{ display: "none" }} ref={triggerRef}></button>
              )}
              content={() => componentRef.current}
            />
          </div>
        </form>
        <div className={styles.totals}>
          <div>
            <span className={styles.fulllabel}>OPENING TOTAL: </span>
            <span className={styles.shortlabel}>OPN: </span>
            <span>{totals.openingAmountSum}</span>
          </div>
          <div>
            <span className={styles.fulllabel}>DAY TOTAL: </span>
            <span className={styles.shortlabel}>DAY: </span>
            <span>{totals.daybill}</span>
          </div>
          <div>
            <span className={styles.fulllabel}>CLOSING TOTAL: </span>
            <span className={styles.shortlabel}>CLS: </span>
            <span>{totals.closingAmountSum}</span>
          </div>
        </div>
        <div style={{display:"flex"}}>
          <div className={styles.search}>
            <TextField
              fullWidth
              type="number"
              size="small"
              label="SEARCH BY ID"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={findById}
            />
          </div>
          <div className={styles.search}>
            <TextField
              fullWidth
              type="text"
              size="small"
              label="SEARCH"
              variant="outlined"
              inputProps={{
                style: {
                  textTransform: "uppercase", // Ensure the input content is transformed
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={find}
            />
          </div>
        </div>
        <MasterTable
          columns={ledgerColumns}
          tableData={tableDataFiltered}
          keyArray={keyArray}
        />
      </div>
      <div style={{ display: "none" }}>
        <VyapariVasuliPrint
          ref={componentRef}
          tableData={tableData}
          formData={{ ...getValues(), ...totals }}
        />
      </div>
    </>
  );
}

export default VyapariVasuliSheet;
