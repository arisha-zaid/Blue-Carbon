// tests/sidebar-fixed-position.spec.js
import { test, expect } from "@playwright/test";

test.describe("Sidebar Fixed Position", () => {
  test.beforeEach(async ({ page }) => {
    // Set role for user access
    await page.addInitScript(() => {
      localStorage.setItem("role", "admin");
    });

    await page.goto("/admin");
    await page.waitForSelector('[role="complementary"]');
  });

  test("sidebar stays fixed when page is scrolled", async ({ page }) => {
    // Verify sidebar is initially visible
    const sidebar = page.locator('[role="complementary"]');
    await expect(sidebar).toBeVisible();

    // Get initial sidebar position
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox).toBeTruthy();
    const initialTop = sidebarBox.top;
    const initialLeft = sidebarBox.left;

    // Scroll page down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100); // Allow scroll to complete

    // Check sidebar position remains fixed
    const sidebarBoxAfterScroll = await sidebar.boundingBox();
    expect(sidebarBoxAfterScroll).toBeTruthy();
    expect(sidebarBoxAfterScroll.top).toBe(initialTop);
    expect(sidebarBoxAfterScroll.left).toBe(initialLeft);

    // Verify sidebar is still visible and functional after scroll
    await expect(sidebar).toBeVisible();
    const dashboardLink = sidebar.locator('text="Dashboard"');
    await expect(dashboardLink).toBeVisible();
  });

  test("main content adjusts properly when sidebar is closed", async ({
    page,
  }) => {
    // Initially verify sidebar is open and main content has proper margin
    const sidebar = page.locator('[role="complementary"]');
    const mainContent = page.locator("main");
    await expect(sidebar).toBeVisible();

    // Close sidebar
    const closeSidebarButton = page.getByRole("button", {
      name: "Close sidebar",
    });
    await closeSidebarButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify sidebar is closed
    await expect(sidebar).not.toBeVisible();

    // Verify toggle button appears and has proper positioning
    const toggleButton = page.getByRole("button", { name: "Open sidebar" });
    await expect(toggleButton).toBeVisible();

    // On desktop, verify main content has left padding to avoid overlap
    if ((await page.viewportSize().width) >= 1024) {
      const mainContentStyles = await mainContent.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
        };
      });

      // Should have left padding on desktop when sidebar is closed
      const leftPadding = parseInt(mainContentStyles.paddingLeft);
      expect(leftPadding).toBeGreaterThan(24); // More than default 1.5rem (24px)
    }
  });

  test("sidebar toggle functionality works correctly with fixed positioning", async ({
    page,
  }) => {
    // Close sidebar
    const closeSidebarButton = page.getByRole("button", {
      name: "Close sidebar",
    });
    await closeSidebarButton.click();
    await page.waitForTimeout(500);

    // Verify sidebar is hidden
    const sidebar = page.locator('[role="complementary"]');
    await expect(sidebar).not.toBeVisible();

    // Open sidebar using toggle button
    const toggleButton = page.getByRole("button", { name: "Open sidebar" });
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Verify sidebar is visible again
    await expect(sidebar).toBeVisible();

    // Verify sidebar links are functional
    const dashboardLink = sidebar.locator('text="Dashboard"');
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute("href", "/admin");
  });

  test("sidebar maintains fixed position during open/close animations", async ({
    page,
  }) => {
    const sidebar = page.locator('[role="complementary"]');

    // Get initial sidebar position
    const initialBox = await sidebar.boundingBox();
    const initialTop = initialBox.top;
    const initialLeft = initialBox.left;

    // Close sidebar
    const closeSidebarButton = page.getByRole("button", {
      name: "Close sidebar",
    });
    await closeSidebarButton.click();

    // Check position during animation (slight delay)
    await page.waitForTimeout(100);
    const duringCloseBox = await sidebar.boundingBox();
    if (duringCloseBox) {
      // Sidebar might be transitioning
      expect(duringCloseBox.top).toBe(initialTop);
      expect(duringCloseBox.left).toBe(initialLeft);
    }

    // Wait for close animation to complete
    await page.waitForTimeout(500);

    // Reopen sidebar
    const toggleButton = page.getByRole("button", { name: "Open sidebar" });
    await toggleButton.click();

    // Check position during opening animation
    await page.waitForTimeout(100);
    const duringOpenBox = await sidebar.boundingBox();
    if (duringOpenBox) {
      expect(duringOpenBox.top).toBe(initialTop);
      expect(duringOpenBox.left).toBe(initialLeft);
    }

    // Wait for open animation to complete and verify final position
    await page.waitForTimeout(500);
    const finalBox = await sidebar.boundingBox();
    expect(finalBox.top).toBe(initialTop);
    expect(finalBox.left).toBe(initialLeft);
  });

  test("sidebar content is scrollable when needed", async ({ page }) => {
    const sidebar = page.locator('[role="complementary"]');
    await expect(sidebar).toBeVisible();

    // Get sidebar height and content height
    const sidebarInfo = await sidebar.evaluate((el) => {
      const rect = el.getBoundingBox();
      const styles = window.getComputedStyle(el);
      return {
        height: rect.height,
        scrollHeight: el.scrollHeight,
        overflow: styles.overflow,
      };
    });

    // Check if sidebar has proper scrolling setup
    // The sidebar should be scrollable if content exceeds height
    if (sidebarInfo.scrollHeight > sidebarInfo.height) {
      // Verify the sidebar can be scrolled
      await sidebar.evaluate((el) => (el.scrollTop = 50));
      const scrollTop = await sidebar.evaluate((el) => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test("mobile responsive behavior", async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForSelector('[role="complementary"]');

    const sidebar = page.locator('[role="complementary"]');

    // On mobile, sidebar should still be fixed positioned
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox.left).toBe(0); // Should be at left edge
    expect(sidebarBox.top).toBe(0); // Should be at top edge

    // Close sidebar
    const closeSidebarButton = page.getByRole("button", {
      name: "Close sidebar",
    });
    await closeSidebarButton.click();
    await page.waitForTimeout(500);

    // Verify mobile toggle button is positioned at top-right
    const toggleButton = page.getByRole("button", { name: "Open sidebar" });
    await expect(toggleButton).toBeVisible();

    const toggleBox = await toggleButton.boundingBox();
    const viewport = page.viewportSize();
    expect(toggleBox.left).toBeGreaterThan(viewport.width - 100); // Should be near right edge
    expect(toggleBox.top).toBeLessThan(100); // Should be near top
  });

  test("z-index layering works correctly", async ({ page }) => {
    const sidebar = page.locator('[role="complementary"]');
    const mainContent = page.locator("main");

    // Check z-index values through computed styles
    const sidebarZIndex = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el.closest('[class*="z-"]')).zIndex;
    });

    const mainContentZIndex = await mainContent.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    // Sidebar should have higher z-index than main content
    expect(parseInt(sidebarZIndex || "0")).toBeGreaterThan(
      parseInt(mainContentZIndex || "0")
    );
  });
});
