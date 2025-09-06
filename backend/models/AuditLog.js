const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

auditLogSchema.statics.record = function(entry) {
  try { return this.create(entry); } catch (e) { return null; }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);