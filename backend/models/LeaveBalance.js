const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const LeaveType = require('./LeaveType');

const LeaveBalance = sequelize.define('LeaveBalance', {
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
  leave_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: LeaveType, key: 'id' },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entitled: {
    type: DataTypes.DECIMAL(4, 1),
    defaultValue: 0,
  },
  used: {
    type: DataTypes.DECIMAL(4, 1),
    defaultValue: 0,
  },
  carried_over: {
    type: DataTypes.DECIMAL(4, 1),
    defaultValue: 0,
  },
}, {
  tableName: 'leave_balances',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'leave_type_id', 'year'] }],
});

LeaveBalance.belongsTo(User, { foreignKey: 'user_id' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

module.exports = LeaveBalance;
