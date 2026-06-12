import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PermissionRoute from '../../components/PermissionRoute';
import { usePermission } from '../../context/PermissionContext';

jest.mock('../../context/PermissionContext');

function renderRoute(permOverride = {}) {
  usePermission.mockReturnValue({
    can: jest.fn(() => true),
    isAdmin: false,
    loading: false,
    loaded: true,
    ...permOverride,
  });

  return render(
    <MemoryRouter initialEntries={['/invoices']}>
      <Routes>
        <Route element={<PermissionRoute module="invoices" action="view" />}>
          <Route path="/invoices" element={<div>Invoice List</div>} />
        </Route>
        <Route path="/forbidden" element={<div>Forbidden Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PermissionRoute', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows a spinner while permissions are loading', () => {
    renderRoute({ loaded: false, loading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Invoice List')).not.toBeInTheDocument();
    expect(screen.queryByText('Forbidden Page')).not.toBeInTheDocument();
  });

  it('does not redirect before permissions have loaded', () => {
    renderRoute({
      loaded: false,
      loading: false,
      can: jest.fn(() => false),
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Forbidden Page')).not.toBeInTheDocument();
  });

  it('renders the route when the user has permission', () => {
    renderRoute({ can: jest.fn(() => true) });

    expect(screen.getByText('Invoice List')).toBeInTheDocument();
  });

  it('redirects to /forbidden when permissions are loaded and access is denied', () => {
    renderRoute({ can: jest.fn(() => false) });

    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
    expect(screen.queryByText('Invoice List')).not.toBeInTheDocument();
  });

  it('bypasses permission checks for admins', () => {
    renderRoute({
      isAdmin: true,
      can: jest.fn(() => false),
    });

    expect(screen.getByText('Invoice List')).toBeInTheDocument();
  });
});
