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

export default function CrateVasuliList() {
  const [date, setDate] = useState(getTodayDate);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const grandTotal = (data || []).reduce((sum, row) => sum + rowTotal(row), 0);

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

        {data?.length > 0 && (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Vyapari</th>
                <th>Crate Type</th>
                <th className={ui.num}>Total</th>
                <th className={styles.actionHead} />
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={row.vyapari_id}>
                  <td className={styles.nameCell}>{row.vyapari_name}</td>

                  <td>
                    <div className={styles.chips}>
                      {row.crates?.map((crate) => (
                        <span className={styles.chip} key={crate.crate_id}>
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
