# Blue Carbon API Configuration

## Environment Variables
Copy this file to .env and update the values:

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blue_carbon

# JWT Authentication
JWT_SECRET=9ee18602a725f2c83c68c843875b0a61f77ec5350b30e6024771faa1402ae3aef6a130f4a2133b2d463daf79bd810439a2f5ba5a4ea8a45f768ff266b97f39dd
JWT_EXPIRE=7d

# Session Secret
SESSION_SECRET=100b2dd710a97abef778ca42c3e33a497e89a39d7776e8d437d04e9d14336c1a01e2186db4145f59cb40c735753a86fc8b933dbc268b4f3900bb18a2abb88baa

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
