const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  opener: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: String,
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected'], default: 'open' },
  resolution: String,
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);