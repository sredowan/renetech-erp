import React, { useState, useEffect } from 'react';
import { 
  Star, TrendingUp, Calendar, Clock, Target, 
  AlertCircle, ChevronRight, Zap, BookOpen, 
  MessageSquare, Layout, PlayCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PremiumBanner from '../components/PremiumBanner';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const student = user?.Student;
  const isPremium = student?.plan_type === 'premium';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const perfRes = await api.get('/pte/performance');
        setPerformance(perfRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Premium Status Banner */}
      <PremiumBanner />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-[var(--border)] dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
            Hi, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--text-dim)] mt-1 font-medium italic">
            "The expert in anything was once a beginner." - Focus on your goals today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-morphism px-4 py-2 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Target Score</p>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xl font-black text-[var(--text-main)]">{student?.target_score || 79}</span>
            </div>
          </div>
          <div className="glass-morphism px-4 py-2 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Exam Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-[var(--text-main)]">
                {student?.exam_date ? new Date(student.exam_date).toLocaleDateString() : 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Speaking', icon: MessageSquare, color: 'text-[var(--accent)]', bg: 'bg-[#275fa7]/10', path: '/pte?section=speaking' },
              { label: 'Writing', icon: Layout, color: 'text-[var(--primary)]', bg: 'bg-[#7bc62e]/10', path: '/pte?section=writing' },
              { label: 'Reading', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500/10', path: '/pte?section=reading' },
              { label: 'Listening', icon: PlayCircle, color: 'text-amber-600', bg: 'bg-amber-500/10', path: '/pte?section=listening' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => navigate(item.path)}
                className={`${item.bg} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group shadow-sm`}
              >
                <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-bold text-[var(--text-main)]">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Performance Overview */}
          <div className="glass-morphism p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--primary)]" /> Skill Progress
              </h3>
              <button onClick={() => navigate('/pte')} className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                Full Analytics <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {[
                { skill: 'Speaking', score: performance?.speaking_avg || 0, color: 'bg-[var(--accent)]' },
                { skill: 'Writing', score: performance?.writing_avg || 0, color: 'bg-[var(--primary)]' },
                { skill: 'Reading', score: performance?.reading_avg || 0, color: 'bg-emerald-500' },
                { skill: 'Listening', score: performance?.listening_avg || 0, color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{item.skill}</span>
                    <span className="text-sm font-black text-[var(--primary)]">{item.score}/90</span>
                  </div>
                  <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div 
                      className={`${item.color} h-full rounded-full transition-all duration-1000`} 
                      style={{ width: `${(item.score / 90) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Practice / Last Activity */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Continue your path</h3>
              <p className="opacity-90 font-medium">You were last practicing <span className="underline font-bold">Repeat Sentence</span>. Ready to beat your high score?</p>
            </div>
            <button 
              onClick={() => navigate('/pte')}
              className="bg-white text-[var(--primary)] px-8 py-4 rounded-2xl font-black text-sm whitespace-nowrap hover:bg-gray-50 hover:-translate-y-1 transition-all active:scale-95 shadow-lg relative z-10"
            >
              Resume Practice
            </button>
          </div>

        </div>

        {/* Right Column: Alerts & Side Panels */}
        <div className="space-y-8">
          
          {/* Daily Goal */}
          <div className="glass-morphism p-6 flex flex-col">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Daily Target
            </h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
               {/* Simplified circular progress for now */}
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="opacity-10" />
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="182.2" className="text-[var(--primary)]" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-black">50%</span>
                 <span className="text-[10px] text-gray-400 font-bold uppercase">Done</span>
               </div>
            </div>
            <p className="text-center text-xs text-gray-500 font-medium">
              You've completed <span className="font-black text-[var(--text-main)]">25 of 50</span> daily practice questions.
            </p>
          </div>

          {/* Weak Skill Alerts */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-6 border border-red-100 dark:border-red-900/40">
            <h3 className="font-black text-red-600 dark:text-red-400 text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Focus Areas
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1.5 h-auto bg-red-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">Vocabulary Choice</p>
                  <p className="text-xs text-red-600 dark:text-red-400 opacity-80">Score trending down in Essay Writing.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-auto bg-amber-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">Oral Fluency</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 opacity-80">Fluency dropped during Read Aloud.</p>
                </div>
              </div>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-gradient-to-br from-[var(--accent)] to-[#1a3f6e] rounded-3xl p-6 text-white text-center shadow-xl">
              <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Get AI Scoring</h3>
              <p className="text-xs opacity-80 mb-6">Upgrade to Premium to get instant feedback on pronunciation, fluency, and grammar.</p>
              <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-3 bg-white text-[var(--accent)] font-black rounded-xl hover:bg-gray-100 transition-all text-xs"
              >
                Learn More
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
