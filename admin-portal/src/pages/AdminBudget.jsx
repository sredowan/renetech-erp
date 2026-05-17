import React, { useState, useEffect } from 'react';
import { Loader2, PieChart, Plus } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const BudgetTracker = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/budget/vs-actual');
      setBudgets(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getColor = (pct) => pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Budget Tracker</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Monitor budget allocations vs actual spending per account</p>
        </div>
        <button className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Create Budget</button>
      </div>

      {budgets.length === 0 ? (
        <div className="glass-morphism" style={{ padding: '4rem', textAlign: 'center' }}>
          <PieChart size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-dim)' }}>No budgets created yet. Click "Create Budget" to start tracking allocations vs actuals.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((b, i) => {
            const pct = parseFloat(b.utilization);
            const color = getColor(pct);
            return (
              <div key={i} className="glass-morphism" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>{b.accountName}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.accountCode} · {b.period}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: `${color}20`, color, alignSelf: 'start' }}>{pct}%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div><p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Allocated</p><p style={{ fontWeight: '700' }}>৳{b.allocated.toLocaleString()}</p></div>
                  <div><p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Spent</p><p style={{ fontWeight: '700', color: '#ef4444' }}>৳{b.spent.toLocaleString()}</p></div>
                  <div><p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Remaining</p><p style={{ fontWeight: '700', color: '#10b981' }}>৳{b.remaining.toLocaleString()}</p></div>
                </div>
                <div style={{ height: '8px', background: 'var(--glass)', borderRadius: '4px' }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s' }}></div>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>{b.periodStart} — {b.periodEnd}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
