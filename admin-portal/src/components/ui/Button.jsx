import React from 'react';
import '../../styles/GlobalStyles.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  disabled = false, 
  loading = false,
  style,
  className = '',
  type = 'button'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary)',
          color: 'var(--bg-deep)',
          boxShadow: '0 4px 14px 0 var(--primary-glow)'
        };
      case 'secondary':
        return {
          background: 'var(--glass)',
          color: 'white',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--primary)',
          border: '1px solid var(--primary)',
        };
      case 'danger':
        return {
          background: 'rgba(239, 64, 64, 0.2)',
          color: '#ef4444',
          border: '1px solid rgba(239, 64, 64, 0.3)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-dim)',
          padding: '0.4rem 0.8rem'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '0.4rem 0.8rem', fontSize: '0.75rem' };
      case 'lg': return { padding: '0.8rem 1.8rem', fontSize: '1rem' };
      default: return { padding: '0.6rem 1.2rem', fontSize: '0.875rem' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`stitch-button ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        borderRadius: 'var(--radius)',
        fontWeight: '600',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {loading ? (
        <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
