import axios from 'axios';
import {
  getBankAccounts,
  createBankAccount,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
} from '../../services/bankAccountService';

jest.mock('axios');

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('bankAccountService', () => {
  const mockAccount = { id: 'ba-1', bank_name: 'Test Bank', account_number: '1234' };

  it('fetches bank accounts with explicit userId', async () => {
    axios.get.mockResolvedValue({ data: [mockAccount] });

    const result = await getBankAccounts('user-1');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/bank-accounts'),
      { headers: { 'X-User-Id': 'user-1' } }
    );
    expect(result).toEqual([mockAccount]);
  });

  it('fetches bank accounts with localStorage fallback', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'ls-user', username: 'admin' }));
    axios.get.mockResolvedValue({ data: [mockAccount] });

    const result = await getBankAccounts();
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'X-User-Id': 'ls-user', 'X-Username': 'admin' } }
    );
    expect(result).toEqual([mockAccount]);
  });

  it('creates a bank account', async () => {
    axios.post.mockResolvedValue({ data: mockAccount });

    const result = await createBankAccount({ bank_name: 'Test Bank' }, 'user-1');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/bank-accounts'),
      { bank_name: 'Test Bank' },
      { headers: { 'X-User-Id': 'user-1' } }
    );
    expect(result).toEqual(mockAccount);
  });

  it('fetches bank account by id', async () => {
    axios.get.mockResolvedValue({ data: mockAccount });

    const result = await getBankAccountById('ba-1', 'user-1');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/bank-accounts/ba-1'),
      { headers: { 'X-User-Id': 'user-1' } }
    );
    expect(result).toEqual(mockAccount);
  });

  it('updates a bank account', async () => {
    const updated = { ...mockAccount, bank_name: 'Updated Bank' };
    axios.put.mockResolvedValue({ data: updated });

    const result = await updateBankAccount('ba-1', { bank_name: 'Updated Bank' }, 'user-1');
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/bank-accounts/ba-1'),
      { bank_name: 'Updated Bank' },
      { headers: { 'X-User-Id': 'user-1' } }
    );
    expect(result.bank_name).toBe('Updated Bank');
  });

  it('deletes a bank account', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'deleted' } });

    const result = await deleteBankAccount('ba-1', 'user-1');
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/bank-accounts/ba-1'),
      { headers: { 'X-User-Id': 'user-1' } }
    );
    expect(result.message).toBe('deleted');
  });

  it('throws on error', async () => {
    axios.get.mockRejectedValue(new Error('Server Error'));
    await expect(getBankAccounts('user-1')).rejects.toThrow('Server Error');
  });
});
