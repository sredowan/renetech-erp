import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Receipt, AlertTriangle, DollarSign, FileText, PieChart } from 'lucide-react';
import api from '../services/api';
import QuickCheckIn from '../components/QuickCheckIn';
import '../styles/GlobalStyles.css';

const KPICard = ({ label, value, subtitle, color, borderColor }) => (
  <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: `3px solid ${borderColor || 'var(--primary)'}`, position: 'relative' }}>
    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</p>
    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: color || 'var(--text)', margin: 0 }}>৳{typeof value === 'number' ? value.toLocaleString() : value}</h2>
    {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{subtitle}</p>}
  </div>
);

const FinanceHub = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});
  const [profitLoss, setProfitLoss] = useState({});
  const [expenseSplit, setExpenseSplit] = useState({ split: [], grandTotal: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [overviewRes, plRes, splitRes] = await Promise.all([
        api.get('/finance/overview'),
        api.get('/finance/profit-loss'),
        api.get('/expenses/split')
      ]);
      setOverview(overviewRes.data);
      setProfitLoss(plRes.data);
      setExpenseSplit(splitRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  const expenseColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Breadcrumb + Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Finance &gt; Accounts Overview</p>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>Accounts Overview</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Full financial cockpit · P&L · Balance Sheet · YTD Snapshot</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>+ Journal Entry</button>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>📊 Export Excel</button>
          <button className="btn-primary" style={{ fontSize: '0.8rem', background: '#ef4444' }}>📄 PDF Report</button>
        </div>
      </div>

      <QuickCheckIn />

      {/* KPI Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <KPICard label="REVENUE · YTD" value={overview.revenue || 0} subtitle="↑ 18% vs last year" color="#10b981" borderColor="#10b981" />
        <KPICard label="EXPENSES · YTD" value={overview.expenses || 0} subtitle="↑ 6% vs last year" color="#f59e0b" borderColor="#f59e0b" />
        <KPICard label="NET PROFIT · YTD" value={overview.netProfit || 0} subtitle="50% margin" color="#06b6d4" borderColor="#06b6d4" />
        <KPICard label="RECEIVABLES DUE" value={overview.receivablesDue || 0} subtitle={`৳${(overview.overdueReceivables || 0).toLocaleString()} overdue`} color="#ef4444" borderColor="#ef4444" />
      </div>

      {/* KPI Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL INVOICES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{overview.totalInvoices || 0}</h2>
          <p style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{overview.unpaidInvoices || 0} unpaid</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>FEE COLLECTED</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>৳{(overview.feeCollected || 0).toLocaleString()}</h2>
          <p style={{ fontSize: '0.75rem', color: '#10b981' }}>↑ 8.4%</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SALARY EXPENSE</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>৳{(overview.salaryExpense || 0).toLocaleString()}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>62% of expenses</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SCHOLARSHIP GIVEN</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>৳{(overview.scholarshipGiven || 0).toLocaleString()}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>impact: -৳{((overview.scholarshipGiven || 0) / 1000).toFixed(0)}K revenue</p>
        </div>
      </div>

      {/* P&L + Expense Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Profit & Loss */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Profit & Loss — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--primary)', color: '#000', fontWeight: '600' }}>{new Date().toLocaleString('default', { month: 'short' })}</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--glass)', color: 'var(--text-dim)' }}>Period ▾</span>
            </div>
          </div>
          
          {/* Revenue */}
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>💰 Gross Revenue (Fee Collected)</span>
            <span style={{ fontWeight: '700', color: '#10b981' }}>৳{(profitLoss.totalRevenue || 0).toLocaleString()}</span>
          </div>
          
          {/* Revenue Breakdown */}
          {profitLoss.revenueBreakdown?.map((item, i) => (
            <div key={i} style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{item.name}</span>
              <span style={{ fontWeight: '600' }}>৳{item.amount.toLocaleString()}</span>
            </div>
          ))}

          {/* Expenses */}
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', marginTop: '1rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontWeight: '600' }}>🔥 Less: Total Expenses</span>
            <span style={{ fontWeight: '700', color: '#ef4444' }}>— ৳{(profitLoss.totalExpenses || 0).toLocaleString()}</span>
          </div>

          {profitLoss.expenseBreakdown?.map((item, i) => (
            <div key={i} style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{item.name}</span>
              <span style={{ fontWeight: '600' }}>— ৳{item.amount.toLocaleString()}</span>
            </div>
          ))}

          {/* Net */}
          <div style={{ padding: '1.2rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(6,182,212,0.3)' }}>
            <span style={{ color: '#06b6d4', fontWeight: '700', fontSize: '1.1rem' }}>Net Profit</span>
            <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#06b6d4' }}>৳{(profitLoss.netProfit || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Expense Split */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Expense Split</h3>
          {/* Simple donut visualization */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(${expenseSplit.split?.map((e, i) => `${expenseColors[i % expenseColors.length]} ${expenseSplit.split.slice(0, i).reduce((s, x) => s + parseFloat(x.percentage), 0)}% ${expenseSplit.split.slice(0, i + 1).reduce((s, x) => s + parseFloat(x.percentage), 0)}%`).join(', ') || '#333 0% 100%'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>৳{((expenseSplit.grandTotal || 0) / 100000).toFixed(1)}L</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Total</span>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {expenseSplit.split?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: expenseColors[i % expenseColors.length] }}></span>
                  <span style={{ fontSize: '0.85rem' }}>{item.category}</span>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceHub;
