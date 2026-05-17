import React from 'react';
import '../../styles/GlobalStyles.css';

const Badge = ({ children, variant = 'primary', style, className = '' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' };
      case 'warning': return { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' };
      case 'danger': return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' };
      case 'accent': return { background: 'rgba(129, 140, 248, 0.1)', color: 'var(--accent)' };
      default: return { background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' };
    }
  };

  return (
    <span 
      className={`stitch-badge ${className}`}
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...getStyles(),
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
