require('dotenv').config();
const sequelize = require('./config/db.config');
const { initializeDefaults } = require('./controllers/settings.controller');

async function run() {
  try {
    await initializeDefaults();
    console.log("Settings initialized successfully.");
  } catch (err) {
    console.error("Error initializing:", err);
  }
  process.exit(0);
}
run();
