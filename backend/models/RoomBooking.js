const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Room = require('./Room');
const Batch = require('./Batch');

const RoomBooking = sequelize.define('RoomBooking', {
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
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id',
    },
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Batch,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  start_time: {
    type: DataTypes.TIME,
  },
  end_time: {
    type: DataTypes.TIME,
  },
}, {
  tableName: 'room_bookings',
  underscored: true,
});

RoomBooking.belongsTo(Branch, { foreignKey: 'branch_id' });
RoomBooking.belongsTo(Room, { foreignKey: 'room_id' });
RoomBooking.belongsTo(Batch, { foreignKey: 'batch_id' });

module.exports = RoomBooking;
