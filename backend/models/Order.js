const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true },
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['created', 'paid', 'settled', 'cancelled'], default: 'created' },
  escrowRef: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);