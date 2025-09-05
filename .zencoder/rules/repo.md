# Repository Testing Framework

## Backend Testing
- **Framework**: Jest
- **Location**: backend/tests/
- **Configuration**: backend/jest.config.js
- **Test Pattern**: *.test.js
- **Environment**: Node.js

## Frontend Testing  
- **Framework**: Not configured (Playwright will be default for E2E)
- **Location**: TBD
- **Configuration**: TBD

## E2E Testing
- **Default Framework**: Playwright (when not specified)
- **Target**: Full application (frontend + backend)
- **Browser**: Chrome headless

## Key Application Components
- Backend API server (Express.js on port 5000)
- Frontend React app (Vite on port 5173) 
- MongoDB database
- Blockchain services (optional)
- Socket.IO for real-time features