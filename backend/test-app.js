const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});

// Create app without starting server (for tests)
const app = express();

// Security headers (ensure x-frame-options is present for tests)
app.use(
  helmet({
    frameguard: { action: "sameorigin" }, // adds X-Frame-Options
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate Limiting (lenient for tests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }
  next(err);
});

// Health route (used by tests)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
try {
  app.use("/api/auth", require("./routes/auth"));
} catch (e) {
  // ignore in test mode
}

try {
  app.use("/api/complaints", require("./routes/complaints"));
} catch (e) {}

try {
  app.use("/api/projects", require("./routes/projects"));
} catch (e) {}

try {
  app.use("/api/blockchain", require("./routes/blockchain"));
} catch (e) {}

// 404 handler expected by tests
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Ensure database connection for tests
const ensureDatabaseConnection = async () => {
  if (mongoose.connection.readyState === 0) {
    const uri = (
      process.env.MONGODB_URI_TEST ||
      "mongodb://127.0.0.1:27017/blue_carbon_test"
    ).replace("localhost", "127.0.0.1");

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        family: 4,
      });
      console.log("Test database connected");
    } catch (error) {
      console.warn(
        "Test database connection failed, tests may not work properly:",
        error.message
      );
    }
  }
};

// Initialize database connection
ensureDatabaseConnection();

module.exports = app;
