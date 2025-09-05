const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  try {
    // Check if user is authenticated via session (Passport)
    if (req.isAuthenticated()) {
      return next();
    }

    // Check for JWT token in header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

// Middleware to check if user has specific role(s)
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = req.user.role || req.user.role;

    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }
    } else {
      if (userRole !== roles) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }
    }

    next();
  };
};

// Middleware to check if user is admin
const isAdmin = hasRole("admin");

// Middleware to check if user is government or admin
const isGovernmentOrAdmin = hasRole(["government", "admin"]);

// Middleware to check if user is industry or admin
const isIndustryOrAdmin = hasRole(["industry", "admin"]);

// Middleware to check if user is verified
const isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Account not verified. Please verify your email first.",
    });
  }

  next();
};

// Middleware to check if user is active
const isActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const isOwnerOrAdmin = (resourceModel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // Admin can access everything
      if (req.user.role === "admin") {
        return next();
      }

      const resourceId = req.params.id || req.params.projectId;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID required.",
        });
      }

      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
        });
      }

      // Check if user owns the resource
      if (
        resource.userId?.toString() === req.user._id?.toString() ||
        resource.user?.toString() === req.user._id?.toString()
      ) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "Access denied. You can only modify your own resources.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking resource ownership.",
      });
    }
  };
};

// Middleware to rate limit specific actions
const rateLimitAction = (
  action,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}-${action}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    // Reset if window has passed
    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: `Too many ${action} attempts. Please try again later.`,
      });
    }

    // Increment attempt count
    userAttempts.count++;
    attempts.set(key, userAttempts);

    next();
  };
};

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin,
  isGovernmentOrAdmin,
  isIndustryOrAdmin,
  isVerified,
  isActive,
  isOwnerOrAdmin,
  rateLimitAction,
};


