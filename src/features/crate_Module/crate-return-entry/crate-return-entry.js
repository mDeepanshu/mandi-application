import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getPendingCrates,
  saveReturnedCrates,
} from "../../../gateway/crateModule/return-entry-apis";
import { getCrateMasterData } from "../../../gateway/crateModule/master-api";
import VyapariField from "../../../shared/elements/VyapariField";
import CrateField from "../../../shared/elements/CrateField";
import { withCrateNumbers } from "../crate-numbers";
import ui from "../crate-shared.module.css";
import styles from "./crate-return-entry.module.css";

const todayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
};

const CrateReturnEntry = () => {
  const [crateTypes, setCrateTypes] = useState([]);
  const [crateInput, setCrateInput] = useState("");
  const [selectedCrate, setSelectedCrate] = useState(null);
  const [amount, setAmount] = useState("");
  const [pendingCrates, setPendingCrates] = useState([]);
  const [entries, setEntries] = useState([]);

  const vyapariBoxRef = useRef(null);
  const crateInputRef = useRef(null);
  const amountRef = useRef(null);

  const {
    formState: { errors },
    control,
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      vyapari_id: null,
    },
  });

  const vyapari = watch("vyapari_id");

  // Load crate types once; each gets a frontend-assigned number.
  useEffect(() => {
    getCrateMasterData().then((res) =>
      setCrateTypes(withCrateNumbers(res?.responseBody || []))
    );
  }, []);

  // When a vyapari is picked, load their pending crates and jump straight to
  // the crate type field.
  useEffect(() => {
    if (!vyapari) {
      setPendingCrates([]);
      return;
    }
    crateInputRef.current?.focus();
    getPendingCrates(vyapari.partyId)
      .then((res) => setPendingCrates(res?.responseBody || []))
      .catch((error) => {
        console.error("Error fetching pending crates:", error);
        setPendingCrates([]);
      });
  }, [vyapari]);

  // CrateField only hands a crate over once its number or full name is typed
  // (or a suggestion is picked) — then move on to the amount.
  const handleCrateChange = (crate) => {
    setSelectedCrate(crate);
    if (crate) setTimeout(() => amountRef.current?.focus(), 0);
  };

  const focusVyapari = () => {
    vyapariBoxRef.current?.querySelector("input")?.focus();
  };

  // Empty crate + Enter → step back: clear the vyapari and refocus it.
  const handleCrateEmptyEnter = () => {
    setValue("vyapari_id", null);
    setSelectedCrate(null);
    focusVyapari();
  };

  const saveEntry = () => {
    const vyapariVal = getValues("vyapari_id");
    if (!vyapariVal || !selectedCrate || !(Number(amount) > 0)) return;

    const count = Number(amount);
    const rowId = Date.now();

    const newRow = {
      id: rowId,
      vyapari_name: vyapariVal.name,
      crate_name: selectedCrate.crate_name,
      count,
      status: "saving",
    };
    setEntries((prev) => [newRow, ...prev]);

    // Reset the crate + amount immediately so the next entry can begin right
    // away (the vyapari stays put for consecutive returns).
    setSelectedCrate(null);
    setCrateInput("");
    setAmount("");
    setTimeout(() => crateInputRef.current?.focus(), 0);

    const payload = {
      vyapariId: vyapariVal.partyId,
      date: todayDate(),
      crates: [{ crate_id: selectedCrate.id, count }],
    };

    saveReturnedCrates(payload)
      .then(() => {
        setEntries((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, status: "saved" } : r))
        );
        // Reflect the return against the vyapari's pending counts.
        setPendingCrates((prev) =>
          prev.map((c) =>
            c.crate_id === payload.crates[0].crate_id
              ? { ...c, pending_count: c.pending_count - count }
              : c
          )
        );
      })
      .catch((error) => {
        console.error("Error saving returned crates:", error);
        setEntries((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, status: "failed" } : r))
        );
      });
  };

  const handleAmountKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    saveEntry();
  };

  const statusLabel = { saving: "Saving…", saved: "Saved", failed: "Failed" };
  const statusClass = {
    saving: styles.statusSaving,
    saved: styles.statusSaved,
    failed: styles.statusFailed,
  };

  return (
    <div className={ui.page}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Crate Return Entry</h2>
          <p className={ui.subtitle}>
            Enter a vyapari, then a crate type and amount — press Enter to save
          </p>
        </div>
      </div>

      <div className={styles.entryRow}>
        <div className={styles.vyapariField} ref={vyapariBoxRef}>
          <VyapariField
            name="vyapari_id"
            control={control}
            errors={errors}
            size="small"
            autoSelectSingleMatch
          />
        </div>

        <div className={styles.crateField}>
          <CrateField
            crates={crateTypes}
            value={selectedCrate}
            inputValue={crateInput}
            onInputChange={setCrateInput}
            onChange={handleCrateChange}
            onEmptyEnter={handleCrateEmptyEnter}
            inputRef={crateInputRef}
          />
        </div>

        <div className={styles.amountField}>
          <input
            ref={amountRef}
            type="number"
            min="1"
            className={styles.textInput}
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleAmountKeyDown}
          />
        </div>
      </div>

      {vyapari && (
        <div className={styles.pendingPanel}>
          <span className={styles.pendingLabel}>Pending crates</span>
          {pendingCrates.length === 0 ? (
            <span className={styles.pendingEmpty}>None outstanding</span>
          ) : (
            <div className={styles.pendingPills}>
              {pendingCrates.map((c) => (
                <span
                  key={c.crate_id}
                  className={`${ui.statPill} ${
                    c.pending_count <= 0 ? styles.pendingCleared : ""
                  }`}
                >
                  {c.crate_name} <b>{c.pending_count}</b>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={ui.card}>
        {entries.length === 0 ? (
          <p className={ui.emptyState}>
            No returns entered yet. Saved entries will appear here.
          </p>
        ) : (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Vyapari</th>
                <th>Crate Type</th>
                <th className={ui.num}>Amount</th>
                <th className={styles.statusHead}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id}>
                  <td className={styles.nameCell}>{row.vyapari_name}</td>
                  <td>{row.crate_name}</td>
                  <td className={ui.num}>{row.count}</td>
                  <td className={styles.statusCell}>
                    <span
                      className={`${styles.statusBadge} ${statusClass[row.status]}`}
                    >
                      {statusLabel[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CrateReturnEntry;
