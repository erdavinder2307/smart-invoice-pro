import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import DemoLanding from '../../pages/DemoLanding';
import { useAuth } from '../../context/AuthContext';

jest.mock('axios');
jest.mock('../../context/AuthContext');
jest.mock('../../context/TourContext', () => ({ armTourStartPending: jest.fn() }));
jest.mock('../../utils/demoMode', () => ({
  isDemoHost: () => true,
  openInteractiveWorkspace: jest.fn(),
}));

const WAIT_TEXT = 'Preparing your sample company… (about 20 seconds)';

describe('DemoLanding', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: { roles: [{ role: 'Sales', title: 'Sales', description: 'Quotes, customers, invoices' }] },
    });
  });

  it('tells the visitor how long the sample company takes while it starts', async () => {
    // Never resolves: the workspace is still starting.
    useAuth.mockReturnValue({ isAuthenticated: false, demoLogin: jest.fn(() => new Promise(() => {})) });
    render(
      <MemoryRouter>
        <DemoLanding />
      </MemoryRouter>
    );

    const roleButton = await screen.findByRole('button', { name: /Sales/ });
    expect(screen.queryByText(WAIT_TEXT)).not.toBeInTheDocument();

    fireEvent.click(roleButton);

    expect(await screen.findByRole('status')).toHaveTextContent(WAIT_TEXT);
  });
});
