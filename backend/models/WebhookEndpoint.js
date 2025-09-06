const mongoose = require('mongoose');

const webhookEndpointSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  url: { type: String, required: true },
  secret: { type: String, required: true },
  events: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('WebhookEndpoint', webhookEndpointSchema);