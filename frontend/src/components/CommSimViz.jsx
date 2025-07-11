import React, { useState, useEffect } from 'react';
import {
  createServer,
  createClient,
  getServerList,
  fetchLogs,
  runTest,
  getClientList
} from "../utils/api";
import './CommSimViz.css';

export default function MultiCommSim() {
  const [servers, setServers] = useState([]);
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [showServerForm, setShowServerForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  const [serverMsg, setServerMsg] = useState('');
  const [clientMsg, setClientMsg] = useState('');
  const [selectedServerId, setSelectedServerId] = useState('');

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServers();
    fetchClients();
    fetchLogs().then(setLogs).catch(() => {});
  }, []);

  async function fetchServers() {
    try {
      const data = await getServerList();
      setServers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchClients() {
    try {
      const data = await getClientList();
      setClients(data);
    } catch {
      setClients([]);
    }
  }

  async function handleCreateServer() {
    setCreating(true);
    try {
      await createServer(serverMsg);
      await fetchServers();
      setShowServerForm(false);
      setServerMsg('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateClient() {
    setCreating(true);
    try {
      await createClient(clientMsg, selectedServerId);
      setShowClientForm(false);
      setClientMsg('');
      setSelectedServerId('');
      await fetchClients();
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
      await fetchClients();
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
        await fetchServers();
        await fetchClients();
        const data = await fetchLogs();
        setLogs(data);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Logları detaylı ve insan okunur şekilde hazırla
  function parseLog(log, who) {
    if (!log) return [];
    return log
      .split('\n')
      .filter(Boolean)
      .map((line, idx) => {
        if (line.toLowerCase().includes('received')) {
          return <div key={idx} className="text-blue-700">{who} aldı: <span className="font-mono">{line}</span></div>;
        }
        if (line.toLowerCase().includes('reply')) {
          return <div key={idx} className="text-green-700">{who} dedi: <span className="font-mono">{line}</span></div>;
        }
        return <div key={idx} className="text-gray-700">{line}</div>;
      });
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex items-center gap-3 mb-6">
        <AnimatedSpinner />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg select-none">
          MultiCommSim Visualizer (Optimized)
        </h1>
      </div>
    {/* Üstte client-server ikonları ve iletişim animasyonu */}
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
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow mb-6">
        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded mb-4">
          <div className="flex gap-3">
            <button onClick={() => setShowServerForm(true)} className="btn-primary">
              ➕ Add Server
            </button>
            <button onClick={() => setShowClientForm(true)} className="btn-primary">
              ➕ Add Client
            </button>
            <button
              onClick={handleRunTest}
              className={`btn-secondary${servers.length === 0 || clients.length === 0 ? ' opacity-50 cursor-not-allowed' : ''}`}
              disabled={servers.length === 0 || clients.length === 0 || loading}
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

        {/* Aktif Serverlar */}
        <h3 className="text-lg font-semibold mb-2">🖥️ Active Servers</h3>
        {servers.length === 0 ? (
          <p className="text-gray-400">No active servers.</p>
        ) : (
          <ul className="pl-0 mb-4">
            {servers.map(s => (
              <li key={s.id} className="flex items-center gap-2 mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="font-bold text-indigo-700">#{s.id}</span>
                <span className="text-gray-700">{s.name}</span>
                <span className="ml-2 text-xs text-gray-500">Port: 6003</span>
              </li>
            ))}
          </ul>
        )}

        {/* Aktif Clientlar */}
        <h3 className="text-lg font-semibold mb-2 mt-4">💻 Active Clients</h3>
        {clients.length === 0 ? (
          <p className="text-gray-400">No active clients.</p>
        ) : (
          <ul className="pl-0">
            {clients.map((c, i) => (
              <li key={i} className="flex items-center gap-2 mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="font-bold text-green-700">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loglar */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">📄 Logs</h3>
        {Object.keys(logs).length === 0 ? (
          <p className="text-gray-400">No logs yet.</p>
        ) : (
          <>
            {/* Server Logları */}
            <h4 className="font-semibold text-indigo-700 mb-2">🖥️ Server Logs</h4>
            {servers.map(s => (
              <div key={s.name} className="mb-4 border rounded p-3 bg-gray-50">
                <div className="font-bold mb-1">{s.name} (Port: 6003)</div>
                <div className="text-sm whitespace-pre-wrap">
                  {parseLog(logs[s.name], "Server")}
                </div>
              </div>
            ))}
            {/* Client Logları */}
            <h4 className="font-semibold text-green-700 mb-2 mt-6">💻 Client Logs</h4>
            {clients.map(c => (
              <div key={c.name} className="mb-4 border rounded p-3 bg-gray-50">
                <div className="font-bold mb-1">{c.name}</div>
                <div className="text-sm whitespace-pre-wrap">
                  {parseLog(logs[c.name], "Client")}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal: Server */}
      {showServerForm && (
        <Modal
          title="➕ Add Server"
          onClose={() => setShowServerForm(false)}
          onSubmit={handleCreateServer}
          creating={creating}
          error={error}
          fields={[
            {
              label: 'Server Message',
              value: serverMsg,
              onChange: setServerMsg
            }
          ]}
        />
      )}

      {/* Modal: Client */}
      {showClientForm && (
        <Modal
          title="➕ Add Client"
          onClose={() => setShowClientForm(false)}
          onSubmit={handleCreateClient}
          creating={creating}
          error={error}
          fields={[
            {
              label: 'Client Message',
              value: clientMsg,
              onChange: setClientMsg
            },
            {
              label: 'Target Server ID',
              type: 'select',
              value: selectedServerId,
              onChange: setSelectedServerId,
              options: servers.map(s => ({
                label: `Server #${s.id} (${s.name})`,
                value: s.id
              }))
            }
          ]}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, creating, error, fields }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {fields.map((field, i) => {
          if (field.type === 'select') {
            return (
              <select
                key={i}
                className="w-full border mb-3 p-2 rounded"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
              >
                <option value="">-- Select Server --</option>
                {field.options.map((opt, idx) => (
                  <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={i}
              className="w-full border mb-3 p-2 rounded"
              placeholder={field.label}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
            />
          );
        })}
        <div className="flex justify-end gap-2">
          <button
            onClick={onSubmit}
            disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {creating ? 'Processing...' : 'Done'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
      </div>
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
