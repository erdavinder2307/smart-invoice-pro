const invoiceValidator = require('./invoice-validator');
const paymentValidator = require('./payment-validator');
const taxValidator = require('./tax-validator');
const balanceValidator = require('./balance-validator');
const reconciliationValidator = require('./reconciliation-validator');

const VALIDATORS = {
  invoice: invoiceValidator,
  payment: paymentValidator,
  tax: taxValidator,
  balance: balanceValidator,
  reconciliation: reconciliationValidator,
};

function runValidation(type, payload) {
  const validator = VALIDATORS[type];
  if (!validator) {
    return { pass: false, errors: [`Unknown validator type: ${type}`] };
  }
  return validator.validate(payload);
}

function runAllValidations(checks) {
  const results = [];
  for (const check of checks) {
    const result = runValidation(check.type, check.payload);
    results.push({ ...check, ...result });
  }
  const pass = results.every((r) => r.pass);
  return { pass, results };
}

module.exports = { runValidation, runAllValidations, VALIDATORS };
