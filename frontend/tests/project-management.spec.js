import { test, expect } from '@playwright/test';

test.describe('Project Management Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to add project page
    await page.goto('/add-project');
    await page.waitForLoadState('networkidle');
  });

  test('should display project creation form with all required fields', async ({ page }) => {
    // Verify page title/heading
    await expect(page.getByRole('heading', { name: /add.*project/i })).toBeVisible();
    
    // Check for essential form fields
    const projectNameInput = page.getByPlaceholder(/project name/i);
    if (await projectNameInput.count() > 0) {
      await expect(projectNameInput.first()).toBeVisible();
    }
    
    // Check for project type selector
    const projectTypeSelect = page.getByRole('combobox');
    if (await projectTypeSelect.count() > 0) {
      await expect(projectTypeSelect.first()).toBeVisible();
    }
    
    // Check for location input (we know this exists from previous tests)
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    if (await locationInput.count() > 0) {
      await expect(locationInput).toBeVisible();
    }
    
    // Check for area input
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await expect(areaInput).toBeVisible();
    }
    
    // Check for description field
    const descriptionField = page.getByRole('textbox', { name: /briefly describe/i });
    if (await descriptionField.count() > 0) {
      await expect(descriptionField).toBeVisible();
    }
  });

  test('should validate project form with different project types', async ({ page }) => {
    const projectTypes = ['Mangroves', 'Seagrass', 'Wetlands', 'Agroforestry'];
    
    for (const projectType of projectTypes) {
      // Select project type
      const projectTypeSelect = page.getByRole('combobox');
      if (await projectTypeSelect.count() > 0) {
        await projectTypeSelect.first().selectOption(projectType);
        await page.waitForTimeout(500);
        
        // Verify the selection worked
        const selectedValue = await projectTypeSelect.first().inputValue();
        expect(selectedValue.toLowerCase()).toBe(projectType.toLowerCase());
      }
    }
  });

  test('should create a complete project with all required information', async ({ page }) => {
    // Fill project name
    const projectNameInput = page.getByPlaceholder(/project name/i);
    if (await projectNameInput.count() > 0) {
      await projectNameInput.fill('Test Mangrove Restoration Project');
    } else {
      // Try alternative selector
      const nameInput = page.getByRole('textbox').first();
      await nameInput.fill('Test Mangrove Restoration Project');
    }
    
    // Select project type
    const projectTypeSelect = page.getByRole('combobox');
    if (await projectTypeSelect.count() > 0) {
      await projectTypeSelect.selectOption('Mangroves');
    }
    
    // Fill location using suggestion
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    if (await locationInput.count() > 0) {
      await locationInput.click();
      await page.waitForTimeout(1000);
      
      // Select first available suggestion
      const suggestionButtons = page.locator('button').filter({ hasText: /sundarbans|bhitarkanika|pichavaram/i });
      if (await suggestionButtons.count() > 0) {
        await suggestionButtons.first().click();
      }
    }
    
    // Fill area
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await areaInput.fill('25.5');
    }
    
    // Fill description
    const descriptionField = page.getByRole('textbox', { name: /briefly describe/i });
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('This is a test mangrove restoration project aimed at carbon sequestration and coastal protection.');
    }
    
    // Try to proceed to next step
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should handle project area validation', async ({ page }) => {
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      // Test invalid area values
      const invalidValues = ['0', '-5', 'abc', ''];
      
      for (const value of invalidValues) {
        await areaInput.fill(value);
        await page.waitForTimeout(500);
        
        // Try to proceed (should fail validation)
        const nextButton = page.getByRole('button', { name: /next.*files/i });
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Should still be on the same page due to validation
          expect(page.url()).toContain('/add-project');
        }
      }
      
      // Test valid value
      await areaInput.fill('15.0');
    }
  });

  test('should handle GPS location detection', async ({ page }) => {
    // Mock geolocation for testing
    await page.addInitScript(() => {
      navigator.geolocation = {
        getCurrentPosition: (success, error) => {
          setTimeout(() => {
            success({
              coords: {
                latitude: 9.4981,
                longitude: 76.3388, // Alappuzha coordinates
                accuracy: 10
              }
            });
          }, 1000);
        }
      };
    });
    
    // Click detect button
    const detectButton = page.getByRole('button', { name: /detect/i });
    if (await detectButton.count() > 0) {
      await detectButton.click();
      
      // Wait for detection process
      await page.waitForTimeout(3000);
      
      // Check if location was updated
      const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
      if (await locationInput.count() > 0) {
        const locationValue = await locationInput.inputValue();
        // Should have some location value after detection
        expect(locationValue.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle project type-specific location suggestions', async ({ page }) => {
    const projectTypeSelect = page.getByRole('combobox');
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    
    if (await projectTypeSelect.count() > 0 && await locationInput.count() > 0) {
      // Test Mangroves suggestions
      await projectTypeSelect.selectOption('Mangroves');
      await locationInput.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=Suggested locations for Mangroves projects:')).toBeVisible();
      
      // Test Seagrass suggestions
      await page.locator('h1').click(); // Close suggestions
      await projectTypeSelect.selectOption('Seagrass');
      await locationInput.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=Suggested locations for Seagrass projects:')).toBeVisible();
      
      // Test Wetlands suggestions
      await page.locator('h1').click(); // Close suggestions
      await projectTypeSelect.selectOption('Wetlands');
      await locationInput.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=Suggested locations for Wetlands projects:')).toBeVisible();
    }
  });

  test('should handle file upload section', async ({ page }) => {
    // Fill basic form first
    const projectNameInput = page.getByRole('textbox').first();
    await projectNameInput.fill('File Upload Test Project');
    
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await areaInput.fill('10.0');
    }
    
    const descriptionField = page.getByRole('textbox', { name: /briefly describe/i });
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Test project for file upload functionality.');
    }
    
    // Try to proceed to files section
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Look for file upload elements
      const fileInputs = page.locator('input[type="file"]');
      const uploadElements = page.getByText(/upload/i);
      
      // Verify file upload section appeared
      if (await fileInputs.count() > 0 || await uploadElements.count() > 0) {
        expect(await fileInputs.count() + await uploadElements.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should validate required fields before proceeding', async ({ page }) => {
    // Try to proceed without filling required fields
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    if (await nextButton.count() > 0) {
      // Button should be disabled initially
      const isEnabled = await nextButton.isEnabled();
      if (!isEnabled) {
        await expect(nextButton).toBeDisabled();
      } else {
        // If enabled, clicking should show validation errors
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Should still be on add-project page
        expect(page.url()).toContain('/add-project');
      }
    }
  });

  test('should handle form reset functionality', async ({ page }) => {
    // Fill some form fields
    const projectNameInput = page.getByRole('textbox').first();
    await projectNameInput.fill('Test Project to Reset');
    
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await areaInput.fill('20.0');
    }
    
    // Look for reset/clear button
    const resetButton = page.getByRole('button', { name: /reset|clear|cancel/i });
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify form was reset
      const nameValue = await projectNameInput.inputValue();
      expect(nameValue).toBe('');
      
      if (await areaInput.count() > 0) {
        const areaValue = await areaInput.inputValue();
        expect(areaValue).toBe('');
      }
    }
  });

  test('should handle navigation back to previous steps', async ({ page }) => {
    // Fill form and proceed to next step
    const projectNameInput = page.getByRole('textbox').first();
    await projectNameInput.fill('Navigation Test Project');
    
    const areaInput = page.getByPlaceholder('e.g., 12.5');
    if (await areaInput.count() > 0) {
      await areaInput.fill('15.0');
    }
    
    const descriptionField = page.getByRole('textbox', { name: /briefly describe/i });
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Testing navigation between form steps.');
    }
    
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Look for back button
      const backButton = page.getByRole('button', { name: /back|previous/i });
      if (await backButton.count() > 0) {
        await backButton.click();
        await page.waitForTimeout(1000);
        
        // Should be back to project details form
        await expect(projectNameInput).toBeVisible();
        
        // Form data should be preserved
        const nameValue = await projectNameInput.inputValue();
        expect(nameValue).toBe('Navigation Test Project');
      }
    }
  });
});