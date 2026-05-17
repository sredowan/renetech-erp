require('dotenv').config();
const Contact = require('./models/Contact');
async function test() {
  const contacts = await Contact.findAll({limit: 1});
  console.log("CONTACT RAW JSON:", JSON.stringify(contacts.map(c => c.toJSON()), null, 2));
  process.exit(0);
}
test();
