import React, { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllPartyList } from "../../gateway/comman-apis";
import styles from "./vyapari_field.module.css";

const VyapariField = ({ name, control, errors, size, onKeyDownFunc,customOnSelect = () => {} }) => {
  const [vyapariList, setVyapariList] = useState([]);
  const vyapariRef = useRef(null); // Create a ref

  useEffect(() => {
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
    getVyapariNames();
  }, []);
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
