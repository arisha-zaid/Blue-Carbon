require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["community", "industry", "government", "admin"], 
    default: "community" 
  },
  organization: {
    name: String,
    type: String,
    website: String,
  },
  phone: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Get public profile method
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`,
    email: this.email,
    role: this.role,
    organization: this.organization,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Blue Carbon Backend is running"
  });
});

// Register route
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    
    const { firstName, lastName, email, password, role, organization, phone } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["firstName", "lastName", "email", "password", "role"]
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    // Add optional fields if provided
    if (organization?.name) userData.organization = organization;
    if (phone) userData.phone = phone;

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    console.log("User created successfully:", user.getPublicProfile());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Blue Carbon Backend running on port ${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:5173`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});