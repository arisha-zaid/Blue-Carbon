const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Carbon SIH Backend...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found!');
  console.log('📝 Please create a .env file based on env.example');
  console.log('🔧 You can copy env.example to .env and update the values\n');
  
  // Copy env.example to .env if it exists
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from env.example');
      console.log('🔧 Please update the values in .env file before starting\n');
    } catch (error) {
      console.log('❌ Failed to create .env file:', error.message);
    }
  }
  
  console.log('📋 Required environment variables:');
  console.log('   - MONGODB_URI (MongoDB connection string)');
  console.log('   - JWT_SECRET (Random string for JWT signing)');
  console.log('   - GOOGLE_CLIENT_ID (Google OAuth client ID)');
  console.log('   - GOOGLE_CLIENT_SECRET (Google OAuth client secret)');
  console.log('   - EMAIL_USER (Gmail address for sending emails)');
  console.log('   - EMAIL_PASS (Gmail app password)');
  console.log('   - FRONTEND_URL (Frontend URL for CORS)\n');
  
  process.exit(1);
}

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});


