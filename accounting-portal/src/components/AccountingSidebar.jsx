import React from 'react';
import { 
  LayoutDashboard, DollarSign, RefreshCw, BookOpen, FileText, LogOut, ChevronRight,
  Sun, Moon, CreditCard, Receipt, Wallet, BarChart3, PieChart, TrendingUp, ScrollText, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const AccountingSidebar = () => {
  const { user, branch, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    {
      label: '',
      items: [
        { name: 'PTE Engine', icon: <BarChart3 size={18} />, path: '/pte', badge: 'Live' },
        { name: 'Attendance', icon: <ScrollText size={18} />, path: '/attendance' },
      ]
    },
    {
      label: 'FINANCE',
      items: [
        { name: 'POS & Fees', icon: <CreditCard size={18} />, path: '/pos-fees', badge: '5' },
        { name: 'Accounts Overview', icon: <LayoutDashboard size={18} />, path: '/' },
        { name: 'General Ledger', icon: <BookOpen size={18} />, path: '/ledger' },
        { name: 'Invoices', icon: <FileText size={18} />, path: '/invoices', badge: '4' },
        { name: 'Expense Manager', icon: <Wallet size={18} />, path: '/expenses' },
        { name: 'Budget Tracker', icon: <PieChart size={18} />, path: '/budget' },
        { name: 'Cash Flow', icon: <TrendingUp size={18} />, path: '/cashflow' },
      ]
    },
    {
      label: 'REPORTS',
      items: [
        { name: 'Reports Hub', icon: <BarChart3 size={18} />, path: '/reports' },
      ]
    }
  ];

  return (
    <aside className="sidebar glass-morphism">
      <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem', color: '#000' }}>RT</div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.5px', margin: 0 }}>RENETECH</h2>
            <p style={{ fontSize: '9px', color: 'var(--text-dim)', margin: 0 }}>Language Academy · Dhaka</p>
          </div>
        </div>
        <div style={{ marginTop: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.65rem', padding: '3px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
          All systems live
        </div>
      </div>

      <nav style={{ padding: '0.8rem', flex: 1, overflowY: 'auto' }}>
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0.8rem 1rem 0.3rem', fontWeight: '600' }}>{section.label}</p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div 
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                    background: isActive ? 'var(--glass)' : 'none',
                    transition: 'all 0.2s', marginBottom: '2px', fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {item.icon}
                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.6rem', padding: '1px 6px', borderRadius: '8px', fontWeight: '700',
                        background: item.badge === 'Live' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: item.badge === 'Live' ? '#10b981' : '#ef4444'
                      }}>{item.badge}</span>
                    )}
                    {isActive && <ChevronRight size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', margin: 0 }}>{user?.name || 'Accountant'}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', margin: 0 }}>Branch: {branch || 'HQ'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <LogOut size={16} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={logout} />
        </div>
      </div>
    </aside>
  );
};

export default AccountingSidebar;
