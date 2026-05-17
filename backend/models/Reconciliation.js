const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Reconciliation = sequelize.define('Reconciliation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    bank_account_id: { type: DataTypes.UUID, allowNull: false },
    statement_date: { type: DataTypes.DATEONLY },
    reconciled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('draft', 'completed'), defaultValue: 'draft' },
    verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verified_by: { type: DataTypes.STRING },
    verified_at: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT },
    match_type: { type: DataTypes.ENUM('manual', 'auto'), defaultValue: 'manual' },
    created_by: { type: DataTypes.STRING }
}, {
    tableName: 'reconciliations',
    underscored: true
});

module.exports = Reconciliation;