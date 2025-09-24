// Quick test script to create a user and test project creation
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'community'
      })
    });

    const data = await response.json();
    console.log('Registration response:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
  }
}

async function testLogin() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function run() {
  console.log('Testing authentication...');
  await testRegistration();
  await testLogin();
}

run();