import { test, expect } from '@playwright/test';

test.describe('Restaurant Browsing and Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
  });

  test('should display restaurant listings on homepage', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title includes our app name
    await expect(page).toHaveTitle(/Food Delivery|Multivendor/);
    
    // Look for restaurant listings - they should have restaurant cards or grid
    // Since we're using MenuVerse integration, restaurants should load from Firebase
    await page.waitForSelector('[data-testid="restaurant-grid"], .restaurant-card, .grid', { timeout: 10000 });
    
    // Verify that we have restaurant content
    const restaurantElements = await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').count();
    expect(restaurantElements).toBeGreaterThan(0);
  });

  test('should navigate to restaurant detail page', async ({ page }) => {
    // Wait for restaurants to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 10000 });
    
    // Click on the first restaurant
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click({ force: true });
    
    // Should navigate to restaurant detail page
    await expect(page).toHaveURL(/\/restaurant\/.*/, { timeout: 10000 });
    
    // Should show menu items
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 10000 });
    
    // Verify menu items are displayed
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item, .food-item').count();
    expect(menuItems).toBeGreaterThan(0);
  });

  test('should add items to cart and update cart count', async ({ page }) => {
    // Navigate to a restaurant page
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 10000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click({ force: true });
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 10000 });
    
    // Get initial cart count (should be 0)
    const initialCartCount = await page.locator('[data-testid="cart-count"], .cart-count').textContent();
    
    // Click "Add to Cart" button
    await page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")').first().click({ force: true });
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Verify cart count increased
    const updatedCartCount = await page.locator('[data-testid="cart-count"], .cart-count').textContent();
    expect(parseInt(updatedCartCount || '0')).toBeGreaterThan(parseInt(initialCartCount || '0'));
  });

  test('should navigate to cart page and show added items', async ({ page }) => {
    // Add an item to cart first
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 10000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click({ force: true });
    
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 10000 });
    await page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")').first().click({ force: true });
    
    // Navigate to cart page
    await page.goto('/cart');
    
    // Should show cart items
    await page.waitForSelector('[data-testid="cart-item"], .cart-item', { timeout: 5000 });
    
    // Verify cart has items
    const cartItems = await page.locator('[data-testid="cart-item"], .cart-item').count();
    expect(cartItems).toBeGreaterThan(0);
    
    // Should show total amount
    await expect(page.locator('[data-testid="cart-total"], .total, .amount')).toBeVisible();
  });

  test('should handle empty cart state', async ({ page }) => {
    // Go directly to cart page
    await page.goto('/cart');
    
    // Should show empty cart message or empty state
    await expect(page.locator('text=empty, text=no items, [data-testid="empty-cart"]')).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should show mobile-friendly layout
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 10000 });
    
    // Check if mobile menu exists (hamburger menu)
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, .menu-button');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu).toBeVisible();
    }
    
    // Restaurant cards should still be visible and clickable
    const restaurantCard = page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first();
    await expect(restaurantCard).toBeVisible();
  });
});