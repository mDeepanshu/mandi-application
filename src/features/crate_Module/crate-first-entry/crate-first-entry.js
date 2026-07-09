import React, { useState } from "react";
import EditDialog from "./dialog/crate-first-edit-dialog";
import styles from "./crate-first-entry.module.css";
import { Edit } from '@mui/icons-material';
import { getCrateSummaryByDate } from "../../../gateway/crateModule/first-entry-api";

export default function CrateManagement() {
  const [data, setData] = useState();
  const [selected, setSelected] = useState(null);

  const fetchData = () => {
    // Placeholder for fetch logic
    const dateInput = document.getElementById("summaryDate").value;
    if (!dateInput) {
      alert("Please select a date.");
      return;
    }

    getCrateSummaryByDate(dateInput)
      .then((summary) => {
        setData(summary?.responseBody || []);
      })
      .catch((error) => {
        console.error("Error fetching crate summary:", error);
      });

  };

  return (
    <div className={styles.container}>
      <h2>Summary After Mandi Completion</h2>

      {/* Date + Fetch */}
      <div className={styles.dateContainer}>
        <div className={styles.dateLeft}>
          <label htmlFor="summaryDate">Date: </label>
          <input
            type="date"
            id="summaryDate"
            className={styles.dateInput}
          />
        </div>

        <button className={styles.fetchBtn} onClick={fetchData}>
          FETCH
        </button>
      </div>

      <hr />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vyapari Name</th>
            <th>Crate Type</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((row) => (
            <tr key={row.vyapari_id}>
              <td>{row.vyapari_name}</td>

              <td>
                {row.crates
                  ?.map(
                    (crate) =>
                      `${crate.crate_name} (${crate.crate_count})`
                  )
                  .join(", ")}
              </td>

              <td>
                {row.crates?.reduce(
                  (sum, crate) => sum + crate.crate_count,
                  0
                )}
              </td>

              <td>
                <button
                  className={styles.editBtn}
                  onClick={() => setSelected(row)}
                >
                  <Edit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <EditDialog
          data={selected}
          onClose={() => setSelected(null)}
          onSave={(updated) => {
            setData((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}