import React, { useState, useEffect } from 'react';
import { Loader2, CreditCard, Receipt, Search } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const POSFees = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalCollected: 0, pending: 0, overdue: 0 });
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get('/pos/transactions').catch(() => ({ data: [] })),
        api.get('/finance/overview').catch(() => ({ data: {} }))
      ]);
      setTransactions(txRes.data || []);
      setStats({
        totalCollected: statsRes.data.feeCollected || 0,
        pending: statsRes.data.receivablesDue || 0,
        overdue: statsRes.data.overdueReceivables || 0
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const methodColors = { bkash: '#e2136e', nagad: '#f6921e', card: '#3b82f6', cash: '#10b981', bank_transfer: '#8b5cf6' };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>POS & Fee Management</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Dynamic invoicing · Auto-unlock course access on payment</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>📄 Generate Receipt</button>
          <button className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Collect Fee</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL COLLECTED</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>৳{stats.totalCollected.toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PENDING</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>৳{stats.pending.toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>OVERDUE 30D+</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>৳{stats.overdue.toLocaleString()}</h2>
        </div>
      </div>

      {/* Transactions Table + Payment Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Transactions</h3>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={{ padding: '0.5rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem' }}>
              <option value="all">All Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>RECEIPT</span><span>STUDENT</span><span>AMOUNT</span><span>METHOD</span><span>COURSE ACCESS</span><span>STATUS</span>
          </div>

          {/* Demo Rows */}
          {[
            { receipt: 'RCP-3401', student: 'Mehedi Hassan', amount: 12000, method: 'bkash', access: 'Unlocked', status: 'Paid' },
            { receipt: 'RCP-3400', student: 'Tasnim Akter', amount: 6000, method: 'nagad', access: 'Partial Access', status: 'Partial' },
            { receipt: 'RCP-3399', student: 'Rakib Hossain', amount: 15000, method: 'card', access: 'Unlocked', status: 'Paid' },
            { receipt: 'RCP-3398', student: 'Fariha Begum', amount: 10000, method: 'cash', access: 'Locked', status: 'Overdue' },
          ].filter(r => methodFilter === 'all' || r.method === methodFilter).map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>{row.receipt}</span>
              <span style={{ fontWeight: '500' }}>{row.student}</span>
              <span style={{ fontWeight: '700' }}>৳{row.amount.toLocaleString()}</span>
              <span><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', background: `${methodColors[row.method]}25`, color: methodColors[row.method] }}>{row.method}</span></span>
              <span><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600',
                background: row.access === 'Unlocked' ? 'rgba(16,185,129,0.15)' : row.access === 'Partial Access' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: row.access === 'Unlocked' ? '#10b981' : row.access === 'Partial Access' ? '#f59e0b' : '#ef4444'
              }}>{row.access === 'Unlocked' ? '✓ ' : row.access === 'Locked' ? '🔒 ' : ''}{row.access}</span></span>
              <span><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600',
                background: row.status === 'Paid' ? 'rgba(16,185,129,0.15)' : row.status === 'Partial' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: row.status === 'Paid' ? '#10b981' : row.status === 'Partial' ? '#f59e0b' : '#ef4444'
              }}>{row.status}</span></span>
            </div>
          ))}
        </div>

        {/* Payment Channels */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Payment Channels</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(#e2136e 0% 57%, #f6921e 57% 84%, #3b82f6 84% 96%, #10b981 96% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>4</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Methods</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'bKash', pct: '57%', color: '#e2136e' },
              { name: 'Nagad', pct: '27%', color: '#f6921e' },
              { name: 'Card', pct: '12%', color: '#3b82f6' },
              { name: 'Cash', pct: '4%', color: '#10b981' },
            ].map((ch, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ch.color }}></span>
                  <span style={{ fontSize: '0.85rem' }}>{ch.name}</span>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{ch.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSFees;
