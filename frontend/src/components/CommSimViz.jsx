import React, { useState, useEffect } from 'react';
import { createPeer, runTest } from "../utils/api";
import './CommSimViz.css';

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


  
  async function handleCreatePeer() {
    setCreating(true);
    try {
      const data = await createPeer(clientMsg, serverMsg);
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

  async function handleRunTest() {
    setLoading(true);
    try {
      const data = await runTest();
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <AnimatedSpinner />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg select-none">
          MultiCommSim Visualizer
        </h1>
      </div>

      {/* Client & Server icons */}
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

        {/* Buttons */}
        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              ➕ Add Peer
            </button>
            <button
              onClick={handleRunTest}
              disabled={loading || peerList.length === 0}
              className={`btn-secondary ${loading || peerList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Running...' : '🧪 Run Test'}
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-indigo-600"
            />
            <span className="font-semibold text-gray-700">🔄 Auto Refresh</span>
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
                    <td className="border px-3 py-1">{idx + 1}</td>
                    <td className="border px-3 py-1">{peer.client}</td>
                    <td className="border px-3 py-1">{peer.server}</td>
                    <td className="border px-3 py-1 text-green-600 font-semibold">🟢 Connected</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 📄 Log boxes in groups */}
        <div>
          <h3 className="text-lg font-semibold mb-4">📄 Logs</h3>
          {Object.keys(logs).length === 0 ? (
            <p className="text-gray-400">No logs yet.</p>
          ) : (
            Array.from(
              new Set(
                Object.keys(logs)
                  .map(k => k.replace(/^client-|^server-/, ''))
              )
            ).map((peerId, idx) => {
              const clientLogs = logs[`client-${peerId}`] || [];
              const serverLogs = logs[`server-${peerId}`] || [];

              return (
                <div key={peerId} className="border border-gray-300 rounded-lg mb-6 shadow-sm">
                  <div className="bg-indigo-100 px-4 py-2 font-bold rounded-t">
                    Peer #{idx + 1} – ID: {peerId}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4">
                    <div className="border border-indigo-200 rounded-lg p-3 bg-white">
                      <h4 className="font-semibold text-indigo-700 mb-2">💻 Client Logs</h4>
                      {clientLogs.length > 0 ? (
                        <div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto">
                          {clientLogs.map((line, i) => (
                            <div key={i} className="mb-1">{line}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No client logs.</p>
                      )}
                    </div>
                    <div className="border border-indigo-200 rounded-lg p-3 bg-white">
                      <h4 className="font-semibold text-indigo-700 mb-2">🖥️ Server Logs</h4>
                      {serverLogs.length > 0 ? (
                        <div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto">
                          {serverLogs.map((line, i) => (
                            <div key={i} className="mb-1">{line}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No server logs.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">➕ Add Peer</h2>
            <input className="w-full border mb-3 p-2 rounded" placeholder="Client Message"
              value={clientMsg} onChange={e => setClientMsg(e.target.value)} />
            <input className="w-full border mb-3 p-2 rounded" placeholder="Server Message"
              value={serverMsg} onChange={e => setServerMsg(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={handleCreatePeer}
                disabled={!clientMsg || !serverMsg || creating}
                className="bg-blue-600 text-white px-4 py-2 rounded">
                {creating ? 'Adding...' : 'Done'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function AnimatedSpinner() {
  return (
    <svg className="animate-spin h-10 w-10 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
