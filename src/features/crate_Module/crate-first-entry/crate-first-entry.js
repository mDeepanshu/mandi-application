import React, { useState } from "react";
import EditDialog from "./dialog/crate-first-edit-dialog";
import styles from "./crate-first-entry.module.css";
import { Edit } from "@mui/icons-material";
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
        ? new Date(a.entry.logged_at) - new Date(b.entry.logged_at)
        : new Date(b.entry.logged_at) - new Date(a.entry.logged_at)
    );

  const fetchData = () => {
    if (!summaryDate) return;

    setLoading(true);
    getCrateSummaryByDate(summaryDate)
      .then((summary) => {
        setData(summary?.responseBody || []);
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
              <tr key={entry.log_id}>
                <td className={styles.nameCell}>{row.vyapari_name}</td>
                <td>{crate.crate_name}</td>
                <td>{entry.count}</td>
                <td>
                  {new Date(entry.logged_at).toLocaleString("en-IN", dateTimeFormat)}
                </td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setSelected(row)}
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

      {selected && (
        <EditDialog
          data={selected}
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
