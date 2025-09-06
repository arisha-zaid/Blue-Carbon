<<<<<<< HEAD
# Repository Testing Framework

## Backend Testing
- **Framework**: Jest
- **Location**: backend/tests/
- **Configuration**: backend/jest.config.js
- **Test Pattern**: *.test.js
- **Environment**: Node.js
- **Coverage**: API endpoints, authentication, data validation, error handling

## Frontend Testing  
- **Framework**: Playwright
- **Location**: frontend/tests/
- **Configuration**: frontend/playwright.config.js
- **Test Pattern**: *.spec.js
- **Target Framework**: Playwright
- **Coverage**: E2E user flows, authentication, project management, dashboards

## E2E Testing
- **Framework**: Playwright 
- **Target**: Full application (frontend + backend)
- **Browser**: Chrome, Firefox, Safari
- **Base URL**: http://localhost:5174 (frontend dev server)
- **Test Files**: 6 comprehensive test suites with 177 total tests

## Key Application Components
- Backend API server (Express.js on port 5000)
- Frontend React app (Vite on port 5174) 
- MongoDB database
- Blockchain services (optional)
- Socket.IO for real-time features

## Test Execution Status
- **Last Updated**: 2025-01-09
- **Frontend Tests**: 177 tests across 6 files
- **Backend Tests**: 26 API integration tests  
- **Overall Health**: GOOD (minor issues documented)
- **Coverage Areas**: Authentication, Navigation, Project Management, Dashboards, API Integration
=======
# Blue-Carbon Repository Overview

- **Root**: c:\Users\Administrator\Documents\Blue-Carbon
- **Apps**:
  - **frontend**: React + Vite app (React 19, React Router 7, Tailwind 4). Entry: src/main.jsx, root component: src/App.jsx. Contexts: AuthContext, UserContext, NotificationContext. Notifications rendered by components/NotificationToaster.jsx.
  - **backend**: Node.js Express API with MongoDB, Passport (local + Google OAuth), sessions, and email service.

## Frontend
- **Start**: npm run dev (Vite)
- **Build**: npm run build
- **Key deps**: react, react-dom, react-router-dom, axios, tailwindcss, framer-motion, recharts, leaflet/react-leaflet.
- **Routing**: Defined in src/App.jsx with role-based redirects via components/RoleBasedRedirect.
- **Notifications**: Provided by src/context/NotificationContext.jsx and shown by src/components/NotificationToaster.jsx.

## Backend
- **Start**: npm run dev (nodemon) or npm start
- **Key deps**: express, mongoose, passport, passport-google-oauth20, express-session, connect-mongo, jsonwebtoken, bcryptjs, nodemailer.
- **Entry**: backend/server.js; setup util: backend/start.js; test server: backend/test-server.js.
- **Routes**: backend/routes/auth.js, users.js, projects.js. Middleware: backend/middleware/auth.js.

## Environment
- **Backend env file**: backend/.env (see backend/env.example)
- **Frontend env**: Vite-style .env files if needed (not present).

## Notes
- Error boundaries recommended for robustness in React (see React docs).
- Notification API supports both string and object calls after fix on 2025-09-05.
>>>>>>> 85f462c (Enhanced ui into Dark themed mode)
