const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const User = require('./User');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('call', 'email', 'meeting', 'demo', 'whatsapp', 'note', 'task'),
    allowNull: false,
    defaultValue: 'note',
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  outcome: {
    type: DataTypes.STRING,
    comment: 'What happened: e.g. "Interested, will call back"',
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contact_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  opportunity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'crm_activities',
  underscored: true,
});

Activity.belongsTo(Branch, { foreignKey: 'branch_id' });
Activity.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

module.exports = Activity;
