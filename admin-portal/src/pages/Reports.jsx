import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe, 
  Download, 
  RefreshCw,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import '../styles/GlobalStyles.css';

const VisualBar = ({ label, value, max, color }) => {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontWeight: '600' }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: '8px', background: 'var(--glass)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          background: color, 
          boxShadow: `0 0 10px ${color}`,
          transition: 'width 1s ease-out'
        }}></div>
      </div>
    </div>
  );
};

const GlobalReports = () => {
  const [comparison, setComparison] = useState([]);
  const [trends, setTrends] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, trendRes, sourceRes] = await Promise.all([
        api.get('/reports/comparison'),
        api.get('/reports/trends'),
        api.get('/reports/sources')
      ]);
      setComparison(compRes.data);
      setTrends(trendRes.data);
      setSources(sourceRes.data);
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = comparison.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalStudents = comparison.reduce((acc, curr) => acc + curr.students, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Global Intelligence Hub</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Consolidated multi-branch performance analytics & trends</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" icon={<RefreshCw size={18} />} onClick={fetchData}>Refresh</Button>
          <Button icon={<Download size={18} />}>Export Financials</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '10rem', textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
          <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Aggregating global datasets...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <Card title="Total Organization Revenue" subtitle="Active FY2026" icon={<DollarSign size={20} />}>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>৳{totalRevenue.toLocaleString()}</h1>
              <Badge variant="success" style={{ marginTop: '0.5rem' }}>+12.4% Global Growth</Badge>
            </Card>
            <Card title="Global Student Pool" subtitle="Consolidated" icon={<Users size={20} />}>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{totalStudents.toLocaleString()}</h1>
              <Badge variant="primary" style={{ marginTop: '0.5rem' }}>{comparison.length} Branches Active</Badge>
            </Card>
            <Card title="Avg Conversion Rate" subtitle="Lead to Student" icon={<TrendingUp size={20} />}>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{(totalStudents / (comparison.reduce((a,c)=>a+c.leads,0) || 1) * 100).toFixed(1)}%</h1>
              <Badge variant="warning" style={{ marginTop: '0.5rem' }}>Optimizing Stages</Badge>
            </Card>
            <Card title="Network Health" subtitle="Branch Connectivity" icon={<Globe size={20} />}>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Stable</h1>
              <Badge variant="success" style={{ marginTop: '0.5rem' }}>All Systems Online</Badge>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            {/* Branch Comparison Table */}
            <Card title="Branch-wise Performance Comparison">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>BRANCH NAME</th>
                      <th style={{ padding: '1rem 0.5rem' }}>REVENUE</th>
                      <th style={{ padding: '1rem 0.5rem' }}>STUDENTS</th>
                      <th style={{ padding: '1rem 0.5rem' }}>LEADS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{b.name}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--success)', fontWeight: '700' }}>৳{b.revenue.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{b.students}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{b.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Lead Source Analytics */}
            <Card title="Lead Acquisition Channels" icon={<PieChart size={20} />}>
               <div style={{ marginTop: '1rem' }}>
                 {sources.map((s, i) => (
                   <VisualBar 
                    key={s.source} 
                    label={s.source || 'Other'} 
                    value={parseInt(s.count)} 
                    max={Math.max(...sources.map(sr => parseInt(sr.count)))} 
                    color={['var(--primary)', 'var(--accent)', 'var(--success)', 'var(--warning)'][i % 4]}
                   />
                 ))}
               </div>
            </Card>
          </div>

          {/* Growth Trend Chart (Modern Minimalist Area Chart Simulation) */}
          <Card title="Enterprise Monthly Growth Trend" subtitle="Revenue (৳) vs Leads over 6 Months">
            <div style={{ height: '300px', padding: '2rem 1rem 1rem', display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
               {trends.map((t, i) => {
                 const maxRev = Math.max(...trends.map(tr => tr.revenue)) || 1;
                 const h = (t.revenue / maxRev) * 200;
                 return (
                   <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ 
                        width: '100%', 
                        height: `${h}px`, 
                        background: 'linear-gradient(to top, var(--primary), var(--primary-glow))',
                        opacity: 0.6 + (i * 0.08),
                        borderRadius: '6px 6px 0 0',
                        position: 'relative',
                        transition: 'height 1s'
                      }}>
                        <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          ৳{(t.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{t.name}</span>
                   </div>
                 );
               })}
            </div>
          </Card>

          {/* Financial Reports Quick Access */}
          <Card title="Financial Reports" subtitle="Jump into detailed financial analysis" icon={<DollarSign size={20} />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              {[
                { title: 'Profit & Loss', desc: 'Revenue vs expenses breakdown', badge: 'P&L', color: '#10b981' },
                { title: 'Trial Balance', desc: 'Debit & credit verification', badge: 'TB', color: '#06b6d4' },
                { title: 'Cash Flow', desc: 'Inflows vs outflows analysis', badge: 'CF', color: '#3b82f6' },
                { title: 'Student Income', desc: 'Per-student revenue report', badge: 'SI', color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} className="glass-morphism" style={{ padding: '1.2rem', cursor: 'pointer', transition: 'all 0.2s', borderTop: `3px solid ${item.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.8rem' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', background: `${item.color}20`, color: item.color }}>{item.badge}</span>
                    <ArrowUpRight size={14} color="var(--text-dim)" />
                  </div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default GlobalReports;
