const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  counterparty: { type: String }, // e.g., buyer/seller name or org
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
