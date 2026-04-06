import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
} from "@mui/material";
import TableSkeleton from "./TableSkeleton";
import EmptyState from "./EmptyState";

/**
 * Canonical checkbox column width (48px = compact cell matching MUI checkbox size).
 * Import this constant instead of hard-coding a value in each list page.
 *
 * ── CANONICAL CHECKBOX PATTERN ──────────────────────────────────────────────
 * DO NOT use padding="checkbox" on TableCell — that MUI prop applies the class
 * .MuiTableCell-paddingCheckbox which sets width:24px with 2-class specificity
 * and overrides any sx width you set. Use explicit sx only:
 *
 *   // renderHeader
 *   <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px' }}>
 *     <Checkbox indeterminate={...} checked={...} onChange={handleSelectAll} />
 *   </TableCell>
 *
 *   // renderRow
 *   <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px' }}>
 *     <Checkbox checked={...} onChange={...} />
 *   </TableCell>
 * ────────────────────────────────────────────────────────────────────────────
 */
export const CHECKBOX_COLUMN_WIDTH = 48;

/**
 * StandardDataTable — Unified table component with skeleton loading,
 * rich empty states, optional toolbar, and row click support.
 *
 * Props (all optional except columns/rows):
 *   toolbar        — React node rendered above the table (search/filter bar)
 *   onRowClick     — (row, index) => void, called when a body row is clicked
 *   emptyIcon      — Icon element for empty state
 *   emptyTitle     — Title string for empty state
 *   emptySubtitle  — Subtitle string for empty state
 *   emptyAction    — { label, onClick } for empty state action button
 *   skeletonRows   — Number of skeleton rows during loading (default 5)
 *   renderHeader   — () => TableRow JSX, replaces auto-generated header row
 */
const StandardDataTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = "No records found",
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyAction,
  getRowKey = (row) => row.id,
  renderRow,
  renderHeader,
  pagination,
  toolbar,
  onRowClick,
  skeletonRows = 5,
}) => {
  return (
    <Paper>
      {toolbar && (
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          {toolbar}
        </Box>
      )}

      <TableContainer sx={{ width: "100%", overflowX: "hidden" }}>
        <Table stickyHeader size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableHead>
            {renderHeader ? (
              renderHeader()
            ) : (
              <TableRow>
                {columns.map((column) => {
                  const isCheckboxCol = column.key === "checkbox" || column.key === "select";
                  return (
                    <TableCell
                      key={column.key}
                      align={column.align || "left"}
                      sx={{
                        width: column.width,
                        ...(isCheckboxCol ? { padding: "0 4px" } : {}),
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {loading ? (
              <TableSkeleton columns={columns.length} rows={skeletonRows} />
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  {emptyIcon || emptyTitle || emptySubtitle ? (
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle || emptyMessage}
                      subtitle={emptySubtitle}
                      action={emptyAction}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) =>
                renderRow ? (
                  renderRow(row, index)
                ) : (
                  <TableRow
                    key={getRowKey(row)}
                    hover={!!onRowClick}
                    onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    sx={onRowClick ? { cursor: "pointer" } : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={column.align || "left"}
                        sx={{
                          fontSize: "0.8125rem",
                          maxWidth: column.maxWidth,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <TablePagination
            rowsPerPageOptions={pagination.rowsPerPageOptions || [10, 25, 50]}
            component="div"
            count={pagination.count}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={pagination.onPageChange}
            onRowsPerPageChange={pagination.onRowsPerPageChange}
          />
        </Box>
      )}
    </Paper>
  );
};

export default StandardDataTable;
