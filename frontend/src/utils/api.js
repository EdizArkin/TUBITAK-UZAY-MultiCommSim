const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * API helper module for MultiCommSim React app.
 * 
 * Provides functions to interact with backend REST API endpoints:
 * - createPeer: Sends client and server messages to create a new peer pair.
 * - runTest: Triggers the test execution on the backend.
 * 
 * Uses the REACT_APP_API_URL environment variable or defaults to localhost.
 */


export async function createPeer(clientMsg, serverMsg) {
  const res = await fetch(`${API_URL}/create-peer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientMsg, serverMsg }),
  });
  if (!res.ok) throw new Error('Failed to create peer');
  return res.json();
}

export async function runTest() {
  const res = await fetch(`${API_URL}/run-test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run test');
  return res.json();
}
