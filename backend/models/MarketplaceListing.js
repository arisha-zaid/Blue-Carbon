const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'sold', 'removed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
