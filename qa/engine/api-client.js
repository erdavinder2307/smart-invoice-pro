/**
 * Optional API client for bookkeeping validation without UI.
 */
async function apiLogin(apiUrl, credentials) {
  const username = credentials.username || process.env.QA_USERNAME;
  const password = credentials.password || process.env.QA_PASSWORD;
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`API login failed: ${res.status}`);
  const data = await res.json();
  return data.access_token || data.token;
}

async function apiGet(apiUrl, token, endpoint) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API GET ${endpoint} failed: ${res.status}`);
  return res.json();
}

module.exports = { apiLogin, apiGet };
