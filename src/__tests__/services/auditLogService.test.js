import axios from 'axios';
import { getAuditLogs } from '../../services/auditLogService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('auditLogService', () => {
  it('fetches audit logs with default params', async () => {
    const mockData = { logs: [{ id: '1', action: 'create' }], total: 1, page: 0, limit: 50, pages: 1 };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getAuditLogs();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/audit-logs'), { params: {} });
    expect(result).toEqual(mockData);
  });

  it('passes filter params', async () => {
    axios.get.mockResolvedValue({ data: { logs: [], total: 0 } });

    const params = { entity_type: 'invoice', action: 'create', page: 1, limit: 25 };
    await getAuditLogs(params);
    expect(axios.get).toHaveBeenCalledWith(expect.any(String), { params });
  });

  it('throws on network error', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    await expect(getAuditLogs()).rejects.toThrow('Network Error');
  });
});
