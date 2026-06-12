import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { usePermission } from "../../context/PermissionContext";
import { getEntityActivity } from "../../services/auditLogService";
import ActivityEventCard from "./ActivityEventCard";
import ActivityDetailDrawer from "./ActivityDetailDrawer";
import { getWorkflowNarrative } from "./activityUtils";

/**
 * Shared entity-scoped activity timeline for detail pages.
 */
export default function EntityActivityPanel({
  entityType,
  entityId,
  title = "Activity",
  limit = 50,
  emptyMessage = "No activity recorded yet.",
}) {
  const { can, isAdmin } = usePermission();
  const canView = isAdmin || can("audit_logs", "view");
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["entity-activity", entityType, entityId, limit],
    queryFn: () => getEntityActivity({
      entity_type: entityType,
      entity_id: entityId,
      limit,
    }),
    enabled: Boolean(entityType && entityId && canView),
  });

  if (!canView) return null;

  const logs = data?.logs || [];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1.5 }}>
        {title}
      </Typography>

      {isLoading ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
          <CircularProgress size={24} />
        </Paper>
      ) : logs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
          <Typography sx={{ color: "#9ca3af", fontSize: "0.84rem" }}>
            {emptyMessage}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {logs.map((log) => (
            <ActivityEventCard
              key={log.id || `${log.action}-${log.created_at}`}
              log={{
                ...log,
                summary: log.summary || getWorkflowNarrative(log) || log.summary,
              }}
              onSelect={setSelectedLog}
            />
          ))}
        </Box>
      )}

      {selectedLog && (
        <ActivityDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </Box>
  );
}
