import React from "react";
import { Navigate } from "react-router-dom";

/** @deprecated Use /activity — kept for backward-compatible deep links. */
export default function AuditLogPage() {
  return <Navigate to="/activity" replace />;
}
