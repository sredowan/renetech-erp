const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Student = require('./Student');
const PteTask = require('./PteTask');

const PteAttempt = sequelize.define('PteAttempt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id',
    },
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Student,
      key: 'id',
    },
  },
  task_id: {
    type: DataTypes.INTEGER,
    references: {
      model: PteTask,
      key: 'id',
    },
  },
  response: {
    type: DataTypes.JSON,
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  evaluation: {
    type: DataTypes.JSON,
  },
  is_mock_test: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'pte_attempts',
  underscored: true,
});

PteAttempt.belongsTo(Branch, { foreignKey: 'branch_id' });
PteAttempt.belongsTo(Student, { foreignKey: 'student_id' });
PteAttempt.belongsTo(PteTask, { foreignKey: 'task_id' });

module.exports = PteAttempt;
