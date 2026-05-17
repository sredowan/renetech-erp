import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  Loader2,
  Mic,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Type,
  UserCircle2,
  WandSparkles
} from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const tabs = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'practice', label: 'Practice', icon: BookOpen },
  { id: 'mock', label: 'Mini Mock', icon: Trophy },
  { id: 'results', label: 'Results', icon: Target },
  { id: 'profile', label: 'Profile', icon: UserCircle2 }
];

const sectionMeta = {
  all: { label: 'All', icon: BookOpen, accent: 'var(--primary)' },
  speaking: { label: 'Speaking', icon: Mic, accent: '#f59e0b' },
  writing: { label: 'Writing', icon: Type, accent: 'var(--primary)' },
  reading: { label: 'Reading', icon: BookOpen, accent: 'var(--accent)' },
  listening: { label: 'Listening', icon: Headphones, accent: '#22c55e' }
};

const prepMinutes = {
  speaking: 3,
  writing: 12,
  reading: 5,
  listening: 4
};

const normalizeSection = (section = 'all') => (sectionMeta[section] ? section : 'all');

const getTaskText = (task) => {
  if (!task) return '';
  if (typeof task.content === 'string') return task.content;
  if (Array.isArray(task.content)) return task.content.join(' ');
  if (task.content?.prompt) return task.content.prompt;
  if (task.prompt) return task.prompt;
  return 'Practice this task and submit your best response.';
};

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  day: 'numeric',
  month: 'short'
});

const scoreTone = (score) => {
  if (score >= 75) return { color: 'var(--success)', label: 'Exam ready' };
  if (score >= 60) return { color: 'var(--warning)', label: 'Improving' };
  return { color: 'var(--danger)', label: 'Needs work' };
};

