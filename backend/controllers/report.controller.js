const Branch = require('../models/Branch');
const Lead = require('../models/Lead');
const Student = require('../models/Student');
const JournalLine = require('../models/JournalLine');
const Account = require('../models/Account');
const { Op, fn, col } = require('sequelize');

exports.getBranchComparison = async (req, res) => {
  try {
    const branches = await Branch.findAll({ where: { is_active: true } });
    
    const comparison = await Promise.all(branches.map(async (b) => {
      const studentCount = await Student.count({ where: { branch_id: b.id } });
      const leadCount = await Lead.count({ where: { branch_id: b.id } });
      
      const revenue = await JournalLine.sum('credit', {
        include: [{
          model: Account,
          where: { branch_id: b.id, type: 'revenue' }
        }]
      }) || 0;

      return {
        id: b.id,
        name: b.name,
        students: studentCount,
        leads: leadCount,
        revenue: parseFloat(revenue)
      };
    }));

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMonthlyTrends = async (req, res) => {
  try {
    // Last 6 months trend
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      });
    }

    const trends = await Promise.all(months.map(async (m) => {
      const leadCount = await Lead.count({
        where: {
          created_at: { [Op.between]: [m.start, m.end] }
        }
      });

      const revenue = await JournalLine.sum('credit', {
        where: {
          created_at: { [Op.between]: [m.start, m.end] }
        },
        include: [{
          model: Account,
          where: { type: 'revenue' }
        }]
      }) || 0;

      return {
        name: m.month,
        leads: leadCount,
        revenue: parseFloat(revenue)
      };
    }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeadSourceAnalytics = async (req, res) => {
    try {
        const sources = await Lead.findAll({
            attributes: [
                'source',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['source']
        });
        res.json(sources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
