const sequelize = require('./config/db.config.js');

async function migrate() {
  try {
    await sequelize.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(255) DEFAULT 'unassigned';");
    console.log('Altered users role');
    try {
      await sequelize.query("ALTER TABLE staff_profiles ADD COLUMN joining_date DATE;");
      console.log('Altered staff_profiles joining_date');
    } catch (e) {
      if(e.message.includes("Duplicate column name")) {
         console.log('Column joining_date already exists.');
      } else {
         throw e;
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
