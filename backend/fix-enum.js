const sequelize = require('./config/db.config.js');

async function fixEnum() {
  try {
    const query = "ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'branch_admin', 'counselor', 'trainer', 'accounts', 'hr', 'student', 'guardian', 'staff', 'unassigned') DEFAULT 'unassigned';";
    await sequelize.query(query);
    console.log('Successfully altered user role enum in MySQL.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to alter enum:', error);
    process.exit(1);
  }
}

fixEnum();
