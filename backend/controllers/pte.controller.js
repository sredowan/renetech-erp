const { Op } = require('sequelize');
const PteTask = require('../models/PteTask');
const PteAttempt = require('../models/PteAttempt');
const Student = require('../models/Student');
const User = require('../models/User');

const textOf = (value) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  if (value && typeof value === 'object') return value.prompt || value.text || value.body || JSON.stringify(value);
  return '';
};

const answerKeyOf = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).toLowerCase());
  if (typeof value === 'string') return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value).map((item) => String(item).toLowerCase());
  return [];
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const scoreAttempt = (task, responseText) => {
  const answerKey = answerKeyOf(task.correct_answer);
  const response = responseText.trim();
  const words = response ? response.split(/\s+/) : [];
  const lower = response.toLowerCase();
  const maxScore = Number(task.max_score || 90);

  if (task.section === 'writing') {
    const hitRate = answerKey.length ? answerKey.filter((keyword) => lower.includes(keyword)).length / answerKey.length : 0.6;
    const content = clamp(Math.round(hitRate * 5), 1, 5);
    const form = clamp(Math.round(words.length / 25), 1, 5);
    const grammar = clamp(5 - Math.floor((response.match(/[!?]{2,}|\s{2,}/g) || []).length), 2, 5);
    const vocabulary = clamp(Math.round(new Set(words.map((word) => word.toLowerCase())).size / 12), 1, 5);
    const score = Math.round((((content * 0.35) + (form * 0.2) + (grammar * 0.25) + (vocabulary * 0.2)) / 5) * maxScore);

    return {
      score,
      evaluation: { content, form, grammar, vocabulary },
      feedback: score >= 70 ? 'Strong structure and useful coverage.' : 'Keep tightening ideas and sentence control.',
      metrics: [
        { label: 'Content', value: `${content}/5` },
        { label: 'Form', value: `${form}/5` },
        { label: 'Grammar', value: `${grammar}/5` },
        { label: 'Vocabulary', value: `${vocabulary}/5` }
      ]
    };
  }

  if (task.section === 'speaking') {
    const hitRate = answerKey.length ? answerKey.filter((keyword) => lower.includes(keyword)).length / answerKey.length : 0.6;
    const content = clamp(Math.round(hitRate * 5), 1, 5);
    const fluency = clamp(Math.round(words.length / 12), 1, 5);
    const pronunciation = clamp(response.length > 40 ? 4 : 2, 1, 5);
    const score = Math.round((((content * 0.35) + (fluency * 0.35) + (pronunciation * 0.3)) / 5) * maxScore);

    return {
      score,
      evaluation: { content, fluency, pronunciation },
      feedback: score >= 70 ? 'Good pace and relevance for a lite speaking drill.' : 'Add more detail and keep the flow steady.',
      metrics: [
        { label: 'Content', value: `${content}/5` },
        { label: 'Fluency', value: `${fluency}/5` },
        { label: 'Pronunciation', value: `${pronunciation}/5` },
        { label: 'Words', value: `${words.length}` }
      ]
    };
  }

  const hitRate = answerKey.length ? answerKey.filter((keyword) => lower.includes(keyword)).length / answerKey.length : (lower ? 0.6 : 0);
  const accuracy = clamp(Math.round(hitRate * 5), 0, 5);
  const completion = words.length > 0 ? clamp(Math.round(words.length / 6), 1, 5) : 0;
  const score = Math.round((((accuracy * 0.7) + (completion * 0.3)) / 5) * maxScore);

  return {
    score,
    evaluation: { accuracy, completion },
    feedback: score >= 70 ? 'Sharp and accurate response.' : 'Review the prompt and aim for stronger accuracy.',
    metrics: [
      { label: 'Accuracy', value: `${accuracy}/5` },
      { label: 'Completion', value: `${completion}/5` },
      { label: 'Words', value: `${words.length}` },
      { label: 'Mode', value: task.section }
    ]
  };
};

const formatTask = (task) => ({
  ...task.toJSON(),
  title: task.type,
  prompt: task.section === 'speaking'
    ? 'Read, think, then deliver a natural response.'
    : 'Work through the prompt and submit your best answer.',
  content: textOf(task.content),
  estimated_time: task.section === 'writing' ? 12 : task.section === 'speaking' ? 3 : 5
});

const formatAttempt = (attempt) => ({
  id: attempt.id,
  score: Number(attempt.score || 0),
  task_type: attempt.PteTask?.type || 'Practice Task',
  section: attempt.PteTask?.section || 'practice',
  created_at: attempt.created_at,
  feedback: attempt.evaluation?.content >= 4 || attempt.evaluation?.accuracy >= 4 ? 'Strong attempt' : 'Room to improve',
  is_mock_test: attempt.is_mock_test
});

exports.getTasks = async (req, res) => {
  try {
    const { section, type } = req.query;
    const where = {};
    if (section) where.section = section;
    if (type) where.type = type;

    const tasks = await PteTask.findAll({ where, order: [['id', 'ASC']] });
    res.json(tasks.map(formatTask));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAttempt = async (req, res) => {
  try {
    const { task_id, is_mock_test } = req.body;
    const responseText = String(req.body.response || req.body.response_text || '').trim();

    if (!responseText) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const task = await PteTask.findByPk(task_id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const scoring = scoreAttempt(task, responseText);
    const student = await Student.findOne({ where: { user_id: req.user.id } });

    const attempt = await PteAttempt.create({
      branch_id: req.branchId,
      student_id: student?.id || null,
      task_id,
      response: { text: responseText },
      score: scoring.score,
      evaluation: scoring.evaluation,
      is_mock_test: !!is_mock_test
    });

    res.status(201).json({
      ...attempt.toJSON(),
      feedback: scoring.feedback,
      metrics: scoring.metrics,
      response: { text: responseText },
      task: formatTask(task)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBranchPerformance = async (req, res) => {
  try {
    const { batch_id } = req.query;
    const where = { branch_id: req.branchId };
    const include = [
      { model: PteTask },
      {
        model: Student,
        include: [{ model: User, attributes: ['name'] }],
        where: batch_id ? { batch_id } : {}
      }
    ];

    const attempts = await PteAttempt.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    const studentIds = student ? [student.id, req.user.id] : [req.user.id];
    const attempts = await PteAttempt.findAll({
      where: { student_id: { [Op.in]: studentIds } },
      include: [PteTask],
      order: [['created_at', 'DESC']]
    });

    const totalAttempts = attempts.length;
    const overallScore = totalAttempts
      ? (attempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0) / totalAttempts).toFixed(1)
      : '0.0';

    const sectionBreakdown = attempts.reduce((acc, attempt) => {
      const section = attempt.PteTask?.section || 'practice';
      if (!acc[section]) acc[section] = { attempts: 0, total: 0 };
      acc[section].attempts += 1;
      acc[section].total += Number(attempt.score || 0);
      return acc;
    }, {});

    Object.keys(sectionBreakdown).forEach((section) => {
      const bucket = sectionBreakdown[section];
      bucket.average_score = (bucket.total / bucket.attempts).toFixed(1);
      delete bucket.total;
    });

    const streakDates = [...new Set(attempts.map((attempt) => new Date(attempt.created_at).toDateString()))];

    res.json({
      overall_score: overallScore,
      total_attempts: totalAttempts,
      streak_days: streakDates.length,
      recent_attempts: attempts.slice(0, 6).map(formatAttempt),
      section_breakdown: sectionBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
