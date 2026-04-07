import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";

import { getPendingCrates, saveReturnedCrates } from "../../../gateway/crateModule/return-entry-apis";
import VyapariField from "../../../shared/elements/VyapariField";
import { useForm } from "react-hook-form";
import styles from "./crate-return-entry.module.css";

const CrateReturnEntry = () => {
  const [vyapariId, setVyapariName] = useState("");
  const [data, setData] = useState([]);
  const isSmallScreen = useMediaQuery("(max-width:495px)");

  const { formState: { errors }, control, getValues } = useForm({
    defaultValues: {
      vyapari_id: null,
    },
  });

  // Mock fetch (replace with API)
  const handleFetch = () => {


    const vyapariId = getValues("vyapari_id");
    console.log(vyapariId);

    getPendingCrates(vyapariId?.partyId)
      .then((response) => {
        setData(response?.responseBody || []);
      })
      .catch((error) => {
        console.error("Error fetching pending crates:", error);
      });


  };

  // Handle input change with validation
  const handleChange = (index, value) => {
    const updated = [...data];

    let val = value === "" ? "" : Number(value);

    // Prevent negative
    if (val < 0) return;

    // Prevent exceeding pending
    if (val > updated[index].pending_count) return;

    updated[index].returned = val;
    setData(updated);
  };

  const totalPending = data.reduce((sum, row) => sum + row.pending_count, 0);

  const totalReturned = data.reduce(
    (sum, row) => sum + Number(row.returned || 0),
    0
  );

  // Check if at least one valid return exists
  const hasValidReturn = data.some(
    (row) => Number(row.returned) > 0
  );

  const handleSave = () => {

    if(getValues("vyapari_id") === null){
      alert("Please select a Vyapari before saving.");
      return;
    }

    const payload = {
      vyapariId: getValues("vyapari_id")?.partyId,
      date: new Date().toISOString().split("T")[0], // current date in YYYY-MM-DD format
      crates: data
        .filter((row) => Number(row.returned) > 0)
        .map((row) => ({
          crate_id: row.crate_id,
          count: Number(row.returned),
        })),
    };

    saveReturnedCrates(payload)
      .then((response) => {
        alert("Returned crates saved successfully!");
        // Optionally, you can clear the form or refetch data here
        setData([]);
      })
      .catch((error) => {
        alert("Failed to save returned crates. Please try again.");
      });


  };

  return (
    <Box p={4}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Crate Return Entry
      </Typography>

      {/* Vyapari Input */}
      <Box display="flex" gap={2} mb={3}>
        <VyapariField
          name="vyapari_id"
          control={control}
          errors={errors}
          size={isSmallScreen ? "small" : "medium"}
        // onKeyDownFunc={onVyapariKeyDown}
        // customOnSelect={handleClose}
        />
        <Button variant="contained" onClick={handleFetch} className={styles.fetchBtn}>
          Fetch
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Crate Type</b></TableCell>
              <TableCell><b>Pending Crates</b></TableCell>
              <TableCell><b>Crates Returned</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((row, index) => {
              const isError =
                row.returned !== "" &&
                (row.returned > row.pending_count || row.returned < 0);

              return (
                <TableRow key={row.id}>
                  <TableCell>{row.crate_name}</TableCell>
                  <TableCell>{row.pending_count}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.returned}
                      error={isError}
                      helperText={
                        isError
                          ? `Max allowed: ${row.pending_count}`
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(index, e.target.value)
                      }
                      inputProps={{
                        min: 0,
                        max: row.pending_count,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Total Pending */}
            <TableRow>
              <TableCell><b>Total</b></TableCell>
              <TableCell><b>{totalPending}</b></TableCell>
              <TableCell><b>{totalReturned}</b></TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save Button */}
      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSave}
          disabled={!hasValidReturn}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default CrateReturnEntry;