const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const User = require('./User');

const CampaignTemplate = sequelize.define('CampaignTemplate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('email', 'whatsapp', 'sms'),
    defaultValue: 'email',
  },
  subject: {
    type: DataTypes.STRING,
    comment: 'Email subject or WhatsApp template name',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachment_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional URL to an attachment file',
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'scheduled'),
    defaultValue: 'draft',
  },
  target_audience: {
    type: DataTypes.ENUM('all_leads', 'new_leads', 'interested', 'trial', 'lost', 'all_contacts'),
    defaultValue: 'all_leads',
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sent_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'campaign_templates',
  underscored: true,
});

CampaignTemplate.belongsTo(Branch, { foreignKey: 'branch_id' });
CampaignTemplate.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

module.exports = CampaignTemplate;
