const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Account = require('./Account');
const BankAccount = require('./BankAccount');

const ReconciliationLine = sequelize.define('ReconciliationLine', {
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
  mapping_id: {
    type: DataTypes.INTEGER,
    references: { model: 'bank_account_ledger_maps', key: 'id' },
  },
  account_id: {
    type: DataTypes.INTEGER,
    references: { model: Account, key: 'id' },
  },
  bank_account_id: {
    type: DataTypes.UUID,
    references: { model: BankAccount, key: 'id' },
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operational_inflows: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  operational_outflows: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  operational_net: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  opening_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  expected_closing_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  actual_closing_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  discrepancy_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  discrepancy_reason: {
    type: DataTypes.TEXT,
  },
  submitted_by: {
    type: DataTypes.INTEGER,
  },
  submitted_at: {
    type: DataTypes.DATE,
  },
  ledger_debit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  ledger_credit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  ledger_net: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  variance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('matched', 'variance_minor', 'variance_major', 'needs_review'),
    defaultValue: 'matched',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  tx_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expense_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'reconciliation_lines',
  underscored: true,
});

ReconciliationLine.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = ReconciliationLine;
