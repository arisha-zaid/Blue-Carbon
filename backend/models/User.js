const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      }, // Only required if not Google OAuth
      minlength: [6, "Password must be at least 6 characters long"],
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    // Profile fields
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    fullName: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },

    // Role and permissions
    role: {
      type: String,
      enum: ["community", "industry", "government", "admin"],
      default: "community",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Organization details
    organization: {
      name: String,
      type: String,
      website: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },

    // Preferences
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        enum: ["en", "hi", "es"],
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
      },
    },

    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Timestamps
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
userSchema.virtual("displayName").get(function () {
  return this.fullName || `${this.firstName} ${this.lastName}`;
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(12);
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update fullName
userSchema.pre("save", function (next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Static method to find by email or googleId
userSchema.statics.findByEmailOrGoogleId = function (email, googleId) {
  return this.findOne({
    $or: [{ email: email }, { googleId: googleId }],
  });
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    profilePicture: this.profilePicture,
    role: this.role,
    organization: this.organization,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
