import React from 'react';
import '../../styles/GlobalStyles.css';

const Input = ({ 
  label, 
  icon, 
  error, 
  className = '', 
  style,
  containerStyle,
  ...props 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', ...containerStyle }}>
      {label && <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex' }}>
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`glass-input ${className}`}
          style={{
            width: '100%',
            padding: icon ? '0.8rem 1rem 0.8rem 2.8rem' : '0.8rem 1.2rem',
            background: 'var(--glass)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
            ...style
          }}
        />
      </div>
      {error && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{error}</p>}
    </div>
  );
};

export default Input;
