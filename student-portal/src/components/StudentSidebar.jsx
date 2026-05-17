import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  LogOut,
  Bell,
  Clock,
  UserCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
    { name: 'My Schedule', icon: <Calendar size={20} />, id: 'schedule' },
    { name: 'PTE Practice', icon: <FileText size={20} />, id: 'pte' },
    { name: 'Attendance', icon: <Clock size={20} />, id: 'attendance' },
    { name: 'Notifications', icon: <Bell size={20} />, id: 'notifications' },
    { name: 'Community', icon: <Users size={20} />, id: 'community' },
    { name: 'My Profile', icon: <UserCircle2 size={20} />, id: 'profile' },
  ];

  const isActive = (id) => location.pathname.includes(id);

  const handleNavigate = (id) => navigate(`/${id}`);

  return (
    <>
      <aside className="student-sidebar glass-morphism">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '1.2rem', fontWeight: '800' }}>LANGUAGE ACADEMY</h2>
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Portal</p>
        </div>

        <nav style={{ padding: '1rem' }}>
          {menuItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: isActive(item.id) ? 'var(--primary)' : 'var(--text-dim)',
                background: isActive(item.id) ? 'var(--glass)' : 'transparent',
                transition: 'all 0.2s',
                marginBottom: '0.5rem'
              }}
            >
              {item.icon}
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</span>
            </div>
          ))}
        </nav>

        <div style={{
          position: 'absolute',
          bottom: '0',
          width: '100%',
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ 
              width: '35px', 
              height: '35px', 
              background: 'var(--accent)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user?.name?.[0] || 'S'}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Student</p>
            </div>
          </div>
          <LogOut 
            size={18} 
            style={{ cursor: 'pointer', color: 'var(--text-dim)' }} 
            onClick={logout}
          />
        </div>
      </aside>

      <nav className="mobile-tabbar glass-morphism">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-tab ${isActive(item.id) ? 'active' : ''}`}
            onClick={() => handleNavigate(item.id)}
          >
            {item.icon}
            <span>{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default StudentSidebar;