const PTEPractice = () => {
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [activeSection, setActiveSection] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [mockQueue, setMockQueue] = useState([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskRes, performanceRes] = await Promise.all([
          api.get('/pte/tasks'),
          api.get('/pte/performance')
        ]);
        setTasks(taskRes.data || []);
        setPerformance(performanceRes.data || null);
      } catch (err) {
        console.error(err);
        setError('Could not load the practice lounge right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    if (activeSection === 'all') return tasks;
    return tasks.filter((task) => task.section === activeSection);
  }, [activeSection, tasks]);

  const sectionCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const key = normalizeSection(task.section);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, { all: tasks.length });
  }, [tasks]);

  const recommendedTask = filteredTasks[0] || tasks[0] || null;
  const recentAttempts = performance?.recent_attempts || [];
  const sectionBreakdown = performance?.section_breakdown || {};
  const currentTask = mockQueue.length > 0 ? mockQueue[mockIndex] : selectedTask;
  const inMockMode = mockQueue.length > 0;
  const activeTone = scoreTone(Number(performance?.overall_score || 0));

  const resetWorkspace = () => {
    setSelectedTask(null);
    setMockQueue([]);
    setMockIndex(0);
    setResponse('');
    setResult(null);
  };

  const openTask = (task) => {
    setSelectedTask(task);
    setMockQueue([]);
    setMockIndex(0);
    setResponse('');
    setResult(null);
  };

  const startMiniMock = () => {
    const queue = tasks.slice(0, 4);
    if (queue.length === 0) return;
    setActiveTab('mock');
    setMockQueue(queue);
    setMockIndex(0);
    setSelectedTask(null);
    setResponse('');
    setResult(null);
  };

  const refreshPerformance = async () => {
    try {
      const res = await api.get('/pte/performance');
      setPerformance(res.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAttempt = async () => {
    if (!currentTask || !response.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/pte/attempts', {
        task_id: currentTask.id,
        response: response.trim(),
        is_mock_test: inMockMode
      });
      setResult(res.data);
      await refreshPerformance();
    } catch (err) {
      console.error(err);
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToNextMockTask = () => {
    if (mockIndex < mockQueue.length - 1) {
      setMockIndex((current) => current + 1);
      setResponse('');
      setResult(null);
      return;
    }

    resetWorkspace();
    setActiveTab('results');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (currentTask) {
    const section = normalizeSection(currentTask.section);
    const sectionInfo = sectionMeta[section];
    const SectionIcon = sectionInfo.icon;
    const metrics = result?.metrics || [];

    return (
      <div className="pte-lite-shell">
        <button
          type="button"
          className="pte-secondary"
          onClick={resetWorkspace}
          style={{ alignSelf: 'flex-start' }}
        >
          <ArrowLeft size={16} />
          Back to PTE app
        </button>

        <div className="pte-attempt-shell">
          <div className="pte-attempt-header">
            <div>
              <div className="pte-chip-row" style={{ marginBottom: '0.7rem' }}>
                <span className="pte-pill" style={{ color: sectionInfo.accent }}>{sectionInfo.label}</span>
                <span className="pte-pill">{inMockMode ? `Mini Mock ${mockIndex + 1}/${mockQueue.length}` : 'Quick Practice'}</span>
              </div>
              <h2 style={{ marginBottom: '0.35rem' }}>{currentTask.type}</h2>
              <p style={{ color: 'var(--text-dim)', maxWidth: '52rem' }}>
                {currentTask.prompt || 'Stay concise, stay accurate, and submit your strongest answer.'}
              </p>
            </div>

            <div className="pte-surface" style={{ minWidth: '160px', padding: '0.9rem' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Prep window</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
                <Clock3 size={16} color={sectionInfo.accent} />
                {prepMinutes[section] || 5} min focus set
              </div>
            </div>
          </div>

          <div className="pte-prompt-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <SectionIcon size={18} color={sectionInfo.accent} />
              <strong>Prompt</strong>
            </div>
            <p>{getTaskText(currentTask)}</p>
          </div>

          <div className="pte-surface">
            <div className="pte-chip-row" style={{ marginBottom: '0.9rem' }}>
              <span className="pte-chip">Mobile-style practice</span>
              <span className="pte-chip">AI-estimated score</span>
              <span className="pte-chip">Autosave coming next</span>
            </div>

            <textarea
              className="pte-response-box"
              placeholder={section === 'speaking' ? 'Type your spoken response transcript for now...' : 'Type your answer here...'}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
            />

            <div className="pte-action-row" style={{ marginTop: '1rem' }}>
              <button type="button" className="pte-primary" onClick={submitAttempt} disabled={submitting || !response.trim()}>
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Submit attempt
              </button>
              <button type="button" className="pte-secondary" onClick={() => setResponse('')}>
                Clear response
              </button>
            </div>
          </div>

          {result && (
            <div className="pte-surface">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Estimated score</p>
                  <h3 style={{ color: activeTone.color }}>{result.score}/{currentTask.max_score}</h3>
                </div>
                <div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Feedback</p>
                  <p style={{ fontWeight: 700 }}>{result.feedback}</p>
                </div>
              </div>

              <div className="pte-score-panel">
                {metrics.map((metric) => (
                  <div className="pte-score-box" key={metric.label}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>{metric.label}</p>
                    <p style={{ fontWeight: 800, marginTop: '0.25rem' }}>{metric.value}</p>
                  </div>
                ))}
              </div>

              {inMockMode && (
                <button type="button" className="pte-primary" onClick={goToNextMockTask} style={{ marginTop: '1rem' }}>
                  {mockIndex < mockQueue.length - 1 ? 'Next mock item' : 'Finish mini mock'}
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pte-lite-shell">
      <section className="pte-hero glass-morphism">
        <div className="pte-chip-row" style={{ marginBottom: '0.85rem' }}>
          <span className="pte-pill">Lite mobile mode</span>
          <span className="pte-pill">Daily PTE flow</span>
        </div>
        <h1 style={{ marginBottom: '0.45rem' }}>PTE Pocket Prep</h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '40rem', lineHeight: 1.7 }}>
          Quick drills, mini mocks, and exam-style feedback inside your student portal.
        </p>

        <div className="pte-quick-actions" style={{ marginTop: '1.1rem' }}>
          <button type="button" className="pte-primary" onClick={() => recommendedTask && openTask(recommendedTask)} disabled={!recommendedTask}>
            <PlayCircle size={18} />
            Start daily task
          </button>
          <button type="button" className="pte-secondary" onClick={startMiniMock} disabled={tasks.length === 0}>
            <WandSparkles size={18} />
            Launch mini mock
          </button>
        </div>
      </section>

      <div className="pte-kpi-grid">
        <div className="pte-kpi-card">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Average score</p>
          <h2 style={{ marginTop: '0.35rem' }}>{performance?.overall_score || 0}</h2>
          <p style={{ color: activeTone.color, fontSize: '0.82rem', marginTop: '0.35rem' }}>{activeTone.label}</p>
        </div>
        <div className="pte-kpi-card">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Total attempts</p>
          <h2 style={{ marginTop: '0.35rem' }}>{performance?.total_attempts || 0}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.35rem' }}>Across quick drills and mocks</p>
        </div>
        <div className="pte-kpi-card">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Current streak</p>
          <h2 style={{ marginTop: '0.35rem' }}>{performance?.streak_days || 0} days</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.35rem' }}>Keep the momentum alive</p>
        </div>
        <div className="pte-kpi-card">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Question bank</p>
          <h2 style={{ marginTop: '0.35rem' }}>{tasks.length}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.35rem' }}>Ready for bite-sized sessions</p>
        </div>
      </div>

      <div className="pte-tab-row">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`pte-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="pte-surface" style={{ borderColor: 'rgba(239, 68, 68, 0.35)', color: '#fecaca' }}>
          {error}
        </div>
      )}

      {activeTab === 'home' && (
        <div className="pte-grid-two">
          <div className="pte-surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Today&apos;s plan</p>
                <h3>One drill, one mini mock, one review</h3>
              </div>
              <span className="pte-pill">Target score 65+</span>
            </div>
            <div className="pte-chip-row">
              {Object.entries(sectionMeta).filter(([key]) => key !== 'all').map(([key, meta]) => (
                <span key={key} className="pte-chip">{meta.label}: {sectionCounts[key] || 0}</span>
              ))}
            </div>
            <div className="pte-list-item" style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Recommended next</p>
              <h4 style={{ marginTop: '0.35rem' }}>{recommendedTask?.type || 'No tasks yet'}</h4>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                {recommendedTask ? getTaskText(recommendedTask).slice(0, 140) : 'Add tasks from the admin panel to start practice.'}
              </p>
            </div>
          </div>

          <div className="pte-surface">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
              <Flame size={18} color="var(--accent)" />
              <h3>Recent wins</h3>
            </div>
            {recentAttempts.length > 0 ? recentAttempts.slice(0, 3).map((attempt) => (
              <div key={attempt.id} className="pte-list-item" style={{ marginBottom: '0.75rem', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <strong>{attempt.task_type}</strong>
                  <span style={{ color: scoreTone(Number(attempt.score)).color, fontWeight: 700 }}>{attempt.score}</span>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.35rem' }}>{formatDate(attempt.created_at)} - {attempt.feedback}</p>
              </div>
            )) : <div className="pte-empty">Your first attempts will show up here.</div>}
          </div>
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="pte-surface">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Choose a lane</p>
              <h3>Quick mobile-style drills</h3>
            </div>
            <span className="pte-pill">{filteredTasks.length} tasks</span>
          </div>

          <div className="pte-filter-row" style={{ marginBottom: '1rem' }}>
            {Object.entries(sectionMeta).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                className={`pte-filter ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <div className="pte-task-grid">
            {filteredTasks.map((task) => {
              const meta = sectionMeta[normalizeSection(task.section)];
              return (
                <button key={task.id} type="button" className="pte-task-card" onClick={() => openTask(task)} style={{ textAlign: 'left' }}>
                  <div className="pte-chip-row" style={{ marginBottom: '0.8rem' }}>
                    <span className="pte-pill" style={{ color: meta.accent }}>{meta.label}</span>
                    <span className="pte-pill">{prepMinutes[normalizeSection(task.section)] || 5} min</span>
                  </div>
                  <h4>{task.type}</h4>
                  <p style={{ color: 'var(--text-dim)', marginTop: '0.45rem', lineHeight: 1.6 }}>
                    {getTaskText(task).slice(0, 140)}
                  </p>
                </button>
              );
            })}
          </div>

          {filteredTasks.length === 0 && <div className="pte-empty">No tasks available in this section yet.</div>}
        </div>
      )}

      {activeTab === 'mock' && (
        <div className="pte-grid-two">
          <div className="pte-mini-card">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Lite mock format</p>
            <h3 style={{ marginTop: '0.35rem' }}>4 tasks / 15 minutes / instant review</h3>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.65rem', lineHeight: 1.7 }}>
              Perfect for mobile revision blocks before class or during commute downtime.
            </p>
            <div className="pte-chip-row" style={{ marginTop: '1rem' }}>
              <span className="pte-chip">Read Aloud</span>
              <span className="pte-chip">Repeat Sentence</span>
              <span className="pte-chip">Essay</span>
              <span className="pte-chip">WFD</span>
            </div>
            <button type="button" className="pte-primary" onClick={startMiniMock} style={{ marginTop: '1rem' }} disabled={tasks.length === 0}>
              <Trophy size={18} />
              Start mini mock
            </button>
          </div>

          <div className="pte-surface">
            <h3 style={{ marginBottom: '0.85rem' }}>What gets tracked</h3>
            <div className="pte-list-item" style={{ marginBottom: '0.75rem' }}>
              <strong>Speed</strong>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>Short practice sets for better consistency.</p>
            </div>
            <div className="pte-list-item" style={{ marginBottom: '0.75rem' }}>
              <strong>Estimated score</strong>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>Task-level performance after every submission.</p>
            </div>
            <div className="pte-list-item">
              <strong>History sync</strong>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>Attempts feed your student dashboard and trainer review.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="pte-results-grid">
          <div className="pte-surface">
            <h3 style={{ marginBottom: '1rem' }}>Section trends</h3>
            {Object.keys(sectionBreakdown).length > 0 ? Object.entries(sectionBreakdown).map(([section, info]) => (
              <div key={section} className="pte-list-item" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <strong>{sectionMeta[normalizeSection(section)]?.label || section}</strong>
                  <span>{info.average_score}</span>
                </div>
                <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>{info.attempts} attempts logged</p>
              </div>
            )) : <div className="pte-empty">Build section insights by submitting a few tasks.</div>}
          </div>

          <div className="pte-surface">
            <h3 style={{ marginBottom: '1rem' }}>Recent submissions</h3>
            {recentAttempts.length > 0 ? recentAttempts.map((attempt) => (
              <div key={attempt.id} className="pte-list-item" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <strong>{attempt.task_type}</strong>
                  <span style={{ color: scoreTone(Number(attempt.score)).color, fontWeight: 700 }}>{attempt.score}</span>
                </div>
                <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem' }}>{attempt.feedback}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.76rem', marginTop: '0.25rem' }}>{formatDate(attempt.created_at)}</p>
              </div>
            )) : <div className="pte-empty">No results yet. Start a task to see your first feedback card.</div>}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="pte-profile-grid">
          <div className="pte-surface">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Exam target</p>
            <h3 style={{ marginTop: '0.35rem' }}>PTE Academic 65+</h3>
            <div className="pte-chip-row" style={{ marginTop: '1rem' }}>
              <span className="pte-chip">Exam date: To be set</span>
              <span className="pte-chip">Plan: Lite practice</span>
            </div>
          </div>

          <div className="pte-surface">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Coach notes</p>
            <h3 style={{ marginTop: '0.35rem' }}>Focus on repetition and writing structure</h3>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.7rem', lineHeight: 1.7 }}>
              Best next step: complete 3 speaking tasks and 1 mini mock this week.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTEPractice;
