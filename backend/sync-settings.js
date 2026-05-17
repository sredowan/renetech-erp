require('dotenv').config();
const sequelize = require('./config/db.config');
const SystemSetting = require('./models/SystemSetting');
const { initializeDefaults } = require('./controllers/settings.controller');

async function run() {
  try {
    await SystemSetting.sync({ force: false }); // creates table if not exist
    console.log("Table created.");
    await initializeDefaults();
    console.log("Defaults initialized!");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
