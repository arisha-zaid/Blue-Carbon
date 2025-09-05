const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { compileAllContracts } = require('./compileContracts');

require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue_carbon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📊 Creating database indexes...');
    
    try {
      // User indexes
      const User = require('../models/User');
      await User.createIndexes();
      console.log('   ✅ User indexes created');
    } catch (error) {
      if (error.message.includes('existing index')) {
        console.log('   ✅ User indexes already exist');
      } else {
        console.log('   ⚠️ User model not found or index creation failed');
      }
    }
    
    try {
      // Complaint indexes
      const Complaint = require('../models/Complaint');
      await Complaint.createIndexes();
      console.log('   ✅ Complaint indexes created');
    } catch (error) {
      if (error.message.includes('existing index')) {
        console.log('   ✅ Complaint indexes already exist');
      } else {
        console.log('   ⚠️ Complaint model not found, skipping indexes');
      }
    }
    
    try {
      // Project indexes
      const Project = require('../models/Project');
      await Project.createIndexes();
      console.log('   ✅ Project indexes created');
    } catch (error) {
      if (error.message.includes('existing index')) {
        console.log('   ✅ Project indexes already exist');
      } else {
        console.log('   ⚠️ Project model not found, skipping indexes');
      }
    }
    
    console.log('✅ Database indexes setup completed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

async function setupDirectories() {
  console.log('📁 Creating required directories...');
  
  const directories = [
    'logs',
    'uploads',
    'uploads/temp',
    'contracts/compiled',
    'contracts/deployments',
    'docs/generated'
  ];
  
  for (const dir of directories) {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`   Created: ${dir}`);
    }
  }
  
  console.log('✅ Directories created');
}

async function setupContracts() {
  console.log('📄 Setting up smart contracts...');
  
  try {
    // Check if Solidity files exist
    const contractsDir = path.join(__dirname, '../contracts');
    const contractFiles = ['CarbonCredit.sol', 'ComplaintRegistry.sol', 'ProjectRegistry.sol'];
    
    const missingContracts = contractFiles.filter(file => 
      !fs.existsSync(path.join(contractsDir, file))
    );
    
    if (missingContracts.length > 0) {
      console.log(`⚠️ Missing contract files: ${missingContracts.join(', ')}`);
      console.log('   Smart contracts will be available once files are created');
      return;
    }
    
    // Compile contracts
    const compiled = await compileAllContracts();
    console.log('✅ Smart contracts compiled successfully');
    
    return compiled;
    
  } catch (error) {
    console.log('⚠️ Contract compilation failed:', error.message);
    console.log('   The server will run without blockchain features');
  }
}

async function createSampleData() {
  console.log('🌱 Creating sample data...');
  
  try {
    const User = require('../models/User');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@bluecarbon.org' });
    
    if (!adminExists) {
      const adminUser = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@bluecarbon.org',
        password: 'admin123', // Will be hashed automatically
        role: 'admin',
        isVerified: true,
        organization: {
          name: 'Blue Carbon Foundation',
          type: 'ngo'
        }
      });
      
      await adminUser.save();
      console.log('   Created admin user: admin@bluecarbon.org / admin123');
    }
    
    // Create sample government user
    const govExists = await User.findOne({ email: 'gov@environmental.org' });
    
    if (!govExists) {
      const govUser = new User({
        firstName: 'Environmental',
        lastName: 'Officer',
        email: 'gov@environmental.org',
        password: 'gov123',
        role: 'government',
        isVerified: true,
        organization: {
          name: 'Department of Environment',
          type: 'government'
        }
      });
      
      await govUser.save();
      console.log('   Created government user: gov@environmental.org / gov123');
    }
    
    console.log('✅ Sample data created');
    
  } catch (error) {
    console.log('⚠️ Sample data creation failed:', error.message);
  }
}

async function checkServices() {
  console.log('🔍 Checking external services...');
  
  // Check IPFS
  try {
    const ipfsService = require('../services/ipfsService');
    if (ipfsService.isAvailable()) {
      console.log('   ✅ IPFS service available');
    } else {
      console.log('   ⚠️ IPFS service not available (will continue without decentralized storage)');
    }
  } catch (error) {
    console.log('   ⚠️ IPFS service check failed');
  }
  
  // Check Blockchain
  try {
    const blockchainService = require('../services/blockchainService');
    if (blockchainService.isConnected()) {
      const walletAddress = blockchainService.getWalletAddress();
      console.log(`   ✅ Blockchain service connected (${walletAddress})`);
    } else {
      console.log('   ⚠️ Blockchain service not connected (will continue without Web3 features)');
    }
  } catch (error) {
    console.log('   ⚠️ Blockchain service check failed');
  }
  
  // Check Redis (for job queue)
  try {
    const redis = require('redis');
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await client.connect();
    await client.ping();
    await client.disconnect();
    console.log('   ✅ Redis service available');
  } catch (error) {
    console.log('   ⚠️ Redis service not available (job queue disabled)');
  }
  
  console.log('✅ Service check completed');
}

async function generateConfig() {
  console.log('⚙️ Generating configuration files...');
  
  const configTemplate = `# Blue Carbon API Configuration

## Environment Variables
Copy this file to .env and update the values:

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blue_carbon

# JWT Authentication
JWT_SECRET=${require('crypto').randomBytes(64).toString('hex')}
JWT_EXPIRE=7d

# Session Secret
SESSION_SECRET=${require('crypto').randomBytes(64).toString('hex')}

# Blockchain Configuration (Optional)
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_infura_project_id_here
PRIVATE_KEY=your_private_key_here
GAS_PRICE=20
GAS_LIMIT=6000000

# IPFS Configuration (Optional)
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_project_id_here
IPFS_PROJECT_SECRET=your_ipfs_project_secret_here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

## Getting Started

1. Install dependencies:
   npm install

2. Start MongoDB (if not using cloud database)

3. Start the server:
   npm run dev

4. Access the API:
   http://localhost:5000/api/health

## Optional Services

- **Blockchain**: Requires Ethereum node (Infura) and wallet private key
- **IPFS**: Requires IPFS node or Infura IPFS service
- **Redis**: Requires Redis server for job queue functionality
- **Email**: Requires SMTP server for notifications

The server will run without these services but with limited functionality.
`;
  
  const configPath = path.join(__dirname, '..', 'CONFIG.md');
  fs.writeFileSync(configPath, configTemplate);
  console.log('   Created CONFIG.md with setup instructions');
  
  // Create example .env file if it doesn't exist
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    const envExample = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blue_carbon

# JWT Secret (generate new ones for production)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Session Secret
SESSION_SECRET=your_session_secret_here

# Blockchain Configuration (Optional)
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_private_key_here

# IPFS Configuration (Optional)
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
    
    fs.writeFileSync(envExamplePath, envExample);
    console.log('   Created .env.example file');
  }
  
  console.log('✅ Configuration files generated');
}

async function main() {
  console.log('🚀 Blue Carbon API Setup\n');
  
  try {
    await setupDirectories();
    await generateConfig();
    await setupDatabase();
    await createSampleData();
    await setupContracts();
    await checkServices();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and update .env file with your configuration');
    console.log('2. Start the server: npm run dev');
    console.log('3. Access the API: http://localhost:5000/api/health');
    console.log('4. Check the documentation: ./docs/API.md');
    
    console.log('\nDefault users created:');
    console.log('- Admin: admin@bluecarbon.org / admin123');
    console.log('- Government: gov@environmental.org / gov123');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  setupDatabase,
  setupDirectories,
  setupContracts,
  createSampleData,
  checkServices,
  generateConfig
};