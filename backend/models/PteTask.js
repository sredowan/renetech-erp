const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const PteTask = sequelize.define('PteTask', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  section: {
    type: DataTypes.ENUM('speaking', 'writing', 'reading', 'listening'),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSON,
  },
  correct_answer: {
    type: DataTypes.JSON,
  },
  max_score: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
  },
  is_free_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_premium_only: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'pte_tasks',
  underscored: true,
});

module.exports = PteTask;
