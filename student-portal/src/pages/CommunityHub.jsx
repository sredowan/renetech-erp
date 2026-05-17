import React from 'react';
import { 
  Users, MessageSquare, Trophy, 
  Flame, Globe, Zap, ArrowRight,
  Star, Heart, Share2, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CommunityHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPremium = user?.Student?.plan_type === 'premium';

  const groups = [
    { title: '79+ Target Squad', members: 1240, active: 85, tags: ['Intensive', 'Templates'] },
    { title: 'Speaking Fluency Pro', members: 850, active: 42, tags: ['Daily Drills', 'AI Feedback'] },
    { title: 'Writing Essay Masters', members: 920, active: 31, tags: ['Vocabulary', 'Structure'] },
  ];

  const leaderboard = [
    { name: 'Redowan S.', score: 88, streak: 12, rank: 1 },
    { name: 'Sarah J.', score: 85, streak: 8, rank: 2 },
    { name: 'Tanvir A.', score: 82, streak: 15, rank: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Community Lounge</h1>
          <p className="text-[var(--text-dim)] mt-1 font-medium">Learn, share, and compete with 5,000+ PTE candidates.</p>
        </div>
        {!isPremium && (
          <button 
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform"
          >
            <Zap className="w-4 h-4 fill-white" /> Go Premium to Join
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed / Groups */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center gap-4 glass-morphism p-2 rounded-2xl border border-[var(--border)] border-[var(--border)] shadow-sm">
             <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
               <Search className="w-5 h-5 text-gray-400" />
             </div>
             <input type="text" placeholder="Search study groups or topics..." className="flex-1 bg-transparent outline-none text-sm font-medium" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group, i) => (
                <div key={i} className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm hover:shadow-md transition-all group">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-2xl text-[var(--primary)]">
                         <Users className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {group.active} online
                      </div>
                   </div>
                   <h3 className="text-lg font-black mb-1">{group.title}</h3>
                   <p className="text-xs text-gray-400 font-medium mb-4">{group.members} members joined</p>
                   <div className="flex flex-wrap gap-2 mb-6">
                      {group.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg text-[10px] font-bold text-gray-500">{t}</span>
                      ))}
                   </div>
                   <button 
                     disabled={!isPremium}
                     className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-black rounded-xl text-xs flex items-center justify-center gap-2 group-hover:bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white group-hover:text-white transition-all disabled:opacity-50"
                   >
                     View Discussions <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>

           {/* Placeholder for Feed */}
           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm space-y-8">
              <h3 className="font-black text-lg">Daily Strategy Poll</h3>
              <div className="p-6 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
                 <p className="font-bold text-[var(--text-main)] dark:text-indigo-200 mb-4">Which section do you find hardest to score 79+ in?</p>
                 <div className="space-y-3">
                    {['Speaking - DI/RL', 'Writing - Essay', 'Reading - FIB', 'Listening - WFD'].map((opt, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-3 glass-morphism rounded-xl border border-indigo-100 dark:border-indigo-800/20 text-xs font-bold hover:shadow-sm transition-all">
                        <span>{opt}</span>
                        <span className="opacity-40">{25 - i * 5}%</span>
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar: Leaderboard & Stats */}
        <div className="space-y-8">
           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm relative overflow-hidden">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                 <Trophy className="w-6 h-6 text-yellow-500" /> Weekly Stars
              </h3>
              <div className="space-y-6 relative z-10">
                 {leaderboard.map((user, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                           i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                           i === 1 ? 'bg-gray-200 text-gray-600' : 
                           'bg-amber-100 text-amber-700'
                         }`}>
                           {user.rank}
                         </div>
                         <div>
                            <p className="text-sm font-bold">{user.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                               <Flame className="w-3 h-3 text-orange-500" /> {user.streak} day streak
                            </div>
                         </div>
                      </div>
                      <div className="text-sm font-black text-[var(--primary)]">{user.score} avg</div>
                   </div>
                 ))}
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 text-white">
              <MessageSquare className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-black mb-2">Trainer Q&A</h3>
              <p className="text-xs opacity-70 mb-6 leading-relaxed">
                Join our weekly live session where senior trainers answer your toughest PTE doubts.
              </p>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 mb-6">
                 <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Next Session</p>
                 <p className="text-sm font-bold">Tuesday, 08:30 PM (BST)</p>
              </div>
              <button 
                disabled={!isPremium}
                className="w-full py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-xl hover:bg-[var(--glass)]0 transition-all text-xs"
              >
                Set Reminder
              </button>
           </div>

           <div className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-[10px] font-black">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                 </div>
                 <span className="text-xs font-bold text-gray-500">+12.4k others</span>
              </div>
              <p className="text-xs text-gray-400 font-medium italic">"The community keeps you accountable."</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CommunityHub;
