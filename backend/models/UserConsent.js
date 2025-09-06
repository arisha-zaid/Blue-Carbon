const mongoose = require('mongoose');

const userConsentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['terms', 'privacy', 'marketing', 'data_processing'], required: true },
  version: { type: String, required: true },
  acceptedAt: { type: Date, default: Date.now },
  ip: String,
}, { timestamps: true });

userConsentSchema.index({ userId: 1, type: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('UserConsent', userConsentSchema);