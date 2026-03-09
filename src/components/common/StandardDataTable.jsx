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
  CircularProgress,
} from "@mui/material";

const StandardDataTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = "No records found",
  getRowKey = (row) => row.id,
  renderRow,
  pagination,
}) => {
  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align || "left"} sx={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) =>
                renderRow ? (
                  renderRow(row, index)
                ) : (
                  <TableRow key={getRowKey(row)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align || "left"}>
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
