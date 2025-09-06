const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  payload: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  nextRetryAt: Date,
  endpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookEndpoint' },
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);