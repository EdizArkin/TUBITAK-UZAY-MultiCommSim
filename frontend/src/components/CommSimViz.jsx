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
import { getClientNumberedList} from '../utils/logUtils';

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


  // Group logs according to client-server actual connection (based on new backend log headers)
  function groupLogsByRealConnection(logs) {
    // New format: "🖥️ Server #1", "💻 Client #1"
    const serverLogs = {};

    // Helper: Extract serverId from client log content
    function extractServerIdFromClientLog(log) {
      if (!log) return null;
      // Look for: Received from server: {"serverId":N,...}
      const match = log.match(/Received from server:.*?"serverId":(\d+)/);
      if (match) return parseInt(match[1], 10);
      // Or: {"serverId":N,...} in any line
      const match2 = log.match(/"serverId":(\d+)/);
      if (match2) return parseInt(match2[1], 10);
      return null;
    }

    // Map: clientNum -> {clientId, serverId, log}
    const clientNumToInfo = [];
    Object.entries(logs).forEach(([name, log]) => {
      const serverMatch = name.match(/^🖥️ Server #(\d+)/);
      const clientMatch = name.match(/^💻 Client #(\d+)/);
      if (serverMatch) {
        const id = parseInt(serverMatch[1], 10);
        serverLogs[id] = log;
      } else if (clientMatch) {
        const clientNum = parseInt(clientMatch[1], 10);
        const serverId = extractServerIdFromClientLog(log);
        clientNumToInfo.push({ clientNum, serverId, log });
      }
    });

    // Logs sorted and matched with correct headers (sorted by serverId)
    const pairs = clientNumToInfo
      .sort((a, b) => {
        if (a.serverId == null && b.serverId == null) return 0;
        if (a.serverId == null) return 1;
        if (b.serverId == null) return -1;
        return a.serverId - b.serverId;
      })
      .map((info, idx) => ({
        index: idx + 1,
        serverId: info.serverId || '?',
        clientName: `Client #${info.serverId || '?'}`,
        clientLog: info.log,
        serverLog: info.serverId ? serverLogs[info.serverId] || null : null
      }));
    return pairs;
  }


  // Active client list: numbered and with 
  // for active clients section
  const numberedClients = getClientNumberedList(clients);

  const sortedServers = [...servers].sort((a, b) => a.id - b.id);

  // Prepare logs in a detailed and user-friendly tabular format
  function parseLogTable(log) {
    if (!log) return null;
    const rows = log
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        // New backend log format
        if (/\[Started\]/i.test(line)) {
          return { type: "Started", msg: line, color: "text-green-700" };
        }
        if (/\[Connection\]/i.test(line)) {
          return { type: "Connection", msg: line, color: "text-indigo-700" };
        }
        if (/\[Incoming JSON\]/i.test(line)) {
          return { type: "Incoming JSON", msg: line, color: "text-blue-700" };
        }
        if (/\[Client Message\]/i.test(line)) {
          return { type: "Client Message", msg: line, color: "text-indigo-700" };
        }
        if (/\[Server Reply\]/i.test(line)) {
          return { type: "Server Reply", msg: line, color: "text-green-700" };
        }
        if (/\[Connected\]/i.test(line)) {
          return { type: "Connected", msg: line, color: "text-indigo-700" };
        }
        if (/\[Sent\]/i.test(line)) {
          return { type: "Sent", msg: line, color: "text-indigo-700" };
        }
        if (/\[Info\]/i.test(line)) {
          return { type: "Info", msg: line, color: "text-gray-700" };
        }
        // Fallback for any other line
        return { type: "Other", msg: line, color: "text-gray-700" };
      });

    if (rows.length === 0) return <span className="text-gray-400">No log.</span>;
    return (
      <table className="min-w-full text-sm border border-gray-200 rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border-b text-left">Type</th>
            <th className="px-2 py-1 border-b text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className={`px-2 py-1 border-b font-semibold ${row.color}`}>{row.type}</td>
              <td className={`px-2 py-1 border-b font-mono ${row.color}`}>{row.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex items-center gap-3 mb-6">
        <AnimatedSpinner />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg select-none">
          MultiCommSim Visualizer (Optimized)
        </h1>
      </div>
      {/* Client-server icons and communication animation on top */}
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
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow mb-6 border border-indigo-200">
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

        {/* Active Servers */}
        <h3 className="text-lg font-semibold mb-2">🖥️ Active Servers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {sortedServers.length === 0 ? (
            <div className="col-span-full text-gray-400">No active servers.</div>
          ) : (
            sortedServers.map((s, idx) => (
              <div key={s.id} className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl shadow flex flex-col items-start p-4 transition hover:shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="font-bold text-indigo-700 text-lg">#{s.id}</span>
                </div>
                <div className="text-gray-800 font-mono text-base mb-1">{s.name}</div>
                <div className="text-xs text-gray-500">Port: 6003</div>
              </div>
            ))
          )}
        </div>

        {/* Active Clients */}
        <h3 className="text-lg font-semibold mb-2 mt-4">💻 Active Clients</h3>
        {numberedClients.length === 0 ? (
          <p className="text-gray-400">No active clients.</p>
        ) : (
          <ul className="pl-0">
            {numberedClients.map((c, i) => (
              <li key={i} className="flex items-center gap-2 mb-1">
                <span className="font-bold text-black mr-1">#{c.clientNum}</span>
                <span className="font-mono text-gray-800">{c.name || c.clientId}</span>
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 ml-1"></span>
                {c.serverId ? (
                  <span className="ml-2 text-gray-500 text-sm flex items-center">
                    <span className="mx-1">→</span>
                    <span className="font-bold text-indigo-700">Server #{c.serverId}</span>
                  </span>
                ) : (
                  <span className="ml-2 text-gray-400 text-xs">(No server)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logs */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">📄 Logs</h3>
        {Object.keys(logs).length === 0 ? (
          <p className="text-gray-400">No logs yet.</p>
        ) : (
          <>
            {/* Server & Client log boxes with real connection matching */}
            {groupLogsByRealConnection(logs).map(({ index, serverId, clientName, clientLog, serverLog }) => (
              <div key={index} className="mb-8 border rounded-lg p-4 bg-gray-50">
                <div className="font-bold text-lg mb-2">
                  #{index} - Server #{serverId || '?'} & {clientName} Logs
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Client Logs */}
                  <div className="flex-1">
                    <div className="font-semibold text-green-700 mb-1">💻 Client Logs</div>
                    <div className="log-card-body">
                      {clientLog ? parseLogTable(clientLog) : <span className="text-gray-400">No client log.</span>}
                    </div>
                  </div>
                  {/* Server Logs */}
                  <div className="flex-1">
                    <div className="font-semibold text-indigo-700 mb-1">🖥️ Server Logs</div>
                    <div className="log-card-body">
                      {serverLog ? parseLogTable(serverLog) : <span className="text-gray-400">No server log.</span>}
                    </div>
                  </div>
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
  // Check if there is a select field and if its value is empty
  const hasSelect = fields.some(f => f.type === 'select');
  const selectValue = fields.find(f => f.type === 'select')?.value;
  const doneDisabled = creating || (hasSelect && !selectValue);
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
            disabled={doneDisabled}
            className={`px-4 py-2 rounded ${doneDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
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
