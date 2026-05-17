const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const SystemSetting = sequelize.define('SystemSetting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  setting_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_secret: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general',
  },
}, {
  tableName: 'system_settings',
  underscored: true,
  timestamps: true
});

module.exports = SystemSetting;
