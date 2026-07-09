import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment } from "@mui/material";
import ReactToPrint from "react-to-print";
import SearchIcon from "@mui/icons-material/Search";
import { getCrateVasuliSheet } from "../../../gateway/crateModule/vasuli-sheet-api";
import MasterTable from "../../../shared/ui/master-table/master-table";
// import VyapariVasuliPrint from "../../dialogs/vyapari-vasuli-print/vyapari-vasuli-print";

import styles from "./crate-vasuli-sheet.module.css";

const CrateVasuliSheet = () => {

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
    "vyapari_name",
    "opening_balance",
    "dayBill",
    "ttl",
    "closing_balance",
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
    const { fromDate } = data;
    getLedgerData(fromDate);
  };

  const getLedgerData = async (fromDate) => {
    const ledger = await getCrateVasuliSheet(fromDate);

    if (!ledger || !ledger.responseBody?.length) {
      setTableData([]);
      setTableDataFiltered([]);
      setTotals({
        openingAmountSum: 0,
        daybill: 0,
        closingAmountSum: 0,
      });
      return;
    }

    let dayBillTotal = 0;
    let openingAmountSum = 0;
    let closingAmountSum = 0;

    // 🔁 Transform API response
    const formattedList = ledger.responseBody.map((item) => {
      // ✅ sum of crate_count
      const total = item.transactions
        ?.map((t) => t.crate_count || 0)
        .reduce((sum, num) => sum + num, 0);

      const dayBill = item.transactions
        ?.map((t) => `${t.crate_name}:${t.crate_count}`)
        .join(", ");

      dayBillTotal += total;
      openingAmountSum += item.opening_balance || 0;
      closingAmountSum += item.closing_balance || 0;

      return {
        ...item,
        ttl: total, // same as old "ttl"
        dayBill,
      };
    });

    // ✅ Set totals
    setTotals({
      openingAmountSum,
      daybill: dayBillTotal,
      closingAmountSum,
    });

    // ✅ Set table data
    setTableData(formattedList);
    setTableDataFiltered(formattedList);
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
          elem?.partyName?.toLowerCase().includes(search.toLowerCase())
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
      <h1 className={styles.heading}>CRATE VASULI SHEET</h1>
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
            {/* <Button
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
            /> */}
          </div>
        </form>
        {/* <div className={styles.totals}>
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
        </div> */}
        <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
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
      {/* <div style={{ display: "none" }}>
        <VyapariVasuliPrint
          ref={componentRef}
          tableData={tableData}
          formData={{ ...getValues(), ...totals }}
        />
      </div> */}
    </>
  );
}

export default CrateVasuliSheet;

