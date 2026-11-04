import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Pricing from '../../pages/Pricing';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../../components/Layout/Header', () => () => <div />);
jest.mock('../../components/Layout/Footer', () => () => <div />);

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('Pricing', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('shows monthly prices with the GST-inclusive amount', () => {
    renderPage();
    const starter = screen.getByTestId('plan-starter');
    expect(within(starter).getByText('₹599')).toBeInTheDocument();
    expect(within(starter).getByText(/₹707 incl\. GST/)).toBeInTheDocument();
    const growth = screen.getByTestId('plan-growth');
    expect(within(growth).getByText('₹1,499')).toBeInTheDocument();
    expect(within(growth).getByText(/₹1,769 incl\. GST/)).toBeInTheDocument();
    expect(screen.getByText(/30-day free trial · no card needed/)).toBeInTheDocument();
  });

  it('switches Starter to the yearly price and keeps Growth monthly', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Yearly' }));
    const starter = screen.getByTestId('plan-starter');
    expect(within(starter).getByText('₹5,999')).toBeInTheDocument();
    expect(within(starter).getByText(/₹7,079 incl\. GST/)).toBeInTheDocument();
    const growth = screen.getByTestId('plan-growth');
    expect(within(growth).getByText('₹1,499')).toBeInTheDocument();
    expect(within(growth).getByText('Monthly billing only')).toBeInTheDocument();
  });

  it('sends "Start free trial" to sign-up and hides Upgrade until checkout ships', async () => {
    renderPage();
    const starter = screen.getByTestId('plan-starter');
    await userEvent.click(within(starter).getByRole('button', { name: 'Start free trial' }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
    expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument();
  });
});
