import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Print } from "@mui/icons-material";
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
    const printRef = useRef(null);

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

    // Print copy is sorted by vyapari name so it is easy to look up on paper.
    const printRows = [...(data || [])].sort((a, b) =>
        (a.vyapari_name || "").localeCompare(b.vyapari_name || "", "en", {
            sensitivity: "base",
        })
    );

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Pending Crates ${today}`,
        pageStyle: "@page { size: A4 portrait; margin: 10mm; }",
    });

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
                    <button
                        onClick={handlePrint}
                        className={`${ui.btnGhost} ${styles.printBtn}`}
                        disabled={loading || printRows.length === 0}
                    >
                        <Print fontSize="small" />
                        Print
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

            {/* Print-only layout: hidden on screen, rendered by react-to-print. */}
            <div className={styles.printHidden}>
                <div ref={printRef} className={styles.printPage}>
                    <div className={styles.printHeader}>
                        <h2>Pending Crate Summary</h2>
                        <div className={styles.printMeta}>
                            <span>Date: {today}</span>
                            <span>
                                Total pending: <b>{totalPending}</b>
                            </span>
                        </div>
                    </div>

                    <div className={styles.printColHeads}>
                        {[0, 1, 2].map((i) => (
                            <div key={i} className={styles.printRow}>
                                <span>Vyapari</span>
                                <span>Last Return</span>
                                <span className={styles.printCount}>Pend.</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.printColumns}>
                        {printRows.map((row, index) => (
                            <div key={row.vyapari_id ?? index} className={styles.printRow}>
                                <span className={styles.printName}>{row.vyapari_name}</span>
                                <span>{formatDate(row.last_return_date) || "—"}</span>
                                <span className={styles.printCount}>
                                    {row.total_pending_crates}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
