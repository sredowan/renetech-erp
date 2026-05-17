const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  days_per_year: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#00D4FF',
  },
}, {
  tableName: 'leave_types',
  underscored: true,
});

module.exports = LeaveType;
