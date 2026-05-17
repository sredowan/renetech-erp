import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Download, Calendar, CreditCard } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const CashFlow = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ inflows: 0, outflows: 0, net: 0, inflowRows: [], outflowRows: [], inflowByCategory: [], outflowByCategory: [], inflowByMethod: [], dailyNet: [], inflowCount: 0, outflowCount: 0 });
  const [activeView, setActiveView] = useState('overview'); // overview | inflows | outflows | daily
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.get('/finance/cashflow', { params });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const applyFilter = () => fetchData();

  const inputStyle = { padding: '0.5rem 0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem' };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  const maxBar = Math.max(data.inflows, data.outflows, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Finance &gt; Cash Flow</p>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>Cash Flow Statement</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Track every taka coming in and going out · {data.inflowCount + data.outflowCount} transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: 'var(--text-dim)' }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          <button onClick={applyFilter} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}><Filter size={14} /> Filter</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL INFLOWS</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', margin: '0.3rem 0' }}>৳{(data.inflows || 0).toLocaleString()}</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{data.inflowCount || 0} transactions</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={18} color="#10b981" /></div>
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL OUTFLOWS</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', margin: '0.3rem 0' }}>৳{(data.outflows || 0).toLocaleString()}</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{data.outflowCount || 0} expenses</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDownRight size={18} color="#ef4444" /></div>
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: `3px solid ${data.net >= 0 ? '#06b6d4' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>NET CASH FLOW</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: data.net >= 0 ? '#06b6d4' : '#ef4444', margin: '0.3rem 0' }}>৳{(data.net || 0).toLocaleString()}</h2>
              <p style={{ fontSize: '0.72rem', color: data.net >= 0 ? '#10b981' : '#ef4444' }}>{data.net >= 0 ? 'Positive position' : 'Deficit'}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: data.net >= 0 ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.net >= 0 ? <TrendingUp size={18} color="#06b6d4" /> : <TrendingDown size={18} color="#ef4444" />}
            </div>
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #8b5cf6' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>BURN RATE</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', margin: '0.3rem 0' }}>
              {data.inflows > 0 ? `${((data.outflows / data.inflows) * 100).toFixed(0)}%` : '0%'}
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Outflow / Inflow ratio</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'inflows', label: `Inflows (${data.inflowCount || 0})` },
          { key: 'outflows', label: `Outflows (${data.outflowCount || 0})` },
          { key: 'daily', label: 'Daily Trend' }
        ].map(t => (
          <button key={t.key} onClick={() => setActiveView(t.key)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
            background: activeView === t.key ? 'var(--primary)' : 'var(--glass)', color: activeView === t.key ? '#000' : 'var(--text-dim)'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeView === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Waterfall */}
          <div className="glass-morphism" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '2rem' }}>Cash Flow Waterfall</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3rem', height: '200px' }}>
              {[
                { label: 'Inflows', value: data.inflows, color: '#10b981', grad: 'linear-gradient(180deg, #10b981, #059669)' },
                { label: 'Outflows', value: data.outflows, color: '#ef4444', grad: 'linear-gradient(180deg, #ef4444, #dc2626)' },
                { label: 'Net', value: Math.abs(data.net), color: data.net >= 0 ? '#06b6d4' : '#ef4444', grad: data.net >= 0 ? 'linear-gradient(180deg, #06b6d4, #0891b2)' : 'linear-gradient(180deg, #ef4444, #dc2626)' }
              ].map((bar, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '70px', height: `${Math.max((bar.value / maxBar) * 180, 8)}px`, background: bar.grad, borderRadius: '8px 8px 0 0', transition: 'height 0.5s' }}></div>
                  <p style={{ fontSize: '0.78rem', color: bar.color, fontWeight: '700', marginTop: '0.4rem' }}>৳{(bar.value / 1000).toFixed(1)}K</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{bar.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* By payment method */}
          <div className="glass-morphism" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Inflows by Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {(data.inflowByMethod || []).map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--glass)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <CreditCard size={16} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{m.method}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({m.count} txns)</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>৳{m.total.toLocaleString()}</span>
                </div>
              ))}
              {(data.inflowByMethod || []).length === 0 && <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No data</p>}
            </div>
          </div>

          {/* Inflow by category */}
          <div className="glass-morphism" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Inflow by Source</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(data.inflowByCategory || []).map((c, i) => {
                const pct = data.inflows > 0 ? (c.total / data.inflows * 100).toFixed(1) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem' }}>{c.category} <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>({c.count})</span></span>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#10b981' }}>৳{c.total.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--glass)', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outflow by category */}
          <div className="glass-morphism" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Outflow by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(data.outflowByCategory || []).map((c, i) => {
                const pct = data.outflows > 0 ? (c.total / data.outflows * 100).toFixed(1) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem' }}>{c.category} <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>({c.count})</span></span>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#ef4444' }}>৳{c.total.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--glass)', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#ef4444', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ INFLOWS TAB ═══ */}
      {activeView === 'inflows' && (
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>All Inflow Transactions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Receipt', 'Description', 'Category', 'Method', 'Account', 'Amount'].map(h => (
                    <th key={h} style={{ padding: '0.8rem', textAlign: h === 'Amount' ? 'right' : 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.inflowRows || []).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.78rem' }}>{row.receipt_no}</td>
                    <td style={{ padding: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</td>
                    <td style={{ padding: '0.8rem' }}><span style={{ padding: '2px 8px', background: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>{row.category}</span></td>
                    <td style={{ padding: '0.8rem', textTransform: 'uppercase', fontSize: '0.78rem' }}>{row.method}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{row.account}</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: '#10b981' }}>৳{row.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {(data.inflowRows || []).length === 0 && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No inflow transactions found.</td></tr>}
              </tbody>
              {(data.inflowRows || []).length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)' }}>
                    <td colSpan="6" style={{ padding: '0.8rem', fontWeight: '700' }}>Total Inflows</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontSize: '1rem' }}>৳{(data.inflows || 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ═══ OUTFLOWS TAB ═══ */}
      {activeView === 'outflows' && (
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>All Outflow Transactions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Voucher', 'Description', 'Category', 'Method', 'Amount'].map(h => (
                    <th key={h} style={{ padding: '0.8rem', textAlign: h === 'Amount' ? 'right' : 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.outflowRows || []).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.8rem', color: '#ef4444', fontWeight: '600', fontSize: '0.78rem' }}>{row.receipt_no}</td>
                    <td style={{ padding: '0.8rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</td>
                    <td style={{ padding: '0.8rem' }}><span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>{row.category}</span></td>
                    <td style={{ padding: '0.8rem', textTransform: 'uppercase', fontSize: '0.78rem' }}>{row.method}</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: '#ef4444' }}>৳{row.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {(data.outflowRows || []).length === 0 && <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No outflow transactions found.</td></tr>}
              </tbody>
              {(data.outflowRows || []).length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)' }}>
                    <td colSpan="5" style={{ padding: '0.8rem', fontWeight: '700' }}>Total Outflows</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: '#ef4444', fontSize: '1rem' }}>৳{(data.outflows || 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ═══ DAILY TREND ═══ */}
      {activeView === 'daily' && (
        <div className="glass-morphism" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Daily Net Cash Flow</h3>
          {(data.dailyNet || []).length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No daily data available for the selected period.</p>
          ) : (
            <>
              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
                {(data.dailyNet || []).map((d, i) => {
                  const maxVal = Math.max(...(data.dailyNet || []).map(x => Math.abs(x.net)), 1);
                  const h = Math.max((Math.abs(d.net) / maxVal) * 160, 4);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '18px', flex: 1 }} title={`${d.date}: ৳${d.net.toLocaleString()}`}>
                      <div style={{ width: '100%', maxWidth: '24px', height: `${h}px`, background: d.net >= 0 ? '#10b981' : '#ef4444', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }}></div>
                    </div>
                  );
                })}
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Net Cash Flow</th>
                    <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.dailyNet || []).map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.8rem' }}><Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: d.net >= 0 ? '#10b981' : '#ef4444' }}>
                        {d.net >= 0 ? '+' : ''}৳{d.net.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '700', background: d.net >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: d.net >= 0 ? '#10b981' : '#ef4444' }}>
                          {d.net >= 0 ? 'Surplus' : 'Deficit'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CashFlow;
