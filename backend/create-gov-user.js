const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createGovernmentUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue_carbon');
    console.log('✅ Connected to MongoDB');

    // Check if government@example.com user exists
    const govExists = await User.findOne({ email: 'government@example.com' });
    
    if (govExists) {
      console.log('✅ Government user already exists: government@example.com');
      console.log('User details:', {
        name: `${govExists.firstName} ${govExists.lastName}`,
        email: govExists.email,
        role: govExists.role,
        isVerified: govExists.isVerified
      });
    } else {
      // Create the specific government user that the backend expects
      const govUser = new User({
        firstName: 'Government',
        lastName: 'Official',
        email: 'government@example.com',
        password: 'gov123',
        role: 'government',
        isVerified: true,
        organization: {
          name: 'Government Environmental Authority',
          type: 'government'
        }
      });
      
      await govUser.save();
      console.log('✅ Created government user: government@example.com / gov123');
    }

    // Also check the other government user
    const otherGovExists = await User.findOne({ email: 'gov@environmental.org' });
    if (otherGovExists) {
      console.log('✅ Other government user exists: gov@environmental.org');
      console.log('User details:', {
        name: `${otherGovExists.firstName} ${otherGovExists.lastName}`,
        email: otherGovExists.email,
        role: otherGovExists.role,
        isVerified: otherGovExists.isVerified
      });
    }

    // List all government users
    const allGovUsers = await User.find({ role: 'government' });
    console.log('\n📋 All government users in database:');
    allGovUsers.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Verified: ${user.isVerified}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createGovernmentUser();