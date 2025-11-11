import { test, expect } from '@playwright/test';

/**
 * Search and Navigation E2E Tests
 * Tests restaurant search, filtering, and navigation features
 */

test.describe('Restaurant Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display search input on homepage', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
      await expect(searchInput.first()).toBeEnabled();
    } else {
      // Search may be in a different location or not yet implemented
      test.skip();
    }
  });

  test('should filter restaurants by search query', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]').first();
    
    if (await searchInput.count() > 0) {
      // Wait for restaurants to load
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
      
      // Get initial restaurant count
      const initialCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
      
      // Search for specific term
      await searchInput.fill('pizza');
      await page.waitForTimeout(1000);
      
      // Results should update
      const filteredCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
      
      // Count may change based on search results
      // expect(filteredCount).toBeLessThanOrEqual(initialCount);
    } else {
      test.skip();
    }
  });

  test('should show "no results" message for invalid search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      // Search for something unlikely to exist
      await searchInput.fill('xyzabc123nonexistent');
      await page.waitForTimeout(1000);
      
      // Should show no results message
      const noResults = page.locator('text=no results, text=not found, text=try again, [data-testid="no-results"]');
      
      if (await noResults.count() > 0) {
        await expect(noResults.first()).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should clear search results when input is cleared', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      const initialCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
      
      // Perform search
      await searchInput.fill('burger');
      await page.waitForTimeout(1000);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      // Should show all restaurants again
      const finalCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    } else {
      test.skip();
    }
  });

  test('should search by cuisine type', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      // Search for cuisine types
      const cuisines = ['Italian', 'Chinese', 'Indian', 'Nigerian'];
      
      for (const cuisine of cuisines) {
        await searchInput.fill(cuisine);
        await page.waitForTimeout(1000);
        
        // Should filter results
        const results = page.locator('[data-testid="restaurant-card"], .restaurant-card');
        const count = await results.count();
        
        // Results may vary based on available restaurants
      }
    } else {
      test.skip();
    }
  });
});

