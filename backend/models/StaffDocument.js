const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');

const StaffDocument = sequelize.define('StaffDocument', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('contract', 'id', 'certificate', 'tax', 'other'),
    defaultValue: 'other',
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(50),
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'staff_documents',
  underscored: true,
});

StaffDocument.belongsTo(User, { foreignKey: 'user_id', as: 'Staff' });
StaffDocument.belongsTo(User, { foreignKey: 'uploaded_by', as: 'Uploader' });
StaffDocument.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = StaffDocument;
