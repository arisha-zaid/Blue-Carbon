require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

// Import passport configuration
require("./config/passport");

const app = express();
const PORT = process.env.PORT || 5000;

// Port availability check function
const checkPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Enhanced logging
console.log("🚀 Starting Blue Carbon Backend Server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 Target Port: ${PORT}`);
console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? "Configured" : "Using default localhost"}`);
console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
console.log("⏰ Timestamp:", new Date().toISOString());

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-session-secret-key-here",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/blue_carbon",
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Basic routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Blue Carbon Backend API",
    version: "1.0.0",
    status: "running"
  });
});

// Add auth routes
try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.warn("⚠️ Auth routes failed to load:", error.message);
}

// Add other routes
try {
  const userRoutes = require("./routes/users");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded");
} catch (error) {
  console.warn("⚠️ User routes failed to load:", error.message);
}

try {
  const complaintRoutes = require("./routes/complaints");
  app.use("/api/complaints", complaintRoutes);
  console.log("✅ Complaint routes loaded");
} catch (error) {
  console.warn("⚠️ Complaint routes failed to load:", error.message);
}

try {
  const projectRoutes = require("./routes/projects");
  app.use("/api/projects", projectRoutes);
  console.log("✅ Project routes loaded");
} catch (error) {
  console.warn("⚠️ Project routes failed to load:", error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize server
const startServer = async () => {
  try {
    // Check port availability
    console.log(`🔍 Checking if port ${PORT} is available...`);
    const isPortAvailable = await checkPortAvailable(PORT);
    
    if (!isPortAvailable) {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.log("💡 Try one of these solutions:");
      console.log("   1. Stop the process using the port: netstat -ano | findstr :5000");
      console.log("   2. Use a different port: PORT=3001 npm start");
      console.log("   3. Kill all node processes: taskkill /f /im node.exe");
      process.exit(1);
    }
    
    console.log(`✅ Port ${PORT} is available`);
    
    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blue_carbon", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Start server
    console.log(`🔄 Starting server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log("🎉 ================================");
      console.log("🚀 SERVER STARTED SUCCESSFULLY!");
      console.log("🎉 ================================");
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log(`🔧 Process ID: ${process.pid}`);
      console.log("🎉 ================================");
    });

    server.on('error', (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });
    
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    console.error("💡 Make sure MongoDB is running and accessible");
    process.exit(1);
  }
};

// Start the server
startServer();

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error('📍 Stack:', err.stack);
  console.error('⏰ Time:', new Date().toISOString());
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message || err);
  console.error('📍 Stack:', err.stack || 'No stack trace available');
  console.error('⏰ Time:', new Date().toISOString());
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  });
});