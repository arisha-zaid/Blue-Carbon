const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true, unique: true },
  device: String,
  ip: String,
  userAgent: String,
  expiresAt: { type: Date, required: true, index: 1 },
  revokedAt: Date,
}, { timestamps: true });

refreshTokenSchema.index({ user: 1, token: 1 }, { unique: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);