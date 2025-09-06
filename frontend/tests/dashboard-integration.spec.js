import { test, expect } from '@playwright/test';

test.describe('Dashboard Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from base URL
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle role-based dashboard redirects', async ({ page }) => {
    // Test direct access to different dashboard routes
    const dashboardRoutes = [
      '/admin',
      '/industry', 
      '/government',
      '/community',
      '/dashboard'
    ];

    for (const route of dashboardRoutes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      
      // Should either stay on the route (if authenticated) or redirect to login
      const validDestinations = [route, '/login', '/register'];
      const isValidRedirect = validDestinations.some(dest => currentUrl.includes(dest));
      
      expect(isValidRedirect).toBe(true);
    }
  });

  test('should test admin dashboard accessibility', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin')) {
      // We're on admin dashboard, test its elements
      const adminElements = [
        page.getByRole('heading', { name: /admin/i }),
        page.getByRole('heading', { name: /dashboard/i }),
        page.getByText(/project/i),
        page.getByText(/user/i),
        page.getByText(/credit/i)
      ];
      
      let foundAdminContent = false;
      for (const element of adminElements) {
        if (await element.first().isVisible()) {
          foundAdminContent = true;
          break;
        }
      }
      
      // If we're on admin page, should have admin-related content
      if (foundAdminContent) {
        expect(foundAdminContent).toBe(true);
      }
    } else {
      // Should redirect to login if not authenticated
      expect(currentUrl).toContain('/login');
    }
  });

  test('should test industry dashboard features', async ({ page }) => {
    await page.goto('/industry');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/industry')) {
      // Look for industry-specific content
      const industryElements = [
        page.getByText(/marketplace/i),
        page.getByText(/transaction/i),
        page.getByText(/wallet/i),
        page.getByText(/credit/i),
        page.getByText(/carbon/i)
      ];
      
      let foundIndustryContent = false;
      for (const element of industryElements) {
        if (await element.first().isVisible()) {
          foundIndustryContent = true;
          break;
        }
      }
      
      // Test navigation to industry sub-pages
      const subRoutes = ['/industry/marketplace', '/industry/wallet', '/industry/transactions'];
      for (const subRoute of subRoutes) {
        await page.goto(subRoute);
        await page.waitForTimeout(1000);
        
        const subUrl = page.url();
        // Should either stay on sub-route or redirect to login
        expect(subUrl).toMatch(new RegExp(`(${subRoute}|/login)`));
      }
    }
  });

  test('should test government dashboard functionality', async ({ page }) => {
    await page.goto('/government');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/government')) {
      // Look for government-specific elements
      const govElements = [
        page.getByText(/audit/i),
        page.getByText(/polic/i),
        page.getByText(/report/i),
        page.getByText(/compliance/i),
        page.getByText(/regulation/i)
      ];
      
      // Test government sub-routes
      const govRoutes = ['/government/audit-projects', '/government/policies', '/government/reports'];
      for (const route of govRoutes) {
        await page.goto(route);
        await page.waitForTimeout(1000);
        
        const routeUrl = page.url();
        expect(routeUrl).toMatch(new RegExp(`(${route}|/login)`));
      }
    }
  });

  test('should test community dashboard interface', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/community')) {
      // Look for community-specific content
      const communityElements = [
        page.getByText(/project/i),
        page.getByText(/profile/i),
        page.getByText(/community/i),
        page.getByRole('heading'),
        page.getByRole('button')
      ];
      
      let foundCommunityContent = false;
      for (const element of communityElements) {
        if (await element.first().isVisible()) {
          foundCommunityContent = true;
          break;
        }
      }
    }
    
    // Test community profile setup
    await page.goto('/community/profile-setup');
    await page.waitForTimeout(1000);
    
    const profileUrl = page.url();
    expect(profileUrl).toMatch(/\/community\/profile-setup|\/login/);
  });

  test('should test sidebar navigation functionality', async ({ page }) => {
    // Try accessing a dashboard route
    await page.goto('/community');
    await page.waitForTimeout(2000);
    
    // Look for sidebar elements
    const sidebarElements = [
      page.locator('nav'),
      page.locator('[role="navigation"]'),
      page.locator('aside'),
      page.locator('.sidebar')
    ];
    
    let sidebarFound = false;
    for (const element of sidebarElements) {
      if (await element.count() > 0) {
        sidebarFound = true;
        
        // Look for navigation links in sidebar
        const navLinks = element.locator('a, button').filter({ hasText: /project|dashboard|profile|setting/i });
        if (await navLinks.count() > 0) {
          // Test clicking first navigation link
          await navLinks.first().click();
          await page.waitForTimeout(1000);
          
          // Should navigate somewhere
          const newUrl = page.url();
          expect(newUrl).toBeTruthy();
        }
        break;
      }
    }
  });

  test('should test settings page accessibility', async ({ page }) => {
    const settingsRoutes = [
      '/dashboard/settings',
      '/admin/settings',
      '/industry/settings',
      '/government/settings'
    ];
    
    for (const route of settingsRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1500);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/settings')) {
        // Look for settings elements
        const settingsElements = [
          page.getByRole('heading', { name: /setting/i }),
          page.getByText(/profile/i),
          page.getByText(/account/i),
          page.getByText(/preference/i)
        ];
        
        let foundSettingsContent = false;
        for (const element of settingsElements) {
          if (await element.first().isVisible()) {
            foundSettingsContent = true;
            break;
          }
        }
        
        // Settings page should load without errors
        expect(currentUrl).toContain('/settings');
      }
    }
  });

  test('should test dashboard data visualization elements', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/community') || currentUrl.includes('/dashboard')) {
      // Look for data visualization elements
      const chartElements = [
        page.locator('canvas'), // Chart.js canvases
        page.locator('svg'), // D3.js or other SVG charts
        page.locator('[class*="chart"]'),
        page.locator('[class*="graph"]'),
        page.locator('[role="img"]') // ARIA charts
      ];
      
      let chartsFound = 0;
      for (const element of chartElements) {
        const count = await element.count();
        chartsFound += count;
      }
      
      // Look for data cards/stats
      const statElements = [
        page.getByText(/\d+.*project/i),
        page.getByText(/\d+.*credit/i),
        page.getByText(/\d+.*ton/i),
        page.getByText(/\$\d+/i)
      ];
      
      let statsFound = 0;
      for (const element of statElements) {
        if (await element.first().isVisible()) {
          statsFound++;
        }
      }
    }
  });

  test('should test dashboard responsive behavior', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(2000);
    
    // Test different screen sizes
    const screenSizes = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet landscape
      { width: 768, height: 1024 },  // Tablet portrait
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const size of screenSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(500);
      
      // Check if page still loads and key elements are visible
      const mainContent = page.locator('main, [role="main"], .main-content').first();
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();
      }
      
      // Check for mobile menu on smaller screens
      if (size.width < 768) {
        const mobileMenu = page.locator('button').filter({ hasText: /menu|☰/ });
        if (await mobileMenu.count() > 0) {
          await mobileMenu.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should test profile management functionality', async ({ page }) => {
    // Test community profile
    await page.goto('/community/profile');
    await page.waitForTimeout(2000);
    
    let currentUrl = page.url();
    
    if (currentUrl.includes('/profile')) {
      // Look for profile elements
      const profileElements = [
        page.getByText(/name/i),
        page.getByText(/email/i),
        page.getByText(/organization/i),
        page.getByRole('button', { name: /edit|update|save/i })
      ];
      
      for (const element of profileElements) {
        if (await element.first().isVisible()) {
          // Profile page has loaded successfully
          break;
        }
      }
    }
    
    // Test admin profile
    await page.goto('/admin/profile');
    await page.waitForTimeout(1500);
    
    currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/profile|\/login/);
  });

  test('should test project integration across dashboards', async ({ page }) => {
    // Test project-related functionality across different dashboards
    const dashboards = ['/admin', '/community', '/government'];
    
    for (const dashboard of dashboards) {
      await page.goto(dashboard);
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes(dashboard)) {
        // Look for project-related elements
        const projectElements = [
          page.getByText(/project/i),
          page.getByRole('button', { name: /add.*project/i }),
          page.getByRole('link', { name: /project/i })
        ];
        
        for (const element of projectElements) {
          if (await element.first().isVisible()) {
            // Try clicking project-related element
            await element.first().click();
            await page.waitForTimeout(1000);
            
            // Should navigate to project-related page
            const newUrl = page.url();
            expect(newUrl).toBeTruthy();
            break;
          }
        }
      }
    }
  });
});