import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Typography } from '@mui/material';
import "./crate-master.module.css"
import { Delete, AddCircleOutline } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MasterTable from "../../../shared/ui/master-table/master-table";

const CrateMaster = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Add your fetch or initialization logic here
    }, []);

    const { control, handleSubmit, reset, formState: { errors } } = useForm();

    const [crateTableData, setCrateTableData] = useState([]);
    const crateTableDataFiltered = crateTableData;
    const crateColumns = ["CRATE NAME", "TYPE", "ACTIONS"];
    const crateKeyArray = ["crateName", "crateType", "delete"];

    const crateTypes = ["SMALL", "MEDIUM", "LARGE"];

    const [open, setOpen] = useState(false);
    const action = (
        <Button onClick={() => setOpen(false)} color="inherit">Close</Button>
    );
    const handleClose = () => setOpen(false);

    const onCrateInput = (e, field) => field.onChange(e.target.value);

    const onSubmit = (formData) => {
        const name = (formData.crateName || "").trim();
        const type = formData.crateType || "";
        if (!name) return;
        const exists = crateTableData.some((it) => (it.crateName || "").toLowerCase() === name.toLowerCase() && (it.crateType || "") === type);
        if (exists) {
            setOpen(true);
            return;
        }
        const newEntry = { crateName: name, crateType: type };
        setCrateTableData((prev) => [newEntry, ...prev]);
        reset();
    };

    const deleteEntry = (index) => {
        setCrateTableData((prev) => {
            const arr = [...prev];
            arr.splice(index, 1);
            return arr;
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="crate-master">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2} p={3}>
                    <Grid item xs={12}>
                        <Typography variant="h4" component="h1" align="left">
                            CRATE MASTER
                        </Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Controller
                            name="crateName"
                            control={control}
                            rules={{ required: "Enter Crate Name" }}
                            defaultValue=""
                            render={({ field }) => <TextField {...field} fullWidth label="CRATE NAME" variant="outlined" onChange={(e) => onCrateInput(e, field)} />}

                        />
                        <p className='err-msg'>{errors.crateName?.message}</p>
                    </Grid>
                    {/* <Grid item xs={4}>
                        <Controller
                            name="crateType"
                            control={control}
                            rules={{ required: "Enter Crate Type" }}
                            defaultValue=""
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>CRATE TYPE</InputLabel>
                                    <Select {...field} label="CRATE TYPE" variant="outlined">
                                        {crateTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <p className='err-msg'>{errors.crateType?.message}</p>
                    </Grid> */}

                    <Grid item xs={2}>
                        <Button variant="contained" color="primary" fullWidth type="submit" sx={{ height: '3.438rem' }}>
                            <AddCircleOutline /> ADD
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                            <div className='table-container'>
                            <MasterTable columns={crateColumns} tableData={crateTableDataFiltered} keyArray={crateKeyArray} />
                        </div>
                    </Grid>
                </Grid>
                <div>
                        <Snackbar
                        open={open}
                        autoHideDuration={4000}
                        message="CRATE ALREADY EXISTS"
                        action={action}
                        onClose={handleClose}
                    />
                </div>
            </form>
        </div>
    );
};

export default CrateMaster;