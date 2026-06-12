import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ActivityEventCard from "./ActivityEventCard";
import { groupLogsByDate } from "./activityUtils";

export default function ActivityTimeline({ logs, loading, emptyMessage, onSelect }) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!logs?.length) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
        {emptyMessage}
      </Typography>
    );
  }

  const groups = groupLogsByDate(logs);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {groups.map(([dateLabel, items]) => (
        <Box key={dateLabel}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mb: 1.5, letterSpacing: 1 }}
          >
            {dateLabel}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.map((log) => (
              <ActivityEventCard key={log.id} log={log} onSelect={onSelect} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
