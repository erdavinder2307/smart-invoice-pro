import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../pages/NotFound';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext');

describe('NotFound', () => {
  it('links signed-out visitors to the home page', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/');
  });

  it('links signed-in users to the dashboard', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/dashboard');
  });
});
