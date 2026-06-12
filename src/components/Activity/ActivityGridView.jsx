import React from "react";
import {
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ACTION_COLORS,
  ACTION_LABELS,
} from "./activityConstants";
import { formatActivityDate } from "./activityUtils";

export default function ActivityGridView({
  logs,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  emptyMessage,
  onSelect,
}) {
  return (
    <Paper variant="outlined">
      <TableContainer sx={{ overflowX: "hidden" }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell><b>Date / Time</b></TableCell>
              <TableCell><b>Action</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Summary</b></TableCell>
              <TableCell><b>User</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : !logs?.length ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const action = String(log.action || "").toUpperCase();
                return (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onSelect?.(log)}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: 13 }}>
                      {formatActivityDate(log.created_at || log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ACTION_LABELS[action] ?? action}
                        color={ACTION_COLORS[action] ?? "default"}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 12 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize", fontSize: 13 }}>
                      {log.category || "—"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={log.entity_id ?? ""}>
                        <Typography variant="body2" sx={{ fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.summary || log.entity_label || log.entity_id}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {log.user_name || log.user_email || log.user_id || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[50]}
        onPageChange={(_, newPage) => onPageChange(newPage)}
      />
    </Paper>
  );
}
