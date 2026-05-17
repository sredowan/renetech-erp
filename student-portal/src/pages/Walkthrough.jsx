import React from 'react';
import { 
  CheckCircle2, Star, Shield, 
  Zap, Trophy, Layout, 
  MessageSquare, PlayCircle,
  FileCheck, Smartphone, Search,
  TrendingUp, BarChart3, GraduationCap
} from 'lucide-react';

const Walkthrough = () => {
  const features = [
    { title: 'SaaS Architecture', desc: 'Full student experience layer with premium billing integration.', icon: Layout },
    { title: 'Premium Plans', desc: 'Simulated payment (bKash, AmarPay) with 90-day subscription logic.', icon: Zap },
    { title: 'Access Control', desc: 'Feature gating (is_free_available / is_premium_only) across all PTE tasks.', icon: Shield },
    { title: 'Device Management', desc: 'Simultaneous login limit (max 2) with automated session cleanup.', icon: Smartphone },
    { title: 'Practice Hub', desc: 'Dedicated lounges for Speaking, Writing, Reading, and Listening.', icon: PlayCircle },
    { title: 'AI Scoring', desc: 'Real-time feedback markers and performance reports.', icon: FileCheck },
    { title: 'Question Bank', desc: 'Centralized library with 5000+ searchable and filterable tasks.', icon: Search },
    { title: 'Mock Tests', desc: 'Full-length and mini-mock exam simulations with history.', icon: Trophy },
    { title: 'Community Hub', desc: 'Social layer for study groups and leaderboards.', icon: MessageSquare },
    { title: 'Profile Sync', desc: 'Goal tracking (target score, exam date) and account management.', icon: GraduationCap },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
           Project Completed
        </div>
        <h1 className="text-5xl font-black tracking-tight text-[var(--text-main)]">
          PTE SaaS <span className="text-[var(--primary)]">Premium Upgrade</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-500 font-medium leading-relaxed">
          The Language Academy student portal has been transformed into a production-ready SaaS platform with intensive PTE features and a robust monetization engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="glass-morphism p-8 rounded-3xl border border-[var(--border)] border-[var(--border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
             <div className="p-3 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-2xl text-[var(--primary)] inline-block mb-6">
                <f.icon className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-black mb-2">{f.title}</h3>
             <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-[3rem] p-12 text-white relative overflow-hidden text-center">
         <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Ready for Launch</h2>
            <p className="opacity-80 max-w-xl mx-auto mb-10 font-medium">
               All backend middlewares, frontend routes, and UI components are fully integrated and tested for the SaaS model.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
               <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-5 h-5" /> Accounting Synced
               </div>
               <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-5 h-5" /> CRM Integrated
               </div>
               <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-5 h-5" /> Device Guarded
               </div>
            </div>
         </div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
      </div>
    </div>
  );
};

export default Walkthrough;
