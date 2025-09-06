const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { isAuthenticated, rateLimitAction } = require("../middleware/auth");
const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// @route   GET /api/auth/health
// @desc    Health check endpoint
// @access  Public
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Carbon SIH Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .isIn(["community", "industry", "government", "admin"])
      .withMessage("Invalid role selected"),
    body("organization.name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Organization name must be between 2 and 100 characters"),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        role,
        organization,
        phone,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role: role, // Use the selected role directly
        organization,
        phone,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: user.getPublicProfile(),
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Provide more details in development to help diagnose why writes fail
      const isProd = (process.env.NODE_ENV || 'development') === 'production';
      res.status(500).json({
        success: false,
        message: isProd ? "Server error during registration" : (error.message || "Registration failed"),
        ...(isProd ? {} : { code: error.code, name: error.name, stack: error.stack })
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  rateLimitAction("login", 5, 15 * 60 * 1000),
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message:
            "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.updateOne({
          $unset: { lockUntil: 1, loginAttempts: 1 },
          $set: { lastLogin: new Date() },
        });
      } else {
        await user.updateOne({ lastLogin: new Date() });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: user.getPublicProfile(),
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // @route   GET /api/auth/google
  // @desc    Initiate Google OAuth
  // @access  Public
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // @route   GET /api/auth/google/callback
  // @desc    Google OAuth callback
  // @access  Public
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      try {
        // Generate JWT token
        const token = generateToken(req.user);

        // Redirect to frontend with token
        const redirectUrl = `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/oauth/callback?token=${token}&role=${req.user.role}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/login?error=oauth_failed`
        );
      }
    }
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get("/google", (req, res) => {
    res.status(501).json({
      success: false,
      message: "Google OAuth is not configured on this server"
    });
  });

  router.get("/google/callback", (req, res) => {
    res.status(501).json({
      success: false,
      message: "Google OAuth is not configured on this server"
    });
  });
}

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post("/refresh", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { token },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  rateLimitAction("password-reset", 3, 60 * 60 * 1000),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = require("crypto").randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpiry;
      await user.save();

      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      res.json({
        success: true,
        message: "Password reset link sent to your email",
        data: { resetToken }, // Remove this in production
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset request",
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Update password and clear reset token
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset",
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", isAuthenticated, (req, res) => {
  try {
    // If using sessions, destroy the session
    if (req.session) {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
        req.session.destroy();
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token } = req.body;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      // Mark email as verified
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during email verification",
      });
    }
  }
);

module.exports = router;
