module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!tests/**',
    '!scripts/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true
};