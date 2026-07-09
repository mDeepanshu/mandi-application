import React, { useState } from "react";
import styles from "./pending-crate.module.css";
import { getPendingCrateSummary } from "../../../gateway/crateModule/pending-crate-api";

export default function PendingCrateSummary() {
    const [date, setDate] = useState("");
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        if (!date) {
            alert("Please select date");
            return;
        }

        try {
            setLoading(true);

            const result = await getPendingCrateSummary();

            // 🔥 Replace with API
            // const res = await fetch(`/api/pending-crates?date=${date}`);
            // const result = await res.json();

            // Dummy data

            setData(result?.responseBody || []);
        } catch (err) {
            console.error(err);
            alert("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Pending Crate Summary</h2>

            {/* 🔹 Filter */}
            <div className={styles.filterBar}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.input}
                />

                <button
                    onClick={handleFetch}
                    className={styles.fetchBtn}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Fetch"}
                </button>
            </div>

            {/* 🔹 Table */}
            {data?.length > 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Vyapari Name</th>
                            <th>Last Transaction</th>
                            <th>Pending Crates</th>
                            <th>Details</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.vyapari_name}</td>

                                <td className={styles.lastDate}>
                                    {row.lastDate
                                        ? new Date(row.lastDate).toLocaleDateString("en-GB")
                                        : "Not"}
                                </td>

                                <td className={styles.pending}>
                                    {row.total_pending_crates}
                                </td>
                                <td>
                                    <button className={styles.detailsBtn}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}