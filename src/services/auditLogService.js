import axios from 'axios';
import { createApiUrl } from '../config/api';

const AUDIT_BASE = createApiUrl('/api/audit-logs');
const ACTIVITY_BASE = createApiUrl('/api/activity');
const ENTITY_ACTIVITY_BASE = createApiUrl('/api/activity/entity');

/**
 * Fetch paginated audit log entries.
 * @param {object} params
 * @param {string}  [params.entity_type]
 * @param {string}  [params.entity_id]
 * @param {string}  [params.user_id]
 * @param {string}  [params.action]
 * @param {string}  [params.category]     financial|security|settings|banking|system
 * @param {string}  [params.risk_level]   low|medium|high
 * @param {string}  [params.search]
 * @param {string}  [params.from_date]    YYYY-MM-DD
 * @param {string}  [params.to_date]      YYYY-MM-DD
 * @param {number}  [params.page=0]
 * @param {number}  [params.limit=50]
 * @returns {Promise<{logs: Array, total: number, page: number, limit: number, pages: number}>}
 */
export const getAuditLogs = async (params = {}) => {
  const { data } = await axios.get(AUDIT_BASE, { params });
  return data;
};

/** Activity Center feed — enriched alias of audit logs. */
export const getActivityLogs = async (params = {}) => {
  const { data } = await axios.get(ACTIVITY_BASE, { params });
  return data;
};

/** Entity-scoped timeline — audit logs + domain events merged. */
export const getEntityActivity = async (params = {}) => {
  const { data } = await axios.get(ENTITY_ACTIVITY_BASE, { params });
  return data;
};

/** Download filtered activity feed as CSV (compliance export). */
export const exportActivityLogs = async (params = {}) => {
  const compacted = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const response = await axios.get(`${ACTIVITY_BASE}/export`, {
    params: compacted,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "activity-export.csv");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const getAuditLogDetailData = (log) => {
  const before = log?.before ?? log?.changes?.before ?? null;
  const after = log?.after ?? log?.changes?.after ?? null;
  return {
    ...log,
    before,
    after,
    created_at: log?.created_at ?? log?.timestamp,
    entity: log?.entity ?? log?.entity_type,
  };
};
