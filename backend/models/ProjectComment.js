const mongoose = require('mongoose');

const projectCommentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  attachments: [String],
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ProjectComment', projectCommentSchema);