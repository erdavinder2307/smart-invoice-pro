import React from "react";
import ResponsiveDataView from "../common/ResponsiveDataView";

const DataTable = ({
  isMobile,
  columns,
  rows,
  loading,
  renderRow,
  renderHeader,
  renderCard,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  pagination,
  rowHeight,
  sortBy,
  sortOrder,
  onSort,
}) => {
  return (
    <ResponsiveDataView
      isMobile={isMobile}
      columns={columns}
      rows={rows}
      loading={loading}
      renderRow={renderRow}
      renderHeader={renderHeader}
      renderCard={renderCard}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptySubtitle={emptySubtitle}
      pagination={pagination}
      rowHeight={rowHeight || 60}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
    />
  );
};

export default DataTable;
