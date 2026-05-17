import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Info, Sparkles, Send
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WritingLounge = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [timer, setTimer] = useState(600); // Default 10 mins (600s)
  const [status, setStatus] = useState('writing'); // writing, submitting, finished
  const [result, setResult] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  const isPremium = user?.Student?.plan_type === 'premium';
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get('/pte/tasks');
        const found = taskId ? res.data.find(t => t.id === parseInt(taskId)) : res.data.find(t => t.section === 'writing');
        setTask(found);
        if (found?.type === 'Essay') setTimer(1200); // 20 mins for essay
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (status === 'writing' && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status, timer]);

  useEffect(() => {
    const words = response.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [response]);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setStatus('submitting');
    try {
      const res = await api.post('/pte/attempts', {
        task_id: task.id,
        response: response.trim(),
        is_mock_test: false
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatus('finished');
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !task) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--primary)]" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">{task.type}</h1>
            <p className="text-sm text-gray-500 font-medium">Writing Task • {task.max_score} Points</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-xl border border-[var(--border)] border-[var(--border)] shadow-sm font-black">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              <span className={timer < 60 ? 'text-red-600' : ''}>{formatTime(timer)}</span>
           </div>
           <div className="px-4 py-2 glass-morphism rounded-xl border border-[var(--border)] border-[var(--border)] shadow-sm font-black text-sm">
              Words: <span className="text-[var(--primary)]">{wordCount}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Prompt Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info className="w-4 h-4" /> Instructions
             </h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
               {task.prompt || "Read the passage and write a summary in one single sentence (5-75 words)."}
             </p>
          </div>

          <div className="bg-[var(--glass)] dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800/40">
             <h3 className="text-xs font-black text-[var(--primary)] dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> PTE Strategy
             </h3>
             <ul className="space-y-3">
               {[
                 "Focus on main ideas only",
                 "Use connectors like although, while, because",
                 "Check for correct punctuation",
                 "Ensure exactly one full stop at the end"
               ].map((item, i) => (
                 <li key={i} className="text-[11px] text-gray-700 dark:text-gray-300 flex gap-2">
                   <CheckCircle2 className="w-3 h-3 text-indigo-500 mt-0.5" /> {item}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Editor Shell */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-morphism rounded-3xl p-4 border border-[var(--border)] border-[var(--border)] shadow-sm min-h-[500px] flex flex-col">
              <div className="mb-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-[var(--border)] dark:border-gray-800 max-h-64 overflow-y-auto italic font-medium text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                 {task.content?.prompt || "Source passage text would appear here..."}
              </div>
              
              <textarea 
                className="flex-1 w-full bg-transparent p-6 outline-none text-[var(--text-main)] font-medium text-base resize-none"
                placeholder="Start writing your answer here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={status !== 'writing'}
              />

              <div className="pt-4 border-t border-gray-50 border-[var(--border)] flex justify-end">
                 <button 
                   onClick={handleSubmit}
                   disabled={status !== 'writing' || !response.trim()}
                   className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                 >
                   {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   {status === 'submitting' ? 'Analyzing...' : 'Submit Essay'}
                 </button>
              </div>
           </div>

           {/* Results Overlay/Card */}
           {result && (
             <div className="glass-morphism rounded-3xl p-8 border-2 border-emerald-500/20 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black">AI Grade Report</h3>
                  <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white px-6 py-2 rounded-2xl font-black text-xl">
                    {result.score}<span className="text-xs opacity-60">/90</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   {[
                     { label: 'Grammar', value: isPremium ? '90/90' : 'Upgrade', color: 'text-[var(--primary)]' },
                     { label: 'Spelling', value: isPremium ? '100%' : 'Upgrade', color: 'text-[var(--accent)]' },
                     { label: 'Form', value: '2/2', color: 'text-emerald-600' },
                     { label: 'Structure', value: isPremium ? 'Excellent' : 'Locked', color: 'text-purple-600' },
                   ].map((m, i) => (
                     <div key={i} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center border border-[var(--border)] dark:border-gray-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                        <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 text-[var(--primary)]" /> Actionable Feedback
                  </h4>
                  <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl text-sm leading-relaxed">
                     {isPremium ? 
                       "Your essay has excellent vocabulary range. However, we found 2 instances of word repetition that could be replaced with synonyms. Your structure follows the standard academic template correctly." : 
                       "Upgrade to Premium for full text analysis, grammar correction suggestions, and model answer comparison."}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                   <button onClick={() => navigate('/pte')} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm">
                      Back to Hub
                   </button>
                   {!isPremium && (
                      <button onClick={() => navigate('/subscription')} className="flex-1 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg text-sm">
                        Unlock AI Analysis
                      </button>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WritingLounge;
