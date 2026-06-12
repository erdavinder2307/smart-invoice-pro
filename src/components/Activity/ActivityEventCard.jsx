import React from "react";
import {
  Box,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import {
  ACTION_COLORS,
  ACTION_LABELS,
  RISK_COLORS,
} from "./activityConstants";
import {
  formatActivityDate,
  getActivityHeadline,
  getActorLabel,
  getWorkflowNarrative,
} from "./activityUtils";

export default function ActivityEventCard({ log, onSelect }) {
  const action = String(log.action || "").toUpperCase();
  const workflow = getWorkflowNarrative(log);

  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect?.(log)}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: onSelect ? "pointer" : "default",
        transition: "box-shadow 0.15s ease",
        "&:hover": onSelect ? { boxShadow: 2 } : undefined,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip
            label={ACTION_LABELS[action] ?? action}
            color={ACTION_COLORS[action] ?? "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {log.category && (
            <Chip label={log.category} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
          )}
          {log.risk_level && (
            <Chip
              label={log.risk_level}
              color={RISK_COLORS[log.risk_level] ?? "default"}
              size="small"
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {formatActivityDate(log.created_at || log.timestamp)}
        </Typography>
      </Box>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {getActivityHeadline(log)}
      </Typography>

      {workflow && (
        <Typography variant="body2" color="primary.main" sx={{ mb: 0.5 }}>
          {workflow}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary">
        {(log.entity || log.entity_type || "record").replace(/_/g, " ")} · {getActorLabel(log)}
      </Typography>
    </Paper>
  );
}
