const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ip: String,
  userAgent: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  loginAt: { type: Date, default: Date.now },
  logoutAt: Date,
  success: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('UserSession', userSessionSchema);