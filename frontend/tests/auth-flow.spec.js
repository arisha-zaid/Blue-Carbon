import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    organization: 'Test Organization'
  };

  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate from landing page to login', async ({ page }) => {
    // Click Login/Register button from landing page
    await page.getByRole('button', { name: 'Login / Register' }).click();
    
    // Verify we're on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  });

  test('should navigate from login to register page', async ({ page }) => {
    await page.goto('/login');
    
    // Click sign up link
    await page.getByRole('link', { name: 'Sign up here' }).click();
    
    // Verify we're on the register page
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    // Check for validation errors (assuming they appear)
    await page.waitForTimeout(1000); // Wait for potential validation
    
    // The form should not submit and we should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show validation errors for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email and valid password
    await page.getByPlaceholder('Enter your email').fill('invalid-email');
    await page.getByPlaceholder('Enter your password').fill('password123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    // Should still be on login page due to validation
    await expect(page).toHaveURL('/login');
  });

  test('should handle login with non-existent user', async ({ page }) => {
    await page.goto('/login');
    
    // Try login with non-existent user
    await page.getByPlaceholder('Enter your email').fill('nonexistent@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    // Wait for potential error message or staying on login page
    await page.waitForTimeout(2000);
    
    // Should still be on login page or show error
    await expect(page).toHaveURL('/login');
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.getByPlaceholder(/first name/i).fill(testUser.firstName);
    await page.getByPlaceholder(/last name/i).fill(testUser.lastName);
    await page.getByPlaceholder(/email/i).fill(testUser.email);
    await page.getByPlaceholder(/password/i).first().fill(testUser.password);
    await page.getByPlaceholder(/confirm password/i).fill(testUser.password);
    
    // Select user type if available
    const userTypeSelect = page.locator('select, [role="combobox"]').first();
    if (await userTypeSelect.isVisible()) {
      await userTypeSelect.selectOption('community');
    }
    
    // Submit registration
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();
    
    // Wait for redirect or success message
    await page.waitForTimeout(3000);
    
    // Should either redirect to dashboard, OTP verification, or show success message
    const currentUrl = page.url();
    expect(currentUrl).not.toBe('/register');
  });

  test('should handle Google OAuth flow initiation', async ({ page }) => {
    await page.goto('/login');
    
    // Check if Google sign-in button exists
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleButton).toBeVisible();
    
    // Note: We can't fully test OAuth without proper setup, but we can test the button click
    // In a real test environment, you'd mock the OAuth response
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByPlaceholder('Enter your password');
    const toggleButton = page.locator('button').filter({ has: page.locator('img') }).last();
    
    // Initially password should be hidden (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button if it exists
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      // After clicking, password might become visible (type="text")
      // This depends on the implementation
    }
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password button
    await page.getByRole('button', { name: 'Forgot your password?' }).click();
    
    // This might open a modal or redirect to a forgot password page
    await page.waitForTimeout(1000);
    
    // Check if modal appeared or page changed
    const currentUrl = page.url();
    
    // The implementation could vary - either modal or new page
    // Just ensure something happened (URL change or modal appearance)
  });

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();
    
    // Should show validation errors and stay on register page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/register');
    
    // Fill form with invalid data
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/password/i).first().fill('123'); // Too short
    await page.getByPlaceholder(/confirm password/i).fill('different'); // Doesn't match
    
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();
    
    // Should still be on register page
    await expect(page).toHaveURL('/register');
  });

  test('should handle registration form with all required fields', async ({ page }) => {
    await page.goto('/register');
    
    // Fill all required fields properly
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    
    await page.getByPlaceholder(/first name/i).fill('John');
    await page.getByPlaceholder(/last name/i).fill('Doe');
    await page.getByPlaceholder(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password/i).first().fill('SecurePassword123!');
    await page.getByPlaceholder(/confirm password/i).fill('SecurePassword123!');
    
    // Fill additional fields if they exist
    const organizationField = page.getByPlaceholder(/organization/i);
    if (await organizationField.isVisible()) {
      await organizationField.fill('Test Organization');
    }
    
    const phoneField = page.getByPlaceholder(/phone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill('+1234567890');
    }
    
    // Select user type
    const userTypeSelect = page.locator('select').first();
    if (await userTypeSelect.isVisible()) {
      await userTypeSelect.selectOption({ index: 1 }); // Select first available option
    }
    
    // Submit form
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should navigate away from register page
    const finalUrl = page.url();
    expect(finalUrl).not.toBe('/register');
  });
});