import React, { useEffect, useState } from "react";
import { getCrateStockReport } from "../../../gateway/crateModule/stock-report-api";
import ui from "../crate-shared.module.css";
import styles from "./crate-stock-report.module.css";

export default function CrateStockSummary() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [items, setItems] = useState([]);
    const [totals, setTotals] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const handleFetch = async (reportDate) => {
        if (!reportDate) return;

        setLoading(true);
        try {
            const result = await getCrateStockReport(reportDate);
            setItems(result?.responseBody?.items || []);
            setTotals(result?.responseBody?.totals || null);
            setFetched(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetch(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={ui.page}>
            <div className={ui.header}>
                <div>
                    <h2 className={ui.title}>Crate Stock Summary</h2>
                    <p className={ui.subtitle}>
                        Opening, movement and closing stock per crate type
                    </p>
                </div>

                <div className={ui.toolbar}>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={ui.input}
                    />
                    <button
                        onClick={() => handleFetch(date)}
                        className={ui.btn}
                        disabled={loading || !date}
                    >
                        {loading ? "Fetching…" : "Fetch"}
                    </button>
                </div>
            </div>

            <div className={ui.card}>
                {fetched && items.length === 0 && (
                    <p className={ui.emptyState}>No stock data for {date}.</p>
                )}

                {(!fetched || items.length > 0) && (
                    <table className={ui.table}>
                        <thead>
                            <tr>
                                <th>Crate Type</th>
                                <th className={ui.num}>Opening</th>
                                <th className={ui.num}>Debit (Out)</th>
                                <th className={ui.num}>Credit (In)</th>
                                <th className={ui.num}>Closing</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((row, index) => (
                                <tr key={row.crate_id ?? index}>
                                    <td className={styles.nameCell}>{row.crate_name}</td>
                                    <td className={ui.num}>{row.opening_stock}</td>
                                    <td className={`${ui.num} ${row.debit ? ui.debit : ui.muted}`}>
                                        {row.debit}
                                    </td>
                                    <td className={`${ui.num} ${row.credit ? ui.credit : ui.muted}`}>
                                        {row.credit}
                                    </td>
                                    <td className={`${ui.num} ${styles.closing}`}>
                                        {row.closing_stock}
                                    </td>
                                </tr>
                            ))}

                            {totals && items.length > 0 && (
                                <tr className={ui.totalRow}>
                                    <td>Total</td>
                                    <td className={ui.num}>{totals.opening_stock}</td>
                                    <td className={`${ui.num} ${totals.debit ? ui.debit : ""}`}>
                                        {totals.debit}
                                    </td>
                                    <td className={`${ui.num} ${totals.credit ? ui.credit : ""}`}>
                                        {totals.credit}
                                    </td>
                                    <td className={ui.num}>{totals.closing_stock}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
