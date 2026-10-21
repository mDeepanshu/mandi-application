import React, { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllPartyList } from "../../gateway/comman-apis";
import styles from "./vyapari_field.module.css";
import { useOutletContext } from "react-router-dom";

// How long typing must pause before a single match is auto-selected. Without
// this, a fast typist's remaining letters spill into the next field once the
// name becomes unique mid-word.
const AUTO_SELECT_DELAY_MS = 300;

const VyapariField = ({ name, control, errors, size, onKeyDownFunc,customOnSelect = () => {}, autoSelectSingleMatch = false }) => {
  const [vyapariList, setVyapariList] = useState([]);
  const vyapariRef = useRef(null); // Create a ref
  const autoSelectTimerRef = useRef(null);
  const pendingQueryRef = useRef("");
  const { snackbarChange, syncComplete } = useOutletContext();

  useEffect(() => {
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
    getVyapariNames();
  }, [syncComplete]);

  useEffect(() => () => clearTimeout(autoSelectTimerRef.current), []);

  const cancelAutoSelect = () => {
    clearTimeout(autoSelectTimerRef.current);
    autoSelectTimerRef.current = null;
  };

  const findSingleMatch = (query) => {
    const matched = vyapariList.filter(
      (option) =>
        option.name.toUpperCase().includes(query.toUpperCase()) ||
        option.idNo.includes(query)
    );
    return matched.length === 1 ? matched[0] : null;
  };

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
                onKeyDown={
                  autoSelectSingleMatch
                    ? (e) => {
                        // Enter commits a pending single match without waiting.
                        if (e.key === "Enter" && autoSelectTimerRef.current) {
                          cancelAutoSelect();
                          const match = findSingleMatch(pendingQueryRef.current);
                          if (match) field.onChange(match);
                        }
                        onKeyDownFunc?.(e);
                      }
                    : onKeyDownFunc
                }
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
            onChange={(event, value) => {
              if (autoSelectSingleMatch) cancelAutoSelect();
              field.onChange(value);
            }}
            // Only wired up when enabled, so other pages get Autocomplete's
            // default input handling untouched.
            onInputChange={autoSelectSingleMatch ? (event, inputValue, reason) => {
              cancelAutoSelect();
              if (reason !== "input") return;
              const query = inputValue.trim();
              if (!query) return;
              pendingQueryRef.current = query;
              // Only one vyapari left once typing pauses → lock it in (parent
              // moves focus onward).
              autoSelectTimerRef.current = setTimeout(() => {
                autoSelectTimerRef.current = null;
                const match = findSingleMatch(query);
                if (match) field.onChange(match);
              }, AUTO_SELECT_DELAY_MS);
            } : undefined}
            disablePortal
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
