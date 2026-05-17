const sequelize = require('./config/db.config');

async function checkData() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT * FROM expense_categories");
    console.log('Current expense_categories data:');
    console.table(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkData();
