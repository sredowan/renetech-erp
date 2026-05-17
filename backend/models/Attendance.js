const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Student = require('./Student');
const Batch = require('./Batch');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
    defaultValue: 'absent',
  },
  method: {
    type: DataTypes.ENUM('manual', 'qr'),
    defaultValue: 'manual',
  },
}, {
  tableName: 'attendance',
  underscored: true,
});

Attendance.belongsTo(Branch, { foreignKey: 'branch_id' });
Attendance.belongsTo(Student, { foreignKey: 'student_id' });
Attendance.belongsTo(Batch, { foreignKey: 'batch_id' });

module.exports = Attendance;
