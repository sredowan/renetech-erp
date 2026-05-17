import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, 
  Calendar, CheckCircle2, AlertCircle, 
  Loader2, ArrowLeft, ChevronRight, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ScoreReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isPremium = user?.Student?.plan_type === 'premium';

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/pte/performance');
        setPerformance(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--primary)]" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pte')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black">Score Reports</h1>
          <p className="text-sm text-gray-500 font-medium italic">"Data-driven path to your PTE success."</p>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall', score: performance?.overall_score || 0, color: 'text-[var(--primary)]', bg: 'bg-indigo-100' },
          { label: 'Speaking', score: performance?.speaking_avg || 0, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Writing', score: performance?.writing_avg || 0, color: 'text-[var(--accent)]', bg: 'bg-blue-100' },
          { label: 'Reading', score: performance?.reading_avg || 0, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((s, i) => (
          <div key={i} className="glass-morphism p-8 rounded-3xl border border-[var(--border)] border-[var(--border)] shadow-sm text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
             <div className={`text-5xl font-black mb-4 ${s.color}`}>{s.score}</div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Across All Attempts</p>
          </div>
        ))}
      </div>

      {/* Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Analysis */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[var(--primary)]" /> Score Trend
                 </h3>
                 <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-[var(--glass)] dark:bg-indigo-900/20 text-[var(--primary)] rounded-lg text-xs font-bold">7D</button>
                    <button className="px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-400 transition-colors">30D</button>
                 </div>
              </div>
              
              <div className="flex items-center justify-center p-20 border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-2xl">
                 <p className="text-sm text-gray-400 font-medium italic">Practice trend visualization would appear here.</p>
              </div>
           </div>

           {/* Detailed Log */}
           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm">
              <h3 className="text-xl font-black mb-6">Attempt History</h3>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                 {(performance?.recent_attempts || []).map((attempt, i) => (
                   <div key={i} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm italic ${
                           attempt.score >= 79 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                           attempt.score >= 65 ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                           'bg-amber-100 text-amber-700 border border-amber-200'
                         }`}>
                           {attempt.score}
                         </div>
                         <div>
                            <p className="font-bold text-[var(--text-main)] uppercase text-xs">{attempt.task_type}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                               <Calendar className="w-3 h-3" /> {new Date(attempt.created_at).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Actionable Insights */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-[var(--primary)] to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                 <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> AI Coach Advice
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Critical Focus</p>
                    <p className="text-sm font-medium">Your Speaking score is consistent, but Writing requires more attention, specifically essay templates.</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Weekly Target</p>
                    <p className="text-sm font-medium">Complete 5 "Describe Image" and 3 "Write Essay" tasks to bridge the fluency gap.</p>
                 </div>
                 {!isPremium ? (
                   <button 
                     onClick={() => navigate('/subscription')}
                     className="w-full py-4 bg-yellow-400 text-[var(--text-main)] font-black rounded-2xl hover:bg-yellow-300 transition-all text-sm uppercase"
                   >
                     Unlock Personalized Insights
                   </button>
                 ) : (
                   <button className="w-full py-4 bg-white text-[var(--text-main)] font-black rounded-2xl hover:bg-[var(--glass)] transition-all text-sm uppercase">
                      Download Score Report (PDF)
                   </button>
                 )}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           </div>

           <div className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm">
              <h3 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Exam Target</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Goal Score</span>
                    <span className="text-xl font-black text-[var(--primary)]">79+</span>
                 </div>
                 <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center px-1">
                    <div className="h-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-full flex items-center justify-center text-[10px] font-black text-white px-2" style={{ width: '85%' }}>85%</div>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium text-center italic">"You are 85% ready for your target exam score."</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreReports;
