const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Student = require('./Student');
const Batch = require('./Batch');

const Enrollment = sequelize.define('Enrollment', {
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
  batch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Batch,
      key: 'id',
    },
  },
  total_fee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('paid', 'partial', 'pending', 'overdue', 'cancelled'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'enrollments',
  underscored: true,
});

Enrollment.belongsTo(Branch, { foreignKey: 'branch_id' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id' });
Enrollment.belongsTo(Batch, { foreignKey: 'batch_id' });

module.exports = Enrollment;
