const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const User = require('./User');

const Opportunity = sequelize.define('Opportunity', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "Rashida – PTE Academic Enrollment"',
  },
  contact_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Originating lead if converted',
  },
  stage: {
    type: DataTypes.ENUM('qualification', 'proposal', 'demo', 'negotiation', 'won', 'lost'),
    defaultValue: 'qualification',
  },
  value: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Expected revenue amount in BDT',
  },
  probability: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    comment: 'Win probability 0-100%',
  },
  expected_close: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  description: {
    type: DataTypes.TEXT,
  },
  lost_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Linked invoice created on win',
  },
  course_interest: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'opportunities',
  underscored: true,
});

Opportunity.belongsTo(Branch, { foreignKey: 'branch_id' });
Opportunity.belongsTo(User, { as: 'AssignedTo', foreignKey: 'assigned_to' });

module.exports = Opportunity;
