import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, Lock, 
  CheckCircle2, Clock, BarChart2, Zap 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuestionBank = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ section: 'all', difficulty: 'all', search: '' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.Student?.plan_type === 'premium';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/pte/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchSection = filter.section === 'all' || task.section === filter.section;
    const matchSearch = task.type.toLowerCase().includes(filter.search.toLowerCase()) || 
                      (task.prompt && task.prompt.toLowerCase().includes(filter.search.toLowerCase()));
    return matchSection && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Question Bank</h1>
          <p className="text-[var(--text-dim)] mt-1 font-medium">Browse and practice from our library of {tasks.length} tasks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              className="pl-10 pr-4 py-2.5 glass-morphism border border-gray-200 border-[var(--border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button className="p-2.5 glass-morphism border border-gray-200 border-[var(--border)] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'speaking', 'writing', 'reading', 'listening'].map(sec => (
          <button
            key={sec}
            onClick={() => setFilter({...filter, section: sec})}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              filter.section === sec 
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white shadow-lg shadow-indigo-500/30' 
              : 'glass-morphism text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-[var(--border)] border-[var(--border)]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="glass-morphism rounded-3xl overflow-hidden border border-[var(--border)] border-[var(--border)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] border-[var(--border)] bg-gray-50/50 ">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Section</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8 h-12 bg-gray-50/20 glass-morphism/20"></td>
                  </tr>
                ))
              ) : filteredTasks.map((task) => {
                const isTaskPremium = task.is_premium_only;
                const locked = isTaskPremium && !isPremium;

                return (
                  <tr 
                    key={task.id} 
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors group cursor-pointer ${locked ? 'opacity-60' : ''}`}
                    onClick={() => !locked && navigate(`/pte/${task.section}/${task.id}`)}
                  >
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        task.section === 'speaking' ? 'bg-amber-100 text-amber-700' :
                        task.section === 'writing' ? 'bg-indigo-100 text-indigo-700' :
                        task.section === 'reading' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.section}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-main)]">{task.type}</span>
                        {isTaskPremium && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <BarChart2 className="w-3 h-3" /> {task.max_score} Score
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <CheckCircle2 className="w-5 h-5 text-gray-200 dark:text-gray-700" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      {locked ? (
                        <div className="flex items-center justify-end gap-2 text-[var(--primary)] font-black text-[10px] uppercase">
                          <Lock className="w-3 h-3" /> Upgrade
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all ml-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && !loading && (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium italic">No tasks found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
