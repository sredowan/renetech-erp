const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const User = require('./User');

const ReconciliationEvent = sequelize.define('ReconciliationEvent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'reconciliation_sessions', key: 'id' },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
  },
  old_value: {
    type: DataTypes.JSON,
  },
  new_value: {
    type: DataTypes.JSON,
  },
}, {
  tableName: 'reconciliation_events',
  underscored: true,
});

ReconciliationEvent.belongsTo(Branch, { foreignKey: 'branch_id' });
ReconciliationEvent.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ReconciliationEvent;