import React, { useState, useEffect } from 'react';
import { Loader2, BarChart3, FileText, Users, Shield, DollarSign } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const ReportsHub = () => {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('pl');
  const [profitLoss, setProfitLoss] = useState({});
  const [incomeExpense, setIncomeExpense] = useState({});
  const [studentIncome, setStudentIncome] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => { fetchReport(); }, [activeReport]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (activeReport === 'pl') {
        const res = await api.get('/finance/profit-loss');
        setProfitLoss(res.data);
      } else if (activeReport === 'ie') {
        const res = await api.get('/finance/income-expense');
        setIncomeExpense(res.data);
      } else if (activeReport === 'student') {
        const res = await api.get('/finance/student-income');
        setStudentIncome(res.data);
      } else if (activeReport === 'audit') {
        const res = await api.get('/accounting/audit-log');
        setAuditLogs(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const reports = [
    { id: 'pl', name: 'Profit & Loss', icon: <BarChart3 size={16} /> },
    { id: 'ie', name: 'Income vs Expense', icon: <DollarSign size={16} /> },
    { id: 'student', name: 'Student-wise Income', icon: <Users size={16} /> },
    { id: 'audit', name: 'Audit Logs', icon: <Shield size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem' }}>Reports Hub</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Generate detailed financial reports and audit trails</p>
      </div>

      {/* Tab Nav */}
      <div className="glass-morphism" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} style={{
            padding: '0.7rem 1.2rem', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: activeReport === r.id ? 'var(--primary)' : 'transparent',
            color: activeReport === r.id ? '#000' : 'var(--text-dim)'
          }}>
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" size={48} /></div>
      ) : (
        <>
          {/* P&L Report */}
          {activeReport === 'pl' && (
            <div className="glass-morphism" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3>Profit & Loss Statement</h3>
                <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>📄 Export PDF</button>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>REVENUE</h4>
                {profitLoss.revenueBreakdown?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <span>{item.name}</span><span style={{ fontWeight: '600' }}>৳{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>Total Revenue</span>
                  <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>৳{(profitLoss.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>EXPENSES</h4>
                {profitLoss.expenseBreakdown?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <span>{item.name}</span><span style={{ fontWeight: '600' }}>৳{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>Total Expenses</span>
                  <span style={{ fontWeight: '800', color: '#ef4444', fontSize: '1.1rem' }}>৳{(profitLoss.totalExpenses || 0).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.3)' }}>
                <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#06b6d4' }}>NET PROFIT</span>
                <span style={{ fontWeight: '900', fontSize: '1.5rem', color: '#06b6d4' }}>৳{(profitLoss.netProfit || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Income vs Expense */}
          {activeReport === 'ie' && (
            <div className="glass-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '2rem' }}>Income vs Expense Statement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Income</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>৳{(incomeExpense.totalIncome || 0).toLocaleString()}</h2>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Expense</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>৳{(incomeExpense.totalExpense || 0).toLocaleString()}</h2>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(6,182,212,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Surplus</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4' }}>৳{(incomeExpense.surplus || 0).toLocaleString()}</h2>
                </div>
              </div>
              <h4 style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.85rem' }}>EXPENSE CATEGORY SPLIT</h4>
              {incomeExpense.expenseSplit?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  <span>{item.category}</span><span style={{ fontWeight: '600' }}>৳{parseFloat(item.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Student-wise */}
          {activeReport === 'student' && (
            <div className="glass-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Student-wise Income Report</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                <span>#</span><span>STUDENT</span><span>PAYMENTS</span><span>TOTAL PAID</span>
              </div>
              {studentIncome.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No student payment data available yet.</p>
              ) : studentIncome.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{i + 1}</span>
                  <span style={{ fontWeight: '500' }}>{row.Enrollment?.Student?.User?.name || 'Unknown'}</span>
                  <span>{row.dataValues?.payment_count || 0}</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>৳{parseFloat(row.dataValues?.total_paid || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Audit Logs */}
          {activeReport === 'audit' && (
            <div className="glass-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Audit Trail</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 0.8fr 2fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                <span>TIMESTAMP</span><span>USER</span><span>ACTION</span><span>ENTITY</span><span>DETAILS</span>
              </div>
              {auditLogs.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No audit logs recorded yet. Actions will be tracked automatically.</p>
              ) : auditLogs.map((log, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 0.8fr 2fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(log.created_at).toLocaleString()}</span>
                  <span>{log.User?.name || 'System'}</span>
                  <span style={{ fontWeight: '500' }}>{log.action}</span>
                  <span><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', background: 'var(--glass)', fontWeight: '600' }}>{log.entity}</span></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{log.new_value ? JSON.stringify(log.new_value).substring(0, 60) + '...' : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsHub;
