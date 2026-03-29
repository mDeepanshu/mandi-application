import React, { useEffect, useState } from "react";
import styles from "./crate-first-edit-dialog.module.css";

export default function EditDialog({ data, onClose, onSave }) {
  const [rows, setRows] = useState([]);

  // initialize rows from API data
  useEffect(() => {
    if (data) {
      const formatted = data.crates.map((c) => ({
        crate_id: c.crate_id,
        crate_name: c.crate_name,
        crate_count: c.crate_count,
      }));
      setRows(formatted);
    }
  }, [data]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] =
      field === "crate_count" ? Number(value) : value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { crate_id: null, crate_name: "", crate_count: 0 },
    ]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const total = rows.reduce(
    (sum, r) => sum + (r.crate_count || 0),
    0
  );

  const originalTotal =
    data?.crates?.reduce(
      (sum, c) => sum + c.crate_count,
      0
    ) || 0;

  const handleSave = () => {
    if (total !== originalTotal) {
      alert(`Total must be ${originalTotal}`);
      return;
    }

    onSave({
      ...data,
      crates: rows,
    });
  };

  return (
    <div className={styles.dialogBackdrop}>
      <div className={styles.dialog}>
        <h3>Edit Crates - {data.vyapari_name}</h3>

        <hr />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Crate Type</th>
              <th>Count</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <select
                    className={styles.select}
                    value={row.crate_name}
                    onChange={(e) =>
                      handleChange(index, "crate_name", e.target.value)
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="PLASTIC">Plastic</option>
                    <option value="WOODEN">Wooden</option>
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    className={styles.input}
                    value={row.crate_count}
                    onChange={(e) =>
                      handleChange(index, "crate_count", e.target.value)
                    }
                  />
                </td>

                <td>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeRow(index)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.btnContainer}>
          <button className={styles.addBtn} onClick={addRow}>
            + Add Row
          </button>
        </div>

        <div className={styles.total}>
          Total Crates: {total} / {originalTotal}
        </div>

        <hr />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}