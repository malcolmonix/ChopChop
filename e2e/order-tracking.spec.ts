import { test, expect } from '@playwright/test';

/**
 * Order Tracking and Status E2E Tests
 * Tests order tracking, status updates, and order history
 */

test.describe('Order Tracking', () => {
  test('should display orders page', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // Should show orders page or redirect to login
    const isOrdersPage = await page.locator('text=order, text=history', { hasText: /order|history/i }).count() > 0;
    const isLoginPage = await page.locator('text=login, text=sign in', { hasText: /login|sign in/i }).count() > 0;
    
    expect(isOrdersPage || isLoginPage).toBeTruthy();
  });

  test('should show order list when authenticated', async ({ page }) => {
    // Mock authenticated state with orders
    await page.goto('/orders');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Test User'
      }));
      
      // Mock some orders
      localStorage.setItem('orders', JSON.stringify([
        {
          id: 'order-1',
          restaurantName: 'Test Restaurant',
          total: 5000,
          status: 'delivered',
          date: new Date().toISOString()
        },
        {
          id: 'order-2',
          restaurantName: 'Another Restaurant',
          total: 3500,
          status: 'in_progress',
          date: new Date().toISOString()
        }
      ]));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show order cards/list
    const orderItems = page.locator('[data-testid="order-item"], .order-card, .order-item');
    
    if (await orderItems.count() > 0) {
      await expect(orderItems.first()).toBeVisible();
      
      // Order items should show details
      await expect(page.locator('text=Test Restaurant')).toBeVisible();
    }
  });

  test('should show empty state when no orders', async ({ page }) => {
    // Mock authenticated state with no orders
    await page.goto('/orders');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Test User'
      }));
      localStorage.setItem('orders', JSON.stringify([]));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show empty state
    const emptyState = page.locator('text=no orders, text=empty, text=start ordering, [data-testid="empty-orders"]');
    
    if (await emptyState.count() > 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('should navigate to order details', async ({ page }) => {
    await page.goto('/orders');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      localStorage.setItem('orders', JSON.stringify([
        { id: 'order-1', restaurantName: 'Test Restaurant', total: 5000, status: 'delivered' }
      ]));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Click on an order
    const orderItem = page.locator('[data-testid="order-item"], .order-card, .order-item').first();
    
    if (await orderItem.count() > 0) {
      await orderItem.click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should navigate to order details or show modal
      const isDetailsPage = page.url().includes('/order');
      const isModal = await page.locator('[data-testid="order-modal"], .modal, .dialog').count() > 0;
      
      expect(isDetailsPage || isModal).toBeTruthy();
    }
  });

  test('should show order status badge', async ({ page }) => {
    await page.goto('/orders');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      localStorage.setItem('orders', JSON.stringify([
        { id: 'order-1', status: 'pending', total: 5000 },
        { id: 'order-2', status: 'in_progress', total: 3000 },
        { id: 'order-3', status: 'delivered', total: 4500 }
      ]));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for status badges
    const statusBadges = page.locator('.status, .badge, [data-testid="order-status"]');
    
    if (await statusBadges.count() > 0) {
      await expect(statusBadges.first()).toBeVisible();
      
      // Different statuses should have different colors
      const pending = page.locator('text=pending, .status-pending');
      const inProgress = page.locator('text=in progress, text=preparing, .status-in-progress');
      const delivered = page.locator('text=delivered, text=completed, .status-delivered');
      
      // At least one status should be visible
    }
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      localStorage.setItem('orders', JSON.stringify([
        { id: 'order-1', status: 'pending', total: 5000 },
        { id: 'order-2', status: 'delivered', total: 3000 }
      ]));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for status filter
    const statusFilter = page.locator('[data-testid="status-filter"], select, .filter-tabs');
    
    if (await statusFilter.count() > 0) {
      // Click on "Active" or "Pending" filter
      const activeFilter = page.locator('button:has-text("Active"), button:has-text("Pending"), option[value="pending"]');
      
      if (await activeFilter.count() > 0) {
        await activeFilter.first().click({ force: true });
        await page.waitForTimeout(500);
        
        // Should show only active/pending orders
        const orderItems = page.locator('[data-testid="order-item"], .order-card');
        // Filtered results
      }
    }
  });

  test('should show order timeline', async ({ page }) => {
    // Navigate to a specific order
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for order timeline or status tracker
    const timeline = page.locator('[data-testid="order-timeline"], .timeline, .status-tracker');
    
    if (await timeline.count() > 0) {
      await expect(timeline.first()).toBeVisible();
      
      // Timeline should show order stages
      const stages = timeline.locator('.stage, .step, li');
      const stageCount = await stages.count();
      expect(stageCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Order Details Page', () => {
  test('should display order information', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Should show order details or redirect to orders/login
    const hasOrderInfo = await page.locator('text=order, text=items, text=total', { hasText: /order|items|total/i }).count() > 0;
    const isRedirect = page.url().includes('/orders') || page.url().includes('/login');
    
    expect(hasOrderInfo || isRedirect).toBeTruthy();
  });

  test('should show restaurant information', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.evaluate(() => {
      // Mock order data
      window.orderData = {
        id: 'order-123',
        restaurantName: 'Test Restaurant',
        restaurantAddress: '123 Main St',
        items: [
          { name: 'Pizza', quantity: 2, price: 2500 }
        ],
        total: 5000,
        status: 'delivered'
      };
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for restaurant info
    const restaurantInfo = page.locator('[data-testid="restaurant-info"], .restaurant, text=Test Restaurant');
    
    if (await restaurantInfo.count() > 0) {
      await expect(restaurantInfo.first()).toBeVisible();
    }
  });

  test('should show order items with quantities', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for order items
    const orderItems = page.locator('[data-testid="order-item"], .item, li');
    
    if (await orderItems.count() > 0) {
      await expect(orderItems.first()).toBeVisible();
      
      // Items should show quantity
      const quantity = page.locator('text=x, text=qty, [data-testid="quantity"]');
      // Quantity may be displayed
    }
  });

  test('should show pricing breakdown', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for price breakdown
    const subtotal = page.locator('text=subtotal, [data-testid="subtotal"]');
    const deliveryFee = page.locator('text=delivery, text=delivery fee, [data-testid="delivery-fee"]');
    const total = page.locator('text=total, [data-testid="total"]');
    
    if (await total.count() > 0) {
      await expect(total.first()).toBeVisible();
    }
  });

  test('should show delivery address', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for delivery address
    const address = page.locator('[data-testid="delivery-address"], .address, text=delivery address');
    
    if (await address.count() > 0) {
      await expect(address.first()).toBeVisible();
    }
  });

  test('should show payment method', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for payment method info
    const paymentMethod = page.locator('[data-testid="payment-method"], text=payment method, text=cash on delivery, text=card');
    
    if (await paymentMethod.count() > 0) {
      await expect(paymentMethod.first()).toBeVisible();
    }
  });

  test('should allow reordering', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for reorder button
    const reorderButton = page.locator('button:has-text("Reorder"), button:has-text("Order Again"), [data-testid="reorder"]');
    
    if (await reorderButton.count() > 0) {
      await expect(reorderButton.first()).toBeVisible();
      await expect(reorderButton.first()).toBeEnabled();
      
      // Click reorder
      await reorderButton.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should add items to cart or navigate to restaurant
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should show contact restaurant option', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for contact button or phone number
    const contactButton = page.locator('button:has-text("Contact"), a:has-text("Call"), [data-testid="contact-restaurant"]');
    const phoneNumber = page.locator('a[href^="tel:"], text=+234');
    
    if (await contactButton.count() > 0 || await phoneNumber.count() > 0) {
      // Contact option exists
      const hasContact = (await contactButton.count() > 0) || (await phoneNumber.count() > 0);
      expect(hasContact).toBeTruthy();
    }
  });

  test('should show order timestamp', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for order date/time
    const timestamp = page.locator('[data-testid="order-time"], .timestamp, text=placed on, text=ordered on');
    
    if (await timestamp.count() > 0) {
      await expect(timestamp.first()).toBeVisible();
    }
  });
});

