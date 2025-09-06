const mongoose = require('mongoose');

const fileAssetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String },
  storage: { type: String, enum: ['local', 'ipfs', 's3'], default: 'local' },
  url: String,
  hash: String,
  size: Number,
  checksum: String,
  virusScan: {
    status: { type: String, enum: ['pending', 'clean', 'infected'], default: 'pending' },
    scannedAt: Date,
    engine: String
  },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('FileAsset', fileAssetSchema);