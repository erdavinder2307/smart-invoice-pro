import axios from 'axios';
import { createApiUrl } from '../config/api';

const PROFILE_URL = createApiUrl('/api/settings/organization-profile');
const LOGO_URL = createApiUrl('/api/settings/upload-logo');

export const getOrgProfile = async () => {
  const res = await axios.get(PROFILE_URL);
  return res.data;
};

export const updateOrgProfile = async (data) => {
  const res = await axios.put(PROFILE_URL, data);
  return res.data;
};

export const uploadOrgLogo = async ({ logo_filename, logo_base64 }) => {
  const res = await axios.post(LOGO_URL, { logo_filename, logo_base64 });
  return res.data;
};
