const ExpenseCategory = require('./models/ExpenseCategory');
const sequelize = require('./config/db.config');

async function test() {
    try {
        const cats = await ExpenseCategory.findAll();
        console.log('Categories in DB:', JSON.stringify(cats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
