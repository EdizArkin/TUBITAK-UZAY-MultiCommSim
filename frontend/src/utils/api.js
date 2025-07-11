const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function createServer(serverMsg) {
  const res = await fetch(`${API_URL}/create-server`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverMsg })
  });
  if (!res.ok) throw new Error('Server creation failed');
  return res.json();
}

export async function createClient(msg, serverId) {
  const res = await fetch(`${API_URL}/create-client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientMsg: msg, serverId }),
  });
  if (!res.ok) throw new Error('Client creation failed');
  return res.json();
}

export async function getServerList() {
  const res = await fetch(`${API_URL}/servers`);
  if (!res.ok) throw new Error('Failed to fetch server list');
  return res.json();
}

export async function runTest() {
  const res = await fetch(`${API_URL}/run-test`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run test');
  return res.json();
}

export async function fetchLogs() {
  const res = await fetch(`${API_URL}/logs`);
  if (!res.ok) throw new Error('Log fetch failed');
  return res.json();
}