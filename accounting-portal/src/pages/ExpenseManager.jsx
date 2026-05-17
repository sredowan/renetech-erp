import React, { useState, useEffect } from 'react';
import { Loader2, Wallet, Plus, ChevronRight, Trash2 } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const ExpenseManager = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [split, setSplit] = useState({ split: [], grandTotal: 0 });
  const [activeTab, setActiveTab] = useState('expenses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ account_id: '', amount: '', description: '', category: '', payment_method: 'cash', date: '' });
  const [catForm, setCatForm] = useState({ name: '', parent_id: '', description: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, accRes, splitRes, catRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/accounting/accounts').catch(() => ({ data: [] })),
        api.get('/expenses/split'),
        api.get('/expenses/categories').catch(() => ({ data: [] }))
      ]);
      setExpenses(expRes.data);
      setAccounts(accRes.data.filter(a => a.type === 'expense'));
      setSplit(splitRes.data);
      setCategories(catRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses', form);
      setIsModalOpen(false);
      setForm({ account_id: '', amount: '', description: '', category: '', payment_method: 'cash', date: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses/categories', catForm);
      setCatForm({ name: '', parent_id: '', description: '' });
      setShowCatForm(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Deactivate this category and all sub-categories?')) return;
    try { await api.delete(`/expenses/categories/${id}`); fetchData(); } catch (err) { alert('Failed'); }
  };

  const catColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Expense Manager</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Track, categorize, and approve all branch expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setActiveTab(activeTab === 'categories' ? 'expenses' : 'categories')} style={{ fontSize: '0.8rem' }}>
            {activeTab === 'categories' ? '← Expenses' : '⚙ Categories'}
          </button>
          {activeTab === 'expenses' && <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.8rem' }}>+ Record Expense</button>}
          {activeTab === 'categories' && <button className="btn-primary" onClick={() => setShowCatForm(!showCatForm)} style={{ fontSize: '0.8rem' }}>+ Add Category</button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL EXPENSES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>৳{(split.grandTotal || 0).toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>APPROVED</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{expenses.filter(e => e.status === 'approved').length}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CATEGORIES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{categories.length} heads</h2>
        </div>
      </div>

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <>
          {/* Split + Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Category Split */}
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Category Breakdown</h3>
              {split.split?.map((item, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{item.category}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>৳{item.total.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: catColors[i % catColors.length], borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expense Table */}
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recent Expenses</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 1fr 0.8fr 0.8fr 0.8fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                <span>DATE</span><span>DESCRIPTION</span><span>CATEGORY</span><span>AMOUNT</span><span>METHOD</span><span>STATUS</span>
              </div>
              {expenses.slice(0, 20).map((exp, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 1fr 0.8fr 0.8fr 0.8fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(exp.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                  <span>{exp.description}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{exp.category || exp.Account?.name}</span>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>৳{parseFloat(exp.amount).toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem' }}>{exp.payment_method}</span>
                  <span><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', background: exp.status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: exp.status === 'approved' ? '#10b981' : '#f59e0b' }}>{exp.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <>
          {showCatForm && (
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Add Expense Category</h3>
              <form onSubmit={handleCreateCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Category Name</label>
                  <input required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="e.g. Office Rent"
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Parent (Head) — leave empty for new head</label>
                  <select value={catForm.parent_id} onChange={e => setCatForm({...catForm, parent_id: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                    <option value="">— None (Expense Head) —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                  <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Optional"
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '0.7rem 1.5rem' }}>{submitting ? 'Saving...' : 'Add'}</button>
              </form>
            </div>
          )}

          <div className="glass-morphism" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Expense Category Tree</h3>
            {categories.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>No categories yet. Click "+ Add Category" to create your first Expense Head.</p>
            ) : categories.map((head, i) => (
              <div key={head.id} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: `${catColors[i % catColors.length]}10`, borderRadius: '8px', borderLeft: `4px solid ${catColors[i % catColors.length]}` }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>📁 {head.name}</p>
                    {head.description && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{head.description}</p>}
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '700', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>HEAD</span>
                  </div>
                  <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.5 }} onClick={() => handleDeleteCategory(head.id)} />
                </div>
                {head.Children?.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem 0.8rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ChevronRight size={14} color="var(--text-dim)" />
                      <span style={{ fontSize: '0.85rem' }}>{sub.name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '700', background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>SUB</span>
                    </div>
                    <Trash2 size={12} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.4 }} onClick={() => handleDeleteCategory(sub.id)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsModalOpen(false)}>
          <div className="glass-morphism" style={{ padding: '2rem', width: '500px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Record New Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select required value={form.account_id} onChange={e => setForm({...form, account_id: e.target.value, category: accounts.find(a => a.id == e.target.value)?.name || ''})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                <option value="">Select Expense Category</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>)}
              </select>
              <input required type="number" placeholder="Amount (BDT)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', height: '80px' }} />
              <select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                <option value="cash">Cash</option><option value="bkash">bKash</option><option value="bank_transfer">Bank Transfer</option><option value="card">Card</option>
              </select>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem' }}>{submitting ? 'Saving...' : 'Record Expense'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
