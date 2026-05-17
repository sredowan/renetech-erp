const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const Contact = sequelize.define('Contact', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  company: {
    type: DataTypes.STRING,
    comment: 'Company or institution name',
  },
  designation: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.STRING,
    comment: 'How they found us: Facebook, Walk-in, Referral, etc.',
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'contacts',
  underscored: true,
});

Contact.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = Contact;
