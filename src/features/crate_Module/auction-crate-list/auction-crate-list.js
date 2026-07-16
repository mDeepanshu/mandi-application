import React, { useEffect, useState } from "react";
import { Edit } from "@mui/icons-material";
import { getAuctionCrateList } from "../../../gateway/crateModule/auction-crate-list-api";
import { getAllPartyList } from "../../../gateway/comman-apis";
import AuctionCrateEditDialog from "./dialog/auction-crate-edit-dialog";
import ui from "../crate-shared.module.css";
import styles from "./auction-crate-list.module.css";

const getTodayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
};

export default function AuctionCrateList() {
  const [date, setDate] = useState(getTodayDate);
  const [rows, setRows] = useState();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = async (listDate) => {
    if (!listDate) return;

    setLoading(true);
    try {
      // party list is cached in localStorage by the gateway; used only to fill in
      // the display idNo when the list API sends the internal vyapari id alone
      const [list, partyList] = await Promise.all([
        getAuctionCrateList(listDate),
        getAllPartyList("VYAPARI"),
      ]);

      const idNoByPartyId = new Map(
        (partyList?.responseBody || []).map((p) => [String(p.partyId), p.idNo])
      );

      setRows(
        (list?.responseBody || []).map((row) => ({
          ...row,
          vyapari_idNo:
            row.vyapari_idNo || idNoByPartyId.get(String(row.vyapari_id)) || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching auction crate list:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = search.trim().toLowerCase();
  const filtered = (rows || []).filter(
    (row) =>
      !term ||
      row.vyapari_name?.toLowerCase().includes(term) ||
      row.vyapari_idNo?.toString().includes(term)
  );

  const totalCrates = filtered.reduce(
    (sum, row) => sum + (row.crate_count || 0),
    0
  );

  return (
    <div className={`${ui.page} ${styles.widePage}`}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Auction Crate List</h2>
          <p className={ui.subtitle}>
            Crates issued against each kisan's lot, by vyapari
          </p>
        </div>

        <div className={ui.toolbar}>
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

      <div className={styles.filterRow}>
        <input
          type="text"
          className={`${ui.input} ${styles.searchInput}`}
          placeholder="Search by vyapari name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {rows?.length > 0 && (
          <div className={styles.stats}>
            <span className={ui.statPill}>
              Entries <b>{filtered.length}</b>
            </span>
            <span className={ui.statPill}>
              Crates <b>{totalCrates}</b>
            </span>
          </div>
        )}
      </div>

      <div className={ui.card}>
        {rows?.length === 0 && !loading && (
          <p className={ui.emptyState}>No crate entries found for {date}.</p>
        )}

        {rows?.length > 0 && filtered.length === 0 && (
          <p className={ui.emptyState}>
            No vyapari matches “{search}” on this date.
          </p>
        )}

        {filtered.length > 0 && (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Kisan Name</th>
                <th>Vyapari ID</th>
                <th>Vyapari Name</th>
                <th>Crate Name</th>
                <th className={ui.num}>Crate Count</th>
                <th className={styles.actionHead} />
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className={styles.nameCell}>{row.kisan_name}</td>
                  <td className={styles.idCell}>
                    {row.vyapari_idNo || <span className={ui.muted}>—</span>}
                  </td>
                  <td className={styles.nameCell}>{row.vyapari_name}</td>
                  <td>
                    <span className={styles.chip}>{row.crate_name}</span>
                  </td>
                  <td className={`${ui.num} ${styles.countCell}`}>
                    {row.crate_count}
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      className={styles.editBtn}
                      onClick={() => setSelected(row)}
                      aria-label={`Edit crate entry for ${row.kisan_name}`}
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
        <AuctionCrateEditDialog
          data={selected}
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
