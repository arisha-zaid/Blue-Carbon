const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function fixGovernmentUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/blue_carbon"
    );
    console.log("✅ Connected to MongoDB");

    // Find and update the government@example.com user
    const govUser = await User.findOne({ email: "government@example.com" });

    if (govUser) {
      console.log("📋 Current user details:");
      console.log({
        name: `${govUser.firstName} ${govUser.lastName}`,
        email: govUser.email,
        role: govUser.role,
        isVerified: govUser.isVerified,
      });

      // Update the user to have correct role and verification
      govUser.role = "government";
      govUser.isVerified = true;
      govUser.firstName = "Government";
      govUser.lastName = "Official";

      if (!govUser.organization) {
        govUser.organization = {
          name: "Government Environmental Authority",
          type: "government",
        };
      }

      await govUser.save();

      console.log("✅ Updated government user successfully!");
      console.log("📋 New user details:");
      console.log({
        name: `${govUser.firstName} ${govUser.lastName}`,
        email: govUser.email,
        role: govUser.role,
        isVerified: govUser.isVerified,
        organization: govUser.organization,
      });
    } else {
      console.log("❌ Government user not found");
    }

    // List all government users after update
    const allGovUsers = await User.find({ role: "government" });
    console.log("\n📋 All government users in database:");
    allGovUsers.forEach((user) => {
      console.log(
        `- ${user.email} (${user.firstName} ${user.lastName}) - Verified: ${user.isVerified}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

fixGovernmentUser();
