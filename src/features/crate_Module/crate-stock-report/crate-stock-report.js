import React, { useState } from "react";
import styles from "./crate-stock-report.module.css";
import { getCrateStockReport } from "../../../gateway/crateModule/stock-report-api";

export default function CrateStockSummary() {

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [items, setItems] = useState([]);
    const [totals, setTotals] = useState(null);

    const handleFetch = async () => {
        if (!date) {
            alert("Please enter date");
            return;
        }

        try {
            const result = await getCrateStockReport(date);
            setItems(result?.responseBody?.items || []);
            setTotals(result?.responseBody?.totals || null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Crate Stock Summary</h2>
            <div className={styles.filterBar}>
                <input
                    type="date"
                    placeholder="Enter date (dd-mm-yyyy)"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.input}
                />

                <button onClick={handleFetch} className={styles.fetchBtn}>
                    Fetch
                </button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Crate Type</th>
                        <th>Opening</th>
                        <th>Debit (Out)</th>
                        <th>Credit (In)</th>
                        <th>Closing</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((row, index) => (
                        <tr key={row.crate_id ?? index}>
                            <td>{row.crate_name}</td>
                            <td>{row.opening_stock}</td>
                            <td className={styles.debit}>{row.debit}</td>
                            <td className={styles.credit}>{row.credit}</td>
                            <td className={styles.closing}>{row.closing_stock}</td>
                        </tr>
                    ))}

                    {totals && (
                        <tr className={styles.totalRow}>
                            <td><b>Total</b></td>
                            <td><b>{totals.opening_stock}</b></td>
                            <td className={styles.debit}><b>{totals.debit}</b></td>
                            <td className={styles.credit}><b>{totals.credit}</b></td>
                            <td className={styles.closing}><b>{totals.closing_stock}</b></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}