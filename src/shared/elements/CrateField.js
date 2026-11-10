import React, { useEffect, useRef } from "react";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// When the fully typed text matches one crate but is also the start of another
// (e.g. "1" while "12" exists), wait this long for more typing before locking
// it in.
const AMBIGUOUS_DELAY_MS = 400;

const norm = (s) => String(s ?? "").trim().toLowerCase();

const matchesQuery = (crate, query) =>
  crate.crate_no.startsWith(query) || norm(crate.crate_name).includes(query);

// The crate whose number or full name equals the query, if any.
const findExact = (crates, query) =>
  crates.find((c) => c.crate_no === query || norm(c.crate_name) === query) ||
  null;

// Another crate could still be meant if typing continues.
const isAmbiguous = (crates, exact, query) =>
  crates.some(
    (c) =>
      c !== exact &&
      (c.crate_no.startsWith(query) || norm(c.crate_name).startsWith(query))
  );

/**
 * Crate type picker. `crates` must carry `crate_no` (see withCrateNumbers).
 * Options show "No | Name"; selection only happens once the typed text fully
 * equals a crate's number or name (or via Enter / click on a suggestion).
 */
const CrateField = ({
  crates,
  value,
  inputValue,
  onInputChange,
  onChange,
  onEmptyEnter,
  inputRef,
  size = "small",
}) => {
  const timerRef = useRef(null);

  const cancelTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => cancelTimer, []);

  const handleInputChange = (event, text, reason) => {
    onInputChange(text);
    if (reason !== "input") return;

    cancelTimer();
    if (value) onChange(null);

    const query = norm(text);
    if (!query) return;

    const exact = findExact(crates, query);
    if (!exact) return;

    if (isAmbiguous(crates, exact, query)) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChange(exact);
      }, AMBIGUOUS_DELAY_MS);
    } else {
      onChange(exact);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;

    // Empty field + Enter → let the parent step back to the previous field.
    if (!norm(inputValue)) {
      event.preventDefault();
      event.defaultMuiPrevented = true;
      cancelTimer();
      onEmptyEnter?.();
      return;
    }

    // A pending exact match is committed right away on Enter.
    if (timerRef.current) {
      event.preventDefault();
      event.defaultMuiPrevented = true;
      cancelTimer();
      const exact = findExact(crates, norm(inputValue));
      if (exact) onChange(exact);
      return;
    }

    // Already selected → Enter re-confirms so the parent can move on.
    if (value) {
      event.preventDefault();
      event.defaultMuiPrevented = true;
      onChange(value);
    }
    // Otherwise Autocomplete selects the highlighted suggestion.
  };

  return (
    <Autocomplete
      options={crates}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(event, crate) => {
        cancelTimer();
        onChange(crate);
      }}
      onKeyDown={handleKeyDown}
      getOptionLabel={(c) => `${c.crate_no} | ${c.crate_name}`}
      filterOptions={(options, state) => {
        const query = norm(state.inputValue);
        // When a crate is selected the input shows its full label; list all.
        if (!query || value) return options;
        return options.filter((c) => matchesQuery(c, query)).slice(0, 10);
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      autoHighlight
      openOnFocus
      // Otherwise clearing the value mid-typing would also wipe the typed text.
      clearOnBlur={false}
      disablePortal
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Crate Type"
          size={size}
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default CrateField;
