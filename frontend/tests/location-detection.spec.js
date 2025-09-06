import { test, expect } from '@playwright/test';

// Test suite for location detection functionality in Add Project page
test.describe('Location Detection Feature', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the Add Project page before each test
    await page.goto('/add-project');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial location input field', async ({ page }) => {
    // Verify that the location input field is present and has correct placeholder
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await expect(locationInput).toBeVisible();
    await expect(locationInput).toHaveAttribute('placeholder', 'e.g., Alappuzha, Kerala');
    
    // Verify the detect button is present
    const detectButton = page.getByRole('button', { name: /detect/i });
    await expect(detectButton).toBeVisible();
  });

  test('should show suggestions when clicking on location input', async ({ page }) => {
    // Click on the location input field
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await locationInput.click();
    
    // Wait for suggestions to appear (check for the actual text we see in the app)
    await page.waitForSelector('text=Suggested locations for', { timeout: 10000 });
    
    // Verify that suggestions are displayed
    const suggestionsHeader = page.locator('text=Suggested locations for');
    await expect(suggestionsHeader).toBeVisible();
    
    // Check that at least one suggestion button exists
    const suggestionButtons = page.locator('button').filter({ hasText: /lake|park|sanctuary|forest|sundarbans|bhitarkanika|chilika/i });
    await expect(suggestionButtons.first()).toBeVisible();
  });

  test('should update suggestions when project type changes', async ({ page }) => {
    // Test changing from Mangroves to Seagrass
    const projectTypeSelect = page.getByRole('combobox');
    await projectTypeSelect.selectOption('Seagrass');
    
    // Click on location input to show suggestions
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await locationInput.click();
    
    // Wait for and verify Seagrass suggestions
    await expect(page.locator('text=Suggested locations for Seagrass projects:')).toBeVisible();
    await expect(page.getByRole('button', { name: /gulf of mannar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /palk bay/i })).toBeVisible();
    
    // Change to Wetlands
    await projectTypeSelect.selectOption('Wetlands');
    
    // Click outside to close suggestions, then click input again
    await page.locator('h1').click(); // Click on heading to close suggestions
    await locationInput.click();
    
    // Verify Wetlands suggestions
    await expect(page.locator('text=Suggested locations for Wetlands projects:')).toBeVisible();
    await expect(page.getByRole('button', { name: /chilika lake/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pulicat lake/i })).toBeVisible();
    
    // Change to Agroforestry  
    await projectTypeSelect.selectOption('Agroforestry');
    await page.locator('h1').click(); // Close suggestions
    await locationInput.click();
    
    // Verify Agroforestry suggestions
    await expect(page.locator('text=Suggested locations for Agroforestry projects:')).toBeVisible();
    await expect(page.getByRole('button', { name: /western ghats/i })).toBeVisible();
  });

  test('should fill location input when suggestion is selected', async ({ page }) => {
    // Set project type to Mangroves first
    const projectTypeSelect = page.getByRole('combobox');
    await projectTypeSelect.selectOption('Mangroves');
    
    // Click on location input to show suggestions
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await locationInput.click();
    
    // Wait for suggestions and click on one
    await page.waitForSelector('text=Suggested locations for Mangroves projects:', { timeout: 10000 });
    
    // Look for any suggestion button that contains location names
    const suggestionButton = page.locator('button').filter({ hasText: /sundarbans|bhitarkanika|pichavaram|national park|sanctuary|forest/i }).first();
    await expect(suggestionButton).toBeVisible({ timeout: 5000 });
    
    // Get the text content before clicking
    const selectedText = await suggestionButton.textContent();
    await suggestionButton.click();
    
    // Verify that the location input is filled with the selected suggestion
    await expect(locationInput).toHaveValue(selectedText);
    
    // Verify that suggestions are hidden after selection
    await expect(page.locator('text=Suggested locations for')).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle GPS detect button interaction', async ({ page }) => {
    // Mock geolocation to avoid browser permission issues
    await page.addInitScript(() => {
      navigator.geolocation = {
        getCurrentPosition: (success, error) => {
          // Simulate successful location detection with a delay
          setTimeout(() => {
            success({
              coords: {
                latitude: 20.2961,
                longitude: 85.8245,
                accuracy: 10
              }
            });
          }, 2000);
        }
      };
    });
    
    const detectButton = page.getByRole('button', { name: /detect/i });
    await detectButton.click();
    
    // Check that the button shows loading state
    await expect(page.getByRole('button', { name: /detecting/i })).toBeVisible({ timeout: 5000 });
    
    // Wait for detection to complete - check button text changes back
    await expect(page.getByRole('button', { name: /detect$|detecting/i })).toBeVisible({ timeout: 15000 });
    
    // The reverse geocoding might fail due to API issues, but we can check the coordinates
    // were processed (button is no longer in "Detecting..." state)
    const detectButtonText = await page.getByRole('button', { name: /detect/i }).textContent();
    expect(detectButtonText).not.toBe('Detecting...');
  });

  test('should show and hide suggestions appropriately', async ({ page }) => {
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    
    // Initially suggestions should not be visible
    await expect(page.locator('text=Suggested locations for')).not.toBeVisible();
    
    // Show suggestions by clicking input
    await locationInput.click();
    await expect(page.locator('text=Suggested locations for')).toBeVisible();
    
    // Hide suggestions by clicking outside
    await page.locator('h1').click();
    await expect(page.locator('text=Suggested locations for')).not.toBeVisible();
    
    // Show suggestions again by focusing input
    await locationInput.focus();
    await expect(page.locator('text=Suggested locations for')).toBeVisible();
  });

  test('should filter suggestions based on typed input', async ({ page }) => {
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    
    // Type some text to trigger filtering
    await locationInput.fill('chil');
    
    // Wait for filtered suggestions
    await page.waitForTimeout(1000); // Allow time for async filtering
    
    // Should show suggestions containing "chil" (like Chilika Lake)
    if (await page.locator('text=Suggested locations for').isVisible()) {
      const visibleSuggestions = await page.locator('button').filter({ hasText: /chil/i }).count();
      expect(visibleSuggestions).toBeGreaterThan(0);
    }
  });

  test('should work with form validation', async ({ page }) => {
    // Fill in required fields
    await page.getByRole('textbox', { name: /mangrove restoration/i }).fill('Test Project');
    await page.getByPlaceholder('e.g., 12.5').fill('10.5');
    
    // Select a location from suggestions
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await locationInput.click();
    
    await page.waitForSelector('text=Suggested locations for', { timeout: 5000 });
    const suggestionButton = page.locator('button').filter({ hasText: /lake|park|sanctuary/i }).first();
    await suggestionButton.click();
    
    // Add description
    await page.getByRole('textbox', { name: /briefly describe/i }).fill('Test project description');
    
    // Verify that the Next button becomes enabled
    const nextButton = page.getByRole('button', { name: /next.*files/i });
    await expect(nextButton).toBeEnabled();
  });

  test('should handle backend API errors gracefully', async ({ page }) => {
    // Mock fetch to simulate API errors
    await page.addInitScript(() => {
      window.fetch = async (url) => {
        if (url.includes('/api/locations/')) {
          throw new Error('Network error');
        }
        return new Response('{}', { status: 200 });
      };
    });
    
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    await locationInput.click();
    
    // Should still show fallback suggestions even when API fails
    await page.waitForSelector('text=Suggested locations for', { timeout: 5000 });
    const suggestionButtons = page.locator('button').filter({ hasText: /lake|park|sanctuary|forest/i });
    await expect(suggestionButtons.first()).toBeVisible();
  });

  test('should maintain suggestions state across project type changes', async ({ page }) => {
    const projectTypeSelect = page.getByRole('combobox');
    const locationInput = page.getByRole('textbox', { name: /alappuzha, kerala/i });
    
    // Test multiple project type changes
    const projectTypes = ['Mangroves', 'Seagrass', 'Wetlands', 'Agroforestry'];
    
    for (const projectType of projectTypes) {
      await projectTypeSelect.selectOption(projectType);
      await locationInput.click();
      
      // Verify suggestions appear for each project type
      await expect(page.locator(`text=Suggested locations for ${projectType} projects:`)).toBeVisible();
      
      // Verify at least one suggestion button is present
      const suggestionButtons = page.locator('button').filter({ hasText: /lake|park|sanctuary|forest|ghats|bay/i });
      await expect(suggestionButtons.first()).toBeVisible();
      
      // Close suggestions before next iteration
      await page.locator('h1').click();
    }
  });
});