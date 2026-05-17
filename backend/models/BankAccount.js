const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const BankAccount = sequelize.define('BankAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    account_name: { type: DataTypes.STRING, allowNull: false },
    account_number: { type: DataTypes.STRING, allowNull: false },
    bank_name: { type: DataTypes.STRING, allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'BDT' },
    balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 }
}, {
    tableName: 'bank_accounts',
    underscored: true
});

module.exports = BankAccount;
