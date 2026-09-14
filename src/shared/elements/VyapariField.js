import React, { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllPartyList } from "../../gateway/comman-apis";
import styles from "./vyapari_field.module.css";
import { useOutletContext } from "react-router-dom";
const VyapariField = ({ name, control, errors, size, onKeyDownFunc,customOnSelect = () => {} }) => {
  const [vyapariList, setVyapariList] = useState([]);
  const vyapariRef = useRef(null); // Create a ref
  const { snackbarChange, syncComplete } = useOutletContext();

  useEffect(() => {
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
    getVyapariNames();
  }, [syncComplete]);

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={{ required: "Enter Party Name" }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            options={vyapariList}
            // getOptionLabel={(option) => option.name}
            getOptionLabel={(option) => `${option.idNo} | ${option.name}`}
            filterOptions={(options, state) =>
              options
                .filter((option) =>
                  option.name.toUpperCase().includes(state.inputValue.toUpperCase()) || option.idNo.includes(state.inputValue)
                )
                .slice(0, 10)
            }
            isOptionEqualToValue={(option, value) => option.idNo === value.idNo}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vyapari Name"
                onKeyDown={onKeyDownFunc}
                error={!!errors[name]}
                helperText={errors[name] ? errors[name].message : ""}
                InputProps={{
                  ...params.InputProps,
                  inputRef: vyapariRef,
                  shrink: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size={size}
              />
            )}
            onChange={(event, value) => field.onChange(value)}
            disablePortal
            // Options live in the popup Paper, so sx on the Autocomplete root can't
            // reach them. The doubled && raises specificity above MUI's own option
            // rules: at equal specificity CSS falls back to source order, and
            // emotion injects styles in a different order in a prod bundle than in
            // the dev server, which made an earlier version work locally and fail
            // on prod.
            slotProps={{
              paper: {
                sx: {
                  "&& .MuiAutocomplete-option": {
                    // keyboard-highlighted option (arrow keys / first match)
                    '&.Mui-focused, &[data-focus="true"]': {
                      backgroundColor: "#1976d2",
                      color: "#fff",
                    },
                    // mouse hover
                    "&:hover": {
                      backgroundColor: "#1976d2",
                      color: "#fff",
                    },
                    // previously selected value
                    '&[aria-selected="true"]': {
                      backgroundColor: "#bbdefb",
                      color: "#0d47a1",
                      fontWeight: 600,
                    },
                    // selected AND highlighted: without this the pale selected
                    // background wins and the arrowed-onto row looks un-highlighted
                    '&[aria-selected="true"].Mui-focused, &[aria-selected="true"][data-focus="true"], &[aria-selected="true"]:hover': {
                      backgroundColor: "#1565c0",
                      color: "#fff",
                    },
                  },
                },
              },
            }}
            id="combo-box-demo"
            sx={{ width: "100%", paddingBottom: "10px" }}
            onSelect={customOnSelect}
          />
        )}
      />
    </>
  );
};

export default VyapariField;
