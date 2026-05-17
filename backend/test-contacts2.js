require('dotenv').config();
const Contact = require('./models/Contact');
async function test() {
  const contacts = await Contact.findAll({
    where: { branch_id: 1, is_active: true },
    order: [['created_at', 'DESC']]
  });
  console.log("Output of mapping: ", JSON.stringify(contacts.map(c => c.toJSON())[0], null, 2));
  process.exit(0);
}
test();
