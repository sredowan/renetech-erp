import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, Play, GraduationCap, 
  BarChart3, ChevronRight, Lock, Zap, 
  Target, Info, ArrowLeft, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PremiumLock from '../../components/PremiumLock';

const MockTests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isPremium = user?.Student?.plan_type === 'premium';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/pte/performance');
        setHistory(res.data.recent_attempts?.filter(a => a.is_mock_test) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const mocks = [
    { 
      id: 'full-1', 
      title: 'Full Mock Test A', 
      desc: 'Complete 2-hour exam simulation with all 20 question types.', 
      duration: '120m',
      questions: 20,
      isPremium: true 
    },
    { 
      id: 'mini-1', 
      title: 'Rapid Mini Mock', 
      desc: 'Bite-sized practice covering 5 critical exam modules.', 
      duration: '15m',
      questions: 5,
      isPremium: false 
    },
    { 
      id: 'section-speaking', 
      title: 'Speaking Marathon', 
      desc: 'Targeted mock for only Speaking section tasks.', 
      duration: '35m',
      questions: 6,
      isPremium: true 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pte')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black">Mock Test System</h1>
          <p className="text-[var(--text-dim)] mt-1 font-medium">Test your readiness with real-time exam simulations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mock Options */}
        <div className="lg:col-span-2 space-y-6">
           {mocks.map((mock) => (
             <div 
               key={mock.id}
               className={`glass-morphism rounded-3xl p-8 border hover:border-indigo-600/30 transition-all shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group ${mock.isPremium && !isPremium ? 'opacity-80' : ''}`}
             >
                <div className="flex-1 space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-2xl text-[var(--primary)]">
                         <Trophy className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black">{mock.title}</h3>
                      {mock.isPremium && !isPremium && <Lock className="w-4 h-4 text-gray-400" />}
                   </div>
                   <p className="text-sm text-[var(--text-dim)] leading-relaxed font-medium">{mock.desc}</p>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                         <Clock className="w-3.5 h-3.5" /> {mock.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                         <GraduationCap className="w-3.5 h-3.5" /> {mock.questions} Tasks
                      </div>
                   </div>
                </div>

                {mock.isPremium && !isPremium ? (
                  <button 
                    onClick={() => navigate('/subscription')}
                    className="w-full md:w-auto px-10 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-black rounded-2xl hover:bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:text-white transition-all text-sm uppercase tracking-wider"
                  >
                    Unlock Mock
                  </button>
                ) : (
                  <button 
                    className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Mock
                  </button>
                )}
             </div>
           ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 text-white">
              <BarChart3 className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-black mb-2 text-white">Mock Analytics</h3>
              <p className="text-xs opacity-70 mb-6 leading-relaxed">
                Premium users get a full skill matrix break-down and estimated real PTE score after every mock test.
              </p>
              <div className="space-y-4">
                 {[
                   { label: 'Avg Mock Score', value: isPremium ? '68.5' : 'Locked' },
                   { label: 'Reliability Index', value: 'High' },
                   { label: 'Improvement Gap', value: isPremium ? '-12.0' : 'Locked' }
                 ].map((s, i) => (
                   <div key={i} className="flex justify-between border-b border-white/10 pb-2">
                     <span className="text-[10px] font-bold uppercase opacity-60">{s.label}</span>
                     <span className="text-sm font-black">{s.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm">
              <h3 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Mock History</h3>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto my-4 text-[var(--primary)]" /> : (
                <div className="space-y-4">
                   {history.length > 0 ? history.map((item, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 p-2 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 font-black text-xs italic">
                              {item.score}
                           </div>
                           <div>
                              <p className="text-xs font-bold">{item.task_type}</p>
                              <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)]" />
                     </div>
                   )) : (
                     <div className="py-8 text-center border-2 border-dashed border-[var(--border)] border-[var(--border)] rounded-2xl">
                        <p className="text-xs text-gray-400 font-medium italic">No mock attempts found.</p>
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default MockTests;
