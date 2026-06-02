import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BankAccounts from '../../pages/BankAccounts';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '../../services/bankAccountService';

const mockNavigate = jest.fn();

jest.mock('../../services/bankAccountService', () => ({
  getBankAccounts: jest.fn(),
  createBankAccount: jest.fn(),
  updateBankAccount: jest.fn(),
  deleteBankAccount: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id', username: 'tester', role: 'Admin' },
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const testTheme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    secondary: { main: '#10B981' },
  },
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={testTheme}>
        <BankAccounts />
      </ThemeProvider>
    </MemoryRouter>
  );

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BankAccounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ id: 'test-user-id', username: 'tester' }));
    getBankAccounts.mockResolvedValue([]);
    createBankAccount.mockResolvedValue({ id: 'ba-1' });
    updateBankAccount.mockResolvedValue({});
    deleteBankAccount.mockResolvedValue({});
  });

  it('opens add dialog and creates a bank account', async () => {
    renderPage();

    expect(await screen.findByText('No bank accounts yet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /bankAccounts\.addButton/i }));

    expect(screen.getByRole('heading', { name: /Add Bank Account/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Bank Name'), { target: { value: 'HDFC Bank' } });
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Business Current' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(createBankAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          bank_name: 'HDFC Bank',
          account_name: 'Business Current',
          account_type: 'current',
        }),
        'test-user-id'
      )
    );
  });

  it('navigates to bank reconciliation import tab from import action', async () => {
    getBankAccounts.mockResolvedValue([
      {
        id: 'ba-1',
        bank_name: 'HDFC Bank',
        account_name: 'Business Current',
        account_type: 'current',
        status: 'active',
      },
    ]);

    renderPage();

    await waitFor(() => expect(getBankAccounts).toHaveBeenCalled());
    await screen.findByText('HDFC Bank', {}, { timeout: 4000 });

    fireEvent.click(screen.getByRole('button', { name: 'Import Statement' }));

    expect(mockNavigate).toHaveBeenCalledWith('/bank-import', {
      state: {
        bankAccountId: 'ba-1',
      },
    });
  });
});
