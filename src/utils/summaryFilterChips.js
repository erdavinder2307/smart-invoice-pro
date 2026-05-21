export const buildSummaryFilterItems = ({
  activeFilter,
  allFilterValue = "All",
  chips = [],
  onFilterChange,
  filteredCount = 0,
  filteredLabel,
  viewAllValue = 0,
  showingLabel = "Showing",
  viewAllLabel = "View All",
}) => {
  if (activeFilter === allFilterValue) {
    return chips.map((chip) => ({
      ...chip,
      active: chip.filterValue === activeFilter,
      onClick: chip.filterValue ? () => onFilterChange(chip.filterValue) : undefined,
    }));
  }

  const label = filteredLabel || activeFilter;
  return [
    {
      label: showingLabel,
      value: `${filteredCount} ${label}`,
      active: true,
    },
    {
      label: viewAllLabel,
      value: viewAllValue,
      onClick: () => onFilterChange(allFilterValue),
    },
  ];
};

export default buildSummaryFilterItems;