import axios from 'axios';
import { getOrgProfile, updateOrgProfile, uploadOrgLogo } from '../../services/organizationProfileService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('organizationProfileService', () => {
  it('fetches organization profile', async () => {
    const mockData = { company_name: 'Test Corp', gst_number: 'GST123' };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getOrgProfile();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/organization-profile'));
    expect(result).toEqual(mockData);
  });

  it('updates organization profile', async () => {
    const payload = { company_name: 'Updated Corp' };
    axios.put.mockResolvedValue({ data: { ...payload, updated: true } });

    const result = await updateOrgProfile(payload);
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/settings/organization-profile'),
      payload
    );
    expect(result.updated).toBe(true);
  });

  it('uploads organization logo', async () => {
    const payload = { logo_filename: 'logo.png', logo_base64: 'base64data' };
    axios.post.mockResolvedValue({ data: { logo_url: 'https://example.com/logo.png' } });

    const result = await uploadOrgLogo(payload);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/settings/upload-logo'),
      payload
    );
    expect(result.logo_url).toContain('logo.png');
  });
});
