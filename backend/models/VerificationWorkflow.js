const mongoose = require('mongoose');

const verificationWorkflowSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['communityProfile', 'project'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'], default: 'draft' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  evidence: [String],
}, { timestamps: true });

verificationWorkflowSchema.index({ targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('VerificationWorkflow', verificationWorkflowSchema);