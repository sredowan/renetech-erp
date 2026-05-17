require('dotenv').config();
const sequelize = require('./config/db.config');

async function run() {
  try {
    await sequelize.query("ALTER TABLE campaign_templates ADD COLUMN attachment_url VARCHAR(255) NULL");
    console.log("Column added successfully.");
  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('Column already exists.');
    } else {
      console.error("Error adding column:", err);
    }
  }
  process.exit(0);
}
run();
