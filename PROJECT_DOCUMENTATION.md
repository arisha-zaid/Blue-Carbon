# 🌊 Blue Carbon Registry - Complete Project Documentation

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema & ER Diagram](#database-schema--er-diagram)
4. [User Workflow Diagrams](#user-workflow-diagrams)
5. [API Documentation](#api-documentation)
6. [Frontend Architecture](#frontend-architecture)
7. [Security Implementation](#security-implementation)
8. [Deployment Guide](#deployment-guide)

---

## **🌟 Project Overview**

### **Mission Statement**
The Blue Carbon Registry is a comprehensive digital platform designed to facilitate the creation, verification, and trading of blue carbon credits from coastal and marine ecosystem restoration projects.

### **Key Objectives**
- 🌱 **Environmental Impact**: Restore and protect blue carbon ecosystems
- 💰 **Economic Incentives**: Create sustainable revenue streams for communities
- 🏛️ **Government Compliance**: Enable regulatory oversight and policy implementation
- 🏭 **Corporate Sustainability**: Help industries meet carbon neutrality goals

### **Target Ecosystems**
1. **Mangroves** - Coastal wetland forests
2. **Seagrass Beds** - Underwater flowering plants
3. **Salt Marshes** - Coastal wetlands
4. **Agroforestry** - Tree-based agricultural systems

---

## **🏗️ System Architecture**

### **Technology Stack**

#### **Frontend**
```
React 18.2.0
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── React Router (Navigation)
├── Axios (HTTP Client)
├── React Hook Form (Forms)
├── Chart.js (Data Visualization)
└── Socket.IO Client (Real-time)
```

#### **Backend**
```
Node.js 18+
├── Express.js (Web Framework)
├── MongoDB (Database)
├── Mongoose (ODM)
├── JWT (Authentication)
├── Passport.js (OAuth)
├── Socket.IO (Real-time)
├── Multer (File Upload)
└── Winston (Logging)
```

#### **Blockchain Integration**
```
Ethereum/Polygon
├── Solidity Smart Contracts
├── Web3.js Integration
├── IPFS (Decentralized Storage)
└── MetaMask Integration
```

### **System Architecture Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Blockchain    │    │   File Storage  │
│   (User Interface)    │   (Smart Contracts) │   (IPFS/Local)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Microservices Architecture**

```
API Gateway (Express.js)
├── Authentication Service
├── User Management Service  
├── Project Management Service
├── Blockchain Integration Service
├── File Upload Service
├── Location Services
├── Notification Service
└── Analytics Service
```

---

## **🗄️ Database Schema & ER Diagram**

### **Core Entities & Relationships**

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    USER ||--o{ TRANSACTION : makes
    USER ||--o{ COMPLAINT : files
    USER }o--|| WALLET : has
    
    PROJECT ||--o{ MILESTONE : contains
    PROJECT ||--o{ FUNDING_RECORD : receives
    PROJECT ||--o{ VERIFICATION : undergoes
    PROJECT ||--o{ CARBON_CREDIT : generates
    
    CARBON_CREDIT ||--o{ TRANSACTION : involves
    CARBON_CREDIT }o--|| MARKETPLACE_LISTING : listed_in
    
    GOVERNMENT_USER ||--o{ AUDIT_LOG : creates
    ADMIN_USER ||--o{ PROJECT_APPROVAL : processes
    
    USER {
        ObjectId _id PK
        string email UK
        string password
        string googleId
        string firstName
        string lastName
        string role
        boolean isVerified
        object organization
        object preferences
        datetime createdAt
        datetime updatedAt
    }
    
    PROJECT {
        ObjectId _id PK
        string name
        string description
        string type
        string status
        ObjectId owner FK
        object location
        object funding
        object carbonImpact
        array milestones
        object blockchain
        datetime createdAt
        datetime updatedAt
    }
    
    TRANSACTION {
        ObjectId _id PK
        ObjectId user FK
        string type
        number amount
        number credits
        string status
        string counterparty
        datetime date
    }
    
    CARBON_CREDIT {
        ObjectId _id PK
        ObjectId projectId FK
        number amount
        string standard
        string status
        datetime issuedDate
        datetime expiryDate
        string blockchainHash
    }
    
    WALLET {
        ObjectId _id PK
        ObjectId user FK
        number balance
        array transactions
        string blockchainAddress
        datetime lastUpdated
    }
```

### **Database Collections Overview**

#### **User Management Collections**
1. **users** - Core user profiles and authentication
2. **refreshtokens** - JWT refresh token management
3. **usersessions** - Active user session tracking
4. **communityprofiles** - Extended community user profiles
5. **kycrecords** - Know Your Customer verification data

#### **Project Management Collections**
1. **projects** - Core project information and lifecycle
2. **projectcomments** - User comments and discussions
3. **verificationworkflows** - Project verification processes
4. **milestones** - Project milestone tracking (embedded in projects)

#### **Financial Collections**
1. **transactions** - All financial transactions
2. **wallets** - User carbon credit wallets
3. **invoices** - Payment invoices and billing
4. **ledgerentries** - Double-entry accounting system
5. **marketplacelistings** - Carbon credit marketplace

#### **Governance Collections**
1. **complaints** - User complaints and issues
2. **auditlogs** - System audit trail
3. **policies** - Government policies and regulations
4. **systemsettings** - Platform configuration

#### **Supporting Collections**
1. **notifications** - User notifications
2. **fileassets** - File upload metadata
3. **watchlists** - User project watchlists
4. **webhookendpoints** - API webhook configurations

---

## **🔄 User Workflow Diagrams**

### **1. Community User Workflow**

```mermaid
flowchart TD
    A[Register Account] --> B[Complete Profile]
    B --> C[Create Project]
    C --> D[Upload Documents]
    D --> E[Submit for Review]
    E --> F{Government Audit}
    F -->|Approved| G[Admin Final Review]
    F -->|Rejected| H[Revise & Resubmit]
    G -->|Approved| I[Credits Issued]
    G -->|Rejected| H
    H --> E
    I --> J[Project Active]
    J --> K[Monitor Progress]
    K --> L[Update Milestones]
    L --> M[Receive Payments]
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style M fill:#fff3e0
```

### **2. Industry User Workflow**

```mermaid
flowchart TD
    A[Register Company] --> B[Complete KYC]
    B --> C[Browse Marketplace]
    C --> D[Select Credits]
    D --> E[Review Project Details]
    E --> F[Purchase Credits]
    F --> G[Payment Processing]
    G --> H[Receive Certificate]
    H --> I[Update Compliance]
    I --> J[Generate Reports]
    
    style A fill:#e8f5e8
    style F fill:#fff3e0
    style H fill:#e1f5fe
```

### **3. Government User Workflow**

```mermaid
flowchart TD
    A[Register Department] --> B[Review Submitted Projects]
    B --> C[Conduct Field Audit]
    C --> D[Verify Documentation]
    D --> E[Check Compliance]
    E --> F{Audit Decision}
    F -->|Approve| G[Send to Admin]
    F -->|Request Changes| H[Return to Community]
    F -->|Reject| I[Record Rejection]
    G --> J[Monitor Implementation]
    H --> B
    I --> K[End Process]
    J --> L[Periodic Reviews]
    
    style A fill:#f3e5f5
    style G fill:#c8e6c9
    style I fill:#ffcdd2
```

### **4. Admin User Workflow**

```mermaid
flowchart TD
    A[System Login] --> B[Review Queue]
    B --> C[Government Approved Projects]
    C --> D[Technical Verification]
    D --> E[Blockchain Check]
    E --> F[Credit Calculation]
    F --> G{Final Decision}
    G -->|Approve| H[Issue Credits]
    G -->|Reject| I[Document Rejection]
    H --> J[Mint NFT Certificate]
    J --> K[Update Marketplace]
    K --> L[Notify Stakeholders]
    I --> M[Send Feedback]
    
    style A fill:#fff8e1
    style H fill:#c8e6c9
    style J fill:#e1f5fe
```

### **5. Complete System Workflow**

```mermaid
flowchart LR
    subgraph Community
        A[Create Project]
        B[Upload Docs]
        C[Monitor Progress]
    end
    
    subgraph Government
        D[Audit Project]
        E[Site Verification]
        F[Compliance Check]
    end
    
    subgraph Admin
        G[Final Review]
        H[Issue Credits]
        I[Blockchain Registration]
    end
    
    subgraph Industry
        J[Browse Credits]
        K[Purchase]
        L[Receive Certificate]
    end
    
    A --> B --> D
    D --> E --> F --> G
    G --> H --> I --> J
    J --> K --> L
    C -.-> D
    
    style Community fill:#e8f5e8
    style Government fill:#f3e5f5
    style Admin fill:#fff8e1
    style Industry fill:#e1f5fe
```

---

## **🔌 API Documentation**

### **Authentication Endpoints**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Authenticated |
| GET | `/api/auth/profile` | Get user profile | Authenticated |
| PUT | `/api/auth/profile` | Update profile | Authenticated |
| POST | `/api/auth/forgot-password` | Password reset | Public |

### **Project Management Endpoints**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | List all projects | Public |
| POST | `/api/projects` | Create project | Community+ |
| GET | `/api/projects/:id` | Get project details | Public |
| PUT | `/api/projects/:id` | Update project | Owner/Admin |
| DELETE | `/api/projects/:id` | Delete project | Owner/Admin |
| POST | `/api/projects/:id/milestones` | Add milestone | Owner |
| PUT | `/api/projects/:id/status` | Update status | Government/Admin |

### **Marketplace Endpoints**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/marketplace/listings` | Get credit listings | Public |
| POST | `/api/marketplace/purchase` | Purchase credits | Industry |
| GET | `/api/marketplace/transactions` | Transaction history | Authenticated |
| POST | `/api/marketplace/sell` | List credits for sale | Credit Owner |

### **Admin Endpoints**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | Manage users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |
| GET | `/api/admin/projects/pending` | Pending approvals | Admin |
| POST | `/api/admin/projects/:id/approve` | Approve project | Admin |
| POST | `/api/admin/credits/issue` | Issue credits | Admin |

### **API Request/Response Examples**

#### **User Registration**
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "securepass123",
  "role": "community",
  "organization": {
    "name": "Green Initiative",
    "type": "ngo"
  }
}

Response: 201 Created
{
  "success": true,
  "user": {
    "_id": "64f...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "community"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### **Create Project**
```json
POST /api/projects
Authorization: Bearer <token>
{
  "name": "Mangrove Restoration",
  "description": "Restore 50 hectares of mangrove forest",
  "type": "mangroves",
  "location": {
    "address": "Coastal Kerala, India",
    "coordinates": {
      "latitude": 10.8505,
      "longitude": 76.2711
    },
    "country": "India"
  },
  "funding": {
    "goal": 25000,
    "currency": "USD"
  }
}

Response: 201 Created
{
  "success": true,
  "project": {
    "_id": "64f...",
    "name": "Mangrove Restoration",
    "status": "draft",
    "owner": "64f...",
    "createdAt": "2024-01-09T10:00:00.000Z"
  }
}
```

---

## **💻 Frontend Architecture**

### **Component Structure**

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   ├── layout/           # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   └── forms/            # Form components
│       ├── ProjectForm.jsx
│       ├── ProfileForm.jsx
│       └── ValidationRules.js
├── pages/                # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── dashboard/        # Role-specific dashboards
│   ├── admin/            # Admin pages
│   ├── industry/         # Industry pages
│   └── government/       # Government pages
├── services/             # API services
│   ├── api.js
│   ├── auth.js
│   ├── projects.js
│   └── marketplace.js
├── store/                # State management
│   ├── authStore.js
│   ├── projectStore.js
│   └── marketplaceStore.js
├── hooks/                # Custom React hooks
│   ├── useAuth.js
│   ├── useProjects.js
│   └── useWebSocket.js
└── utils/                # Utility functions
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

### **State Management**

#### **Authentication State**
```javascript
// authStore.js
const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(credentials);
      set({ 
        user: response.user, 
        token: response.token,
        isLoading: false 
      });
      localStorage.setItem('token', response.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  }
}));
```

### **Routing Structure**

```javascript
// App.jsx routing
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={<ProtectedRoute />}>
      <Route path="community" element={<CommunityDashboard />} />
      <Route path="industry" element={<IndustryDashboard />} />
      <Route path="government" element={<GovernmentDashboard />} />
      <Route path="admin" element={<AdminDashboard />} />
    </Route>
    
    {/* Project Routes */}
    <Route path="/projects">
      <Route index element={<ProjectList />} />
      <Route path=":id" element={<ProjectDetails />} />
      <Route path="create" element={<CreateProject />} />
    </Route>
    
    {/* Marketplace Routes */}
    <Route path="/marketplace" element={<Marketplace />} />
  </Routes>
</BrowserRouter>
```

---

## **🔐 Security Implementation**

### **Authentication & Authorization**

#### **JWT Token Strategy**
```javascript
// Token structure
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "64f...",
    "email": "user@example.com",
    "role": "community",
    "iat": 1641024000,
    "exp": 1641110400
  }
}
```

#### **Role-Based Access Control**
```javascript
// middleware/auth.js
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Usage in routes
router.post('/admin/approve', 
  authenticate, 
  authorize(['admin']), 
  approveProject
);
```

### **Data Validation**

#### **Input Sanitization**
```javascript
// Joi validation schemas
const projectSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  type: Joi.string().valid('mangroves', 'seagrass', 'saltmarsh').required(),
  location: Joi.object({
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    })
  })
});
```

### **Security Headers**

```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## **🚀 Deployment Guide**

### **Production Environment Setup**

#### **Environment Variables**
```bash
# Backend .env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
BLOCKCHAIN_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/your-key
IPFS_API_URL=https://api.pinata.cloud
```

#### **Docker Deployment**

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/blue_carbon
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    
volumes:
  mongodb_data:
```

### **Cloud Deployment Options**

#### **AWS Deployment**
1. **EC2 Instances** - Virtual machines for backend
2. **S3 + CloudFront** - Static frontend hosting
3. **DocumentDB** - Managed MongoDB service
4. **ELB** - Load balancing
5. **Route 53** - DNS management

#### **Digital Ocean Deployment**
1. **App Platform** - Managed application hosting
2. **Managed Databases** - MongoDB hosting
3. **Spaces CDN** - Static file delivery

#### **Heroku Deployment**
```bash
# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

### **Performance Optimization**

#### **Backend Optimizations**
- Database indexing on frequent queries
- Redis caching for session management
- API rate limiting
- Connection pooling
- Compression middleware

#### **Frontend Optimizations**
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle analysis and optimization
- Service worker for caching
- CDN for static assets

---

## **📊 Monitoring & Analytics**

### **Application Monitoring**

#### **Winston Logging Configuration**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### **Key Metrics to Track**

1. **User Metrics**
   - Registration rates
   - Active users (DAU/MAU)
   - User retention
   - Role distribution

2. **Project Metrics**
   - Projects created
   - Approval rates
   - Completion rates
   - Carbon credits issued

3. **Financial Metrics**
   - Transaction volume
   - Revenue generated
   - Average transaction value
   - Payment success rates

4. **System Metrics**
   - API response times
   - Error rates
   - Database performance
   - Server resource usage

---

## **🧪 Testing Strategy**

### **Test Coverage Overview**

- **Unit Tests**: 85% coverage target
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load testing with artillery
- **Security Tests**: Vulnerability scanning

### **Test Execution**

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

---

## **🔮 Future Enhancements**

### **Phase 2 Features**
1. **Mobile Application** - React Native app
2. **IoT Integration** - Sensor data collection
3. **Satellite Imagery** - Remote monitoring
4. **AI/ML Analytics** - Predictive modeling
5. **Multi-language Support** - Internationalization

### **Phase 3 Features**
1. **Blockchain Governance** - DAO implementation
2. **DeFi Integration** - Yield farming with credits
3. **NFT Certificates** - Tradeable certificates
4. **Carbon Marketplace** - Advanced trading features
5. **Global Expansion** - Multi-country support

---

## **📞 Support & Maintenance**

### **Documentation Updates**
This documentation should be updated with each major release and reviewed quarterly.

### **Contact Information**
- **Technical Lead**: [Your Name]
- **Project Manager**: [PM Name]  
- **Repository**: https://github.com/your-org/blue-carbon-registry

### **License**
MIT License - See LICENSE file for details.

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 9, 2025  
**Next Review**: April 9, 2025

---

*This documentation serves as the definitive guide for the Blue Carbon Registry platform. For technical issues or questions, please refer to the project repository or contact the development team.*