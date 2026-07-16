import React, { useEffect, useState } from "react";
import { getPendingCrateSummary } from "../../../gateway/crateModule/pending-crate-api";
import ui from "../crate-shared.module.css";
import styles from "./pending-crate.module.css";

// Backend dates are GMT without a trailing "Z"; format by string-splitting
// instead of new Date() to avoid the IST timezone shift.
const formatDate = (isoString) => {
    if (!isoString) return null;
    const [datePart] = isoString.split("T");
    const [y, m, d] = datePart.split("-");
    if (!y || !m || !d) return datePart;
    return `${d}/${m}/${y}`;
};

export default function PendingCrateSummary() {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        try {
            setLoading(true);
            const result = await getPendingCrateSummary();
            setData(result?.responseBody || []);
        } catch (err) {
            console.error("Error fetching pending crate summary:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetch();
    }, []);

    const totalPending = (data || []).reduce(
        (sum, row) => sum + (row.total_pending_crates || 0),
        0
    );

    return (
        <div className={ui.page}>
            <div className={ui.header}>
                <div>
                    <h2 className={ui.title}>Pending Crate Summary</h2>
                    <p className={ui.subtitle}>
                        Vyaparis who still have crates to return
                    </p>
                </div>

                <div className={ui.toolbar}>
                    {data?.length > 0 && (
                        <span className={ui.statPill}>
                            Total pending <b>{totalPending}</b>
                        </span>
                    )}
                    <button
                        onClick={handleFetch}
                        className={ui.btn}
                        disabled={loading}
                    >
                        {loading ? "Loading…" : "Refresh"}
                    </button>
                </div>
            </div>

            <div className={ui.card}>
                {data?.length === 0 && !loading && (
                    <p className={ui.emptyState}>
                        No pending crates — everything has been returned.
                    </p>
                )}

                {data?.length > 0 && (
                    <table className={ui.table}>
                        <thead>
                            <tr>
                                <th>Vyapari Name</th>
                                <th>Last Return</th>
                                <th className={ui.num}>Pending Crates</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row.vyapari_id ?? index}>
                                    <td className={styles.nameCell}>{row.vyapari_name}</td>
                                    <td>
                                        {formatDate(row.last_return_date) || (
                                            <span className={ui.muted}>—</span>
                                        )}
                                    </td>
                                    <td className={`${ui.num} ${styles.pending}`}>
                                        {row.total_pending_crates}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
