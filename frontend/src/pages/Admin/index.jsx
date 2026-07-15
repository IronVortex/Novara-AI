import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../context/MyContext.jsx';
import { getAnalytics } from '../../services/api.js';
import { IconActivity, IconUser, IconDatabase, IconZap } from '../../components/common/Icons.jsx';
import './admin.css';

function StatCard({ icon, label, value, color }) {
  const IconComponent = icon;
  return (
    <div className="admin-stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon"><IconComponent size={20} /></div>
      <div className="stat-body">
        <span className="stat-value">{value ?? '—'}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { authUser } = useContext(MyContext);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnalytics();
        setMetrics(res.data);
      } catch {
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <button className="admin-back" onClick={() => navigate('/app')}>← App</button>
        <h1>Admin Dashboard</h1>
        <span className="admin-user">{authUser?.name || 'Admin'}</span>
      </header>

      {loading ? (
        <div className="admin-loading">Loading metrics…</div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <StatCard icon={IconActivity} label="Total Conversations" value={metrics?.totalConversations ?? 0} color="var(--color-primary)" />
            <StatCard icon={IconZap} label="Tokens Used" value={(metrics?.totalTokensUsed ?? 0).toLocaleString()} color="var(--color-secondary)" />
            <StatCard icon={IconDatabase} label="Avg Latency" value={`${metrics?.averageLatencyMs ?? 0}ms`} color="var(--color-success)" />
            <StatCard icon={IconUser} label="Account" value={authUser?.email} color="var(--color-warning)" />
          </div>
          <div className="admin-section">
            <h2>Your Usage Summary</h2>
            <table className="admin-table">
              <thead><tr><th>Metric</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Total Conversations</td><td>{metrics?.totalConversations ?? 0}</td></tr>
                <tr><td>Total Tokens Used</td><td>{(metrics?.totalTokensUsed ?? 0).toLocaleString()}</td></tr>
                <tr><td>Average Response Latency</td><td>{metrics?.averageLatencyMs ?? 0}ms</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
