/**
 * Future-ready validation for bank reconciliation workflows.
 */
function validate({ bankTransactions = [], matchedPairs = [], unmatchedCount }) {
  const errors = [];
  const warnings = [];

  for (const pair of matchedPairs) {
    const bankAmt = Number(pair.bank_amount ?? pair.statement_amount ?? 0);
    const bookAmt = Number(pair.book_amount ?? pair.ledger_amount ?? 0);
    if (Math.abs(bankAmt - bookAmt) > 0.02) {
      errors.push(`Matched pair amount mismatch: bank=${bankAmt}, book=${bookAmt}`);
    }
  }

  const matchedBankIds = new Set(matchedPairs.map((p) => p.bank_transaction_id));
  for (const tx of bankTransactions) {
    if (tx.matched && !matchedBankIds.has(tx.id)) {
      warnings.push(`Transaction ${tx.id} marked matched but not in matchedPairs`);
    }
  }

  if (typeof unmatchedCount === 'number' && unmatchedCount < 0) {
    errors.push('Unmatched count cannot be negative');
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    reconciliationReady: errors.length === 0,
  };
}

module.exports = { validate };
