import React, { useState, useEffect } from 'react';
import { Loader2, Search, Plus } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const Journal = () => {
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { fetchJournal(); }, []);

  const fetchJournal = async () => {
    try {
      const res = await api.get('/accounting/journal', { params: { search, type: typeFilter } });
      setLines(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchJournal(), 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  // Build running balance
  let runningBalance = 0;
  const enriched = lines.map(line => {
    runningBalance += parseFloat(line.debit || 0) - parseFloat(line.credit || 0);
    return { ...line, balance: runningBalance };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Transaction Journal</h2>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search journal..." style={{ padding: '0.6rem 0.6rem 0.6rem 2.2rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', width: '220px' }} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '0.6rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem' }}>
            <option value="all">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
          <button className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Entry</button>
        </div>
      </div>

      {/* Journal Table */}
      <div className="glass-morphism" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 0.7fr 2fr 1.2fr 1fr 1fr 1fr 0.8fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span>DATE</span><span>REF #</span><span>DESCRIPTION</span><span>ACCOUNT</span><span>DEBIT (DR)</span><span>CREDIT (CR)</span><span>BALANCE</span><span>POSTED BY</span>
        </div>

        {enriched.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No journal entries found. Create your first entry to see transactions here.</p>
        ) : enriched.map((line, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.7fr 0.7fr 2fr 1.2fr 1fr 1fr 1fr 0.8fr', gap: '0.5rem', padding: '0.9rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{line.JournalEntry?.date ? new Date(line.JournalEntry.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '—'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{line.JournalEntry?.ref_no || '—'}</span>
            <div>
              <span style={{ fontWeight: '500' }}>{line.JournalEntry?.description || '—'}</span>
              {line.notes && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>{line.notes}</p>}
            </div>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{line.Account?.name || '—'}</span>
            <span style={{ fontWeight: '600', color: parseFloat(line.debit) > 0 ? '#06b6d4' : 'var(--text-dim)' }}>{parseFloat(line.debit) > 0 ? `৳${parseFloat(line.debit).toLocaleString()}` : '—'}</span>
            <span style={{ fontWeight: '600', color: parseFloat(line.credit) > 0 ? '#10b981' : 'var(--text-dim)' }}>{parseFloat(line.credit) > 0 ? `৳${parseFloat(line.credit).toLocaleString()}` : '—'}</span>
            <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>৳{Math.abs(line.balance).toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{line.JournalEntry?.Poster?.name || 'System'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
