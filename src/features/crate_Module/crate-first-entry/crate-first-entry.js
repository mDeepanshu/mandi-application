import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { getCrateMasterData } from "../../../gateway/crateModule/master-api";
import EditDialog from "./dialog/crate-first-edit-dialog";
import styles from "./crate-first-entry.module.css";
import { Edit, Print } from "@mui/icons-material";
import { getCrateSummaryByDate } from "../../../gateway/crateModule/first-entry-api";
import { dateTimeFormat } from "../../../constants/config";

const getTodayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
};

export default function CrateManagement() {
  const [data, setData] = useState();
  const [selected, setSelected] = useState(null);
  const [summaryDate, setSummaryDate] = useState(getTodayDate);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [crateTypes, setCrateTypes] = useState([]);
  // Date the loaded data belongs to (the picker can change after Fetch).
  const [fetchedDate, setFetchedDate] = useState(null);
  const printRef = useRef(null);

  const visibleData = data
    ?.filter((row) =>
      row.vyapari_name?.toLowerCase().includes(search.trim().toLowerCase())
    )
    .flatMap((row) =>
      (row.crates || []).flatMap((crate) =>
        (crate.entries || []).map((entry) => ({ row, crate, entry }))
      )
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.entry.created_at) - new Date(b.entry.created_at)
        : new Date(b.entry.created_at) - new Date(a.entry.created_at)
    );

  // Print rows: one line per vyapari + crate type with counts summed,
  // sorted by vyapari name so the paper copy is easy to look up.
  const printRows = Object.values(
    (visibleData || []).reduce((acc, { row, crate, entry }) => {
      const key = `${row.vyapari_name}|${crate.crate_name}`;
      if (!acc[key]) {
        acc[key] = { name: row.vyapari_name, crate: crate.crate_name, count: 0 };
      }
      acc[key].count += Number(entry.count) || 0;
      return acc;
    }, {})
  ).sort(
    (a, b) =>
      (a.name || "").localeCompare(b.name || "", "en", { sensitivity: "base" }) ||
      (a.crate || "").localeCompare(b.crate || "")
  );

  const printTotal = printRows.reduce((sum, r) => sum + r.count, 0);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Crate Summary ${fetchedDate || ""}`,
    pageStyle: "@page { size: A4 portrait; margin: 10mm; }",
  });

  const formatDisplayDate = (iso) => (iso ? iso.split("-").reverse().join("-") : "");

  // All crate types from the master, for the edit dialog's type dropdown.
  useEffect(() => {
    getCrateMasterData().then((res) => setCrateTypes(res?.responseBody || []));
  }, []);

  const fetchData = () => {
    if (!summaryDate) return;

    setLoading(true);
    getCrateSummaryByDate(summaryDate)
      .then((summary) => {
        setData(summary?.responseBody || []);
        setFetchedDate(summaryDate);
      })
      .catch((error) => {
        console.error("Error fetching crate summary:", error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Summary After Mandi Completion</h2>
          <p className={styles.subtitle}>
            Crates counted per vyapari for the selected day
          </p>
        </div>

        <div className={styles.toolbar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search vyapari…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.sortSelect}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort by entry time"
          >
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>
          <input
            type="date"
            id="summaryDate"
            className={styles.dateInput}
            value={summaryDate}
            onChange={(e) => setSummaryDate(e.target.value)}
          />
          <button
            className={styles.fetchBtn}
            onClick={fetchData}
            disabled={loading || !summaryDate}
          >
            {loading ? "Fetching…" : "Fetch"}
          </button>
          <button
            className={styles.printBtn}
            onClick={handlePrint}
            disabled={loading || printRows.length === 0}
          >
            <Print fontSize="small" />
            Print
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vyapari</th>
              <th>Crate Type</th>
              <th>Count</th>
              <th>Time</th>
              <th className={styles.actionHead} />
            </tr>
          </thead>

          <tbody>
            {visibleData?.map(({ row, crate, entry }) => (
              <tr key={entry.id}>
                <td className={styles.nameCell}>{row.vyapari_name}</td>
                <td>{crate.crate_name}</td>
                <td>{entry.count}</td>
                <td>
                  {new Date(entry.created_at).toLocaleString("en-IN", dateTimeFormat)}
                </td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setSelected({ row, crate, entry })}
                    aria-label={`Edit crates for ${row.vyapari_name}`}
                  >
                    <Edit fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data && !loading && (
          <p className={styles.emptyState}>
            Pick a date and press Fetch to load the day's summary.
          </p>
        )}

        {data?.length === 0 && !loading && (
          <p className={styles.emptyState}>
            No crate entries found for {summaryDate}.
          </p>
        )}

        {data?.length > 0 && search.trim() && visibleData?.length === 0 && !loading && (
          <p className={styles.emptyState}>
            No vyapari matches "{search}".
          </p>
        )}
      </div>

      {/* Print-only layout: hidden on screen, rendered by react-to-print. */}
      <div className={styles.printHidden}>
        <div ref={printRef} className={styles.printPage}>
          <div className={styles.printHeader}>
            <h2>Summary After Mandi Completion</h2>
            <div className={styles.printMeta}>
              <span>Date: {formatDisplayDate(fetchedDate)}</span>
              <span>
                Total crates: <b>{printTotal}</b>
              </span>
            </div>
          </div>

          <div className={styles.printColHeads}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.printRow}>
                <span>Vyapari</span>
                <span>Crate</span>
                <span className={styles.printCount}>Count</span>
              </div>
            ))}
          </div>

          <div className={styles.printColumns}>
            {printRows.map((r) => (
              <div key={`${r.name}|${r.crate}`} className={styles.printRow}>
                <span className={styles.printName}>{r.name}</span>
                <span>{r.crate}</span>
                <span className={styles.printCount}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <EditDialog
          data={selected.row}
          crate={selected.crate}
          entry={selected.entry}
          crateTypes={crateTypes}
          date={summaryDate}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
