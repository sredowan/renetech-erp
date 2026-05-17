const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Enrollment = require('./Enrollment');
const User = require('./User');
const Account = require('./Account');
const Invoice = require('./Invoice');

const Transaction = sequelize.define('Transaction', {
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
  enrollment_id: {
    type: DataTypes.INTEGER,
    references: { model: Enrollment, key: 'id' },
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    references: { model: Invoice, key: 'id' },
  },
  receipt_no: {
    type: DataTypes.STRING,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('bkash', 'nagad', 'card', 'cash', 'bank_transfer'),
    allowNull: false,
  },
  transaction_ref: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.ENUM('pos_fee', 'premium_plan', 'website', 'manual'),
    defaultValue: 'pos_fee',
  },
  account_id: {
    type: DataTypes.INTEGER,
    references: { model: Account, key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('success', 'pending', 'failed'),
    defaultValue: 'success',
  },
  paid_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'transactions',
  underscored: true,
});

Transaction.belongsTo(Branch, { foreignKey: 'branch_id' });
Transaction.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Transaction.belongsTo(Invoice, { foreignKey: 'invoice_id' });
Transaction.belongsTo(User, { as: 'Recorder', foreignKey: 'recorded_by' });
Transaction.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = Transaction;