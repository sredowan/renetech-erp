const sequelize = require('./config/db.config.js');
const Course = require('./models/Course.js');
const Batch = require('./models/Batch.js');
const { Op } = require('sequelize');
const fs = require('fs');

async function run() {
  try {
    const slug = "1";
    const isId = /^\d+$/.test(slug);
    
    const course = await Course.findOne({
      where: {
        [Op.or]: [
          { slug: slug },
          ...(isId ? [{ id: parseInt(slug, 10) }] : [])
        ],
        is_published: true,
        status: 'active'
      },
      include: [
        {
          model: Batch,
          where: { status: 'upcoming' },
          required: false,
          attributes: ['id', 'name', 'start_date', 'fee', 'schedule', 'capacity', 'enrolled']
        }
      ]
    });
    fs.writeFileSync('./error.txt', "SUCCESS: " + JSON.stringify(course));
  } catch(e) {
    fs.writeFileSync('./error.txt', e.toString() + "\n" + e.stack);
  }
  process.exit(0);
}
run();
