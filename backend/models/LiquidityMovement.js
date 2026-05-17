const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Account = require('./Account');
const User = require('./User');

const LiquidityMovement = sequelize.define('LiquidityMovement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  branch_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Branch, key: 'id' } },
  account_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Account, key: 'id' } },
  related_account_id: { type: DataTypes.INTEGER, references: { model: Account, key: 'id' } },
  movement_date: { type: DataTypes.DATEONLY, allowNull: false },
  transaction_type: {
    type: DataTypes.ENUM('opening_balance', 'opening_adjustment', 'collection', 'direct_bank_receipt', 'mobile_receipt', 'transfer_in', 'transfer_out', 'expense', 'closing_submission', 'closing_adjustment', 'manual_adjustment', 'reversal'),
    allowNull: false,
  },
  direction: { type: DataTypes.ENUM('inflow', 'outflow', 'neutral'), allowNull: false, defaultValue: 'neutral' },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
  previous_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  new_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  actual_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  variance_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  reference: { type: DataTypes.STRING },
  source_model: { type: DataTypes.STRING },
  source_id: { type: DataTypes.STRING },
  remarks: { type: DataTypes.TEXT },
  reason: { type: DataTypes.TEXT },
  created_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
  updated_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
}, {
  tableName: 'liquidity_movements',
  underscored: true,
});

LiquidityMovement.belongsTo(Branch, { foreignKey: 'branch_id' });
LiquidityMovement.belongsTo(Account, { foreignKey: 'account_id' });
LiquidityMovement.belongsTo(Account, { as: 'RelatedAccount', foreignKey: 'related_account_id' });
LiquidityMovement.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });
LiquidityMovement.belongsTo(User, { as: 'Updater', foreignKey: 'updated_by' });

module.exports = LiquidityMovement;
