#!/usr/bin/env node
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const testDataDir = path.join(__dirname, '../test-data');

function writeSheet(filename, rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, path.join(testDataDir, filename));
  console.log('Wrote', filename);
}

const customers = JSON.parse(
  fs.readFileSync(path.join(testDataDir, 'customers.json'), 'utf8')
);
const items = JSON.parse(fs.readFileSync(path.join(testDataDir, 'items.json'), 'utf8'));

writeSheet('customers.xlsx', customers);
writeSheet('items.xlsx', items);

const invoiceScenarios = JSON.parse(
  fs.readFileSync(path.join(testDataDir, 'invoice-scenarios.json'), 'utf8')
);
writeSheet('invoice-scenarios.xlsx', [
  { scenario: 'full-lifecycle', customer: invoiceScenarios['full-lifecycle'].customer.name },
  { scenario: 'partial-payment', customer: 'QA Partial Customer' },
]);
