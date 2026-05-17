const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.STRING,
  },
  capacity: {
    type: DataTypes.INTEGER,
  },
  facilities: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('free', 'occupied', 'booked', 'maintenance'),
    defaultValue: 'free',
  },
}, {
  tableName: 'rooms',
  underscored: true,
});

Room.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = Room;
