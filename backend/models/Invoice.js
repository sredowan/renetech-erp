const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Enrollment = require('./Enrollment');
const Student = require('./Student');
const IncomeCategory = require('./IncomeCategory');
const Customer = require('./Customer');

const Invoice = sequelize.define('Invoice', {
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
  invoice_no: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  enrollment_id: {
    type: DataTypes.INTEGER,
    references: { model: Enrollment, key: 'id' },
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: { model: Student, key: 'id' },
  },
  invoice_type: {
    type: DataTypes.ENUM('tuition', 'custom'),
    defaultValue: 'tuition',
  },
  income_category_id: {
    type: DataTypes.INTEGER,
    references: { model: IncomeCategory, key: 'id' },
  },
  customer_id: {
    type: DataTypes.INTEGER,
    references: { model: Customer, key: 'id' },
  },
  customer_name: {
    type: DataTypes.STRING,
  },
  customer_phone: {
    type: DataTypes.STRING,
  },
  customer_email: {
    type: DataTypes.STRING,
  },
  customer_company: {
    type: DataTypes.STRING,
  },
  customer_address: {
    type: DataTypes.TEXT,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paid: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'paid', 'overdue', 'partial', 'rejected'),
    defaultValue: 'pending',
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'invoices',
  underscored: true,
});

Invoice.belongsTo(Branch, { foreignKey: 'branch_id' });
Invoice.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Invoice.belongsTo(Student, { foreignKey: 'student_id' });
Invoice.belongsTo(IncomeCategory, { foreignKey: 'income_category_id' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = Invoice;
