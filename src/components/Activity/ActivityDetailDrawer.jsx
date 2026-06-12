import React from "react";
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAuditLogDetailData } from "../../services/auditLogService";
import {
  ACTION_COLORS,
  ACTION_LABELS,
} from "./activityConstants";
import ChangeHistory from "./ChangeHistory";
import { formatFieldValue } from "./fieldLabels";
import {
  formatActivityDate,
  getActivityHeadline,
  getActorLabel,
  getWorkflowNarrative,
} from "./activityUtils";

export default function ActivityDetailDrawer({ log, onClose }) {
  if (!log) return null;

  const normalized = getAuditLogDetailData(log) || log;
  const action = String(log.action || "").toUpperCase();
  const workflow = getWorkflowNarrative(log);

  return (
    <Drawer anchor="right" open onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 520 } } }}>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
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
              <Chip label={log.risk_level} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
            )}
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {getActivityHeadline(log)}
          </Typography>
          {workflow && (
            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
              {workflow}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {formatActivityDate(normalized.created_at)} · {getActorLabel(log)}
          </Typography>
          {log.ip_address && (
            <Typography variant="caption" color="text.secondary" display="block">
              IP: {log.ip_address}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ px: 2.5, pb: 3 }}>
        <ChangeHistory
          action={action}
          before={normalized.before}
          after={normalized.after}
        />

        {!["CREATE", "UPDATE", "DELETE"].includes(action) && log.metadata && Object.keys(log.metadata).length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Details</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  {Object.entries(log.metadata).map(([field, value]) => (
                    <TableRow key={field}>
                      <TableCell sx={{ fontSize: 12, width: "35%" }}>{field}</TableCell>
                      <TableCell sx={{ wordBreak: "break-all", fontSize: 13 }}>{formatFieldValue(value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Drawer>
  );
}
