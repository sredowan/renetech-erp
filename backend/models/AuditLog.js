const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    references: { model: Branch, key: 'id' },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.INTEGER,
  },
  old_value: {
    type: DataTypes.JSON,
  },
  new_value: {
    type: DataTypes.JSON,
  },
  ip_address: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'audit_logs',
  underscored: true,
});

AuditLog.belongsTo(User, { foreignKey: 'user_id' });
AuditLog.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = AuditLog;
