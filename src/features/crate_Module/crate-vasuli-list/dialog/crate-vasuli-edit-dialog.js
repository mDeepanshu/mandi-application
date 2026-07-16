import React, { useEffect, useState } from "react";
import { getCrateMasterData } from "../../../../gateway/crateModule/master-api";
import { updateCrateVasuli } from "../../../../gateway/crateModule/vasuli-list-api";
import styles from "../../crate-dialog.module.css";

export default function VasuliEditDialog({ data, date, onClose, onSaved }) {
  const [rows, setRows] = useState([]);
  const [crateTypes, setCrateTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRowErrors, setShowRowErrors] = useState(false);

  useEffect(() => {
    getCrateMasterData().then((res) => setCrateTypes(res?.responseBody || []));
  }, []);

  useEffect(() => {
    if (data) {
      setRows(
        (data.crates || []).map((c) => ({
          crate_id: c.crate_id,
          crate_name: c.crate_name,
          crate_count: c.crate_count,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: field === "crate_id" ? value : Number(value),
    };
    setRows(updated);
    setError("");
  };

  const addRow = () => {
    setRows([...rows, { crate_id: "", crate_count: 0 }]);
    setError("");
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
    setError("");
  };

  const total = rows.reduce((sum, r) => sum + (r.crate_count || 0), 0);

  const originalTotal =
    data?.crates?.reduce((sum, c) => sum + c.crate_count, 0) || 0;

  const difference = total - originalTotal;

  const handleSave = async () => {
    if (rows.some((r) => !r.crate_id)) {
      setShowRowErrors(true);
      setError("Select a crate type for every row.");
      return;
    }

    if (rows.some((r) => r.crate_count < 0)) {
      setError("Counts cannot be negative.");
      return;
    }

    // Merge duplicate crate types, then send every crate that was originally
    // present but has since been removed with a count of 0 so the backend clears it.
    const counts = new Map();
    rows.forEach((r) => {
      const id = Number(r.crate_id);
      counts.set(id, (counts.get(id) || 0) + (r.crate_count || 0));
    });
    (data?.crates || []).forEach((c) => {
      const id = Number(c.crate_id);
      if (!counts.has(id)) counts.set(id, 0);
    });

    const payload = {
      vyapariId: String(data.vyapari_id),
      date,
      crates: [...counts].map(([crate_id, count]) => ({ crate_id, count })),
    };

    setSaving(true);
    try {
      await updateCrateVasuli(payload);
      onSaved();
    } catch (err) {
      console.error("Error updating vasuli:", err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Edit Vasuli</h3>
            <p className={styles.subtitle}>
              {data.vyapari_name}
              {date ? ` · ${date}` : ""}
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.rowsHeader}>
            <span>Crate type</span>
            <span>Returned</span>
            <span />
          </div>

          {rows.length === 0 && (
            <p className={styles.emptyHint}>
              No crates in this vasuli — add a row, or save to clear it.
            </p>
          )}

          {rows.map((row, index) => (
            <div className={styles.row} key={index}>
              <select
                className={`${styles.select} ${
                  showRowErrors && !row.crate_id ? styles.fieldError : ""
                }`}
                value={row.crate_id ?? ""}
                onChange={(e) => handleChange(index, "crate_id", e.target.value)}
              >
                <option value="">Select type…</option>
                {/* keep the row's own type selectable before the master list lands */}
                {!crateTypes.length && row.crate_id && (
                  <option value={row.crate_id}>{row.crate_name}</option>
                )}
                {crateTypes.map((crate) => (
                  <option key={crate.id} value={crate.id}>
                    {crate.crate_name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                className={styles.countInput}
                value={row.crate_count}
                onChange={(e) =>
                  handleChange(index, "crate_count", e.target.value)
                }
              />

              <button
                className={styles.removeBtn}
                onClick={() => removeRow(index)}
                aria-label="Remove row"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2.5 4h11M6.5 4V2.8a.8.8 0 0 1 .8-.8h1.4a.8.8 0 0 1 .8.8V4m2.7 0-.5 9.2a1 1 0 0 1-1 .95H5.3a1 1 0 0 1-1-.95L3.8 4M6.5 7v4M9.5 7v4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button className={styles.addBtn} onClick={addRow}>
            + Add row
          </button>
        </div>

        <div className={styles.footer}>
          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.footerBar}>
            <span className={`${styles.totalPill} ${styles.totalNeutral}`}>
              Total {total}
              {difference !== 0 && (
                <span className={styles.changed}>
                  ({difference > 0 ? "+" : ""}
                  {difference})
                </span>
              )}
            </span>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
