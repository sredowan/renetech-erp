const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ReconciliationMatch = sequelize.define('ReconciliationMatch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reconciliation_id: { type: DataTypes.UUID, allowNull: false },
    statement_line_id: { type: DataTypes.UUID, allowNull: false },
    journal_line_id: { type: DataTypes.UUID, allowNull: false }
}, {
    tableName: 'reconciliation_matches',
    underscored: true
});

module.exports = ReconciliationMatch;
