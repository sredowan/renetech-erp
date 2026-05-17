const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Branch, key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('head', 'sub'),
    defaultValue: 'head',
  },
  description: {
    type: DataTypes.STRING,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'expense_categories',
  underscored: true,
});

ExpenseCategory.belongsTo(Branch, { foreignKey: 'branch_id' });
ExpenseCategory.belongsTo(ExpenseCategory, { as: 'Parent', foreignKey: 'parent_id' });
ExpenseCategory.hasMany(ExpenseCategory, { as: 'Children', foreignKey: 'parent_id' });

module.exports = ExpenseCategory;
