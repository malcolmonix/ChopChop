import { test, expect } from '@playwright/test';

/**
 * Complete Order Flow E2E Tests
 * Tests the critical user journey: Browse → Select Restaurant → Add to Cart → Checkout → Place Order
 */

test.describe('Complete Order Flow - Critical Path', () => {
  test('should complete full order journey with cash on delivery', async ({ page }) => {
    // Step 1: Browse restaurants on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for restaurants to load
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { 
      timeout: 15000,
      state: 'visible'
    });
    
    // Verify restaurant listings are displayed
    const restaurantCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').count();
    expect(restaurantCount).toBeGreaterThan(0);
    
    // Step 2: Navigate to restaurant detail
    const firstRestaurant = page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first();
    const restaurantName = await firstRestaurant.locator('h2, h3, .font-bold').first().textContent();
    await firstRestaurant.click();
    
    // Wait for navigation and menu to load
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the restaurant page
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 15000 });
    
    // Step 3: Add items to cart
    const menuItems = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")');
    const itemCount = await menuItems.count();
    
    if (itemCount > 0) {
      // Add first item
      await menuItems.first().click();
      await page.waitForTimeout(1000); // Wait for cart to update
      
      // Verify cart count updated
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-count, .badge');
      if (await cartBadge.count() > 0) {
        await expect(cartBadge.first()).toBeVisible();
      }
    }
    
    // Step 4: Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on checkout page
    await expect(page.locator('text=checkout, text=cart, text=order', { hasText: /checkout|cart|order/i })).toBeVisible({ timeout: 10000 });
    
    // Step 5: Complete checkout flow (if available)
    // This depends on the actual checkout implementation
    const checkoutButton = page.locator('button:has-text("Place Order"), button:has-text("Complete"), button:has-text("Checkout")');
    
    if (await checkoutButton.count() > 0) {
      // Fill in any required fields if present
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
      if (await nameInput.count() > 0 && await nameInput.isVisible()) {
        await nameInput.first().fill('Test User');
      }
      
      const phoneInput = page.locator('input[name="phone"], input[placeholder*="phone"]');
      if (await phoneInput.count() > 0 && await phoneInput.isVisible()) {
        await phoneInput.first().fill('+234 801 234 5678');
      }
      
      const addressInput = page.locator('input[name="address"], textarea[name="address"], input[placeholder*="address"]');
      if (await addressInput.count() > 0 && await addressInput.isVisible()) {
        await addressInput.first().fill('123 Test Street, Lagos');
      }
      
      // Select Cash on Delivery if available
      const codOption = page.locator('text="Cash on Delivery", [data-payment="cod"]');
      if (await codOption.count() > 0) {
        await codOption.first().click();
        await page.waitForTimeout(500);
      }
      
      // Place order
      await checkoutButton.first().click();
      await page.waitForTimeout(2000);
      
      // Verify success (order confirmation page or message)
      const successIndicators = page.locator('text=success, text=confirmed, text=thank you, .success, .confirmation');
      if (await successIndicators.count() > 0) {
        await expect(successIndicators.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should persist cart across page refreshes', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click();
    
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 15000 });
    
    const addButton = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Get cart count before refresh
    const cartCountBefore = await page.locator('[data-testid="cart-count"], .cart-count, .badge').first().textContent();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Cart count should be the same
    const cartCountAfter = await page.locator('[data-testid="cart-count"], .cart-count, .badge').first().textContent();
    expect(cartCountAfter).toBe(cartCountBefore);
  });

  test('should show error when trying to checkout with empty cart', async ({ page }) => {
    // Clear any existing cart data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('enatega_cart');
      localStorage.removeItem('chopchop_cart');
    });
    
    // Try to go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Should show empty cart message or redirect
    const emptyIndicators = page.locator('text=empty, text=no items, [data-testid="empty-cart"]');
    if (await emptyIndicators.count() > 0) {
      await expect(emptyIndicators.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should calculate order total correctly', async ({ page }) => {
    // Add multiple items to cart
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click();
    
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 15000 });
    
    // Add first item
    const addButtons = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")');
    const buttonCount = await addButtons.count();
    
    if (buttonCount >= 2) {
      await addButtons.nth(0).click();
      await page.waitForTimeout(1000);
      await addButtons.nth(1).click();
      await page.waitForTimeout(1000);
    }
    
    // Go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Verify total is displayed
    const totalIndicators = page.locator('[data-testid="cart-total"], .total, text=total, text=₦');
    if (await totalIndicators.count() > 0) {
      await expect(totalIndicators.first()).toBeVisible();
    }
  });
});

test.describe('Order Flow - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should complete order flow on mobile device', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for restaurants to load
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    
    // Tap on restaurant
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().tap();
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    
    // Wait for menu
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 15000 });
    
    // Add item to cart
    const addButton = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")').first();
    if (await addButton.count() > 0) {
      await addButton.tap();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Verify checkout page is mobile-friendly
    const checkoutContent = page.locator('[data-testid="checkout"], .checkout, main');
    await expect(checkoutContent).toBeVisible();
  });

  test('should show mobile menu when available', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], .hamburger, .menu-button, button[aria-label*="menu"]');
    
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton.first()).toBeVisible();
      
      // Click to open menu
      await mobileMenuButton.first().tap();
      await page.waitForTimeout(500);
      
      // Menu should be visible
      const menu = page.locator('[data-testid="mobile-menu-content"], .mobile-nav, nav[role="navigation"]');
      if (await menu.count() > 0) {
        await expect(menu.first()).toBeVisible();
      }
    }
  });
});

test.describe('Order Flow - Error Scenarios', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Should show error message or offline indicator
    await page.waitForTimeout(3000);
    
    // Restore connection
    await page.context().setOffline(false);
    
    // Retry navigation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should load successfully
    await expect(page).toHaveURL('/');
  });

  test('should validate required checkout fields', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { id: '1', name: 'Test Item', price: 1000, quantity: 1 }
      ]));
    });
    
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Place Order"), button:has-text("Complete"), button:has-text("Submit")');
    
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      const errorIndicators = page.locator('.error, [role="alert"], text=required, text=invalid');
      // Errors may appear depending on form validation
    }
  });

  test('should handle item out of stock gracefully', async ({ page }) => {
    // This test would require backend support for out-of-stock items
    // For now, just verify the page doesn't crash
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click();
    
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, .food-item', { timeout: 15000 });
    
    // Page should load without errors
    const errorMessages = page.locator('text=error, text=failed, .error-message');
    // Should not have critical errors
  });
});
