const sequelize = require('./config/db.config.js');
const Lead = require('./models/Lead');
const Batch = require('./models/Batch');
const Student = require('./models/Student');
const JournalLine = require('./models/JournalLine');
const Account = require('./models/Account');

async function testStats() {
  try {
    console.log("Starting test...");
    const whereClause = {};
    const totalLeads = await Lead.count({ where: whereClause });
    console.log({ totalLeads });
    const totalBatches = await Batch.count({ where: whereClause });
    console.log({ totalBatches });
    const totalStudents = await Student.count({ where: whereClause });
    console.log({ totalStudents });
    
    const revenue = await JournalLine.sum('credit', {
      include: [{
        model: Account,
        where: { ...whereClause, type: 'revenue' },
        required: true
      }]
    }) || 0;
    console.log({ revenue });
    
    const expenses = await JournalLine.sum('debit', {
      include: [{
        model: Account,
        where: { ...whereClause, type: 'expense' },
        required: true
      }]
    }) || 0;
    console.log({ expenses });
    
    console.log("ALL STATS FETCHED SUCCESSFULLY");
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    process.exit(0);
  }
}

testStats();
