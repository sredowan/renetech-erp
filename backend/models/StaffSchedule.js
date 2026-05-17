const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Shift = require('./Shift');

const StaffSchedule = sequelize.define('StaffSchedule', {
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
  shift_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Shift, key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'staff_schedules',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'date'] }],
});

StaffSchedule.belongsTo(User, { foreignKey: 'user_id' });
StaffSchedule.belongsTo(Shift, { foreignKey: 'shift_id' });

module.exports = StaffSchedule;
