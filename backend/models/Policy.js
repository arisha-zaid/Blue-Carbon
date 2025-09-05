const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    effectiveDate: { type: Date, default: Date.now },
    attachments: [{ type: String }], // URLs or file references
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
