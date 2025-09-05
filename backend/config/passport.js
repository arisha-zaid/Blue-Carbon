const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);


// Local Strategy for email/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Check if account is locked
        if (user.isLocked()) {
          return done(null, false, {
            message:
              "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
          });
        }

        // Check if user is active
        if (!user.isActive) {
          return done(null, false, {
            message: "Account is deactivated. Please contact support.",
          });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          // Increment login attempts
          await user.incLoginAttempts();
          return done(null, false, { message: "Invalid email or password" });
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

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy (only enable if environment variables are present)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login
          await user.updateOne({ lastLogin: new Date() });
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0]?.value;
          user.isVerified = true; // Google accounts are pre-verified
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          fullName: profile.displayName,
          profilePicture: profile.photos[0]?.value,
          isVerified: true,
          lastLogin: new Date(),
          role: "community", // Default role, can be changed later
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  ));
} else {
  console.log('Google OAuth disabled: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

module.exports = passport;


