const fs = require('fs');
const path = require('path');

/**
 * Tracks entities created during QA runs for reuse across workflows.
 * Stored per execution under qa/evidence/<runId>/entities.json
 */
class EntityTracker {
  constructor(runDir) {
    this.runDir = runDir;
    this.filePath = path.join(runDir, 'entities.json');
    this.data = {
      runId: path.basename(runDir),
      startedAt: new Date().toISOString(),
      customers: [],
      products: [],
      invoices: [],
      payments: [],
      vendors: [],
      purchaseOrders: [],
      quotes: [],
      bankImports: [],
    };
    if (fs.existsSync(this.filePath)) {
      this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    }
  }

  save() {
    fs.mkdirSync(this.runDir, { recursive: true });
    this.data.updatedAt = new Date().toISOString();
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  track(type, record) {
    const key = this._normalizeType(type);
    if (!this.data[key]) this.data[key] = [];
    this.data[key].push({ ...record, trackedAt: new Date().toISOString() });
    this.save();
    return record;
  }

  getLatest(type) {
    const key = this._normalizeType(type);
    const list = this.data[key] || [];
    return list.length ? list[list.length - 1] : null;
  }

  getAll(type) {
    return this.data[this._normalizeType(type)] || [];
  }

  _normalizeType(type) {
    const map = {
      customer: 'customers',
      customers: 'customers',
      product: 'products',
      products: 'products',
      item: 'products',
      items: 'products',
      invoice: 'invoices',
      invoices: 'invoices',
      payment: 'payments',
      payments: 'payments',
      vendor: 'vendors',
      vendors: 'vendors',
      purchase_order: 'purchaseOrders',
      purchaseOrders: 'purchaseOrders',
      quote: 'quotes',
      quotes: 'quotes',
    };
    return map[type] || type;
  }
}

module.exports = { EntityTracker };
