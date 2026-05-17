const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-portal', 'src', 'pages', 'Reconciliation.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace dark backgrounds
content = content.replace(/background:\s*'linear-gradient\(180deg, rgba\(15,23,42,0\.8\), rgba\(15,23,42,0\.6\)\)'/g, "background: 'var(--surface)'");
content = content.replace(/background:\s*'rgba\(15,23,42,0\.\d+\)'/g, "background: 'var(--surface)'");
content = content.replace(/background:\s*'#0f172a'/g, "background: 'var(--canvas)'");
content = content.replace(/background:\s*'linear-gradient\(135deg, rgba\(15,23,42,0\.9\), rgba\(2,6,23,0\.95\)\)'/g, "background: 'var(--surface)'");
content = content.replace(/background:\s*'rgba\(2,6,23,0\.7\)'/g, "background: 'rgba(0,0,0,0.5)'");

// Replace text colors
content = content.replace(/color:\s*'#f8fafc'/gi, "color: 'var(--text-main)'");
content = content.replace(/color:\s*'#e2e8f0'/gi, "color: 'var(--text-main)'");
content = content.replace(/color:\s*'#94a3b8'/gi, "color: 'var(--text-dim)'");
content = content.replace(/color:\s*'#64748b'/gi, "color: 'var(--text-dim)'");
content = content.replace(/color:\s*'#475569'/gi, "color: 'var(--text-dim)'");

// Replace borders
content = content.replace(/border(Bottom)?:\s*'1px solid rgba\(148,163,184,0\.[0-9]+\)'/g, "border$1: '1px solid var(--border)'");
content = content.replace(/borderBottom:\s*'2px solid #e2e8f0'/g, "borderBottom: '2px solid var(--border)'");

// Replace active/brand hexes
content = content.replace(/#3b82f6/gi, "var(--accent)"); // Slate blue -> Accent
content = content.replace(/#38bdf8/gi, "var(--accent)"); // Sky blue -> Accent
content = content.replace(/#22c55e/gi, "var(--primary)"); // Slate green -> Primary
content = content.replace(/#10b981/gi, "var(--primary)"); // Emerald -> Primary
content = content.replace(/#c084fc/gi, "var(--text-main)"); // Purple -> Third color (Black)
content = content.replace(/#fbbf24/gi, "var(--accent)"); // Amber -> Accent (Wait, orange is sometimes good for warnings, but user said 'primary accent and third')
content = content.replace(/#f59e0b/gi, "var(--accent)"); // Amber -> Accent
content = content.replace(/#ef4444/gi, "var(--danger)"); // Red -> keep as danger variable if exists, or hardcode #ef4444. Wait, globalstyles has --danger.

// For Quick action buttons, we have complex hover states
// Let's replace the Quick Actions block completely to use clean brand variables
const quickActionsRegex = /<button onClick=\{\(\) => setActiveModal\('opening'\)\}.*?<\/button>\s*<button onClick=\{\(\) => setActiveModal\('collection'\)\}.*?<\/button>\s*<button onClick=\{\(\) => setActiveModal\('transfer'\)\}.*?<\/button>\s*<button onClick=\{\(\) => setActiveModal\('closing'\)\}.*?<\/button>/s;

const newQuickActions = `
          <button onClick={() => setActiveModal('opening')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '16px', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Landmark size={28} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Set Opening Balance</span>
          </button>
          
          <button onClick={() => setActiveModal('collection')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '16px', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Banknote size={28} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Record Collection</span>
          </button>
          
          <button onClick={() => setActiveModal('transfer')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', background: 'var(--canvas)', border: '1px solid var(--text-main)', borderRadius: '16px', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <ArrowLeftRight size={28} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Internal Transfer</span>
          </button>
          
          <button onClick={() => setActiveModal('closing')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '16px', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <ShieldCheck size={28} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Submit Closing</span>
          </button>
`;
content = content.replace(quickActionsRegex, newQuickActions.trim());

// Also replace the rgba borders and backgrounds for those buttons that were replaced dynamically:
content = content.replace(/rgba\(34,197,94,0\.15\)/g, "' + 'var(--primary-glow)' + '");
content = content.replace(/rgba\(34,197,94,0\.\d+\)/g, 'var(--primary-glow)');

content = content.replace(/rgba\(16, \?185, \?129, \?0\.\d+\)/g, 'var(--primary-glow)');
content = content.replace(/rgba\(16,185,129,0\.\d+\)/g, 'var(--primary-glow)');

content = content.replace(/rgba\(56,189,248,0\.\d+\)/g, 'var(--accent-glow)');
content = content.replace(/rgba\(59,130,246,0\.\d+\)/g, 'var(--accent-glow)');

content = content.replace(/rgba\(168,85,247,0\.\d+\)/g, 'var(--canvas)');
content = content.replace(/rgba\(245,158,11,0\.\d+\)/g, 'var(--accent-glow)');

fs.writeFileSync(filePath, content);
console.log('Reconciliation.jsx colors updated successfully!')
