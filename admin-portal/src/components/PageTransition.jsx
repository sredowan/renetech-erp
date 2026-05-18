import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════
   PAGE TRANSITION SYSTEM
   - Top progress bar (NProgress-style) during lazy chunk loading
   - Smooth fade+slide animation between pages
   - Eliminates the ugly "Loading..." text fallback
   ═══════════════════════════════════════════════════════════════════ */

/* ── 1. Top Loading Bar ──────────────────────────────────────────── */
export function TopLoadingBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setVisible(true);
    setProgress(12);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(timerRef.current); return 90; }
        // Slow down as it gets closer — feels natural
        const inc = prev < 30 ? 8 : prev < 50 ? 4 : prev < 70 ? 2 : 0.5;
        return Math.min(prev + inc, 90);
      });
    }, 150);
  }, []);

  const done = useCallback(() => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => { setVisible(false); setProgress(0); }, 350);
  }, []);

  // Expose to window for the Suspense fallback to trigger
  useEffect(() => {
    window.__topbar = { start, done };
    return () => { clearInterval(timerRef.current); delete window.__topbar; };
  }, [start, done]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: '3px', pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #7bc62e 0%, #275fa7 50%, #00D4FF 100%)',
          borderRadius: '0 2px 2px 0',
          transition: progress === 100
            ? 'width 0.2s ease-out'
            : 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 0 12px rgba(123, 198, 46, 0.5), 0 0 4px rgba(39, 95, 167, 0.3)',
        }}
      />
    </div>
  );
}

/* ── 2. Suspense Fallback (triggers the top bar instead of text) ── */
export function SuspenseFallback() {
  useEffect(() => {
    window.__topbar?.start();
    return () => window.__topbar?.done();
  }, []);

  // Return an invisible placeholder that takes up the canvas space
  // This prevents layout jump while the chunk loads
  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--topbar-height, 70px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Subtle skeleton pulse — much more professional than "Loading..." */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.3, width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <div style={{ height: '18px', width: '40%', borderRadius: '6px', background: 'var(--border)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '65%', borderRadius: '4px', background: 'var(--border)', animation: 'skeletonPulse 1.6s ease-in-out 0.1s infinite' }} />
        <div style={{ height: '12px', width: '55%', borderRadius: '4px', background: 'var(--border)', animation: 'skeletonPulse 1.6s ease-in-out 0.2s infinite' }} />
      </div>
    </div>
  );
}

/* ── 3. Page Wrapper with Transition Animation ────────────────── */
export function AnimatedPage({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState('enter'); // 'enter' | 'exit'
  const prevKeyRef = useRef(location.key);

  useEffect(() => {
    if (location.key !== prevKeyRef.current) {
      // Route changed — trigger exit then enter
      setTransitionState('exit');

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionState('enter');
        prevKeyRef.current = location.key;
      }, 120); // Exit duration — keep short for snappy feel

      return () => clearTimeout(timer);
    } else {
      // Same route or initial mount
      setDisplayChildren(children);
      setTransitionState('enter');
    }
  }, [location.key, children]);

  return (
    <div
      className={`page-transition page-${transitionState}`}
      style={{
        willChange: 'opacity, transform',
      }}
    >
      {displayChildren}
    </div>
  );
}

export default { TopLoadingBar, SuspenseFallback, AnimatedPage };
