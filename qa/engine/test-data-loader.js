const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function loadExcel(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath);
  const sheet = sheetName || workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: '' });
}

/**
 * Load test data by filename from qa/test-data/.
 * Supports .json, .csv, .xlsx
 */
function loadTestData(testDataDir, filename, options = {}) {
  const filePath = path.join(testDataDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.json') return loadJson(filePath);
  if (ext === '.csv') return loadCsv(filePath);
  if (ext === '.xlsx' || ext === '.xls') return loadExcel(filePath, options.sheet);
  throw new Error(`Unsupported test data format: ${ext}`);
}

function compareExpectedActual(expected, actual, fields) {
  const mismatches = [];
  for (const field of fields) {
    const exp = expected[field];
    const act = actual[field];
    if (exp === undefined) continue;
    const expNum = Number(exp);
    const actNum = Number(act);
    if (!Number.isNaN(expNum) && !Number.isNaN(actNum)) {
      if (Math.abs(expNum - actNum) > 0.01) {
        mismatches.push({ field, expected: expNum, actual: actNum });
      }
    } else if (String(exp) !== String(act)) {
      mismatches.push({ field, expected: exp, actual: act });
    }
  }
  return { pass: mismatches.length === 0, mismatches };
}

module.exports = { loadTestData, loadJson, loadCsv, loadExcel, compareExpectedActual };
