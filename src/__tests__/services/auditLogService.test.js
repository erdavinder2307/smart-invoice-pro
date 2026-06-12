import axios from 'axios';
import {
  exportActivityLogs,
  getAuditLogs,
  getActivityLogs,
  getEntityActivity,
} from '../../services/auditLogService';

jest.mock('axios');

let clickSpy;
let appendChildSpy;

beforeEach(() => {
  jest.clearAllMocks();
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
  appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
  clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  appendChildSpy.mockRestore();
  clickSpy.mockRestore();
});

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

  it('fetches entity activity from /api/activity/entity', async () => {
    const mockData = { logs: [{ id: '1', summary: 'INV-1 created' }], total: 1 };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getEntityActivity({ entity_type: 'invoice', entity_id: 'inv-1' });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/activity/entity'),
      { params: { entity_type: 'invoice', entity_id: 'inv-1' } }
    );
    expect(result).toEqual(mockData);
  });

  it('exports activity logs as CSV download', async () => {
    axios.get.mockResolvedValue({ data: new Blob(['created_at,summary\n2026-01-01,test']) });

    await exportActivityLogs({ category: 'financial' });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/activity/export'),
      expect.objectContaining({
        params: { category: 'financial' },
        responseType: 'blob',
      })
    );
    expect(clickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('fetches activity logs from /api/activity', async () => {
    const mockData = { logs: [{ id: '1', summary: 'INV-1 created' }], total: 1 };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getActivityLogs({ category: 'financial' });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/activity'),
      { params: { category: 'financial' } }
    );
    expect(result).toEqual(mockData);
  });
});
