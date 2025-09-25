# Blue Carbon API Configuration

## Environment Variables
Copy this file to .env and update the values:

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blue_carbon

# JWT Authentication
JWT_SECRET=af0f466ca635ddd1520580b0b9b6e7e2ad8ce2c91ceec881512c0dde151d28b7a6e1f2c65b55ba2139990eca64f3ef101a9275c8ff0d091fb1bbd2ba83b6a227
JWT_EXPIRE=7d

# Session Secret
SESSION_SECRET=f4f32387ce8a2126cb8e0beb0d49f9054c0ed4174932daa39cfcfb9762b180c194217eff2ffe85720fe042a47017d2b55caeda51c7d58bb9ac13399a9d47ab51

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
