const axios = require('axios');
const fs = require('fs');
const sequelize = require('./config/db.config');

(async () => {
  try {
    const token = fs.readFileSync('_token.txt', 'utf8').trim();
    const headers = { Authorization: 'Bearer ' + token };
    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers });

    console.log('1. Creating Income Category...');
    const cat = await api.post('/invoices/categories', { name: 'E2E Test Income Type ' + Date.now() });
    console.log('   -> Category ID:', cat.data.id);

    console.log('2. Creating Customer...');
    const cust = await api.post('/invoices/customers', { name: 'E2E Customer', phone: '01'+Date.now().toString().slice(-9) });
    console.log('   -> Customer ID:', cust.data.id);

    console.log('3. Creating Manual Invoice for Customer...');
    const invData = {
      invoice_type: 'custom',
      income_category_id: cat.data.id,
      customer_id: cust.data.id,
      customer_name: cust.data.name,
      amount: '3500.00',
      due_date: new Date().toISOString().split('T')[0],
      notes: 'Testing manual invoice flow'
    };
    const inv = await api.post('/invoices', invData);
    console.log('   -> Invoice Created:', inv.data.invoice_no, '(ID:', inv.data.id, ')');

    console.log('4. Paying Invoice via POS endpoint...');
    const payData = {
      invoice_id: inv.data.id,
      amount: '3500.00',
      method: 'cash',
      notes: 'Collected from POS test'
    };
    const payRes = await api.post('/pos/collect-custom-income', payData);
    console.log('   -> Payment Message:', payRes.data.message);
    console.log('   -> Transaction ID:', payRes.data.transaction.id);

    console.log('5. Verifying Invoice Status...');
    const pendingList = await api.get('/pos/pending');
    console.log('   -> Invoice in pending anymore?', pendingList.data.some(i => i.id === inv.data.id) ? 'YES (Error)' : 'NO (Success)');

    const fetchInv = await api.get('/invoices');
    const myInv = fetchInv.data.find(i => i.id === inv.data.id);
    console.log('   -> Final Status:', myInv.status, '| Paid:', myInv.paid);

    console.log('6. Verifying Journals & Reconciliation Data...');
    const je = await sequelize.query(`SELECT * FROM journal_entries WHERE ref_no = '${payRes.data.transaction.receipt_no}'`);
    console.log('   -> Created Journal Entry?', je[0].length === 1 ? 'YES' : 'NO');
    
    if (je[0].length > 0) {
      const jl = await sequelize.query(`SELECT * FROM journal_lines WHERE journal_entry_id = ${je[0][0].id}`);
      console.log('   -> Created double-entry Journal Lines? Count:', jl[0].length);
      jl[0].forEach(line => {
        console.log(`      - Debit: ${line.debit} | Credit: ${line.credit} (Account ${line.account_id})`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
})();
