import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, CheckCircle, XCircle, Calendar } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const typeBadge = (type) => {
  const colors = { asset: '#3b82f6', liability: '#f59e0b', equity: '#8b5cf6', revenue: '#10b981', expense: '#ef4444' };
  return (
    <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '700', textTransform: 'capitalize', background: `${colors[type] || '#666'}20`, color: colors[type] || '#666' }}>{type}</span>
  );
};

const Ledger = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [trialBalance, setTrialBalance] = useState({ totalDebits: 0, totalCredits: 0, difference: 0, isBalanced: true });
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-06-30');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ledgerRes, tbRes] = await Promise.all([
        api.get('/accounting/ledger-summary'),
        api.get('/finance/trial-balance')
      ]);
      setSummary(ledgerRes.data);
      setTrialBalance(tbRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Finance &gt; General Ledger</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>General Ledger</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Double-entry bookkeeping · All transactions with debit/credit/balance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Account Summary */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Account Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>ACCOUNT</span><span>TYPE</span><span>DEBIT TOTAL</span><span>CREDIT TOTAL</span><span>BALANCE</span>
          </div>
          {summary.map((acc, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1fr', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '500' }}>{acc.name}</span>
              {typeBadge(acc.type)}
              <span>৳{acc.debitTotal.toLocaleString()}</span>
              <span>৳{acc.creditTotal.toLocaleString()}</span>
              <span style={{ fontWeight: '700', color: acc.balance >= 0 ? '#10b981' : '#ef4444' }}>৳{Math.abs(acc.balance).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Trial Balance Check */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Trial Balance Check</h3>
            <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700',
              background: trialBalance.isBalanced ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: trialBalance.isBalanced ? '#10b981' : '#ef4444'
            }}>
              {trialBalance.isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.2rem', background: 'rgba(6,182,212,0.08)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Total Debits</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#06b6d4' }}>৳{trialBalance.totalDebits.toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.2rem', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Total Credits</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#10b981' }}>৳{trialBalance.totalCredits.toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.2rem', background: 'var(--glass)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Difference</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ৳{trialBalance.difference} {trialBalance.isBalanced && <CheckCircle size={18} color="#10b981" />}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>ACCOUNTING PERIOD</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', marginTop: '0.3rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', marginTop: '0.3rem' }} />
              </div>
            </div>
            <button onClick={fetchData} className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>Regenerate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
