const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  environment: { type: String, default: 'default' },
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);