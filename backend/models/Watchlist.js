const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
}, { timestamps: true });

watchlistSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);