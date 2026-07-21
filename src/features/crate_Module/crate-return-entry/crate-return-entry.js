import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { saveReturnedCrates } from "../../../gateway/crateModule/return-entry-apis";
import { getCrateMasterData } from "../../../gateway/crateModule/master-api";
import VyapariField from "../../../shared/elements/VyapariField";
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

  // Load crate types once for name matching.
  useEffect(() => {
    getCrateMasterData().then((res) => setCrateTypes(res?.responseBody || []));
  }, []);

  // When a vyapari is picked, jump straight to the crate type field.
  useEffect(() => {
    if (vyapari) crateInputRef.current?.focus();
  }, [vyapari]);

  const matches = crateInput.trim()
    ? crateTypes.filter((c) =>
        c.crate_name.toLowerCase().includes(crateInput.trim().toLowerCase())
      )
    : [];

  const selectCrate = (crate) => {
    setSelectedCrate(crate);
    setCrateInput(crate.crate_name);
    setTimeout(() => amountRef.current?.focus(), 0);
  };

  const handleCrateInput = (value) => {
    setCrateInput(value);
    setSelectedCrate(null);

    const query = value.trim().toLowerCase();
    if (!query) return;

    const found = crateTypes.filter((c) =>
      c.crate_name.toLowerCase().includes(query)
    );
    // Exactly one crate matches the typed string → lock it in and move on.
    if (found.length === 1) selectCrate(found[0]);
  };

  const focusVyapari = () => {
    vyapariBoxRef.current?.querySelector("input")?.focus();
  };

  const handleCrateKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    // Empty crate + Enter → step back: clear the vyapari and refocus it.
    if (!crateInput.trim()) {
      setValue("vyapari_id", null);
      setSelectedCrate(null);
      focusVyapari();
      return;
    }

    if (selectedCrate) {
      amountRef.current?.focus();
      return;
    }
    if (matches.length >= 1) {
      const exact = matches.find(
        (c) => c.crate_name.toLowerCase() === crateInput.trim().toLowerCase()
      );
      selectCrate(exact || matches[0]);
    }
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
          <input
            ref={crateInputRef}
            type="text"
            className={`${styles.textInput} ${
              selectedCrate ? styles.textInputOk : ""
            }`}
            placeholder="Crate type"
            value={crateInput}
            onChange={(e) => handleCrateInput(e.target.value)}
            onKeyDown={handleCrateKeyDown}
            autoComplete="off"
          />
          {!selectedCrate && matches.length > 0 && (
            <div className={styles.suggestions}>
              {matches.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className={styles.suggestion}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCrate(c);
                  }}
                >
                  {c.crate_name}
                </div>
              ))}
            </div>
          )}
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
