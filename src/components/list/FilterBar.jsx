import React from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const FilterBar = ({
  statusValue,
  onStatusChange,
  statusOptions = [],
  dateValue,
  onDateChange,
  dateOptions = [],
  rightSlot,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        alignItems: "center",
        bgcolor: "background.paper",
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        mb: 2,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select value={statusValue} onChange={(event) => onStatusChange(event.target.value)}>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {dateOptions.length > 0 && onDateChange ? (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={dateValue} onChange={(event) => onDateChange(event.target.value)}>
            {dateOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <Box sx={{ ml: "auto" }}>{rightSlot}</Box>
    </Box>
  );
};

export default FilterBar;