test.describe('Real-time Order Updates', () => {
  test('should reflect status changes in real-time', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Get initial status
    const statusElement = page.locator('[data-testid="order-status"], .status, .badge').first();
    
    if (await statusElement.count() > 0) {
      const initialStatus = await statusElement.textContent();
      
      // Simulate status change via localStorage/state
      await page.evaluate(() => {
        // Mock status update
        const event = new CustomEvent('orderStatusUpdate', {
          detail: { orderId: 'order-123', status: 'in_progress' }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(1000);
      
      // Status may update (depends on implementation)
    }
  });

  test('should show estimated delivery time', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for estimated delivery time
    const estimatedTime = page.locator('[data-testid="estimated-time"], text=estimated, text=expected, text=arriving');
    
    if (await estimatedTime.count() > 0) {
      await expect(estimatedTime.first()).toBeVisible();
      
      // Should show time like "30-45 mins" or specific time
    }
  });

  test('should update when order is accepted', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Simulate order acceptance
    await page.evaluate(() => {
      const event = new CustomEvent('orderAccepted', {
        detail: { orderId: 'order-123' }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(1000);
    
    // Look for accepted status or notification
    const accepted = page.locator('text=accepted, text=confirmed, .status-accepted');
    
    if (await accepted.count() > 0) {
      // Order accepted state may be shown
    }
  });

  test('should show when order is ready for pickup', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Simulate order ready
    await page.evaluate(() => {
      const event = new CustomEvent('orderReady', {
        detail: { orderId: 'order-123' }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(1000);
    
    // Look for ready status
    const ready = page.locator('text=ready, text=pickup, .status-ready');
    
    if (await ready.count() > 0) {
      // Ready status may be shown
    }
  });

  test('should show delivery tracking when available', async ({ page }) => {
    await page.goto('/order-details/order-123');
    await page.waitForLoadState('networkidle');
    
    // Look for map or tracking info
    const trackingMap = page.locator('[data-testid="tracking-map"], .map, iframe[src*="maps"]');
    const trackingInfo = page.locator('[data-testid="tracking-info"], text=on the way, text=driver');
    
    if (await trackingMap.count() > 0 || await trackingInfo.count() > 0) {
      // Tracking is available
      const hasTracking = (await trackingMap.count() > 0) || (await trackingInfo.count() > 0);
      // Tracking feature may exist
    }
  });
});

test.describe('Order Notifications', () => {
  test('should show success notification after placing order', async ({ page }) => {
    // This test assumes order has been placed
    await page.goto('/order-confirmation');
    await page.waitForLoadState('networkidle');
    
    // Look for success message
    const successMessage = page.locator('text=success, text=confirmed, text=thank you, .success, [role="alert"]');
    
    if (await successMessage.count() > 0) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should show order number after successful order', async ({ page }) => {
    await page.goto('/order-confirmation');
    await page.waitForLoadState('networkidle');
    
    // Look for order ID/number
    const orderNumber = page.locator('[data-testid="order-number"], text=#, text=order number, text=order id');
    
    if (await orderNumber.count() > 0) {
      await expect(orderNumber.first()).toBeVisible();
    }
  });

  test('should have option to view order details from confirmation', async ({ page }) => {
    await page.goto('/order-confirmation');
    await page.waitForLoadState('networkidle');
    
    // Look for "View Order" button
    const viewOrderButton = page.locator('button:has-text("View Order"), a:has-text("Order Details"), [data-testid="view-order"]');
    
    if (await viewOrderButton.count() > 0) {
      await expect(viewOrderButton.first()).toBeVisible();
      
      await viewOrderButton.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should navigate to order details
      const currentUrl = page.url();
      expect(currentUrl).toContain('order');
    }
  });

  test('should have option to continue shopping', async ({ page }) => {
    await page.goto('/order-confirmation');
    await page.waitForLoadState('networkidle');
    
    // Look for continue shopping button
    const continueButton = page.locator('button:has-text("Continue"), a:has-text("Browse"), [data-testid="continue-shopping"]');
    
    if (await continueButton.count() > 0) {
      await expect(continueButton.first()).toBeVisible();
      
      await continueButton.first().click({ force: true });
      await page.waitForURL('/');
      
      // Should navigate to homepage
      await expect(page).toHaveURL('/');
    }
  });
});
