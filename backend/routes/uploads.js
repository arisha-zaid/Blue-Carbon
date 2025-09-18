// backend/routes/uploads.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isAuthenticated: auth } = require("../middleware/auth");

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage: save to disk, keep original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const allowed = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (allowed.has(file.mimetype)) return cb(null, true);
    cb(new Error("Invalid file type"));
  },
});

// POST /api/uploads/image -> { url, filename }
// Note: Auth disabled for simplicity in project creation flow; enable in production.
router.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const relativePath = `/uploads/${req.file.filename}`;
  const absoluteUrl = `${req.protocol}://${req.get("host")}${relativePath}`;
  return res.json({
    success: true,
    data: { url: absoluteUrl, filename: req.file.filename, path: relativePath },
  });
});

module.exports = router;
