import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProtectedRoute from '../../admin/routes/AdminProtectedRoute';
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('../../admin/services/adminAuthService');

describe('AdminProtectedRoute', () => {
  it('renders children when admin is authenticated', () => {
    adminAuthService.isAuthenticated.mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <div data-testid="protected-content">Admin Content</div>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to /admin/login when not authenticated', () => {
    adminAuthService.isAuthenticated.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminProtectedRoute>
          <div data-testid="protected-content">Admin Content</div>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
