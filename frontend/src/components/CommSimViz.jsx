import React, { useState, useEffect } from 'react';
import './CommSimViz.css'; // Stil dosyan

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MultiCommSim() {
  const [logs, setLogs] = useState({});
  const [peerList, setPeerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clientMsg, setClientMsg] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  async function createPeer() {
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/create-peer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientMsg, serverMsg }),
      });
      const data = await res.json();
      setPeerList(list => [...list, data]);
      setShowForm(false);
      setClientMsg('');
      setServerMsg('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function runTest() {
    setLoading(true);
    setLogs({});
    try {
      const res = await fetch(`${API_URL}/run-test`, { method: 'POST' });
      const data = await res.json();
      setLogs(data);
      setPeerList([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Başlık + Spinner */}
      <div className="flex items-center gap-3 mb-6">
        <AnimatedSpinner />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg select-none">
          MultiCommSim Visualizer
        </h1>
      </div>

      {/* Client & Server ikonları alt yazılı */}
      <div className="flex justify-center items-center my-10 relative">
        <div className="flex flex-col items-center">
          <div className="node client-node">💻</div>
          <span className="icon-label">Client</span>
        </div>
        <div className="comm-line mx-6 relative z-0">
          <div className="pulse-line green-glow"></div>
          <div className="pulse-line blue-glow delay-1"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="node server-node">🖥️</div>
          <span className="icon-label">Server</span>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">
          🌐 MultiCommSim Dashboard
        </h2>

        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded mb-4">
          <div className="flex gap-3">
            <button onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
              ➕ Create Peer
            </button>
            <button onClick={runTest} disabled={loading || peerList.length===0}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">
              {loading ? 'Running...' : '🧪 Run Test'}
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)} />
            <span className="text-gray-700 font-semibold">🔄 Auto Refresh</span>
          </label>
        </div>

        {/* Active Peers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Active Peers</h3>
          {peerList.length === 0 ? (
            <p className="text-gray-400">No active peers.</p>
          ) : (
            <table className="w-full table-fixed border border-gray-300 rounded">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="border px-3 py-1 w-12">#</th>
                  <th className="border px-3 py-1">Client</th>
                  <th className="border px-3 py-1">Server</th>
                  <th className="border px-3 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {peerList.map((peer, idx) => (
                  <tr key={peer.peerId} className="hover:bg-indigo-50">
                    <td className="border px-3 py-1">{idx+1}</td>
                    <td className="border px-3 py-1">{peer.client}</td>
                    <td className="border px-3 py-1">{peer.server}</td>
                    <td className="border px-3 py-1 text-green-600 font-semibold">🟢 Connected</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Logları grup halinde göster */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📄 Logs</h3>
          {Object.keys(logs).length === 0 ? (
            <p className="text-gray-400">No logs yet.</p>
          ) : (
            Object.entries(logs).map(([name, lines]) => (
              <details key={name} className="mb-3 border rounded">
                <summary className="bg-gray-200 px-3 py-1 cursor-pointer font-medium">{name}</summary>
                <div className="bg-gray-50 p-3 text-sm whitespace-pre-wrap max-h-48 overflow-auto">
                  {lines.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </details>
            ))
          )}
        </div>
      </div>

      {/* Peer ekleme modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">➕ Add Peer</h2>
            <input className="w-full border mb-3 p-2 rounded" placeholder="Client Message"
              value={clientMsg} onChange={e=>setClientMsg(e.target.value)} />
            <input className="w-full border mb-3 p-2 rounded" placeholder="Server Message"
              value={serverMsg} onChange={e=>setServerMsg(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={createPeer}
                disabled={!clientMsg||!serverMsg||creating}
                className="bg-blue-600 text-white px-4 py-2 rounded">
                {creating?'Adding...':'Done'}
              </button>
              <button onClick={()=>setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Dönen yükleme simgesi
function AnimatedSpinner() {
  return (
    <svg className="animate-spin h-10 w-10 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      role="img" aria-label="loading">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
