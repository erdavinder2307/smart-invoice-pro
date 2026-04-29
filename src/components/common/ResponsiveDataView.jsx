import React from "react";
import { Box, Paper, Skeleton, Stack, TablePagination, Typography } from "@mui/material";
import StandardDataTable from "./StandardDataTable";
import EmptyState from "./EmptyState";

/**
 * ResponsiveDataView — Switches between a StandardDataTable (desktop) and
 * a card list (mobile) based on the `isMobile` prop.
 *
 * Props (all StandardDataTable props are forwarded):
 *   isMobile     {boolean}  — when true and renderCard is provided, renders card view
 *   rows         {array}    — data items
 *   renderCard   {fn}       — (item, index) => JSX — renders one card per item
 *   loading      {boolean}
 *   skeletonRows {number}   — number of skeleton rows/cards during loading (default 5)
 *   columns      {array}    — column definitions (forwarded to StandardDataTable)
 *   emptyTitle   {string}
 *   emptySubtitle{string}
 *   emptyIcon    {node}
 *   emptyAction  {object}   — { label, onClick }
 *   pagination   {object}   — { count, page, rowsPerPage, onPageChange, onRowsPerPageChange }
 *   toolbar      {node}     — search/filter bar rendered above the data
 *   renderRow    {fn}       — custom desktop row renderer
 *   renderHeader {fn}       — custom desktop header renderer
 *   onRowClick   {fn}
 */
const ResponsiveDataView = ({
  isMobile = false,
  rows = [],
  renderCard,
  loading = false,
  skeletonRows = 5,
  columns = [],
  emptyMessage = "No records found",
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyAction,
  getRowKey,
  renderRow,
  renderHeader,
  pagination,
  toolbar,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}) => {
  if (isMobile && renderCard) {
    return (
      <Paper elevation={0} sx={{ border: "1px solid #edf0f3", borderRadius: 2, overflow: "hidden" }}>
        {/* Toolbar (search/filter bar) */}
        {toolbar && (
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            {toolbar}
          </Box>
        )}

        {/* Content area */}
        <Box sx={{ p: 1.5 }}>
          {loading ? (
            <Stack spacing={1.5}>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={148} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : rows.length === 0 ? (
            <Box sx={{ py: 4 }}>
              {emptyIcon || emptyTitle || emptySubtitle ? (
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle || emptyMessage}
                  subtitle={emptySubtitle}
                  action={emptyAction}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {emptyMessage}
                </Typography>
              )}
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {rows.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  {renderCard(item, index)}
                </React.Fragment>
              ))}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        {pagination && !loading && rows.length > 0 && (
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
  }

  // Desktop: delegate fully to StandardDataTable
  return (
    <StandardDataTable
      columns={columns}
      rows={rows}
      loading={loading}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptySubtitle={emptySubtitle}
      emptyAction={emptyAction}
      getRowKey={getRowKey}
      renderRow={renderRow}
      renderHeader={renderHeader}
      pagination={pagination}
      toolbar={toolbar}
      onRowClick={onRowClick}
      skeletonRows={skeletonRows}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
    />
  );
};

export default ResponsiveDataView;
