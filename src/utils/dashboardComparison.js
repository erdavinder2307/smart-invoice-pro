export const getComparisonLabel = (range, t, previousPeriod = null) => {
  if (range === "this_week") return t("dashboard.comparison.vsLastWeek");
  if (range === "this_month") return t("dashboard.comparison.vsLastMonth");
  if (range === "this_quarter") return t("dashboard.comparison.vsLastQuarter");
  if (range === "this_year") return t("dashboard.comparison.vsLastYear");
  if (range === "custom" && previousPeriod?.start_date && previousPeriod?.end_date) {
    return t("dashboard.comparison.vsPreviousCustomRange", {
      start: previousPeriod.start_date,
      end: previousPeriod.end_date,
    });
  }
  return t("dashboard.comparison.vsPreviousPeriod");
};
