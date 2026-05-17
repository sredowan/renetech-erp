const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                .replace(/bg-white dark:bg-gray-800/g, 'glass-morphism')
                .replace(/bg-white dark:bg-slate-800/g, 'glass-morphism')
                .replace(/dark:bg-gray-800/g, 'glass-morphism')
                .replace(/dark:bg-gray-900\/20/g, '')
                .replace(/dark:border-gray-700/g, 'border-[var(--border)]')
                .replace(/border-gray-100/g, 'border-[var(--border)]')
                .replace(/text-gray-900 dark:text-white/g, 'text-[var(--text-main)]')
                .replace(/text-slate-900 dark:text-white/g, 'text-[var(--text-main)]')
                .replace(/text-gray-500 dark:text-gray-400/g, 'text-[var(--text-dim)]')
                .replace(/text-indigo-600/g, 'text-[var(--primary)]')
                .replace(/text-blue-600/g, 'text-[var(--accent)]')
                .replace(/bg-indigo-600/g, 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white')
                .replace(/bg-blue-600/g, 'bg-[var(--accent)] text-white')
                .replace(/from-indigo-600/g, 'from-[var(--primary)]')
                .replace(/from-indigo-900/g, 'from-[var(--primary)]')
                .replace(/to-blue-600/g, 'to-[var(--accent)]')
                .replace(/to-blue-500/g, 'to-[var(--accent)]')
                .replace(/bg-indigo-50/g, 'bg-[var(--glass)]')
                .replace(/bg-blue-50/g, 'bg-[var(--glass)]')
                .replace(/text-indigo-900/g, 'text-[var(--text-main)]');
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir('c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/LA FINAL/student-portal/src');
