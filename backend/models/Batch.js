const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Course = require('./Course');
const User = require('./User');

const Batch = sequelize.define('Batch', {
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
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id',
    },
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  trainer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('enrolling', 'active', 'starting_soon', 'completed'),
    defaultValue: 'enrolling',
  },
  capacity: {
    type: DataTypes.INTEGER,
  },
  enrolled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  schedule: {
    type: DataTypes.JSON,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'batches',
  underscored: true,
});

Batch.belongsTo(Branch, { foreignKey: 'branch_id' });
Batch.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Batch, { foreignKey: 'course_id' });
Batch.belongsTo(User, { as: 'Trainer', foreignKey: 'trainer_id' });

module.exports = Batch;
