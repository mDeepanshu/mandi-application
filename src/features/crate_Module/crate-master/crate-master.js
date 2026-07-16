import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField } from "@mui/material";
import MasterTable from "../../../shared/ui/master-table/master-table";
import { getCrateMasterData, addCrateMasterData } from "../../../gateway/crateModule/master-api";
import ui from "../crate-shared.module.css";
import styles from "./crate-master.module.css";

const CRATE_COLUMNS = ["CRATE NAME", "TOTAL CRATES", "CLOSING AMOUNT"];
const CRATE_KEY_ARRAY = ["crate_name", "total", "closing_amount"];

const CrateMaster = () => {
    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm();
    const [crateTableData, setCrateTableData] = useState([]);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const data = await getCrateMasterData();
            setCrateTableData(data?.responseBody || []);
        } catch (error) {
            console.error("Error fetching crate master data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (formData) => {
        const name = (formData.crateName || "").trim();
        if (!name) return;

        const exists = crateTableData.some(
            (it) => (it.crate_name || "").toLowerCase() === name.toLowerCase()
        );
        if (exists) {
            setError("crateName", { type: "duplicate", message: "This crate already exists" });
            return;
        }

        setSaving(true);
        try {
            const res = await addCrateMasterData({
                crateName: name,
                total: formData.total,
                closingAmount: formData.closingAmount,
            });
            if (res) {
                fetchData();
                reset();
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={ui.page}>
            <div className={ui.header}>
                <div>
                    <h2 className={ui.title}>Crate Master</h2>
                    <p className={ui.subtitle}>Crate types and their total stock</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={`${ui.card} ${ui.cardPad} ${styles.formCard}`}>
                <Controller
                    name="crateName"
                    control={control}
                    rules={{ required: "Enter crate name" }}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Crate Name"
                            variant="outlined"
                            error={!!errors.crateName}
                            helperText={errors.crateName?.message}
                        />
                    )}
                />
                <Controller
                    name="total"
                    control={control}
                    rules={{
                        required: "Enter total crates",
                        validate: (v) => Number(v) > 0 || "Must be a positive number",
                    }}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="number"
                            label="Total Crates"
                            variant="outlined"
                            error={!!errors.total}
                            helperText={errors.total?.message}
                        />
                    )}
                />
                <Controller
                    name="closingAmount"
                    control={control}
                    rules={{
                        required: "Enter closing amount",
                        validate: (v) => Number(v) >= 0 || "Cannot be negative",
                    }}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="number"
                            label="Closing Amount"
                            variant="outlined"
                            error={!!errors.closingAmount}
                            helperText={errors.closingAmount?.message}
                        />
                    )}
                />
                <button type="submit" className={`${ui.btn} ${styles.addBtn}`} disabled={saving}>
                    {saving ? "Adding…" : "+ Add"}
                </button>
            </form>

            <div className={styles.tableWrap}>
                <MasterTable
                    columns={CRATE_COLUMNS}
                    tableData={crateTableData}
                    keyArray={CRATE_KEY_ARRAY}
                />
            </div>
        </div>
    );
};

export default CrateMaster;
