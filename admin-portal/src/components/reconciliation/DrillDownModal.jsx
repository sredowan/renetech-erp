import React from 'react';
import { X } from 'lucide-react';

const money = (v) => `BDT ${Number(v || 0).toLocaleString()}`;
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '-');

const DrillDownModal = ({ isOpen, onClose, title, data, accountName }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 800 }}>{title}</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Detailed break-down for <strong>{accountName}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(148,163,184,0.1)' }}>
                <th style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ref / Source</th>
                <th style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Details</th>
                <th style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem', color: '#e2e8f0', fontSize: '0.85rem' }}>{fmtDate(item.movement_date)}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {item.transaction_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>{item.reference || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>{item.remarks || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <strong style={{ color: item.direction === 'inflow' ? '#10b981' : '#ef4444' }}>
                      {item.direction === 'outflow' ? '-' : ''}{money(item.amount)}
                    </strong>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No transactions found for this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1.5rem 2rem', background: 'rgba(148,163,184,0.03)', borderTop: '1px solid rgba(148,163,184,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Total Category Volume</p>
            <h4 style={{ color: '#f8fafc', fontSize: '1.25rem', margin: 0 }}>{money(data.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;
