const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Account = require('./Account');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Account, key: 'id' },
  },
  period: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly',
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  allocated: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
  },
  spent: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'budgets',
  underscored: true,
});

Budget.belongsTo(Branch, { foreignKey: 'branch_id' });
Budget.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = Budget;
