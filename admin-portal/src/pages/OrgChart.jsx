import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const OrgChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        const res = await api.get('/hrm/org-chart');
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrgChart();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  // Group by department
  const departments = {};
  data.forEach(person => {
    const dept = person.department || 'General';
    if (!departments[dept]) departments[dept] = [];
    departments[dept].push(person);
  });

  const DEPT_COLORS = ['#00D4FF', '#00FF94', '#FFB347', '#9B6DFF', '#FF4D6D', '#38E8FF'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={24} /> Organization Chart</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Visual staff hierarchy by department</p>
      </div>

      {/* Stat bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(departments).map(([dept, members], i) => (
          <div key={dept} style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: `${DEPT_COLORS[i % DEPT_COLORS.length]}10`, border: `1px solid ${DEPT_COLORS[i % DEPT_COLORS.length]}25` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: DEPT_COLORS[i % DEPT_COLORS.length] }}>{dept}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({members.length})</span>
          </div>
        ))}
      </div>

      {/* Department Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(departments).map(([dept, members], deptIdx) => (
          <div key={dept} className="glass-morphism" style={{ padding: '1.5rem', borderTop: `3px solid ${DEPT_COLORS[deptIdx % DEPT_COLORS.length]}` }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: DEPT_COLORS[deptIdx % DEPT_COLORS.length] }}>{dept}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {members.map(person => (
                <div key={person.id} style={{
                  padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${DEPT_COLORS[deptIdx % DEPT_COLORS.length]}, ${DEPT_COLORS[(deptIdx + 1) % DEPT_COLORS.length]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800', fontSize: '1rem',
                  }}>
                    {person.name?.[0]}
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{person.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{person.designation}</p>
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)',
                  }}>
                    {person.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
