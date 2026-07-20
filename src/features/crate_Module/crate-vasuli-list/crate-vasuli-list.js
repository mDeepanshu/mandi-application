import React, { useEffect, useState } from "react";
import { Edit } from "@mui/icons-material";
import { getCrateVasuliList } from "../../../gateway/crateModule/vasuli-list-api";
import VasuliEditDialog from "./dialog/crate-vasuli-edit-dialog";
import ui from "../crate-shared.module.css";
import styles from "./crate-vasuli-list.module.css";

const getTodayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
};

// created_at comes back as UTC; some endpoints omit the zone designator, so
// normalise before parsing.
const toDate = (value) => {
  if (!value) return null;
  const withZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatTime = (value) => {
  const parsed = toDate(value);
  if (!parsed) return "—";
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function CrateVasuliList() {
  const [date, setDate] = useState(getTodayDate);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const fetchData = async (vasuliDate) => {
    if (!vasuliDate) return;

    setLoading(true);
    try {
      const res = await getCrateVasuliList(vasuliDate);
      setData(res?.responseBody || []);
    } catch (error) {
      console.error("Error fetching crate vasuli list:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowTotal = (row) =>
    row.crates?.reduce((sum, crate) => sum + crate.crate_count, 0) || 0;

  const visibleData = (data || [])
    .filter((row) =>
      row.vyapari_name?.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) => {
      const at = toDate(a.created_at)?.getTime() ?? 0;
      const bt = toDate(b.created_at)?.getTime() ?? 0;
      return sortOrder === "asc" ? at - bt : bt - at;
    });

  const grandTotal = visibleData.reduce((sum, row) => sum + rowTotal(row), 0);

  return (
    <div className={ui.page}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Crate Vasuli List</h2>
          <p className={ui.subtitle}>All crate returns recorded on the selected day</p>
        </div>

        <div className={ui.toolbar}>
          {data?.length > 0 && (
            <span className={ui.statPill}>
              Returned <b>{grandTotal}</b>
            </span>
          )}
          {data?.length > 0 && (
            <input
              type="text"
              className={ui.input}
              placeholder="Search vyapari…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {data?.length > 0 && (
            <select
              className={ui.input}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort by entry time"
            >
              <option value="asc">Oldest first</option>
              <option value="desc">Newest first</option>
            </select>
          )}
          <input
            type="date"
            className={ui.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className={ui.btn}
            onClick={() => fetchData(date)}
            disabled={loading || !date}
          >
            {loading ? "Fetching…" : "Fetch"}
          </button>
        </div>
      </div>

      <div className={ui.card}>
        {data?.length === 0 && !loading && (
          <p className={ui.emptyState}>No crate vasuli recorded on {date}.</p>
        )}

        {data?.length > 0 && visibleData.length === 0 && !loading && (
          <p className={ui.emptyState}>No vyapari matches "{search}".</p>
        )}

        {visibleData.length > 0 && (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Vyapari</th>
                <th>Time</th>
                <th>Crate Type</th>
                <th className={ui.num}>Total</th>
                <th className={styles.actionHead} />
              </tr>
            </thead>

            <tbody>
              {visibleData.map((row) => (
                <tr key={row.vyapari_id}>
                  <td className={styles.nameCell}>{row.vyapari_name}</td>

                  <td className={styles.timeCell}>{formatTime(row.created_at)}</td>

                  <td>
                    <div className={styles.chips}>
                      {row.crates?.map((crate) => (
                        <span
                          className={styles.chip}
                          key={crate.crate_id}
                          title={`Recorded ${formatTime(crate.created_at)}`}
                        >
                          {crate.crate_name}
                          <b>× {crate.crate_count}</b>
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className={`${ui.num} ${styles.totalCell}`}>
                    {rowTotal(row)}
                  </td>

                  <td className={styles.actionCell}>
                    <button
                      className={styles.editBtn}
                      onClick={() => setSelected(row)}
                      aria-label={`Edit vasuli for ${row.vyapari_name}`}
                    >
                      <Edit fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <VasuliEditDialog
          data={selected}
          date={date}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            fetchData(date);
          }}
        />
      )}
    </div>
  );
}
