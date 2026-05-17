import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Download } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const Invoices = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [aging, setAging] = useState({ aging: [], totalReceivable: 0 });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [invRes, statsRes, agingRes] = await Promise.all([
        api.get('/invoices'), api.get('/invoices/stats'), api.get('/invoices/aging')
      ]);
      setInvoices(invRes.data);
      setStats(statsRes.data);
      setAging(agingRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredInvoices = activeFilter === 'all' ? invoices : invoices.filter(inv => inv.status === activeFilter);
  const statusColor = (s) => ({ paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444', partial: '#3b82f6', draft: '#64748b' }[s] || '#666');

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Finance &gt; Invoice Management</p>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>Invoice Management</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{stats.totalCount || 0} total · {stats.overdueCount || 0} overdue · Auto-generated on enrollment</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>Bulk Export</button>
          <button className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Create Invoice</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.2rem', borderTop: '3px solid #06b6d4' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL INVOICED</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>৳{(stats.totalInvoiced || 0).toLocaleString()}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{stats.totalCount || 0} invoices</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.2rem', borderTop: '3px solid #10b981' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PAID</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>৳{(stats.totalPaid || 0).toLocaleString()}</h3>
          <p style={{ fontSize: '0.7rem', color: '#10b981' }}>{stats.collectionRate || 0}% collected</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.2rem', borderTop: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PENDING</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>৳{(stats.pendingAmount || 0).toLocaleString()}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{stats.pendingCount || 0} invoices</p>
        </div>
        <div className="glass-morphism" style={{ padding: '1.2rem', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>OVERDUE</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>৳{(stats.overdueAmount || 0).toLocaleString()}</h3>
          <p style={{ fontSize: '0.7rem', color: '#ef4444' }}>{stats.overdueCount || 0} invoices</p>
        </div>
      </div>

      {/* Filter Tabs + Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['all', 'paid', 'pending', 'overdue', 'draft'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                background: activeFilter === f ? 'var(--primary)' : 'var(--glass)', color: activeFilter === f ? '#000' : 'var(--text-dim)'
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${invoices.length})` : `(${invoices.filter(i => i.status === f).length})`}
              </button>
            ))}
          </div>

          {filteredInvoices.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No invoices found. Invoices are auto-generated when students enroll.</p>
          ) : filteredInvoices.map((inv, i) => (
            <div key={i} className="glass-morphism" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{inv.invoice_no}</p>
                <p style={{ fontWeight: '600' }}>{inv.Student?.User?.name || 'Student'} · {inv.Enrollment?.Course?.title || 'Course'}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Issued {new Date(inv.issued_at).toLocaleDateString()} · Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>৳{parseFloat(inv.amount).toLocaleString()}</p>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '700', background: `${statusColor(inv.status)}20`, color: statusColor(inv.status), textTransform: 'capitalize' }}>{inv.status === 'paid' && '✓ '}{inv.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Aging Analysis */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Aging Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aging.aging?.map((range, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--glass)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: i === 0 ? '#10b981' : i === 3 ? '#ef4444' : 'var(--text)' }}>{range.label}</span>
                <span style={{ fontWeight: '700', color: i === 0 ? '#10b981' : i === 3 ? '#ef4444' : 'var(--text)' }}>৳{range.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(6,182,212,0.3)' }}>
              <span style={{ fontWeight: '600' }}>Total Receivable</span>
              <span style={{ fontWeight: '800', color: '#06b6d4' }}>৳{(aging.totalReceivable || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
