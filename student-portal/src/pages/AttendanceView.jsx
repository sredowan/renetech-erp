import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const AttendanceView = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance/student/me');
                setAttendance(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-morphism" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>Attendance History</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Track your daily presence and leave records</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {attendance.filter(a => a.status === 'present').length}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Present</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                            {attendance.filter(a => a.status === 'absent').length}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Absent</p>
                    </div>
                </div>
            </div>

            <div className="glass-morphism" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '1.2rem' }}>DATE</th>
                            <th style={{ padding: '1.2rem' }}>BATCH</th>
                            <th style={{ padding: '1.2rem' }}>STATUS</th>
                            <th style={{ padding: '1.2rem' }}>METHOD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map((record) => (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CalendarIcon size={14} color="var(--text-dim)" />
                                        {new Date(record.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>{record.Batch?.code}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {record.status === 'present' ? <CheckCircle size={14} color="var(--success)" /> : 
                                         record.status === 'absent' ? <XCircle size={14} color="var(--danger)" /> :
                                         <Clock size={14} color="var(--warning)" />}
                                        <span style={{ 
                                            textTransform: 'capitalize',
                                            color: record.status === 'present' ? 'var(--success)' : 
                                                   record.status === 'absent' ? 'var(--danger)' : 'var(--warning)'
                                        }}>
                                            {record.status}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{record.method}</td>
                            </tr>
                        ))}
                        {attendance.length === 0 && (
                             <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                    No attendance records found yet.
                                </td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceView;
