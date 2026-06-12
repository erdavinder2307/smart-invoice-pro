import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivityCenterPage from '../../pages/ActivityCenterPage';

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/PermissionContext', () => ({
  usePermission: jest.fn(() => ({
    can: () => true,
    isAdmin: true,
  })),
}));

jest.mock('../../services/auditLogService', () => {
  const normalize = (log) => ({
    ...log,
    before: log?.before ?? log?.changes?.before ?? null,
    after: log?.after ?? log?.changes?.after ?? null,
    created_at: log?.created_at ?? log?.timestamp,
    entity: log?.entity ?? log?.entity_type,
  });
  return {
    getActivityLogs: jest.fn(),
    exportActivityLogs: jest.fn(),
    getAuditLogDetailData: jest.fn((log) => normalize(log)),
  };
});

const { getActivityLogs, exportActivityLogs } = require('../../services/auditLogService');
const { usePermission } = require('../../context/PermissionContext');

describe('ActivityCenterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePermission.mockReturnValue({ can: () => true, isAdmin: true });
  });

  it('renders timeline with enriched activity cards', async () => {
    getActivityLogs.mockResolvedValue({
      logs: [
        {
          id: '1',
          action: 'CONVERTED',
          entity: 'quote',
          entity_id: 'q-1',
          entity_label: 'QT-001',
          summary: 'QT-001 converted',
          user_name: 'Admin User',
          category: 'financial',
          risk_level: 'medium',
          created_at: '2026-01-01T10:00:00',
          metadata: { target_entity_label: 'INV-001' },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter initialEntries={['/activity']}>
        <ActivityCenterPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('QT-001 converted')).toBeInTheDocument();
      expect(screen.getByText('QT-001 → INV-001')).toBeInTheDocument();
    });
  });

  it('denies access without audit_logs.view permission', () => {
    usePermission.mockReturnValue({ can: () => false, isAdmin: false });

    render(
      <MemoryRouter initialEntries={['/activity']}>
        <ActivityCenterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/access denied|permission/i)).toBeInTheDocument();
    expect(getActivityLogs).not.toHaveBeenCalled();
  });

  it('triggers CSV export with active filters', async () => {
    getActivityLogs.mockResolvedValue({ logs: [], total: 0 });
    exportActivityLogs.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/activity']}>
        <ActivityCenterPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export CSV'));

    await waitFor(() => {
      expect(exportActivityLogs).toHaveBeenCalledWith({});
    });
  });

  it('opens detail drawer when an event is selected', async () => {
    getActivityLogs.mockResolvedValue({
      logs: [
        {
          id: '2',
          action: 'UPDATE',
          entity: 'invoice',
          entity_id: 'inv-1',
          summary: 'INV-001 updated',
          created_at: '2026-01-02T10:00:00',
          before: { status: 'Draft' },
          after: { status: 'Issued' },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter initialEntries={['/activity']}>
        <ActivityCenterPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001 updated')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('INV-001 updated'));

    await waitFor(() => {
      expect(screen.getByText(/field\(s\) changed/i)).toBeInTheDocument();
    });
  });
});
