import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuditLogs from '../../admin/pages/AuditLogs';

jest.mock('../../admin/services/adminApiService', () => ({
  getAdminAuditLogs: jest.fn(),
}));

jest.mock('../../admin/services/adminAuthService', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => true),
    getToken: jest.fn(() => 'admin-jwt'),
    getUser: jest.fn(() => ({ id: '1', is_super_admin: true })),
    logout: jest.fn(),
  },
}));

const { getAdminAuditLogs } = require('../../admin/services/adminApiService');

describe('Admin AuditLogs page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table rows from API', async () => {
    getAdminAuditLogs.mockResolvedValue({
      logs: [
        {
          id: 'log-1',
          created_at: '2026-01-01T12:00:00',
          user_id: 'u1',
          tenant_id: 't1',
          action: 'CREATE',
          entity: 'invoice',
          entity_id: 'inv-1',
          before: null,
          after: { status: 'draft' },
          metadata: { source: 'test' },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument();
      expect(screen.getByText('invoice')).toBeInTheDocument();
      expect(screen.getByText('inv-1')).toBeInTheDocument();
    });
  });

  it('opens detail modal when row clicked', async () => {
    getAdminAuditLogs.mockResolvedValue({
      logs: [
        {
          id: 'log-2',
          created_at: '2026-01-01T12:00:00',
          user_id: 'u2',
          tenant_id: 't2',
          action: 'UPDATE',
          entity: 'customer',
          entity_id: 'cust-1',
          before: { name: 'Old' },
          after: { name: 'New' },
          metadata: { reason: 'edit' },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('cust-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('cust-1'));

    await waitFor(() => {
      expect(screen.getByText('Audit Detail')).toBeInTheDocument();
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });
  });
});
