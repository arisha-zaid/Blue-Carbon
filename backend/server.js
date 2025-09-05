require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Import routes with error handling
let authRoutes, userRoutes, projectRoutes, complaintRoutes, blockchainRoutes;

try {
  authRoutes = require("./routes/auth");
  userRoutes = require("./routes/users");
  projectRoutes = require("./routes/projects");
  complaintRoutes = require("./routes/complaints");
  blockchainRoutes = require("./routes/blockchain");
  logger.info("✅ All route modules loaded successfully");
} catch (error) {
  logger.error("❌ Error loading routes:", error);
  process.exit(1);
}

// Import passport configuration
try {
  require("./config/passport");
  logger.info("✅ Passport configuration loaded");
} catch (error) {
  logger.error("❌ Error loading passport configuration:", error);
  process.exit(1);
}

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/carbon_sih", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("✅ Connected to MongoDB");
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error:", err);
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/carbon_sih",
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use(logger.logRequest);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/blockchain", blockchainRoutes);

// Industry-specific routes (transactions, wallet, marketplace)
app.use("/api/industry", require("./routes/industry"));
app.use("/api/policies", require("./routes/policies"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  socket.on('join_complaint', (complaintId) => {
    socket.join(`complaint_${complaintId}`);
    logger.info(`Socket ${socket.id} joined complaint ${complaintId}`);
  });
  
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    logger.info(`Socket ${socket.id} joined project ${projectId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('socketio', io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Application error:", err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      details: err.details 
    }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Initialize services
const initializeServices = async () => {
  let servicesInitialized = 0;
  let totalServices = 0;
  
  // Initialize blockchain service
  try {
    totalServices++;
    const blockchainService = require('./services/blockchainService');
    servicesInitialized++;
    logger.info("   ✅ Blockchain service initialized");
  } catch (error) {
    logger.warn("   ⚠️ Blockchain service unavailable:", error.message);
  }
  
  // Initialize IPFS service  
  try {
    totalServices++;
    const ipfsService = require('./services/ipfsService');
    servicesInitialized++;
    logger.info("   ✅ IPFS service initialized");
  } catch (error) {
    logger.warn("   ⚠️ IPFS service unavailable:", error.message);
  }
  
  // Initialize job queue
  try {
    totalServices++;
    const jobQueue = require('./utils/jobQueue');
    servicesInitialized++;
    logger.info("   ✅ Job queue initialized");
  } catch (error) {
    logger.warn("   ⚠️ Job queue unavailable:", error.message);
  }
  
  logger.info(`✅ Services initialization completed (${servicesInitialized}/${totalServices} services available)`);
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Blockchain Network: ${process.env.ETHEREUM_NETWORK || "sepolia"}`);
  
  logger.info(`Server started successfully on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    blockchain: process.env.ETHEREUM_NETWORK || "sepolia"
  });
  
  // Initialize services after server starts
  await initializeServices();
});


