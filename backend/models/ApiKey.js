const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: String,
  keyHash: { type: String, required: true, unique: true },
  scopes: [String],
  lastUsedAt: Date,
  revokedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);