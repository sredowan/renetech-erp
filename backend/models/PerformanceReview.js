const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');

const PerformanceReview = sequelize.define('PerformanceReview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  review_period: {
    type: DataTypes.STRING(50),
  },
  ratings: {
    type: DataTypes.JSON,
  },
  overall_score: {
    type: DataTypes.DECIMAL(3, 1),
  },
  strengths: {
    type: DataTypes.TEXT,
  },
  improvements: {
    type: DataTypes.TEXT,
  },
  goals: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'acknowledged'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'performance_reviews',
  underscored: true,
});

PerformanceReview.belongsTo(User, { foreignKey: 'user_id', as: 'Employee' });
PerformanceReview.belongsTo(User, { foreignKey: 'reviewer_id', as: 'Reviewer' });
PerformanceReview.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = PerformanceReview;
