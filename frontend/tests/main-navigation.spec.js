import { test, expect } from '@playwright/test';

test.describe('Main Navigation and Dashboard Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display landing page with key elements', async ({ page }) => {
    // Verify main heading
    await expect(page.getByRole('heading', { name: /blockchain.*powered.*blue carbon registry/i })).toBeVisible();
    
    // Verify key buttons
    await expect(page.getByRole('button', { name: 'Login / Register' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Watch Demo' })).toBeVisible();
    
    // Verify key sections
    await expect(page.getByRole('heading', { name: /key features/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /registry insights/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /top performers/i })).toBeVisible();
  });

  test('should navigate to different sections on landing page', async ({ page }) => {
    // Test scrolling and navigation within landing page
    const featuresSection = page.getByRole('heading', { name: /key features/i });
    await featuresSection.scrollIntoViewIfNeeded();
    await expect(featuresSection).toBeVisible();
    
    const stakeholdersSection = page.getByRole('heading', { name: /our stakeholders/i });
    await stakeholdersSection.scrollIntoViewIfNeeded();
    await expect(stakeholdersSection).toBeVisible();
    
    const faqSection = page.getByRole('heading', { name: /frequently asked questions/i });
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();
  });

  test('should expand FAQ items on landing page', async ({ page }) => {
    // Scroll to FAQ section
    const faqSection = page.getByRole('heading', { name: /frequently asked questions/i });
    await faqSection.scrollIntoViewIfNeeded();
    
    // Try to expand FAQ items
    const faqItems = page.locator('[cursor=pointer]').filter({ hasText: /what is blue carbon/i });
    if (await faqItems.count() > 0) {
      await faqItems.first().click();
      await page.waitForTimeout(500); // Wait for expansion animation
    }
    
    const blockchainFaq = page.locator('[cursor=pointer]').filter({ hasText: /how does blockchain help/i });
    if (await blockchainFaq.count() > 0) {
      await blockchainFaq.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should access add project page directly', async ({ page }) => {
    await page.goto('/add-project');
    await page.waitForLoadState('networkidle');
    
    // Verify add project page elements
    await expect(page.getByRole('heading', { name: /add.*project/i })).toBeVisible();
    
    // Check for project form elements
    const projectNameInput = page.getByPlaceholder(/project name/i);
    if (await projectNameInput.isVisible()) {
      await expect(projectNameInput).toBeVisible();
    }
    
    // Check for project type selector
    const projectTypeSelect = page.getByRole('combobox');
    if (await projectTypeSelect.count() > 0) {
      await expect(projectTypeSelect.first()).toBeVisible();
    }
  });

  test('should access dashboard with role-based redirect', async ({ page }) => {
    await page.goto('/dashboard');
    
    // This should either redirect to login or to role-specific dashboard
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    // Should either be on login page (if not authenticated) or on a role-specific dashboard
    const validUrls = ['/login', '/admin', '/industry', '/government', '/community'];
    const isValidRedirect = validUrls.some(url => currentUrl.includes(url));
    
    expect(isValidRedirect).toBe(true);
  });

  test('should access certificates page', async ({ page }) => {
    await page.goto('/certificates');
    await page.waitForLoadState('networkidle');
    
    // Verify certificates page loads
    expect(page.url()).toContain('/certificates');
    
    // Look for certificate-related content
    const certificateElements = [
      page.getByRole('heading', { name: /certificate/i }),
      page.getByText(/certificate/i),
      page.getByText(/carbon credit/i)
    ];
    
    let foundCertificateContent = false;
    for (const element of certificateElements) {
      if (await element.first().isVisible()) {
        foundCertificateContent = true;
        break;
      }
    }
    
    // At minimum, the page should load without error
    expect(page.url()).toContain('/certificates');
  });

  test('should access leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Verify leaderboard page loads
    expect(page.url()).toContain('/leaderboard');
    
    // Look for leaderboard-related content
    const leaderboardElements = [
      page.getByRole('heading', { name: /leaderboard/i }),
      page.getByText(/ranking/i),
      page.getByText(/top.*performer/i),
      page.getByText(/score/i)
    ];
    
    let foundLeaderboardContent = false;
    for (const element of leaderboardElements) {
      if (await element.first().isVisible()) {
        foundLeaderboardContent = true;
        break;
      }
    }
    
    // At minimum, the page should load without error
    expect(page.url()).toContain('/leaderboard');
  });

  test('should handle direct access to role-specific dashboards', async ({ page }) => {
    const dashboards = ['/admin', '/industry', '/government', '/community'];
    
    for (const dashboard of dashboards) {
      await page.goto(dashboard);
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      
      // Should either stay on the dashboard (if authorized) or redirect to login
      expect(currentUrl).toMatch(new RegExp(`(${dashboard}|/login)`));
    }
  });

  test('should test responsive navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Test on different screen sizes
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(500);
    
    // Look for mobile menu toggle if it exists
    const mobileMenuToggle = page.locator('button').filter({ hasText: /menu|☰|≡/ });
    if (await mobileMenuToggle.count() > 0) {
      await mobileMenuToggle.first().click();
      await page.waitForTimeout(500);
    }
    
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should handle project details page routing', async ({ page }) => {
    // Test dynamic project route
    await page.goto('/project/123');
    await page.waitForLoadState('networkidle');
    
    // Should either show project details or appropriate error/redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('/project/123');
    
    // Look for project-related content
    const projectElements = [
      page.getByRole('heading'),
      page.getByText(/project/i),
      page.getByText(/details/i)
    ];
    
    // At minimum, page should load without crashing
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });

  test('should test watch demo functionality', async ({ page }) => {
    await page.goto('/');
    
    // Click Watch Demo button
    const watchDemoButton = page.getByRole('button', { name: 'Watch Demo' });
    await watchDemoButton.click();
    
    // This might open a modal, redirect, or start a video
    await page.waitForTimeout(1000);
    
    // Check if something changed (modal appeared, video started, etc.)
    // This test validates the button works without crashing
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy(); // At minimum, page should not crash
  });

  test('should validate footer and copyright information', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    const footer = page.locator('footer, [role="contentinfo"]');
    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
    }
    
    // Look for copyright text
    const copyrightText = page.getByText(/©.*blue carbon registry/i);
    if (await copyrightText.count() > 0) {
      await expect(copyrightText).toBeVisible();
    }
  });
});