import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import '../styles/GlobalStyles.css';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="var(--success)" />;
      case 'alert': return <AlertTriangle size={20} color="var(--danger)" />;
      default: return <Info size={20} color="var(--primary)" />;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 size={32} className="animate-spin" color="var(--primary)" />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'white', fontWeight: '600' }}>Inbox</h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          {notifications.filter(n => !n.is_read).length} Unread
        </span>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-dim)' }}>You're all caught up! No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="glass-morphism" 
              style={{ 
                padding: '1.2rem', 
                display: 'flex', 
                gap: '1.5rem', 
                alignItems: 'flex-start',
                opacity: notif.is_read ? 0.7 : 1,
                borderLeft: !notif.is_read ? '3px solid var(--primary)' : '1px solid var(--border)',
                cursor: !notif.is_read ? 'pointer' : 'default'
              }}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}>
                {getIcon(notif.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <h4 style={{ color: 'white', fontSize: '1rem' }}>{notif.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
