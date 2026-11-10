import React, { useEffect, useState } from "react";
import { updateCrateSummary } from "../../../../gateway/crateModule/first-entry-api";
import styles from "../../crate-dialog.module.css";

// Edits a single log entry: its count can be re-split across crate types, but
// the total must stay equal to that entry's count.
export default function EditDialog({
  data,
  crate,
  entry,
  crateTypes = [],
  date,
  onClose,
  onSaved,
}) {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRowErrors, setShowRowErrors] = useState(false);

  // initialize with the selected entry only
  useEffect(() => {
    if (crate && entry) {
      setRows([
        {
          crate_id: crate.crate_id,
          crate_name: crate.crate_name,
          crate_count: Number(entry.count) || 0,
        },
      ]);
    }
  }, [crate, entry]);

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
      [field]: field === "crate_name" ? value : Number(value),
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

  const originalTotal = Number(entry?.count) || 0;

  const totalMatches = total === originalTotal;

  const handleSave = async () => {
    if (rows.some((r) => !r.crate_id)) {
      setShowRowErrors(true);
      setError("Select a crate type for every row.");
      return;
    }

    if (!totalMatches) {
      setError(`Total must equal ${originalTotal}.`);
      return;
    }

    // The API takes the vyapari's per-type totals for the day, so start from
    // those, take this entry's count out of its type, then add the edited rows.
    const counts = new Map();
    (data?.crates || []).forEach((c) => {
      const id = Number(c.crate_id);
      counts.set(id, (counts.get(id) || 0) + (Number(c.crate_count) || 0));
    });
    const entryCrateId = Number(crate.crate_id);
    counts.set(entryCrateId, (counts.get(entryCrateId) || 0) - originalTotal);
    rows.forEach((r) => {
      const id = Number(r.crate_id);
      counts.set(id, (counts.get(id) || 0) + (r.crate_count || 0));
    });

    const payload = {
      vyapariId: String(data.vyapari_id),
      date,
      crates: [...counts].map(([crate_id, count]) => ({ crate_id, count })),
    };

    setSaving(true);
    try {
      await updateCrateSummary(payload);
      onSaved();
    } catch (err) {
      console.error("Error updating crate summary:", err);
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
            <h3 className={styles.title}>Edit Crates</h3>
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
            <span>Count</span>
            <span />
          </div>

          {rows.length === 0 && (
            <p className={styles.emptyHint}>
              No crates yet — add a row to get started.
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
                {/* keep the row's own type selectable even if it isn't in the list */}
                {row.crate_id &&
                  !crateTypes.some((t) => String(t.id) === String(row.crate_id)) && (
                    <option value={row.crate_id}>{row.crate_name}</option>
                  )}
                {crateTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.crate_name}
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
            <span
              className={`${styles.totalPill} ${
                totalMatches ? styles.totalOk : styles.totalBad
              }`}
            >
              Total {total} / {originalTotal}
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
