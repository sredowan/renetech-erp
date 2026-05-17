import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Info, Sparkles, Send, LayoutList, ChevronRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ReadingLounge = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(300); // Default 5 mins
  const [status, setStatus] = useState('reading'); // reading, finished
  const [result, setResult] = useState(null);
  const [selections, setSelections] = useState({});

  const isPremium = user?.Student?.plan_type === 'premium';

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get('/pte/tasks');
        const found = taskId ? res.data.find(t => t.id === parseInt(taskId)) : res.data.find(t => t.section === 'reading');
        setTask(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (status === 'reading' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [status, timer]);

  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      const res = await api.post('/pte/attempts', {
        task_id: task.id,
        response: JSON.stringify(selections),
        is_mock_test: false
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatus('finished');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
            <p className="text-sm text-gray-500 font-medium">Reading Section • {task.max_score} Points</p>
          </div>
        </div>
        <div className="px-4 py-2 glass-morphism rounded-xl border border-[var(--border)] border-[var(--border)] shadow-sm font-black flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span className={timer < 60 ? 'text-red-600' : ''}>{formatTime(timer)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm leading-relaxed text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">
            {task.content?.prompt || task.prompt || "Reading passage content would appear here..."}
          </div>
          
          <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm">
             <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-gray-400">Your Answer</h3>
             <div className="space-y-4">
                {/* Simulated Multiple Choice or Fill in the blanks UI */}
                <p className="text-sm italic text-gray-500 mb-4">Select the most appropriate option based on the text above.</p>
                {[1,2,3,4].map(i => (
                  <button 
                    key={i}
                    onClick={() => setSelections({...selections, answer: i})}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                      selections.answer === i 
                      ? 'border-indigo-600 bg-[var(--glass)] dark:bg-indigo-900/20 text-[var(--text-main)] dark:text-indigo-100' 
                      : 'border-[var(--border)] border-[var(--border)] hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-sm font-bold">Option {String.fromCharCode(64 + i)}: Sample answer text for reading task.</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selections.answer === i ? 'border-indigo-600 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white' : 'border-gray-200 group-hover:border-indigo-300'
                    }`}>
                      {selections.answer === i && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
             </div>
             
             <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={status !== 'reading' || !selections.answer}
                  className="px-10 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  Submit Reading Task
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-morphism rounded-3xl p-6 border border-[var(--border)] border-[var(--border)] shadow-sm">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info className="w-4 h-4" /> Reading Guide
             </h3>
             <ul className="space-y-4">
               {[
                 "Skim the text for the main theme first",
                 "Identify keywords in the options",
                 "Eliminate obviously wrong choices",
                 "Watch for absolute words like 'always' or 'never'"
               ].map((item, i) => (
                 <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> {item}
                 </li>
               ))}
             </ul>
          </div>

          {result && (
             <div className="glass-morphism rounded-3xl p-8 border-2 border-emerald-500/20 shadow-2xl animate-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                  <div className="text-4xl font-black text-[var(--primary)]">{result.score || 0}</div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Validation</span>
                    <span className="text-emerald-600">Correct</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Efficiency</span>
                    <span className="text-[var(--primary)]">High</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-xs leading-relaxed italic text-gray-600">
                  {isPremium ? 
                    "Excellent work! You identified the core argument correctly. The distracting option B was tricky because it used similar keywords but reversed the causality mentioned in paragraph 2." : 
                    "Upgrade to Premium to see detailed explanations and why other options were incorrect."}
                </div>

                <button onClick={() => navigate('/pte')} className="w-full mt-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-xl hover:bg-indigo-700 transition-all text-xs">
                  Continue Practice
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingLounge;
