const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
// Enable Mongoose debug logs in development to trace DB operations
if ((process.env.NODE_ENV || "development") !== "production") {
  mongoose.set("debug", true);
}
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

// Import passport configuration
require("./config/passport");

// Prefer IPv4 for DNS and handle Mongo URI (local vs Atlas SRV)
const dns = require("dns");
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}
const DEFAULT_LOCAL_MONGO = "mongodb://127.0.0.1:27017/blue_carbon";
const getMongoUri = () => {
  const envUri = (process.env.MONGODB_URI || "").trim();
  // If Atlas/local URI is provided, use it exactly as-is
  if (envUri) return envUri;
  // Fallback to local default only when no env var is set
  return DEFAULT_LOCAL_MONGO;
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 5000;

// Port availability check function
const checkPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = require("net").createServer();
    server.listen(port, () => {
      server.once("close", () => resolve(true));
      server.close();
    });
    server.on("error", () => resolve(false));
  });
};

// Enhanced logging
console.log("🚀 Starting Blue Carbon Backend Server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 Target Port: ${PORT}`);
console.log(
  `🗄️  MongoDB URI: ${
    process.env.MONGODB_URI
      ? process.env.MONGODB_URI.startsWith("mongodb+srv://")
        ? "Atlas SRV (configured)"
        : "Custom (configured)"
      : "Default localhost"
  }`
);
console.log(
  `🔗 Effective Mongo URI: ${
    getMongoUri().startsWith("mongodb+srv://")
      ? "mongodb+srv://<hidden>@<cluster>/<db>"
      : getMongoUri()
  }`
);
console.log(
  `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
);
console.log("⏰ Timestamp:", new Date().toISOString());

// Basic middleware
app.use(
  helmet({
    // Allow frontend (different origin) to load images and other static assets
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight
app.options("*", cors());

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

// Static uploads directory for user-uploaded files (thumbnails, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: getMongoUri(),
      mongoOptions: {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        family: 4,
        tls: getMongoUri().startsWith("mongodb+srv://") ? true : undefined,
        retryWrites: true,
        w: "majority",
      },
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

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join user-specific room for real-time updates
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Basic routes
app.get("/", (req, res) => {
  res.json({
    message: "Blue Carbon Backend API",
    version: "1.0.0",
    status: "running",
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

try {
  const uploadRoutes = require("./routes/uploads");
  app.use("/api/uploads", uploadRoutes);
  console.log("✅ Upload routes loaded");
} catch (error) {
  console.warn("⚠️ Upload routes failed to load:", error.message);
}

try {
  const locationRoutes = require("./routes/locations");
  app.use("/api/locations", locationRoutes);
  console.log("✅ Location routes loaded");
} catch (error) {
  console.warn("⚠️ Location routes failed to load:", error.message);
}

try {
  const communityRoutes = require("./routes/community");
  app.use("/api/community", communityRoutes);
  console.log("✅ Community routes loaded");
} catch (error) {
  console.warn("⚠️ Community routes failed to load:", error.message);
}

try {
  const adminRoutes = require("./routes/admin");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.warn("⚠️ Admin routes failed to load:", error.message);
}

try {
  const industryRoutes = require("./routes/industry");
  app.use("/api/industry", industryRoutes);
  console.log("✅ Industry routes loaded");
} catch (error) {
  console.warn("⚠️ Industry routes failed to load:", error.message);
}

try {
  const blockchainRoutes = require("./routes/blockchain");
  app.use("/api/blockchain", blockchainRoutes);
  console.log("✅ Blockchain routes loaded");
} catch (error) {
  console.warn("⚠️ Blockchain routes failed to load:", error.message);
}

try {
  const transactionRoutes = require("./routes/transactions");
  app.use("/api/transactions", transactionRoutes);
  console.log("✅ Transaction routes loaded");
} catch (error) {
  console.warn("⚠️ Transaction routes failed to load:", error.message);
}

try {
  const paymentRoutes = require("./routes/payments");
  app.use("/api/payments", paymentRoutes);
  console.log("✅ Payment routes loaded");
} catch (error) {
  console.warn("⚠️ Payment routes failed to load:", error.message);
}

try {
  const webhookRoutes = require("./routes/webhooks");
  app.use("/api/webhooks", webhookRoutes);
  console.log("✅ Webhook routes loaded");
} catch (error) {
  console.warn("⚠️ Webhook routes failed to load:", error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
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
      console.log(
        "   1. Stop the process using the port: netstat -ano | findstr :5000"
      );
      console.log("   2. Use a different port: PORT=3001 npm start");
      console.log("   3. Kill all node processes: taskkill /f /im node.exe");
      process.exit(1);
    }

    console.log(`✅ Port ${PORT} is available`);

    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    const mongoUri = getMongoUri();

    // Connection event logs
    mongoose.connection.on("connecting", () =>
      console.log("🟡 MongoDB: connecting...")
    );
    mongoose.connection.on("connected", () =>
      console.log("🟢 MongoDB: connected")
    );
    mongoose.connection.on("reconnected", () =>
      console.log("🟢 MongoDB: reconnected")
    );
    mongoose.connection.on("disconnected", () =>
      console.log("🛑 MongoDB: disconnected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB error:", err.message)
    );

    await mongoose.connect(mongoUri, {
      // Connection tuning for reliability
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 0,
      family: 4, // Prefer IPv4
      // Atlas SRV support
      tls: mongoUri.startsWith("mongodb+srv://") ? true : undefined,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(
      `🔗 Connection State: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    // Quick write check to detect permission issues early
    try {
      const diagnostics = mongoose.connection.db.collection("diagnostics");
      const testDoc = { _t: "startup-write-check", ts: new Date() };
      await diagnostics.insertOne(testDoc);
      await diagnostics.deleteOne({ _id: testDoc._id });
      console.log("🧪 DB write check: OK (insert/delete succeeded)");
    } catch (e) {
      console.warn("⚠️ DB write check failed:", e && (e.message || e));
      console.warn(
        "   ➜ Your MongoDB user may not have write permissions on this database."
      );
      console.warn(
        '   ➜ Ensure the user has at least the "readWrite" role on the target DB:',
        mongoose.connection.name
      );
    }

    // Ensure default admin and government users exist
    try {
      const User = require("./models/User");
      const adminEmail =
        process.env.DEFAULT_ADMIN_EMAIL || "admin@bluecarbon.org";
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
      const govEmail = process.env.DEFAULT_GOV_EMAIL || "gov@environmental.org";
      const govPassword = process.env.DEFAULT_GOV_PASSWORD || "gov123";

      const ensureUser = async (
        email,
        password,
        role,
        firstName,
        lastName,
        org
      ) => {
        const existing = await User.findOne({ email });
        if (!existing) {
          const u = new User({
            firstName,
            lastName,
            email,
            password, // hashed by pre-save hook
            role,
            isVerified: true,
            organization: org || undefined,
          });
          await u.save();
          console.log(`👤 Created default ${role} user: ${email}`);
        } else {
          let changed = false;
          if (existing.role !== role) {
            existing.role = role;
            changed = true;
          }
          if (!existing.isVerified) {
            existing.isVerified = true;
            changed = true;
          }
          if (existing.isActive === false) {
            existing.isActive = true;
            changed = true;
          }
          if (
            (process.env.RESET_DEFAULT_PASSWORDS || "false").toLowerCase() ===
            "true"
          ) {
            existing.password = password; // will be re-hashed by pre-save hook
            // Clear any previous lock or attempts when resetting password
            existing.lockUntil = undefined;
            existing.loginAttempts = 0;
            changed = true;
          }
          if (changed) {
            await existing.save();
            console.log(`🔁 Updated default ${role} user: ${email}`);
          }
        }
      };

      await ensureUser(
        adminEmail,
        adminPassword,
        "admin",
        "System",
        "Administrator",
        { name: "Blue Carbon Foundation", type: "ngo" }
      );

      await ensureUser(
        govEmail,
        govPassword,
        "government",
        "Environmental",
        "Officer",
        { name: "Department of Environment", type: "government" }
      );
    } catch (e) {
      console.warn(
        "⚠️ Failed to ensure default admin/government users:",
        e && (e.message || e)
      );
    }

    // Start server
    console.log(`🔄 Starting server on port ${PORT}...`);
    server.listen(PORT, () => {
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

    server.on("error", (err) => {
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
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  console.error("📍 Stack:", err.stack);
  console.error("⏰ Time:", new Date().toISOString());
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message || err);
  console.error("📍 Stack:", err.stack || "No stack trace available");
  console.error("⏰ Time:", new Date().toISOString());
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 SIGTERM received. Shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  } catch (e) {
    console.warn("⚠️ Error closing MongoDB connection:", e && e.message);
  } finally {
    process.exit(0);
  }
});

process.on("SIGINT", async () => {
  console.log("📴 SIGINT received. Shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  } catch (e) {
    console.warn("⚠️ Error closing MongoDB connection:", e && e.message);
  } finally {
    process.exit(0);
  }
});
