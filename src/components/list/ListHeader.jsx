import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const ListHeader = ({
  title,
  summary,
  rightAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>{title}</Typography>
        {summary ? (
          <Typography variant="body2" color="text.secondary">{summary}</Typography>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", width: { xs: "100%", md: "auto" } }}>
        {rightAction}
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: "100%", md: 260 },
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />
      </Box>
    </Box>
  );
};

export default ListHeader;
