# Carbon SIH - Backend-Frontend Integration Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Test database connection
npm run test-db

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env file)

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/carbon-sih

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env file)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_OAUTH_URL=http://localhost:5000/api/auth/google
```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:3000/oauth/callback`
7. Copy Client ID and Client Secret to your `.env` file

## 📧 Gmail Setup for Email Service

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in your `.env` file

## 🗄️ MongoDB Setup

### Local Installation

```bash
# Install MongoDB Community Edition
# Follow instructions at: https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod

# Create database
mongosh
use carbon-sih
```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Replace `MONGODB_URI` in your `.env` file

## 🔄 API Integration Status

### ✅ Completed

- [x] User authentication (login/register)
- [x] Google OAuth integration
- [x] JWT token management
- [x] Role-based access control
- [x] Password reset functionality
- [x] Email verification system
- [x] Frontend API service layer
- [x] Login component integration
- [x] OAuth callback handling
- [x] Register component integration

### 🔄 In Progress

- [ ] Project management endpoints
- [ ] File upload system
- [ ] Real-time notifications
- [ ] Dashboard data integration

### 📋 Planned

- [ ] Blockchain integration
- [ ] Advanced analytics
- [ ] Real-time chat
- [ ] Mobile app support

## 🧪 Testing the Integration

### 1. Test Backend

```bash
cd backend
npm run test-db
npm run dev
```

Visit: `http://localhost:5000/api/auth/health`

### 2. Test Frontend

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

### 3. Test Authentication Flow

1. Go to `/register`
2. Create an account
3. Verify email (check console for email details)
4. Login with credentials
5. Test Google OAuth

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

#### Database connection failed

- Verify MongoDB URI in `.env`
- Check if MongoDB service is running
- For Atlas: check IP whitelist and credentials

#### Google OAuth not working

- Verify Google OAuth credentials in `.env`
- Check redirect URIs in Google Console
- Ensure frontend URL matches exactly

#### Frontend can't connect to backend

- Check if backend is running on port 5000
- Verify CORS settings in backend
- Check browser console for CORS errors

#### Email not sending

- Verify Gmail credentials in `.env`
- Check if 2FA is enabled
- Use App Password, not regular password

### Debug Mode

Enable debug logging in backend:

```env
DEBUG=passport:*,express:*,mongoose:*
```

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Account lockout protection
- Session management

## 🚀 Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Set secure JWT secret
4. Configure production email service
5. Set up proper CORS origins

### Frontend Deployment

1. Update API base URL
2. Build production bundle: `npm run build`
3. Deploy to hosting service (Vercel, Netlify, etc.)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review browser console and server logs
3. Verify all environment variables
4. Test database connection separately
5. Check if all services are running

## 🔄 Updates

This integration guide will be updated as new features are added. Check the project repository for the latest version.


