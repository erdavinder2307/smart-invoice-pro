import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/audit-logs');

/**
 * Fetch paginated audit log entries.
 * @param {object} params
 * @param {string}  [params.entity_type]  invoice|customer|payment|user
 * @param {string}  [params.entity_id]
 * @param {string}  [params.user_id]
 * @param {string}  [params.action]       create|update|delete
 * @param {string}  [params.from_date]    YYYY-MM-DD
 * @param {string}  [params.to_date]      YYYY-MM-DD
 * @param {number}  [params.page=0]
 * @param {number}  [params.limit=50]
 * @returns {Promise<{logs: Array, total: number, page: number, limit: number, pages: number}>}
 */
export const getAuditLogs = async (params = {}) => {
  const { data } = await axios.get(BASE, { params });
  return data;
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
