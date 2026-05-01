import axios from 'axios';
import {
  bulkRecurringProfileAction,
  createRecurringProfile,
  deleteRecurringProfile,
  getRecurringProfileById,
  getRecurringProfilesList,
  patchRecurringProfileAction,
  updateRecurringProfile,
} from '../../services/recurringProfileService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('recurringProfileService', () => {
  it('getRecurringProfilesList compacts params and forwards signal', async () => {
    const signal = { aborted: false };
    axios.get.mockResolvedValue({ data: { data: [{ id: 'rp-1' }], total: 1 } });

    const result = await getRecurringProfilesList(
      {
        page: 1,
        limit: 10,
        q: 'monthly',
        status: '',
        frequency: undefined,
        date_from: null,
      },
      signal
    );

    expect(result).toEqual({ data: [{ id: 'rp-1' }], total: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/recurring-profiles'),
      expect.objectContaining({
        params: {
          page: 1,
          limit: 10,
          q: 'monthly',
        },
        signal,
      })
    );
  });

  it('getRecurringProfileById fetches one profile', async () => {
    axios.get.mockResolvedValue({ data: { id: 'rp-1' } });

    const result = await getRecurringProfileById('rp-1');

    expect(result).toEqual({ id: 'rp-1' });
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/recurring-profiles/rp-1'));
  });

  it('createRecurringProfile posts payload', async () => {
    const payload = { profile_name: 'Monthly Plan' };
    axios.post.mockResolvedValue({ data: { id: 'rp-1' } });

    const result = await createRecurringProfile(payload);

    expect(result).toEqual({ id: 'rp-1' });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/recurring-profiles'),
      payload
    );
  });

  it('updateRecurringProfile puts payload', async () => {
    const payload = { profile_name: 'Updated Plan' };
    axios.put.mockResolvedValue({ data: { id: 'rp-1', profile_name: 'Updated Plan' } });

    const result = await updateRecurringProfile('rp-1', payload);

    expect(result).toEqual({ id: 'rp-1', profile_name: 'Updated Plan' });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/recurring-profiles/rp-1'),
      payload
    );
  });

  it('deleteRecurringProfile deletes by id', async () => {
    axios.delete.mockResolvedValue({ data: { deleted: true } });

    const result = await deleteRecurringProfile('rp-1');

    expect(result).toEqual({ deleted: true });
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/recurring-profiles/rp-1'));
  });

  it('patchRecurringProfileAction sends patch body', async () => {
    axios.patch.mockResolvedValue({ data: { status: 'Paused' } });

    const result = await patchRecurringProfileAction('rp-1', 'pause');

    expect(result).toEqual({ status: 'Paused' });
    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recurring-profiles/rp-1'),
      { action: 'pause' }
    );
  });

  it('bulkRecurringProfileAction posts payload to bulk endpoint', async () => {
    const payload = { action: 'resume', ids: ['rp-1', 'rp-2'] };
    axios.post.mockResolvedValue({ data: { updated: 2 } });

    const result = await bulkRecurringProfileAction(payload);

    expect(result).toEqual({ updated: 2 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/recurring-profiles/bulk'),
      payload
    );
  });
});
