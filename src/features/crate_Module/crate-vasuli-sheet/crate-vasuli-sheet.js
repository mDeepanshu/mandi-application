import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Print } from "@mui/icons-material";
import { getCrateVasuliSheet } from "../../../gateway/crateModule/vasuli-sheet-api";
import MasterTable from "../../../shared/ui/master-table/master-table";
import ui from "../crate-shared.module.css";
import styles from "./crate-vasuli-sheet.module.css";

const LEDGER_COLUMNS = [
  "ID",
  "PARTY NAME",
  "OPENING AMOUNT",
  "DAY BILL",
  "TTL",
  "CLOSING AMOUNT",
];
const KEY_ARRAY = [
  "id_no",
  "vyapari_name",
  "opening_balance",
  "dayBill",
  "ttl",
  "closing_balance",
];

const CrateVasuliSheet = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(currentDate);
  const [tableData, setTableData] = useState([]);
  const [idQuery, setIdQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [loading, setLoading] = useState(false);
  // Show (and print) only vyaparis with crate transactions on the fetched day.
  const [onlyWithTxn, setOnlyWithTxn] = useState(false);
  // Date the loaded data belongs to (the picker can change after Fetch).
  const [fetchedDate, setFetchedDate] = useState(null);
  const printRef = useRef(null);
  const [totals, setTotals] = useState({
    openingAmountSum: 0,
    closingAmountSum: 0,
    daybill: 0,
  });

  const getLedgerData = async (fromDate) => {
    setLoading(true);
    try {
      const ledger = await getCrateVasuliSheet(fromDate);
      setFetchedDate(fromDate);

      if (!ledger || !ledger.responseBody?.length) {
        setTableData([]);
        setTotals({ openingAmountSum: 0, daybill: 0, closingAmountSum: 0 });
        return;
      }

      let dayBillTotal = 0;
      let openingAmountSum = 0;
      let closingAmountSum = 0;

      const formattedList = ledger.responseBody.map((item) => {
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
          ttl: total,
          dayBill,
        };
      });

      setTotals({
        openingAmountSum,
        daybill: dayBillTotal,
        closingAmountSum,
      });
      setTableData(formattedList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLedgerData(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableDataFiltered = tableData.filter((elem) => {
    const matchesId =
      !idQuery || elem?.id_no?.toString().includes(idQuery);
    const matchesName =
      !nameQuery ||
      elem?.vyapari_name?.toLowerCase().includes(nameQuery.toLowerCase());
    const matchesTxn = !onlyWithTxn || elem?.transactions?.length > 0;
    return matchesId && matchesName && matchesTxn;
  });

  // Print totals follow the filtered rows, so the paper matches the screen.
  const printTotals = tableDataFiltered.reduce(
    (acc, r) => ({
      opening: acc.opening + (Number(r.opening_balance) || 0),
      day: acc.day + (Number(r.ttl) || 0),
      closing: acc.closing + (Number(r.closing_balance) || 0),
    }),
    { opening: 0, day: 0, closing: 0 }
  );

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Crate Vasuli Sheet ${fetchedDate || ""}`,
    pageStyle: "@page { size: A4 portrait; margin: 10mm; }",
  });

  const formatDisplayDate = (iso) =>
    iso ? iso.split("-").reverse().join("-") : "";

  return (
    <div className={`${ui.page} ${styles.widePage}`}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Crate Vasuli Sheet</h2>
          <p className={ui.subtitle}>
            Day-wise crate balances for all vyaparis
          </p>
        </div>

        <div className={ui.toolbar}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={ui.input}
          />
          <button
            className={ui.btn}
            onClick={() => getLedgerData(date)}
            disabled={loading || !date}
          >
            {loading ? "Fetching…" : "Fetch"}
          </button>
          <button
            className={styles.printBtn}
            onClick={handlePrint}
            disabled={loading || tableDataFiltered.length === 0}
          >
            <Print fontSize="small" />
            Print
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searches}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Search by ID"
            className={`${ui.input} ${styles.searchInput}`}
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by name"
            className={`${ui.input} ${styles.searchInput}`}
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
          <label className={styles.txnToggle}>
            <input
              type="checkbox"
              checked={onlyWithTxn}
              onChange={(e) => setOnlyWithTxn(e.target.checked)}
            />
            Only with day's transactions
          </label>
        </div>

        <div className={styles.stats}>
          <span className={ui.statPill}>
            Opening <b>{totals.openingAmountSum}</b>
          </span>
          <span className={ui.statPill}>
            Day <b>{totals.daybill}</b>
          </span>
          <span className={ui.statPill}>
            Closing <b>{totals.closingAmountSum}</b>
          </span>
        </div>
      </div>

      <MasterTable
        columns={LEDGER_COLUMNS}
        tableData={tableDataFiltered}
        keyArray={KEY_ARRAY}
      />

      {/* Print-only layout: hidden on screen, rendered by react-to-print. */}
      <div className={styles.printHidden}>
        <div ref={printRef} className={styles.printPage}>
          <div className={styles.printHeader}>
            <h2>Crate Vasuli Sheet</h2>
            <div className={styles.printMeta}>
              <span>
                Date: {formatDisplayDate(fetchedDate)}
                <span className={styles.printLegend}>
                  O = Open · T = TTL · C = Close
                </span>
              </span>
              <span>
                Opening <b>{printTotals.opening}</b> · Day{" "}
                <b>{printTotals.day}</b> · Closing <b>{printTotals.closing}</b>
              </span>
            </div>
          </div>

          <div className={styles.printColHeads}>
            {[0, 1].map((i) => (
              <div key={i} className={styles.printRow}>
                <span>ID</span>
                <span>Party</span>
                <span className={styles.printNum}>O</span>
                <span>DB</span>
                <span className={styles.printNum}>T</span>
                <span className={styles.printNum}>C</span>
              </div>
            ))}
          </div>

          <div className={styles.printColumns}>
            {tableDataFiltered.map((r, idx) => (
              <div key={`${r.id_no}|${idx}`} className={styles.printRow}>
                <span>{r.id_no}</span>
                <span className={styles.printName}>{r.vyapari_name}</span>
                <span className={styles.printNum}>{r.opening_balance}</span>
                <span className={styles.printDayBill}>{r.dayBill}</span>
                <span className={styles.printNum}>{r.ttl}</span>
                <span className={`${styles.printNum} ${styles.printClose}`}>
                  {r.closing_balance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrateVasuliSheet;
