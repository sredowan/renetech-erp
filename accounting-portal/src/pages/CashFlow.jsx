import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const CashFlow = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ inflows: 0, outflows: 0, net: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/finance/cashflow');
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem' }}>Cash Flow Report</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Cash inflows vs outflows · Net cash position</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '2rem', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CASH INFLOWS</p>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', margin: '0.5rem 0 0' }}>৳{data.inflows.toLocaleString()}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Fee collections + payments received</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} color="#10b981" />
            </div>
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '2rem', borderTop: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CASH OUTFLOWS</p>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ef4444', margin: '0.5rem 0 0' }}>৳{data.outflows.toLocaleString()}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Salaries + rent + operational costs</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownRight size={20} color="#ef4444" />
            </div>
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '2rem', borderTop: `3px solid ${data.net >= 0 ? '#06b6d4' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>NET CASH POSITION</p>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: data.net >= 0 ? '#06b6d4' : '#ef4444', margin: '0.5rem 0 0' }}>৳{data.net.toLocaleString()}</h2>
              <p style={{ fontSize: '0.75rem', color: data.net >= 0 ? '#10b981' : '#ef4444', marginTop: '0.3rem' }}>{data.net >= 0 ? 'Positive cash position' : 'Negative cash position'}</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: data.net >= 0 ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.net >= 0 ? <TrendingUp size={20} color="#06b6d4" /> : <TrendingDown size={20} color="#ef4444" />}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Representation */}
      <div className="glass-morphism" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '2rem' }}>Cash Flow Waterfall</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3rem', height: '250px' }}>
          {/* Inflow bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: `${Math.min((data.inflows / Math.max(data.inflows, data.outflows, 1)) * 200, 200)}px`, background: 'linear-gradient(180deg, #10b981, #059669)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s' }}></div>
            <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', marginTop: '0.5rem' }}>৳{(data.inflows / 100000).toFixed(1)}L</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Inflows</p>
          </div>
          {/* Outflow bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: `${Math.min((data.outflows / Math.max(data.inflows, data.outflows, 1)) * 200, 200)}px`, background: 'linear-gradient(180deg, #ef4444, #dc2626)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s' }}></div>
            <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', marginTop: '0.5rem' }}>৳{(data.outflows / 100000).toFixed(1)}L</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Outflows</p>
          </div>
          {/* Net bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: `${Math.min((Math.abs(data.net) / Math.max(data.inflows, data.outflows, 1)) * 200, 200)}px`, background: data.net >= 0 ? 'linear-gradient(180deg, #06b6d4, #0891b2)' : 'linear-gradient(180deg, #ef4444, #dc2626)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s' }}></div>
            <p style={{ fontSize: '0.8rem', color: data.net >= 0 ? '#06b6d4' : '#ef4444', fontWeight: '700', marginTop: '0.5rem' }}>৳{(Math.abs(data.net) / 100000).toFixed(1)}L</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Net</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
