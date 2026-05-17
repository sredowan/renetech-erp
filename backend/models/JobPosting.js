const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');

const JobPosting = sequelize.define('JobPosting', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  requirements: {
    type: DataTypes.TEXT,
  },
  salary_range: {
    type: DataTypes.STRING(100),
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'on_hold'),
    defaultValue: 'open',
  },
  posted_by: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
  deadline: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'job_postings',
  underscored: true,
});

JobPosting.belongsTo(Branch, { foreignKey: 'branch_id' });
JobPosting.belongsTo(User, { foreignKey: 'posted_by', as: 'PostedBy' });

module.exports = JobPosting;
