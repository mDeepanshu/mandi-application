import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getPendingCrates, saveReturnedCrates } from "../../../gateway/crateModule/return-entry-apis";
import VyapariField from "../../../shared/elements/VyapariField";
import ui from "../crate-shared.module.css";
import styles from "./crate-return-entry.module.css";

const CrateReturnEntry = () => {
  const [data, setData] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [saving, setSaving] = useState(false);

  const { formState: { errors }, control, getValues, trigger } = useForm({
    defaultValues: {
      vyapari_id: null,
    },
  });

  const handleFetch = async () => {
    const isValid = await trigger("vyapari_id");
    if (!isValid) return;

    const vyapari = getValues("vyapari_id");
    getPendingCrates(vyapari?.partyId)
      .then((response) => {
        setData(
          (response?.responseBody || []).map((row) => ({ ...row, returned: "" }))
        );
        setFetched(true);
      })
      .catch((error) => {
        console.error("Error fetching pending crates:", error);
      });
  };

  const handleChange = (index, value) => {
    let val = value === "" ? "" : Number(value);
    if (val < 0) return;
    if (val > data[index].pending_count) return;

    setData(
      data.map((row, i) => (i === index ? { ...row, returned: val } : row))
    );
  };

  const totalPending = data.reduce((sum, row) => sum + row.pending_count, 0);
  const totalReturned = data.reduce(
    (sum, row) => sum + Number(row.returned || 0),
    0
  );
  const hasValidReturn = data.some((row) => Number(row.returned) > 0);

  const handleSave = async () => {
    const payload = {
      vyapariId: getValues("vyapari_id")?.partyId,
      date: new Date().toISOString().split("T")[0],
      crates: data
        .filter((row) => Number(row.returned) > 0)
        .map((row) => ({
          crate_id: row.crate_id,
          count: Number(row.returned),
        })),
    };

    setSaving(true);
    try {
      await saveReturnedCrates(payload);
      setData([]);
      setFetched(false);
    } catch (error) {
      console.error("Error saving returned crates:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={ui.page}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Crate Return Entry</h2>
          <p className={ui.subtitle}>
            Record crates a vyapari has returned today
          </p>
        </div>
      </div>

      <div className={styles.fetchRow}>
        <div className={styles.vyapariField}>
          <VyapariField
            name="vyapari_id"
            control={control}
            errors={errors}
            size="small"
          />
        </div>
        <button className={ui.btn} onClick={handleFetch}>
          Fetch
        </button>
      </div>

      <div className={ui.card}>
        {!fetched && (
          <p className={ui.emptyState}>
            Select a vyapari and fetch to see their pending crates.
          </p>
        )}

        {fetched && data.length === 0 && (
          <p className={ui.emptyState}>No pending crates for this vyapari.</p>
        )}

        {fetched && data.length > 0 && (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Crate Type</th>
                <th className={ui.num}>Pending</th>
                <th className={styles.returnedHead}>Returned</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.crate_id ?? index}>
                  <td className={styles.nameCell}>{row.crate_name}</td>
                  <td className={ui.num}>{row.pending_count}</td>
                  <td className={styles.returnedCell}>
                    <input
                      type="number"
                      min="0"
                      max={row.pending_count}
                      className={styles.returnInput}
                      value={row.returned}
                      placeholder="0"
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              <tr className={ui.totalRow}>
                <td>Total</td>
                <td className={ui.num}>{totalPending}</td>
                <td className={styles.returnedCell}>
                  <span className={styles.returnedTotal}>{totalReturned}</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {fetched && data.length > 0 && (
        <div className={styles.saveRow}>
          <button
            className={ui.btn}
            onClick={handleSave}
            disabled={!hasValidReturn || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CrateReturnEntry;
