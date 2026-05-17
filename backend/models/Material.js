const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Batch = require('./Batch');
const User = require('./User');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Batch,
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('document', 'video', 'link', 'meeting'),
    defaultValue: 'document',
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'materials',
  underscored: true,
});

Material.belongsTo(Batch, { foreignKey: 'batch_id' });
Material.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

module.exports = Material;
