const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  payload: mongoose.Schema.Types.Mixed,
  readAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);