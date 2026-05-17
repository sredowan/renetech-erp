import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Square, RefreshCcw, 
  Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Zap
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SpeakingLounge = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(40);
  const [prepTimer, setPrepTimer] = useState(35);
  const [status, setStatus] = useState('prep'); // prep, recording, done, submitting
  const [result, setResult] = useState(null);

  const isPremium = user?.Student?.plan_type === 'premium';
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get('/pte/tasks');
        const found = taskId ? res.data.find(t => t.id === parseInt(taskId)) : res.data.find(t => t.section === 'speaking');
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
    if (status === 'prep') {
      intervalRef.current = setInterval(() => {
        setPrepTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const startRecording = () => {
    setStatus('recording');
    setIsRecording(true);
    // Intersection with real MediaRecorder API would go here
  };

  const stopRecording = () => {
    setIsRecording(false);
    setStatus('done');
    setAudioUrl('#'); // Placeholder for actual blob
  };

  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      // Simulation for now
      const res = await api.post('/pte/attempts', {
        task_id: task.id,
        response: 'Recorded Audio Response [Simulated Transcript]',
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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black">{task.type}</h1>
          <p className="text-sm text-gray-500 font-medium">Speaking Task • {task.max_score} Points</p>
        </div>
      </div>

      <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm space-y-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-50 border-[var(--border)]">
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-[var(--primary)]" />
             <span className="text-sm font-bold">
               {status === 'prep' ? `Preparing: ${prepTimer}s` : status === 'recording' ? `Recording: ${timer}s` : 'Recording Completed'}
             </span>
           </div>
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
             status === 'prep' ? 'bg-amber-100 text-amber-700' : 
             status === 'recording' ? 'bg-red-100 text-red-600 animate-pulse' : 
             'bg-emerald-100 text-emerald-700'
           }`}>
             {status}
           </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl border border-[var(--border)] dark:border-gray-800 text-lg leading-relaxed font-medium text-gray-800 dark:text-gray-200 shadow-inner">
          {task.content?.prompt || task.prompt || 'Please wait for the prompt to load...'}
        </div>

        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            status === 'recording' ? 'bg-red-600 shadow-2xl shadow-red-500/40 ring-4 ring-red-100' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-xl'
          }`}>
             {status === 'recording' ? <Square className="w-8 h-8 text-white fill-white" /> : <Mic className="w-10 h-10 text-white" />}
          </div>
          
          <div className="flex items-center gap-4">
             {status === 'prep' && (
               <button onClick={startRecording} className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg">Start Now</button>
             )}
             {status === 'recording' && (
               <button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg">Stop Recording</button>
             )}
             {status === 'done' && (
               <div className="flex gap-4">
                 <button onClick={() => { setStatus('prep'); setPrepTimer(35); setTimer(40); }} className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition-all">
                   <RefreshCcw className="w-4 h-4" /> Redo
                 </button>
                 <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg">
                   Submit Attempt
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {status === 'submitting' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-morphism p-8 rounded-3xl max-w-sm w-full text-center">
             <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--primary)] mb-4" />
             <h3 className="text-xl font-black mb-2">Analyzing Audio...</h3>
             <p className="text-sm text-gray-500">AI is evaluating your pronunciation, fluency, and content matching.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="glass-morphism rounded-3xl p-8 border-2 border-emerald-500/20 shadow-xl space-y-6 animate-in slide-in-from-top-6 duration-500">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Result Analysis
              </h3>
              <div className="text-3xl font-black text-[var(--primary)]">{result.score || 0}<span className="text-sm text-gray-400">/90</span></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pronunciation', value: isPremium ? '78/90' : 'Upgrade', premium: true, color: 'text-[var(--accent)]' },
                { label: 'Oral Fluency', value: isPremium ? '82/90' : 'Upgrade', premium: true, color: 'text-[var(--primary)]' },
                { label: 'Content', value: '75/90', premium: false, color: 'text-emerald-600' },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-[var(--border)] dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                  {!isPremium && m.premium && <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-1"><Zap className="w-2 h-2 fill-yellow-500 text-yellow-500" /> Premium Feature</div>}
                </div>
              ))}
           </div>

           <div className="p-4 bg-[var(--glass)] dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="text-sm font-bold text-[var(--text-main)] dark:text-indigo-200 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Improvement Tips
              </h4>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                {isPremium ? 
                  "Your intonation was strong, but try to reduce the hesitation before the multi-syllable words in the second sentence. Watch your 'th' sounds." : 
                  "Upgrade to Premium to get detailed AI feedback and pronunciation coaching for this task."}
              </p>
           </div>
           
           <button onClick={() => navigate('/pte')} className="w-full py-3 border border-gray-200 border-[var(--border)] rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
             Try Another Task
           </button>
        </div>
      )}
    </div>
  );
};

export default SpeakingLounge;
