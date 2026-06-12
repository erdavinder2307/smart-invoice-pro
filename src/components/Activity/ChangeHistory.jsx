import React from "react";
import {
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { computeDiff } from "./activityUtils";
import { formatFieldValue, getFieldLabel } from "./fieldLabels";

export default function ChangeHistory({ action, before, after, emptyMessage = "No field differences detected." }) {
  const normalizedAction = String(action || "").toUpperCase();

  if (normalizedAction === "CREATE" && after) {
    return (
      <>
        <Typography variant="subtitle2" gutterBottom>Created record</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableBody>
              {Object.entries(after).map(([field, value]) => (
                <TableRow key={field}>
                  <TableCell sx={{ width: "35%", fontSize: 13 }}>{getFieldLabel(field)}</TableCell>
                  <TableCell sx={{ wordBreak: "break-all", fontSize: 13 }}>{formatFieldValue(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  if (normalizedAction === "DELETE" && before) {
    return (
      <>
        <Typography variant="subtitle2" gutterBottom>Deleted record</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableBody>
              {Object.entries(before).map(([field, value]) => (
                <TableRow key={field}>
                  <TableCell sx={{ width: "35%", fontSize: 13 }}>{getFieldLabel(field)}</TableCell>
                  <TableCell sx={{ wordBreak: "break-all", fontSize: 13 }}>{formatFieldValue(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  if (normalizedAction === "UPDATE") {
    const diff = computeDiff(before, after);
    if (diff.length === 0) {
      return <Alert severity="info">{emptyMessage}</Alert>;
    }
    return (
      <>
        <Typography variant="subtitle2" gutterBottom>{diff.length} field(s) changed</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell><b>Field</b></TableCell>
                <TableCell><b>Before</b></TableCell>
                <TableCell><b>After</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diff.map(({ field, before: oldVal, after: newVal }) => (
                <TableRow key={field}>
                  <TableCell sx={{ fontSize: 13 }}>{getFieldLabel(field)}</TableCell>
                  <TableCell sx={{ bgcolor: "#ffebee", wordBreak: "break-all", fontSize: 12 }}>
                    {formatFieldValue(oldVal)}
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#e8f5e9", wordBreak: "break-all", fontSize: 12 }}>
                    {formatFieldValue(newVal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  return null;
}
