import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import '../styles/GlobalStyles.css';

const ScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/schedule');
      setSchedule(response.data);
    } catch (err) {
      setError('Failed to fetch schedule');
    } finally {
      setLoading(false);
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
        <h2 style={{ color: 'white', fontWeight: '600' }}>Weekly Class Schedule</h2>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {schedule.length === 0 ? (
        <div className="glass-morphism" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)' }}>No classes scheduled at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {schedule.map((session) => (
            <div key={session.id} className="glass-morphism" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>
                  {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="badge-primary" style={{ fontSize: '0.7rem' }}>
                  {session.Batch?.name}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>Language Session</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span>{session.Room?.name} ({session.Room?.floor})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
