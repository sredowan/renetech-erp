const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const IncomeCategory = sequelize.define('IncomeCategory', {
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
  tableName: 'income_categories',
  underscored: true,
});

IncomeCategory.belongsTo(Branch, { foreignKey: 'branch_id' });
IncomeCategory.belongsTo(IncomeCategory, { as: 'Parent', foreignKey: 'parent_id' });
IncomeCategory.hasMany(IncomeCategory, { as: 'Children', foreignKey: 'parent_id' });

module.exports = IncomeCategory;
