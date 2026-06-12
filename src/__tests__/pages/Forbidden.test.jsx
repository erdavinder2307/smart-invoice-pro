import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Forbidden from '../../pages/Forbidden';
import { useAuth } from '../../context/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../context/AuthContext');

describe('Forbidden', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('navigates authenticated users to /dashboard', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Back to Dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates unauthenticated users to /login', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Back to Login' }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
