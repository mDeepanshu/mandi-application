import React, { useEffect, useState } from "react";
import { getCrateVasuliSheet } from "../../../gateway/crateModule/vasuli-sheet-api";
import { getAllPartyList } from "../../../gateway/comman-apis";
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
  "vyapariIdNo",
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
  const [totals, setTotals] = useState({
    openingAmountSum: 0,
    closingAmountSum: 0,
    daybill: 0,
  });

  const getLedgerData = async (fromDate) => {
    setLoading(true);
    try {
      // party list is cached in localStorage by the gateway; used to map
      // internal vyapari_id -> human idNo for the ID column and ID search
      const [ledger, partyList] = await Promise.all([
        getCrateVasuliSheet(fromDate),
        getAllPartyList("VYAPARI"),
      ]);

      if (!ledger || !ledger.responseBody?.length) {
        setTableData([]);
        setTotals({ openingAmountSum: 0, daybill: 0, closingAmountSum: 0 });
        return;
      }

      const idNoByPartyId = new Map(
        (partyList?.responseBody || []).map((p) => [String(p.partyId), p.idNo])
      );

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
          vyapariIdNo: idNoByPartyId.get(String(item.vyapari_id)) || "",
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
      !idQuery || elem?.vyapariIdNo?.toString().includes(idQuery);
    const matchesName =
      !nameQuery ||
      elem?.vyapari_name?.toLowerCase().includes(nameQuery.toLowerCase());
    return matchesId && matchesName;
  });

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
    </div>
  );
};

export default CrateVasuliSheet;
