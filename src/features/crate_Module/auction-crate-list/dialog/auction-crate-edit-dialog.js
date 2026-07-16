import React, { useEffect, useState } from "react";
import { getCrateMasterData } from "../../../../gateway/crateModule/master-api";
import { updateAuctionCrateEntry } from "../../../../gateway/crateModule/auction-crate-list-api";
import shared from "../../crate-dialog.module.css";
import styles from "./auction-crate-edit-dialog.module.css";

export default function AuctionCrateEditDialog({ data, onClose, onSaved }) {
  const [crateId, setCrateId] = useState("");
  const [count, setCount] = useState(0);
  const [crateTypes, setCrateTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCrateMasterData().then((res) => setCrateTypes(res?.responseBody || []));
  }, []);

  useEffect(() => {
    if (data) {
      setCrateId(data.crate_id ?? "");
      setCount(data.crate_count ?? 0);
    }
  }, [data]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = async () => {
    if (!crateId) {
      setError("Select a crate type.");
      return;
    }
    if (count < 0) {
      setError("Count cannot be negative.");
      return;
    }

    setSaving(true);
    try {
      await updateAuctionCrateEntry({
        id: data.id,
        crate_id: Number(crateId),
        count: Number(count),
      });
      onSaved();
    } catch (err) {
      console.error("Error updating crate entry:", err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={shared.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={shared.dialog} role="dialog" aria-modal="true">
        <div className={shared.header}>
          <div>
            <h3 className={shared.title}>Edit Crate Entry</h3>
            <p className={shared.subtitle}>
              {data.kisan_name} → {data.vyapari_name}
            </p>
          </div>
          <button
            className={shared.closeBtn}
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

        <div className={shared.body}>
          <dl className={styles.context}>
            <div>
              <dt>Kisan</dt>
              <dd>{data.kisan_name}</dd>
            </div>
            <div>
              <dt>Vyapari</dt>
              <dd>
                {data.vyapari_idNo ? `${data.vyapari_idNo} · ` : ""}
                {data.vyapari_name}
              </dd>
            </div>
          </dl>

          <label className={styles.field}>
            <span className={styles.label}>Crate type</span>
            <select
              className={`${shared.select} ${error && !crateId ? shared.fieldError : ""}`}
              value={crateId ?? ""}
              onChange={(e) => {
                setCrateId(e.target.value);
                setError("");
              }}
            >
              <option value="">Select type…</option>
              {/* keep the row's own type selectable before the master list lands */}
              {!crateTypes.length && data.crate_id && (
                <option value={data.crate_id}>{data.crate_name}</option>
              )}
              {crateTypes.map((crate) => (
                <option key={crate.id} value={crate.id}>
                  {crate.crate_name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Count</span>
            <input
              type="number"
              min="0"
              className={`${shared.countInput} ${styles.countInput}`}
              value={count}
              onChange={(e) => {
                setCount(Number(e.target.value));
                setError("");
              }}
            />
          </label>
        </div>

        <div className={shared.footer}>
          {error && <p className={shared.errorText}>{error}</p>}

          <div className={shared.footerBar}>
            <span className={`${shared.totalPill} ${shared.totalNeutral}`}>
              Count {count}
            </span>

            <div className={shared.actions}>
              <button className={shared.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                className={shared.saveBtn}
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
