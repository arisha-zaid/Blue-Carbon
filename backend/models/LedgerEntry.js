const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  account: { type: String, required: true, index: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  refType: String, // e.g., 'Order', 'Transaction'
  refId: mongoose.Schema.Types.ObjectId,
  description: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);