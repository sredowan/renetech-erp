import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Type, BookOpen, Headphones, 
  Trophy, GraduationCap, BarChart3, Search,
  Zap, Lock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PremiumLock from '../../components/PremiumLock';

const PracticeHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPremium = user?.Student?.plan_type === 'premium';

  const sections = [
    { 
      id: 'speaking', 
      title: 'Speaking', 
      desc: 'Read Aloud, Repeat Sentence, DI & RL', 
      icon: Mic, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      isPremium: false 
    },
    { 
      id: 'writing', 
      title: 'Writing', 
      desc: 'Summarize Text & Essay Writing', 
      icon: Type, 
      color: 'text-[var(--primary)]', 
      bg: 'bg-[#7bc62e]/10',
      isPremium: false 
    },
    { 
      id: 'reading', 
      title: 'Reading', 
      desc: 'Fill in the Blanks & Re-order', 
      icon: BookOpen, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      isPremium: false 
    },
    { 
      id: 'listening', 
      title: 'Listening', 
      desc: 'SST, Multiple Choice & WFD', 
      icon: Headphones, 
      color: 'text-[var(--accent)]', 
      bg: 'bg-[#275fa7]/10',
      isPremium: false 
    },
  ];

  const tools = [
    { title: 'Question Bank', desc: 'Central library of 5000+ tasks', icon: Search, path: '/pte/questions', premiumOnly: false },
    { title: 'Mock Tests', desc: 'Full-length exam simulations', icon: Trophy, path: '/pte/mocks', premiumOnly: true },
    { title: 'Score Reports', desc: 'Deep analytics & skill trends', icon: BarChart3, path: '/pte/reports', premiumOnly: true },
    { title: 'Study Materials', desc: 'Strategy guides & templates', icon: GraduationCap, path: '/pte/materials', premiumOnly: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Practice Lounge</h1>
          <p className="text-[var(--text-dim)] mt-1">Master every PTE section with AI-powered feedback.</p>
        </div>
        {!isPremium && (
          <button 
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform"
          >
            <Zap className="w-4 h-4 fill-white" /> Upgrade to Premium
          </button>
        )}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => navigate(`/pte/${sec.id}`)}
            className={`${sec.bg} p-6 rounded-3xl border border-transparent hover:border-current/10 transition-all group text-left relative overflow-hidden`}
          >
            <div className={`${sec.color} mb-4 p-3 glass-morphism rounded-2xl inline-block group-hover:scale-110 transition-transform`}>
              <sec.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)] mb-1">{sec.title}</h3>
            <p className="text-xs text-[var(--text-dim)] font-medium">{sec.desc}</p>
            <ChevronRight className={`absolute bottom-6 right-6 w-5 h-5 ${sec.color} opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0`} />
          </button>
        ))}
      </div>

      {/* Advanced Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--primary)]" /> Advanced Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <button
                key={i}
                onClick={() => navigate(tool.path)}
                className="p-5 glass-morphism rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 glass-morphism rounded-lg group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  {tool.premiumOnly && !isPremium && <Lock className="w-3 h-3 text-[var(--text-dim)]" />}
                </div>
                <h4 className="font-bold text-sm mb-1">{tool.title}</h4>
                <p className="text-[10px] text-[var(--text-dim)]">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Bank Preview (Premium) */}
        <PremiumLock isPremium={isPremium}>
          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-3xl p-8 text-white relative overflow-hidden h-full">
            <div className="relative z-10">
              <div className="bg-yellow-400 text-[var(--text-main)] text-[10px] font-black px-3 py-1 rounded-full inline-block mb-4">
                PREMIUM PREDICTION BANK
              </div>
              <h3 className="text-2xl font-black mb-4">Real Exam Questions</h3>
              <p className="opacity-80 text-sm mb-6 leading-relaxed">
                Unlock the latest questions appearing in exams this week. Our prediction bank has a 85% match rate with real PTE tasks.
              </p>
              <button className="bg-white text-[var(--accent)] px-6 py-3 rounded-xl font-black text-sm hover:opacity-90 transition-colors">
                Open Daily Predictions
              </button>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          </div>
        </PremiumLock>
      </div>
    </div>
  );
};

export default PracticeHub;
