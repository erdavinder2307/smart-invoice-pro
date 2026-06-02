import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import BankImportWorkflow from '../../pages/BankImportWorkflow';
import { getBankAccounts } from '../../services/bankAccountService';
import {
  approveImportBatch,
  createImportBatch,
  getImportBatch,
  getImportJob,
  getImportRows,
  listImportBatches,
  updateImportRow,
} from '../../services/bankImportService';

const mockNavigate = jest.fn();

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'test-user-id', username: 'tester' } })),
}));

jest.mock('../../services/bankAccountService', () => ({
  getBankAccounts: jest.fn(),
}));

jest.mock('../../services/bankImportService', () => ({
  createImportBatch: jest.fn(),
  listImportBatches: jest.fn(),
  getImportBatch: jest.fn(),
  getImportJob: jest.fn(),
  getImportRows: jest.fn(),
  updateImportRow: jest.fn(),
  approveImportBatch: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { bankAccountId: 'ba-1' } }),
  };
});

const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    secondary: { main: '#10B981' },
  },
});

const renderPage = () => render(
  <MemoryRouter>
    <ThemeProvider theme={theme}>
      <BankImportWorkflow />
    </ThemeProvider>
  </MemoryRouter>
);

describe('BankImportWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBankAccounts.mockResolvedValue([
      { id: 'ba-1', bank_name: 'HDFC Bank', account_name: 'Primary Current' },
    ]);
    listImportBatches.mockResolvedValue([]);
    createImportBatch.mockResolvedValue({
      batch: {
        id: 'batch-1',
        filename: 'statement.csv',
        workflow_mode: 'deterministic_parse',
        status: 'review_ready',
        row_count: 1,
        warning_count: 0,
        warnings: [],
        storage_mode: 'inline_cosmos',
      },
      rows: [
        {
          id: 'row-1',
          normalized_date: '2024-01-15',
          description: 'Acme Payment',
          amount: 1000,
          confidence_level: 'high',
          confidence_score: 0.9,
          review_status: 'ready',
          warnings: [],
        },
      ],
    });
    getImportRows.mockResolvedValue([
      {
        id: 'row-1',
        normalized_date: '2024-01-15',
        description: 'Acme Payment',
        amount: 1000,
        confidence_level: 'high',
        confidence_score: 0.9,
        review_status: 'ready',
        warnings: [],
      },
    ]);
    getImportBatch.mockResolvedValue({
      id: 'batch-1',
      filename: 'statement.csv',
      workflow_mode: 'deterministic_parse',
      status: 'review_ready',
      row_count: 1,
      warning_count: 0,
      warnings: [],
      storage_mode: 'inline_cosmos',
    });
    getImportJob.mockResolvedValue({ id: 'job-1', status: 'completed' });
    updateImportRow.mockResolvedValue({
      id: 'row-1',
      normalized_date: '2024-01-15',
      description: 'Acme Payment Updated',
      amount: 1200,
      confidence_level: 'high',
      confidence_score: 0.9,
      review_status: 'reviewed',
      warnings: [],
    });
    approveImportBatch.mockResolvedValue({
      batch: { id: 'batch-1', status: 'reconciliation_prepared', filename: 'statement.csv' },
      transactions_created: 1,
    });
  });

  it('uploads a statement and renders review rows', async () => {
    renderPage();

    expect(await screen.findByText('Upload Statement')).toBeInTheDocument();

    const fileInput = screen.getByTestId('bank-import-file-input');
    const file = new File(['date,description,debit,credit\n2024-01-15,Acme Payment,,1000'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Create Review Batch/i }));

    await waitFor(() => expect(createImportBatch).toHaveBeenCalled());
    expect(await screen.findByDisplayValue('Acme Payment')).toBeInTheDocument();
  });

  it('saves an edited row and approves the batch', async () => {
    renderPage();

    const fileInput = await screen.findByTestId('bank-import-file-input');
    const file = new File(['date,description,debit,credit\n2024-01-15,Acme Payment,,1000'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Create Review Batch/i }));

    const descriptionField = await screen.findByDisplayValue('Acme Payment');
    fireEvent.change(descriptionField, { target: { value: 'Acme Payment Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Row/i }));

    await waitFor(() => expect(updateImportRow).toHaveBeenCalledWith('batch-1', 'row-1', expect.objectContaining({
      description: 'Acme Payment Updated',
      amount: 1000,
    })));

    fireEvent.click(screen.getByRole('button', { name: /Approve and Prepare Reconciliation/i }));

    await waitFor(() => expect(approveImportBatch).toHaveBeenCalledWith('batch-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/bank-reconciliation', {
      state: {
        bankAccountId: 'ba-1',
        importBatchId: 'batch-1',
        importedCount: 1,
      },
    });
  });

  it('polls job status when upload is queued asynchronously', async () => {
    createImportBatch.mockResolvedValueOnce({
      batch: {
        id: 'batch-1',
        filename: 'statement.csv',
        workflow_mode: 'deterministic_parse',
        status: 'processing',
        row_count: 0,
        warning_count: 0,
        warnings: [],
        storage_mode: 'inline_cosmos',
      },
      job: { id: 'job-1', status: 'queued' },
      rows: [],
    });
    getImportJob.mockResolvedValueOnce({ id: 'job-1', status: 'completed' });

    renderPage();
    const fileInput = await screen.findByTestId('bank-import-file-input');
    const file = new File(['date,description,debit,credit\n2024-01-15,Acme Payment,,1000'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Create Review Batch/i }));

    await waitFor(() => expect(getImportJob).toHaveBeenCalledWith('job-1'), { timeout: 4000 });
    await waitFor(() => expect(getImportRows).toHaveBeenCalledWith('batch-1'), { timeout: 4000 });
  });
});