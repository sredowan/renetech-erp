const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const RbacConfig = sequelize.define('RbacConfig', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  config_json: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('config_json');
      try { return JSON.parse(raw); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('config_json', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  custom_roles_json: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('custom_roles_json');
      try { return JSON.parse(raw); } catch { return []; }
    },
    set(val) {
      this.setDataValue('custom_roles_json', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'rbac_configs',
  underscored: true,
  timestamps: true,
});

module.exports = RbacConfig;
