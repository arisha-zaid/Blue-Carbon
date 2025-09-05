# Blue Carbon Backend API

A comprehensive blockchain-enabled backend system for environmental complaint management, carbon credit trading, and environmental project tracking.

## 🌟 Features

- **Environmental Complaint Management**: Submit, track, and resolve environmental complaints
- **Carbon Credit System**: Issue, trade, and retire carbon credits on blockchain
- **Project Management**: Create and manage environmental restoration projects
- **Blockchain Integration**: Ethereum-based smart contracts for transparency
- **Decentralized Storage**: IPFS integration for document storage
- **Real-time Updates**: WebSocket support for live notifications
- **Comprehensive API**: RESTful endpoints with detailed documentation
- **Job Queue System**: Background processing with Redis
- **Advanced Security**: JWT authentication, rate limiting, input validation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Optional Services

- Redis (for job queue functionality)
- Ethereum node access (Infura) for blockchain features
- IPFS node for decentralized storage

### Installation

1. **Clone and setup**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Setup**
   ```bash
   npm run setup
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── contracts/           # Smart contracts (Solidity)
│   ├── CarbonCredit.sol
│   ├── ComplaintRegistry.sol
│   ├── ProjectRegistry.sol
│   └── compiled/        # Compiled contract artifacts
├── models/              # MongoDB models
│   ├── User.js
│   ├── Complaint.js
│   └── Project.js
├── routes/              # API route handlers
│   ├── auth.js
│   ├── complaints.js
│   ├── projects.js
│   └── blockchain.js
├── services/            # Business logic services
│   ├── blockchainService.js
│   └── ipfsService.js
├── middleware/          # Express middleware
│   └── auth.js
├── utils/               # Utility functions
│   ├── logger.js
│   ├── emailService.js
│   └── jobQueue.js
├── scripts/             # Setup and deployment scripts
│   ├── setup.js
│   ├── compileContracts.js
│   └── deploy.js
├── tests/               # Test files
│   ├── server.test.js
│   └── setup.js
├── logs/                # Application logs
├── docs/                # Documentation
│   └── API.md
└── server.js            # Main application entry point
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Essential Configuration
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blue_carbon
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret

# Optional Blockchain Configuration
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_wallet_private_key

# Optional IPFS Configuration
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret

# Optional Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional Redis Configuration
REDIS_URL=redis://localhost:6379

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

### Database Setup

MongoDB is required. The setup script will:
- Create necessary indexes
- Set up sample admin and government users
- Configure the database schema

### Smart Contracts

If you plan to use blockchain features:
1. Set up Ethereum node access (Infura recommended)
2. Configure wallet private key
3. Compile contracts: `npm run compile`
4. Deploy contracts: `npm run deploy`

## 📡 API Documentation

Comprehensive API documentation is available in [`docs/API.md`](./docs/API.md).

### Key Endpoints

- **Authentication**: `/api/auth/*`
- **Complaints**: `/api/complaints/*`
- **Projects**: `/api/projects/*`
- **Blockchain**: `/api/blockchain/*`
- **Health Check**: `/api/health`

### Authentication

Most endpoints require JWT authentication:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bluecarbon.org","password":"admin123"}'

# Use token in subsequent requests
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- Unit tests for services and utilities
- Integration tests for API endpoints
- Database tests with test database
- Mock services for external dependencies

## 🔄 Development Workflow

### 1. Start Development

```bash
# Start with live reload
npm run dev

# Or start without reload
npm start
```

### 2. Monitor Logs

```bash
# View all logs
npm run logs

# View error logs only
npm run logs:error

# View blockchain operation logs
npm run logs:blockchain
```

### 3. Database Management

```bash
# Reset and setup database
npm run setup

# Test database connection
npm run test-db
```

### 4. Contract Development

```bash
# Compile smart contracts
npm run compile

# Deploy to network
npm run deploy
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Request throttling (100 requests/15 minutes)
- **Input Validation**: express-validator integration
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **File Upload Security**: Type and size validation
- **Audit Logging**: Comprehensive request/response logging

## 🌐 Blockchain Integration

### Smart Contracts

1. **CarbonCredit**: ERC20-based carbon credit token
2. **ComplaintRegistry**: Complaint submission and tracking
3. **ProjectRegistry**: Environmental project management

### Features

- Carbon credit issuance and retirement
- Transparent complaint tracking
- Decentralized project verification
- NFT certificates for verified projects
- IPFS integration for document storage

### Supported Networks

- Ethereum Mainnet
- Sepolia Testnet (recommended for development)
- Polygon
- BSC

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   # Configure production database
   # Set secure JWT/session secrets
   # Configure production blockchain network
   ```

2. **Build and Deploy**
   ```bash
   npm install --production
   npm run setup
   npm start
   ```

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "blue-carbon-api"
   ```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring and Logging

### Log Files

- `logs/combined.log`: All application logs
- `logs/error.log`: Error logs only
- `logs/blockchain.log`: Blockchain operation logs
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log`: Unhandled promise rejections

### Log Levels

- `error`: System errors, failures
- `warn`: Warnings, non-critical issues
- `info`: General information, successful operations
- `http`: HTTP request/response logs
- `debug`: Detailed debugging information

### Health Monitoring

Check application health:
```bash
curl http://localhost:5000/api/health
```

Response includes:
- Server status
- Database connectivity
- Blockchain service status
- IPFS availability
- Uptime statistics

## 🤝 Contributing

### Development Guidelines

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages
5. Ensure all tests pass

### Code Style

- Use ESLint configuration
- Follow REST API conventions
- Implement proper error handling
- Add comprehensive logging
- Include input validation

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Pass code review

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MongoDB status
sudo service mongod status

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/blue_carbon
```

**Blockchain Service Unavailable**
```bash
# Check Infura project ID and network
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_project_id

# Verify private key format (no 0x prefix needed)
PRIVATE_KEY=abcd1234...
```

**IPFS Upload Failures**
```bash
# Check IPFS configuration
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process or change PORT in .env
PORT=5001
```

### Debug Mode

Enable verbose logging:
```bash
NODE_ENV=development npm run dev
```

Or set log level:
```bash
LOG_LEVEL=debug npm run dev
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:

- **Documentation**: Check `docs/API.md` for detailed API documentation
- **Issues**: Create an issue on GitHub
- **Email**: support@bluecarbon.org

## 🗺️ Roadmap

- [ ] GraphQL API support
- [ ] Multi-chain blockchain support
- [ ] Advanced analytics dashboard
- [ ] Mobile app API optimization
- [ ] Machine learning integration
- [ ] Real-time data streaming
- [ ] Advanced geospatial features

---

Built with ❤️ for environmental sustainability