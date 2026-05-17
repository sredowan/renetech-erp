const sequelize = require('./config/db.config.js');
const Course = require('./models/Course.js');
const fs = require('fs');
async function run() {
  await sequelize.authenticate();
  const courses = await Course.findAll({attributes: ['id', 'title', 'slug', 'is_published', 'status']});
  fs.writeFileSync('./courses_output.json', JSON.stringify(courses, null, 2));
  process.exit(0);
}
run();
