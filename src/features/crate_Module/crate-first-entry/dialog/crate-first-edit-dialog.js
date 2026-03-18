import React, { useState } from "react";
import styles from "./crate-first-edit-dialog.module.css";

export default function EditDialog({ data, onClose, onSave }) {
  const [rows, setRows] = useState([
    { type: data.defaultCrate, count: data.total },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = field === "count" ? Number(value) : value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { type: "", count: 0 }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const total = rows.reduce((sum, r) => sum + (r.count || 0), 0);

  const handleSave = () => {
    if (total !== data.total) {
      alert(`Total must be ${data.total}`);
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
        <h3>Edit Crates - {data.vyapari}</h3>
        <hr />
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Crate Type</th>
              <th>Count</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <select
                    className={styles.select}
                    value={row.type}
                    onChange={(e) => handleChange(rows.indexOf(row), "type", e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Wooden">Wooden</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    value={row.count}
                    onChange={(e) => handleChange(rows.indexOf(row), "count", e.target.value)}
                  />
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

        <div className={styles.total}>Total Crates: {total} / {data.total}</div>

        <hr />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}