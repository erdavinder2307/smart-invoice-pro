import axios from 'axios';
import { createApiUrl } from '../config/api';

export const getAutomationSettings = () =>
  axios.get(createApiUrl('/api/settings/automation')).then((r) => r.data);

export const saveAutomationSettings = (data) =>
  axios.put(createApiUrl('/api/settings/automation'), data).then((r) => r.data);
