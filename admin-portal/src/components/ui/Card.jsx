import React from 'react';
import '../../styles/GlobalStyles.css';

const Card = ({ children, title, subtitle, icon, style, className = '', hover = true }) => {
  return (
    <div 
      className={`glass-morphism ${hover ? 'transition-hover' : ''} ${className}`}
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        ...style
      }}
    >
      {(title || icon) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            {title && <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{subtitle}</p>}
          </div>
          {icon && <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{icon}</div>}
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      
      {/* Decorative Blur Background */}
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        background: 'var(--primary)',
        filter: 'blur(40px)',
        opacity: '0.05',
        zIndex: '0',
        pointerEvents: 'none'
      }}></div>
    </div>
  );
};

export default Card;
