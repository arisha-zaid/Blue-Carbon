const mongoose = require('mongoose');

const kycRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  level: { type: String, enum: ['basic', 'advanced'], default: 'basic' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  provider: String,
  checks: mongoose.Schema.Types.Mixed,
  documents: [String],
  expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('KYCRecord', kycRecordSchema);