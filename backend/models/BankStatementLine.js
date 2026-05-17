const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const BankStatementLine = sequelize.define('BankStatementLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    bank_account_id: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.STRING },
    reference: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false }, // Positive for credit, Negative for debit
    status: { type: DataTypes.ENUM('unmatched', 'matched', 'ignored'), defaultValue: 'unmatched' }
}, {
    tableName: 'bank_statement_lines',
    underscored: true
});

module.exports = BankStatementLine;
