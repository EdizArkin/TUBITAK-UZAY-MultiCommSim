import React, { useState } from 'react';
import './CommSimViz.css';

export default function CommSimViz() {
  const [logs, setLogs] = useState({ client: [], server: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setLogs({ client: [], server: [] });

    try {
      const res = await fetch('http://localhost:5000/run-test');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setLogs({
        client: data.client || [],
        server: data.server || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="viz-container">
      <h1>🔁 MultiCommSim Test Runner</h1>

      <div className="viz-box">
        <div className="node client">💻 Client</div>
        <div className="arrow-line">
          <div className="glow-pulse" />
        </div>
        <div className="node server">🖥️ Server</div>
      </div>

      <button className="run-btn" onClick={runTest} disabled={loading}>
        {loading ? 'Running...' : '🚀 Run Test'}
      </button>

      {error && <div className="error">⚠️ {error}</div>}

      <div className="log-section">
        <div className="log-box">
          <h3>💬 Client Logs</h3>
          {logs.client.length === 0 ? <p>—</p> : logs.client.map((line, i) => (
            <pre key={i}>{line}</pre>
          ))}
        </div>
        <div className="log-box">
          <h3>📡 Server Logs</h3>
          {logs.server.length === 0 ? <p>—</p> : logs.server.map((line, i) => (
            <pre key={i}>{line}</pre>
          ))}
        </div>
      </div>
    </div>
  );
}
