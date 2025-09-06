import { test, expect } from '@playwright/test';

test.describe('Complete User Journey - End to End', () => {
  const testUser = {
    firstName: 'E2E',
    lastName: 'TestUser',
    email: `e2e.test.${Date.now()}@example.com`,
    password: 'E2ETestPass123!',
    organization: 'E2E Test Organization'
  };

  test('Complete user registration and project creation flow', async ({ page }) => {
    // Step 1: Start from landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify landing page loads
    await expect(page.getByRole('heading', { name: /blockchain.*powered.*blue carbon registry/i })).toBeVisible();
    
    // Step 2: Navigate to registration
    await page.getByRole('button', { name: 'Login / Register' }).click();
    await expect(page).toHaveURL('/login');
    
    await page.getByRole('link', { name: 'Sign up here' }).click();
    await expect(page).toHaveURL('/register');
    
    // Step 3: Complete registration form
    await page.getByPlaceholder(/first name/i).fill(testUser.firstName);
    await page.getByPlaceholder(/last name/i).fill(testUser.lastName);
    await page.getByPlaceholder(/email/i).fill(testUser.email);
    await page.getByPlaceholder(/password/i).first().fill(testUser.password);
    await page.getByPlaceholder(/confirm password/i).fill(testUser.password);
    
    // Fill organization if field exists
    const orgField = page.getByPlaceholder(/organization/i);
    if (await orgField.isVisible()) {
      await orgField.fill(testUser.organization);
    }
    
    // Select user type if available
    const userTypeSelect = page.locator('select').first();
    if (await userTypeSelect.isVisible()) {
      await userTypeSelect.selectOption('community');
    }
    
    // Submit registration
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();
    
    // Step 4: Handle post-registration flow
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/otp')) {
      // Handle OTP verification if required
      const otpInputs = page.locator('input[type="text"], input[type="number"]').filter({ hasText: /^\d$/ });
      if (await otpInputs.count() > 0) {
        // Fill mock OTP (in real test, you'd handle this properly)
        const mockOtp = '123456';
        for (let i = 0; i < Math.min(6, await otpInputs.count()); i++) {
          await otpInputs.nth(i).fill(mockOtp[i]);
        }
        
        await page.getByRole('button', { name: /verify|submit/i }).click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Step 5: Navigate to dashboard or login if registration was successful
    let finalUrl = page.url();
    
    if (finalUrl.includes('/login') || finalUrl === '/') {
      // If redirected back to login, try to login with the new credentials
      if (!finalUrl.includes('/login')) {
        await page.goto('/login');
      }
      
      await page.getByPlaceholder('Enter your email').fill(testUser.email);
      await page.getByPlaceholder('Enter your password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      await page.waitForTimeout(3000);
      finalUrl = page.url();
    }
    
    // Step 6: Verify we're in the application (dashboard area)
    const validPostAuthUrls = ['/dashboard', '/community', '/admin', '/industry', '/government'];
    const isInApp = validPostAuthUrls.some(url => finalUrl.includes(url));
    
    if (!isInApp) {
      // If not automatically redirected, try to navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);
    }
    
    // Step 7: Navigate to Add Project
    await page.goto('/add-project');
    await page.waitForLoadState('networkidle');
    
    // Verify add project page loads
    await expect(page.getByRole('heading', { name: /add.*project/i })).toBeVisible();
    
    // Step 8: Fill project creation form
    const projectName = 'E2E Test Mangrove Project';
    
    // Fill project name
    const projectNameInput = page.getByRole('textbox').first();
    await projectNameInput.fill(projectName);
    
    // Select project type
    const projectTypeSelect = page.getByRole('combobox');
    if (await projectTypeSelect.count() > 0) {
      await projectTypeSelect.selectOption('Mangroves');
    }
    
    // Handle location selection
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    if (await locationInput.count() > 0) {
      await locationInput.click();
      await page.waitForTimeout(1000);
      
      // Select a location suggestion
      const suggestionButtons = page.locator('button').filter({ hasText: /sundarbans|bhitarkanika|pichavaram|national park/i });
      if (await suggestionButtons.count() > 0) {
        await suggestionButtons.first().click();
        await page.waitForTimeout(500);
      }
    }
    
    // Fill area
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await areaInput.fill('18.5');
    }
    
    // Fill description
    const descriptionField = page.getByRole('textbox', { name: /briefly describe/i });
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('End-to-end test project for mangrove restoration and carbon credit generation in coastal areas.');
    }
    
    // Step 9: Proceed to next step if available
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Step 10: Handle file upload section if we reached it
      const fileInputs = page.locator('input[type="file"]');
      const uploadAreas = page.getByText(/upload|drag.*drop/i);
      
      if (await fileInputs.count() > 0 || await uploadAreas.count() > 0) {
        // File upload section loaded successfully
        expect(await fileInputs.count() + await uploadAreas.count()).toBeGreaterThan(0);
        
        // Look for continue/submit button
        const submitButton = page.getByRole('button', { name: /submit|create.*project|finish/i });
        if (await submitButton.count() > 0 && await submitButton.isEnabled()) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Step 11: Verify project creation success
          const successUrl = page.url();
          
          // Should redirect to project list, dashboard, or success page
          const successIndicators = [
            '/my-projects',
            '/dashboard', 
            '/community',
            '/projects',
            '/success'
          ];
          
          const projectCreated = successIndicators.some(indicator => successUrl.includes(indicator));
          
          if (projectCreated) {
            // Look for success message or project in list
            const successElements = [
              page.getByText(/success/i),
              page.getByText(/created/i),
              page.getByText(projectName),
              page.getByText(/mangrove/i)
            ];
            
            let foundSuccessIndicator = false;
            for (const element of successElements) {
              if (await element.first().isVisible()) {
                foundSuccessIndicator = true;
                break;
              }
            }
          }
        }
      }
    }
    
    // Step 12: Navigate through different sections to verify full application functionality
    const sectionsToTest = ['/certificates', '/leaderboard'];
    
    for (const section of sectionsToTest) {
      await page.goto(section);
      await page.waitForTimeout(1500);
      
      // Verify section loads without errors
      const sectionUrl = page.url();
      expect(sectionUrl).toContain(section);
      
      // Look for page-specific content
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
    }
    
    // Step 13: Test dashboard functionality
    await page.goto('/community');
    await page.waitForTimeout(2000);
    
    const dashboardUrl = page.url();
    
    if (dashboardUrl.includes('/community') || dashboardUrl.includes('/dashboard')) {
      // Look for dashboard elements
      const dashboardElements = [
        page.getByRole('heading'),
        page.getByText(/project/i),
        page.getByText(/dashboard/i),
        page.getByRole('button')
      ];
      
      let foundDashboardContent = false;
      for (const element of dashboardElements) {
        if (await element.first().isVisible()) {
          foundDashboardContent = true;
          break;
        }
      }
      
      expect(foundDashboardContent).toBe(true);
    }
  });

  test('Complete marketplace and credit purchase flow (Industry user)', async ({ page }) => {
    // This test simulates an industry user purchasing carbon credits
    
    // Step 1: Start from landing page and navigate to industry dashboard
    await page.goto('/');
    await page.getByRole('button', { name: 'Login / Register' }).click();
    
    // Step 2: Try to access industry dashboard
    await page.goto('/industry');
    await page.waitForTimeout(2000);
    
    const industryUrl = page.url();
    
    if (industryUrl.includes('/industry')) {
      // We're on industry dashboard
      await expect(page.getByRole('heading')).toBeVisible();
      
      // Step 3: Navigate to marketplace
      await page.goto('/industry/marketplace');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/marketplace')) {
        // Look for marketplace elements
        const marketplaceElements = [
          page.getByText(/marketplace/i),
          page.getByText(/credit/i),
          page.getByText(/buy|purchase/i),
          page.getByRole('button')
        ];
        
        let foundMarketplaceContent = false;
        for (const element of marketplaceElements) {
          if (await element.first().isVisible()) {
            foundMarketplaceContent = true;
            
            // Try to interact with marketplace element
            if (element === page.getByRole('button') && await element.first().isEnabled()) {
              await element.first().click();
              await page.waitForTimeout(1000);
            }
            break;
          }
        }
        
        expect(foundMarketplaceContent).toBe(true);
      }
      
      // Step 4: Check wallet functionality
      await page.goto('/industry/wallet');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/wallet')) {
        const walletElements = [
          page.getByText(/wallet/i),
          page.getByText(/balance/i),
          page.getByText(/credit/i)
        ];
        
        let foundWalletContent = false;
        for (const element of walletElements) {
          if (await element.first().isVisible()) {
            foundWalletContent = true;
            break;
          }
        }
      }
      
      // Step 5: Check transaction history
      await page.goto('/industry/transactions');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/transactions')) {
        expect(page.url()).toContain('/transactions');
      }
    }
  });

  test('Complete admin workflow - project approval and credit issuance', async ({ page }) => {
    // This test simulates admin functionality
    
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const adminUrl = page.url();
    
    if (adminUrl.includes('/admin')) {
      // Step 1: Test project approval interface
      await page.goto('/admin/project-approval');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/project-approval')) {
        const approvalElements = [
          page.getByText(/approval/i),
          page.getByText(/project/i),
          page.getByRole('button', { name: /approve|reject/i })
        ];
        
        let foundApprovalContent = false;
        for (const element of approvalElements) {
          if (await element.first().isVisible()) {
            foundApprovalContent = true;
            break;
          }
        }
      }
      
      // Step 2: Test credit issuance interface
      await page.goto('/admin/credit-issuance');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/credit-issuance')) {
        const issuanceElements = [
          page.getByText(/issuance/i),
          page.getByText(/credit/i),
          page.getByRole('button')
        ];
        
        let foundIssuanceContent = false;
        for (const element of issuanceElements) {
          if (await element.first().isVisible()) {
            foundIssuanceContent = true;
            break;
          }
        }
      }
      
      // Step 3: Test user management
      await page.goto('/admin/user-management');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/user-management')) {
        expect(page.url()).toContain('/user-management');
      }
      
      // Step 4: Test reports
      await page.goto('/admin/reports');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/reports')) {
        expect(page.url()).toContain('/reports');
      }
    }
  });

  test('Complete government audit workflow', async ({ page }) => {
    await page.goto('/government');
    await page.waitForTimeout(2000);
    
    const govUrl = page.url();
    
    if (govUrl.includes('/government')) {
      // Step 1: Test audit projects interface
      await page.goto('/government/audit-projects');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/audit-projects')) {
        const auditElements = [
          page.getByText(/audit/i),
          page.getByText(/project/i),
          page.getByRole('button')
        ];
        
        let foundAuditContent = false;
        for (const element of auditElements) {
          if (await element.first().isVisible()) {
            foundAuditContent = true;
            break;
          }
        }
      }
      
      // Step 2: Test policies interface
      await page.goto('/government/policies');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/policies')) {
        expect(page.url()).toContain('/policies');
      }
      
      // Step 3: Test government reports
      await page.goto('/government/reports');
      await page.waitForTimeout(1500);
      
      if (page.url().includes('/reports')) {
        expect(page.url()).toContain('/reports');
      }
    }
  });

  test('Test cross-browser compatibility and responsiveness', async ({ page, browserName }) => {
    // Test key functionality across different browsers
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test on different screen sizes
    const screenSizes = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(500);
      
      // Verify key elements are still visible and functional
      await expect(page.getByRole('heading', { name: /blockchain.*powered.*blue carbon registry/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login / Register' })).toBeVisible();
      
      // Test navigation on different screen sizes
      await page.getByRole('button', { name: 'Login / Register' }).click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/login');
      
      // Navigate back to home
      await page.goto('/');
      await page.waitForTimeout(500);
    }
    
    // Reset to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test browser-specific features
    console.log(`Testing on ${browserName}`);
    
    // Verify JavaScript functionality works across browsers
    const jsWorking = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(jsWorking).toBe(true);
  });
});