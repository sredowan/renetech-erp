import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const PremiumLock = ({ children, isPremium }) => {
  const navigate = useNavigate();

  if (isPremium) {
    return children;
  }

  return (
    <div className="relative group overflow-hidden rounded-xl border border-dashed border-gray-300 border-[var(--border)] bg-gray-50 dark:bg-gray-900/50">
      <div className="blur-[1px] pointer-events-none opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20 group-hover:bg-black/10 transition-all p-4 text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-full flex items-center justify-center mb-3 shadow-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-main)] mb-1">Premium Only</h3>
        <p className="text-xs text-[var(--text-dim)] mb-4 max-w-[200px]">Upgrade to access full AI scoring and predicted questions.</p>
        <button 
          onClick={() => navigate('/subscription')}
          className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
        >
          Upgrade for 2500 BDT
        </button>
      </div>
    </div>
  );
};

export default PremiumLock;
