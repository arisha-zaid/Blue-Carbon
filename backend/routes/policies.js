const express = require("express");
const router = express.Router();
const Policy = require("../models/Policy");
const { isAuthenticated } = require("../middleware/auth");

// Create a new policy (government only)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Only allow government role
    if (req.user.role !== "government") {
      return res.status(403).json({ success: false, message: "Forbidden: Only government can create policies." });
    }
    const { title, description, effectiveDate, attachments, status } = req.body;
    const policy = new Policy({
      title,
      description,
      createdBy: req.user._id,
      effectiveDate,
      attachments,
      status,
    });
    await policy.save();
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create policy.", error: error.message });
  }
});

// Get all policies
router.get("/", async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch policies.", error: error.message });
  }
});

module.exports = router;
