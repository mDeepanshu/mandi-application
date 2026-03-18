import React, { useState } from "react";
import styles from "./pending-crate.module.css";

export default function PendingCrateSummary() {
    const [date, setDate] = useState("");
    const [data, setData] = useState([
        { name: "P Ankit Rampur", lastDate: null, pending: 20 },
        { name: "P Badry Knw", lastDate: null, pending: 1 },
        { name: "P Brijesh Rampur Et", lastDate: "2025-05-24", pending: 70 },
        { name: "P Rady Rampur", lastDate: "2025-05-29", pending: 61 },
    ]);
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        if (!date) {
            alert("Please select date");
            return;
        }

        try {
            setLoading(true);

            // 🔥 Replace with API
            // const res = await fetch(`/api/pending-crates?date=${date}`);
            // const result = await res.json();

            // Dummy data
            const result = [
                { name: "P Ankit Rampur", lastDate: null, pending: 20 },
                { name: "P Badry Knw", lastDate: null, pending: 1 },
                { name: "P Brijesh Rampur Et", lastDate: "2025-05-24", pending: 70 },
                { name: "P Rady Rampur", lastDate: "2025-05-29", pending: 61 },
            ];

            setData(result);
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
            {data.length > 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Vyapari Name</th>
                            <th>Last Transaction</th>
                            <th>Pending Crates</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.name}</td>

                                <td className={styles.lastDate}>
                                    {row.lastDate
                                        ? new Date(row.lastDate).toLocaleDateString("en-GB")
                                        : "Not"}
                                </td>

                                <td className={styles.pending}>
                                    {row.pending}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}