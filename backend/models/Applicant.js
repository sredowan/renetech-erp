const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const JobPosting = require('./JobPosting');

const Applicant = sequelize.define('Applicant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  job_posting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: JobPosting, key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING(50),
  },
  resume_url: {
    type: DataTypes.STRING(500),
  },
  cover_letter: {
    type: DataTypes.TEXT,
  },
  stage: {
    type: DataTypes.ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected'),
    defaultValue: 'applied',
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'applicants',
  underscored: true,
});

Applicant.belongsTo(JobPosting, { foreignKey: 'job_posting_id' });
JobPosting.hasMany(Applicant, { foreignKey: 'job_posting_id' });

module.exports = Applicant;
