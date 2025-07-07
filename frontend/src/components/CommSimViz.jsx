import React, { useState } from 'react';
import './CommSimViz.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MultiCommSim() {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPeerForm, setShowPeerForm] = useState(false);
  const [peerList, setPeerList] = useState([]);
  const [serverMsg, setServerMsg] = useState('');
  const [clientMsg, setClientMsg] = useState('');
  const [creating, setCreating] = useState(false);

  // Peer ekleme formunu aç
  function openPeerForm() {
    setServerMsg('');
    setClientMsg('');
    setShowPeerForm(true);
    setError(null);
  }

  // Peer ekleme işlemi
  async function handleCreatePeer() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/create-peer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverMsg,
          clientMsg
        })
      });
      if (!res.ok) throw new Error(`Failed to create peer: ${res.statusText}`);
      const data = await res.json();
      console.log("DEBUG /create-peer response (frontend):", data); // <-- DEBUG
      setPeerList(list => [...list, data]);
      setShowPeerForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // Test başlat
  async function runTest() {
    setLoading(true);
    setError(null);
    setLogs({});
    try {
      const res = await fetch(`${API_URL}/run-test`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log("DEBUG /run-test response (frontend):", data); // <-- DEBUG
      setLogs(data);
      // Test sonrası peer listesini temizle (çünkü dockerda kapatıldı)
      setPeerList([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="multi-comm-sim p-4">
      <h1>🔁 MultiCommSim Test Runner</h1>

      <div className="buttons">
        <button onClick={openPeerForm} disabled={loading} className="btn">
          ➕ Create Peer
        </button>
        <button onClick={runTest} disabled={loading || peerList.length === 0} className="btn">
          {loading ? 'Running...' : '🧪 Run Test'}
        </button>
      </div>

      {/* Peer ekleme modalı */}
      {showPeerForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Add Peer</h2>
            <label>
              Server'a gönderilecek mesaj:
              <input
                type="text"
                value={serverMsg}
                onChange={e => setServerMsg(e.target.value)}
                placeholder="Örn: Hello Server"
              />
            </label>
            <label>
              Client'a gönderilecek mesaj:
              <input
                type="text"
                value={clientMsg}
                onChange={e => setClientMsg(e.target.value)}
                placeholder="Örn: Hello Client"
              />
            </label>
            <div className="modal-actions">
              <button className="btn" onClick={handleCreatePeer} disabled={creating || !serverMsg || !clientMsg}>
                {creating ? 'Adding...' : 'Done'}
              </button>
              <button className="btn btn-cancel" onClick={() => setShowPeerForm(false)} disabled={creating}>
                Cancel
              </button>
            </div>
            {error && <div className="error">⚠️ {error}</div>}
          </div>
        </div>
      )}

      {/* Peer listesi */}
      <div className="peer-list">
        <h3>Active Peers</h3>
        {peerList.length === 0 ? (
          <p>No active peers.</p>
        ) : (
          <ul>
            {peerList.map(peer => (
              <li key={peer.peerId}>
                <span>🖥️ {peer.server} &nbsp;|&nbsp; 💻 {peer.client}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="viz-container">
        <div className="node client">💻 Client</div>
        <div className="arrow-line">
          <div className="glow-pulse" />
        </div>
        <div className="node server">🖥️ Server</div>
      </div>

      {error && !showPeerForm && <div className="error">⚠️ {error}</div>}

      <div className="log-section">
        {Object.entries(logs).length === 0 && <p>No logs yet.</p>}
        {Object.entries(logs).map(([name, lines]) => (
          <div key={name} className="log-box">
            <h3>{name}</h3>
            {lines.length === 0 ? (
              <p>—</p>
            ) : (
              lines.map((line, i) => <pre key={i}>{line}</pre>)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