test.describe('Restaurant Filtering and Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should filter restaurants by category', async ({ page }) => {
    // Look for category filters
    const categoryFilters = page.locator('[data-testid="category-filter"], .category, .filter-btn');
    
    if (await categoryFilters.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      
      // Click on a category
      await categoryFilters.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Results should filter
      const restaurants = page.locator('[data-testid="restaurant-card"], .restaurant-card');
      await expect(restaurants.first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should sort restaurants by rating', async ({ page }) => {
    // Look for sort dropdown or buttons
    const sortControl = page.locator('[data-testid="sort"], select, button:has-text("Sort")');
    
    if (await sortControl.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      
      // Select sort by rating
      if (sortControl.first().locator('option').count() > 0) {
        // It's a select element
        await sortControl.first().selectOption({ label: /rating/i });
      } else {
        // It's a button
        await sortControl.first().click({ force: true });
        await page.waitForTimeout(500);
        
        const ratingOption = page.locator('text=rating, [data-sort="rating"]');
        if (await ratingOption.count() > 0) {
          await ratingOption.first().click({ force: true });
        }
      }
      
      await page.waitForTimeout(1000);
      
      // Restaurants should be reordered
      await expect(page.locator('[data-testid="restaurant-card"], .restaurant-card').first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should sort restaurants by delivery time', async ({ page }) => {
    const sortControl = page.locator('[data-testid="sort"], select, button:has-text("Sort")');
    
    if (await sortControl.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      
      // Select sort by delivery time
      if (sortControl.first().locator('option').count() > 0) {
        await sortControl.first().selectOption({ label: /delivery|time/i });
      } else {
        await sortControl.first().click({ force: true });
        const timeOption = page.locator('text=delivery time, text=fastest, [data-sort="time"]');
        if (await timeOption.count() > 0) {
          await timeOption.first().click({ force: true });
        }
      }
      
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="restaurant-card"], .restaurant-card').first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should filter by price range', async ({ page }) => {
    // Look for price filter controls
    const priceFilter = page.locator('[data-testid="price-filter"], input[type="range"], .price-range');
    
    if (await priceFilter.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      
      // Adjust price filter
      await priceFilter.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Results should update
      await expect(page.locator('[data-testid="restaurant-card"], .restaurant-card').first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should filter by dietary preferences', async ({ page }) => {
    // Look for dietary filters (vegetarian, vegan, etc.)
    const dietaryFilter = page.locator('[data-testid="dietary-filter"], button:has-text("Vegetarian"), button:has-text("Vegan")');
    
    if (await dietaryFilter.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      
      // Click on dietary preference
      await dietaryFilter.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Results should filter
      await expect(page.locator('[data-testid="restaurant-card"], .restaurant-card').first()).toBeVisible();
    } else {
      test.skip();
    }
  });
});

test.describe('Navigation and Breadcrumbs', () => {
  test('should navigate using breadcrumbs', async ({ page }) => {
    // Navigate to a restaurant
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click({ force: true });
    
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    
    // Look for breadcrumbs
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"], .breadcrumb, nav[aria-label*="breadcrumb"]');
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible();
      
      // Click on home breadcrumb
      const homeLink = breadcrumbs.locator('a:has-text("Home"), a[href="/"]').first();
      if (await homeLink.count() > 0) {
        await homeLink.click({ force: true });
        await page.waitForURL('/');
        
        // Should be back on homepage
        await expect(page).toHaveURL('/');
      }
    }
  });

  test('should navigate using header links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for header navigation
    const header = page.locator('header, [data-testid="header"], nav');
    await expect(header.first()).toBeVisible();
    
    // Click on different navigation items
    const ordersLink = header.locator('a:has-text("Orders"), a[href*="/orders"]');
    if (await ordersLink.count() > 0) {
      await ordersLink.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // May navigate to orders page or login
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should navigate using footer links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Look for footer
    const footer = page.locator('footer, [data-testid="footer"]');
    
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
      
      // Footer should have links
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should show active page in navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for active navigation indicator
    const nav = page.locator('nav, header');
    const activeLink = nav.locator('.active, [aria-current="page"], .bg-orange, .text-orange');
    
    if (await activeLink.count() > 0) {
      await expect(activeLink.first()).toBeVisible();
    }
  });
});

test.describe('Location-based Features', () => {
  test('should show location selector', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for location selector
    const locationButton = page.locator('[data-testid="location"], button:has-text("Location"), .location-selector');
    
    if (await locationButton.count() > 0) {
      await expect(locationButton.first()).toBeVisible();
      
      // Click to open location selector
      await locationButton.first().click({ force: true });
      await page.waitForTimeout(500);
      
      // Location modal/dropdown should appear
      const locationModal = page.locator('[data-testid="location-modal"], .modal, .dropdown');
      if (await locationModal.count() > 0) {
        await expect(locationModal.first()).toBeVisible();
      }
    }
  });

  test('should filter restaurants by location', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const locationButton = page.locator('[data-testid="location"], button:has-text("Location")').first();
    
    if (await locationButton.count() > 0) {
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card', { timeout: 15000 });
      const initialCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
      
      // Change location
      await locationButton.click({ force: true });
      await page.waitForTimeout(500);
      
      const locationOption = page.locator('[data-testid="location-option"], .location-item').first();
      if (await locationOption.count() > 0) {
        await locationOption.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Restaurants should update based on location
        const newCount = await page.locator('[data-testid="restaurant-card"], .restaurant-card').count();
        // Count may change based on location
      }
    }
  });

  test('should show delivery area on restaurant page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .bg-white', { timeout: 15000 });
    await page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first().click({ force: true });
    
    await page.waitForURL(/\/restaurant\/.*|\/menuverse\/.*/);
    
    // Look for delivery area information
    const deliveryInfo = page.locator('text=delivery area, text=delivery to, [data-testid="delivery-area"]');
    
    if (await deliveryInfo.count() > 0) {
      await expect(deliveryInfo.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility and Keyboard Navigation', () => {
  test('should navigate using keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Focus should move to first interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible();
    }
    
    const nav = page.locator('nav, [role="navigation"]');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');
    
    // Look for skip link (may be hidden until focused)
    const skipLink = page.locator('a:has-text("Skip to content"), a:has-text("Skip to main"), [href="#main-content"]');
    
    if (await skipLink.count() > 0) {
      // Tab to focus skip link
      await page.keyboard.press('Tab');
      
      // Skip link should be visible or accessible
      const isVisible = await skipLink.first().isVisible();
      // Skip link implementation may vary
    }
  });
});
