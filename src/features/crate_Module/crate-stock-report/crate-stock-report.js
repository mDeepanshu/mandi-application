import React, { useState } from "react";
import styles from "./crate-stock-report.module.css";
import { getCrateStockReport } from "../../../gateway/crateModule/stock-report-api";


const data = [
    { type: "AKP Crate", opening: 64, debit: 0, credit: 0 },
    { type: "HIS Crate", opening: 17, debit: 0, credit: 0 },
    { type: "MD Crate", opening: 2, debit: 0, credit: 0 },
    { type: "Wooden Crate", opening: 70, debit: 0, credit: 0 },
    { type: "Plastic Crate", opening: 114, debit: 0, credit: 0 },
    { type: "Metal Crate", opening: 13, debit: 0, credit: 0 },
];

export default function CrateStockSummary() {

    const [date, setDate] = useState("");
    const [data, setData] = useState();

    const calculateClosing = (row) =>
        row.opening + row.credit - row.debit;

    const total = data?.reduce(
        (acc, row) => {
            acc.opening += row.opening;
            acc.debit += row.debit;
            acc.credit += row.credit;
            acc.closing += calculateClosing(row);
            return acc;
        },
        { opening: 0, debit: 0, credit: 0, closing: 0 }
    );

    const handleFetch = async () => {
        if (!date) {
            alert("Please enter date");
            return;
        }

        try {
            const result = await getCrateStockReport(date);
            console.log(result);
            
            //   setLoading(true);

            // 🔥 Replace this with your API call
            // const res = await fetch(`/api/crate-summary?date=${date}`);
            // const result = await res.json();

            // Dummy data for now
            setData(result?.responseBody || []);
        } catch (err) {
            console.error(err);
            alert("Error fetching data");
        } finally {
            //   setLoading(false);
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
                    {data?.map((row, index) => {
                        const closing = calculateClosing(row);
                        return (
                            <tr key={index}>
                                <td>{row.crate_name}</td>
                                <td>{row.opening_stock}</td>
                                <td className={styles.debit}>{row.debit}</td>
                                <td className={styles.credit}>{row.credit}</td>
                                <td className={styles.closing}>{row.closing_stock}</td>
                            </tr>
                        );
                    })}

                    {/* Total Row */}
                    <tr className={styles.totalRow}>
                        <td><b>Total</b></td>
                        <td><b>{total?.opening}</b></td>
                        <td className={styles.debit}><b>{total?.debit}</b></td>
                        <td className={styles.credit}><b>{total?.credit}</b></td>
                        <td className={styles.closing}><b>{total?.closing}</b></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}