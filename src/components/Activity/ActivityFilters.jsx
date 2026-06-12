import React from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewListIcon from "@mui/icons-material/ViewList";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  ACTION_OPTIONS,
  CATEGORY_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  RISK_OPTIONS,
} from "./activityConstants";

export default function ActivityFilters({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  onExport,
  exportLoading = false,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
    >
      <TextField
        size="small"
        placeholder="Search activity..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        sx={{ minWidth: 200, flex: "1 1 200px" }}
      />

      <Select
        size="small"
        value={filters.category}
        onChange={(e) => set("category", e.target.value)}
        displayEmpty
        sx={{ minWidth: 140 }}
      >
        {CATEGORY_OPTIONS.map((o) => (
          <MenuItem key={o.value || "all-cat"} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={filters.riskLevel}
        onChange={(e) => set("riskLevel", e.target.value)}
        displayEmpty
        sx={{ minWidth: 130 }}
      >
        {RISK_OPTIONS.map((o) => (
          <MenuItem key={o.value || "all-risk"} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={filters.entityType}
        onChange={(e) => set("entityType", e.target.value)}
        displayEmpty
        sx={{ minWidth: 150 }}
      >
        {ENTITY_TYPE_OPTIONS.map((o) => (
          <MenuItem key={o.value || "all-entity"} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={filters.action}
        onChange={(e) => set("action", e.target.value)}
        displayEmpty
        sx={{ minWidth: 130 }}
      >
        {ACTION_OPTIONS.map((o) => (
          <MenuItem key={o.value || "all-action"} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>

      <TextField
        size="small"
        type="date"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={filters.fromDate}
        onChange={(e) => set("fromDate", e.target.value)}
        sx={{ width: 150 }}
      />
      <TextField
        size="small"
        type="date"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={filters.toDate}
        onChange={(e) => set("toDate", e.target.value)}
        sx={{ width: 150 }}
      />

      <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
        {onExport && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onExport}
            disabled={exportLoading}
          >
            {exportLoading ? "Exporting..." : "Export CSV"}
          </Button>
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(_, value) => value && onViewModeChange(value)}
        >
          <ToggleButton value="timeline" aria-label="Timeline view">
            <TimelineIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Grid view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
}
