import React from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(customParseFormat);

const VALUE_FORMAT = "YYYY-MM-DD"; // what the form/APIs keep
const DISPLAY_FORMAT = "DD/MM/YYYY"; // what the user types and sees

// Date input shown as dd/mm/yyyy instead of the browser's locale format, while
// the form value stays a plain "YYYY-MM-DD" string like the old type="date" input.
const DateField = ({ value, onChange, label, size, ...props }) => {
  const parsed = value ? dayjs(value, VALUE_FORMAT, true) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        format={DISPLAY_FORMAT}
        value={parsed && parsed.isValid() ? parsed : null}
        onChange={(date) => onChange(date && date.isValid() ? date.format(VALUE_FORMAT) : "")}
        slotProps={{
          textField: {
            size,
            fullWidth: true,
            variant: "outlined",
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DateField;
