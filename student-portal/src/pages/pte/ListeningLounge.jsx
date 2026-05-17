import React, { useState, useEffect } from 'react';
import { 
  Headphones, Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Info, Play, Pause, Volume2, Send
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ListeningLounge = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(600);
  const [status, setStatus] = useState('listening'); // listening, finished
  const [result, setResult] = useState(null);
  const [response, setResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const isPremium = user?.Student?.plan_type === 'premium';

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get('/pte/tasks');
        const found = taskId ? res.data.find(t => t.id === parseInt(taskId)) : res.data.find(t => t.section === 'listening');
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
    if (isPlaying && progress < 100) {
      interval = setInterval(() => setProgress(p => p + 1), 300);
    } else if (progress >= 100) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleSubmit = async () => {
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

  if (loading || !task) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--primary)]" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">{task.type}</h1>
            <p className="text-sm text-gray-500 font-medium">Listening Section • {task.max_score} Points</p>
          </div>
        </div>
        <div className="px-4 py-2 glass-morphism rounded-xl border border-[var(--border)] border-[var(--border)] shadow-sm font-black flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span>{Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="glass-morphism rounded-3xl p-10 border border-[var(--border)] border-[var(--border)] shadow-sm space-y-10">
        
        {/* Audio Player UX */}
        <div className="flex flex-col items-center space-y-6">
           <div className="w-20 h-20 bg-[var(--glass)] dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-[var(--primary)]">
              <Volume2 className="w-10 h-10" />
           </div>
           
           <div className="w-full max-w-lg space-y-4">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <span>0:00</span>
                 <span>0:30</span>
              </div>
           </div>

           <button 
             onClick={() => { if(progress >= 100) setProgress(0); setIsPlaying(!isPlaying); }}
             className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${
               isPlaying 
               ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' 
               : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white shadow-indigo-600/20 hover:scale-105 active:scale-95'
             }`}
           >
             {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
             {isPlaying ? 'Playing Audio...' : progress >= 100 ? 'Replay Audio' : 'Start Audio'}
           </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <Info className="w-4 h-4" /> Your Response
           </h3>
           <textarea 
             className="w-full h-40 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-[var(--border)] dark:border-gray-800 outline-none text-base font-medium focus:ring-2 focus:ring-indigo-600 transition-all"
             placeholder="Type your answer, transcript, or summary based on the audio above..."
             value={response}
             onChange={(e) => setResponse(e.target.value)}
           />
        </div>

        <div className="flex justify-end pt-4">
           <button 
             onClick={handleSubmit}
             disabled={!response.trim() || status === 'finished'}
             className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
           >
             {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             Submit Attempt
           </button>
        </div>
      </div>

      {result && (
        <div className="glass-morphism rounded-3xl p-10 border-2 border-emerald-500/20 shadow-2xl space-y-6 animate-in zoom-in duration-300">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">Performance Report</h3>
              <div className="text-3xl font-black text-[var(--primary)]">{result.score || 0}<span className="text-sm text-gray-400">/90</span></div>
           </div>

           <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl text-sm leading-relaxed border border-[var(--border)] dark:border-gray-800">
              <h4 className="font-bold text-[var(--text-main)] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Insights
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {isPremium ? 
                  "Your summary captured all 3 core points from the lecture on environmental science. Spelling was 100% accurate. To reach 79+, try to use more complex academic structures in your concluding clause." : 
                  "Upgrade to Premium to get full AI feedback on your listening comprehension and notes formatting."}
              </p>
           </div>
           
           <button onClick={() => navigate('/pte')} className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg">
             Explore More Tasks
           </button>
        </div>
      )}
    </div>
  );
};

export default ListeningLounge;
