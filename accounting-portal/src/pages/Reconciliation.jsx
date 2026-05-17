import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Check, AlertCircle, Trash2, 
  Loader2, Search, FileText, ChevronRight, Scale, Plus
} from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const StatusBadge = ({ status }) => {
  const styles = {
    draft: { bg: '#e0e7ff', color: '#3730a3' },
    reviewed: { bg: '#fef3c7', color: '#92400e' },
    approved: { bg: '#d1fae5', color: '#065f46' },
    locked: { bg: '#f3f4f6', color: '#1f2937' }
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ 
      padding: '2px 8px', borderRadius: '10px', 
      fontSize: '0.65rem', fontWeight: '700',
      background: s.bg, color: s.color, textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};

const Reconciliation = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateToGenerate, setDateToGenerate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        api.get('/reconciliation/stats'),
        api.get('/reconciliation/sessions')
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Failed to fetch reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/reconciliation/generate', { recon_date: dateToGenerate });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate session');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (loading && sessions.length === 0) return <div className="canvas"><Loader2 className="animate-spin" color="var(--primary)" size={48} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Bank Reconciliation</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Automated matching sessions for accounting audit</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="date" 
            value={dateToGenerate} 
            onChange={e => setDateToGenerate(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              background: 'var(--bg-deep)', border: '1px solid var(--border)',
              color: 'white'
            }}
          />
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Generate Session</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Today's Net</p>
          <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{formatCurrency(stats?.today?.net)}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--success)' }}>{stats?.today?.inflow_count} Inflows / {stats?.today?.outflow_count} Outflows</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pending Review</p>
          <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats?.sessions?.draft || 0} Sessions</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Draft sessions awaiting audit</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Unresolved Variance</p>
          <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{formatCurrency(stats?.unresolved_variance)}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Across all unmatched mappings</p>
        </div>
      </div>

      <div className="glass-morphism" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <FileText size={20} color="var(--primary)" /> Reconciliation Sessions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem' }}>No sessions found.</p>
          ) : sessions.map(session => (
            <div key={session.id} className="glass-morphism transition-hover" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>{session.recon_date}</p>
                  <StatusBadge status={session.status} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Prepared by: {session.Preparer?.name || 'System'} | Variance: {formatCurrency(session.total_variance)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Ledger Net</p>
                  <p style={{ fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(session.total_ledger_net)}</p>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => alert('Detail view coming soon to accounting portal. Use Admin Portal for full audit.')}
                >
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reconciliation;
