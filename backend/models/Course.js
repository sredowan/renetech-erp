const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const Course = sequelize.define('Course', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  base_fee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  duration_weeks: {
    type: DataTypes.INTEGER,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  short_description: {
    type: DataTypes.STRING(255),
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  image_url: {
    type: DataTypes.STRING,
  },
  instructor_name: {
    type: DataTypes.STRING,
  },
  instructor_bio: {
    type: DataTypes.TEXT,
  },
  instructor_video_url: {
    type: DataTypes.STRING,
  },
  what_you_will_learn: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  modules: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.STRING,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active',
  },
}, {
  tableName: 'courses',
  underscored: true,
});

Course.belongsTo(Branch, { foreignKey: 'branch_id' });
Branch.hasMany(Course, { foreignKey: 'branch_id' });

module.exports = Course;
