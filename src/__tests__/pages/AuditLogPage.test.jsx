import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuditLogPage from '../../pages/AuditLogPage';

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ userRole: 'Admin' })),
}));

jest.mock('../../services/auditLogService', () => ({
  getAuditLogs: jest.fn(),
  getAuditLogDetailData: jest.fn((log) => ({
    ...log,
    before: log.before ?? log.changes?.before ?? null,
    after: log.after ?? log.changes?.after ?? null,
    created_at: log.created_at ?? log.timestamp,
    entity: log.entity ?? log.entity_type,
  })),
}));

const { getAuditLogs, getAuditLogDetailData } = require('../../services/auditLogService');
const { useAuth } = require('../../context/AuthContext');

describe('AuditLogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ userRole: 'Admin' });
    getAuditLogDetailData.mockImplementation((log) => ({
      ...log,
      before: log.before ?? log.changes?.before ?? null,
      after: log.after ?? log.changes?.after ?? null,
      created_at: log.created_at ?? log.timestamp,
      entity: log.entity ?? log.entity_type,
    }));
  });

  it('renders table and supports row detail modal', async () => {
    getAuditLogs.mockResolvedValue({
      logs: [
        {
          id: '1',
          action: 'UPDATE',
          entity: 'invoice',
          entity_id: 'inv-1',
          user_id: 'u-1',
          created_at: '2026-01-01T10:00:00',
          before: { status: 'Draft' },
          after: { status: 'Issued' },
          metadata: { source: 'test' },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter initialEntries={['/settings/audit-logs']}>
        <AuditLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument();
      expect(screen.getByText('inv-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('inv-1'));

    await waitFor(() => {
      expect(screen.getByText(/field\(s\) changed/i)).toBeInTheDocument();
    });
  });

  it('loads audit logs with pagination params', async () => {
    getAuditLogs.mockResolvedValue({ logs: [], total: 0 });

    render(
      <MemoryRouter initialEntries={['/settings/audit-logs']}>
        <AuditLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ page: 0, limit: 50 }));
    });
  });
});
