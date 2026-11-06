import React from 'react';
import { render, screen } from '@testing-library/react';
import AppRoutes from '../../routes';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn(),
}));

describe('AppRoutes: unknown URL', () => {
  afterEach(() => window.history.pushState({}, '', '/'));

  it('shows "Page not found" instead of a blank page', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });
    window.history.pushState({}, '', '/no-such-page');
    render(<AppRoutes />);
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
