const sequelize = require('./config/db.config');
const PteTask = require('./models/PteTask');

async function checkTasks() {
  try {
    const count = await PteTask.count();
    const tasks = await PteTask.findAll({ limit: 5 });
    console.log(`Total tasks: ${count}`);
    console.log('Sample tasks:', JSON.stringify(tasks, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error checking tasks:', err);
    process.exit(1);
  }
}

checkTasks();
