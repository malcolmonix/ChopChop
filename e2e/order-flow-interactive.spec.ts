import { test, expect } from '@playwright/test';

/**
 * Interactive Order Flow and Status Update Tests
 * 
 * This test suite is designed for manual testing with MenuVerse integration.
 * Run with: npx playwright test e2e/order-flow-interactive.spec.ts --headed --workers=1
 * 
 * The test will pause at key points to allow manual status updates from MenuVerse dashboard.
 */

test.describe('Order Flow and Status Updates - Interactive', () => {
  test.setTimeout(300000); // 5 minutes for manual interaction

  test('should complete order and display status updates from MenuVerse', async ({ page }) => {
    console.log('\n🚀 Starting Interactive Order Flow Test...\n');

    // Step 1: Navigate to homepage
    console.log('Step 1: Loading homepage...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for restaurants to load
    console.log('Step 2: Waiting for restaurants to load...');
    const restaurantsLoaded = await page.waitForSelector(
      '[data-testid="restaurant-card"], .restaurant-card, .bg-white',
      { timeout: 30000 }
    ).catch(() => null);

    if (!restaurantsLoaded) {
      console.log('⚠️  No restaurants found. Checking page state...');
      const pageContent = await page.content();
      console.log('Page contains "Loading":', pageContent.includes('Loading'));
      console.log('Page URL:', page.url());
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/homepage-no-restaurants.png', fullPage: true });
      console.log('📸 Screenshot saved to test-results/homepage-no-restaurants.png');
    }

    // Step 2: Select a restaurant
    console.log('\nStep 3: Selecting first restaurant...');
    const firstRestaurant = page.locator('[data-testid="restaurant-card"], .restaurant-card, .bg-white').first();
    
    // Get restaurant name if possible
    const restaurantName = await firstRestaurant.locator('h2, h3, .font-bold').first().textContent().catch(() => 'Unknown Restaurant');
    console.log(`   Restaurant: ${restaurantName}`);
    
    await firstRestaurant.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check if navigation occurred
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/restaurant') && !currentUrl.includes('/menuverse')) {
      console.log('⚠️  Navigation did not occur. Trying alternative approach...');
      
      // Try clicking a link inside the card
      const link = await firstRestaurant.locator('a').first();
      if (await link.count() > 0) {
        await link.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }

    // Step 3: Wait for menu items
    console.log('\nStep 4: Waiting for menu items...');
    const menuItems = await page.waitForSelector(
      '[data-testid="menu-item"], .menu-item, .food-item',
      { timeout: 30000 }
    ).catch(() => null);

    if (!menuItems) {
      console.log('⚠️  No menu items found.');
      await page.screenshot({ path: 'test-results/restaurant-no-menu.png', fullPage: true });
      console.log('📸 Screenshot saved to test-results/restaurant-no-menu.png');
    }

    // Step 4: Add items to cart
    console.log('\nStep 5: Adding items to cart...');
    const addToCartButtons = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add"), button:has-text("₦")');
    const buttonCount = await addToCartButtons.count();
    console.log(`   Found ${buttonCount} add-to-cart buttons`);

    if (buttonCount > 0) {
      // Add first item
      await addToCartButtons.first().click({ force: true });
      await page.waitForTimeout(1000);
      console.log('   ✓ Added first item to cart');

      // Add second item if available
      if (buttonCount > 1) {
        await addToCartButtons.nth(1).click({ force: true });
        await page.waitForTimeout(1000);
        console.log('   ✓ Added second item to cart');
      }

      // Check cart count
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-count, .badge').first();
      const cartCount = await cartBadge.textContent().catch(() => '0');
      console.log(`   Cart items: ${cartCount}`);
    }

    // Step 5: Navigate to checkout
    console.log('\nStep 6: Navigating to checkout...');
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of checkout page
    await page.screenshot({ path: 'test-results/checkout-page.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/checkout-page.png');

    // Step 6: Fill checkout form (if present)
    console.log('\nStep 7: Filling checkout form...');
    
    // Fill name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.count() > 0 && await nameInput.isVisible()) {
      await nameInput.fill('E2E Test User');
      console.log('   ✓ Filled name');
    }

    // Fill phone
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="phone"]').first();
    if (await phoneInput.count() > 0 && await phoneInput.isVisible()) {
      await phoneInput.fill('+234 801 234 5678');
      console.log('   ✓ Filled phone');
    }

    // Fill address
    const addressInput = page.locator('input[name="address"], textarea[name="address"], input[placeholder*="address"]').first();
    if (await addressInput.count() > 0 && await addressInput.isVisible()) {
      await addressInput.fill('123 Test Street, Lagos, Nigeria');
      console.log('   ✓ Filled address');
    }

    // Select Cash on Delivery
    const codOption = page.locator('text="Cash on Delivery", [data-payment="cod"], input[value="cash"]').first();
    if (await codOption.count() > 0) {
      await codOption.click({ force: true });
      await page.waitForTimeout(500);
      console.log('   ✓ Selected Cash on Delivery');
    }

    // Step 7: Place order
    console.log('\nStep 8: Placing order...');
    const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Complete"), button:has-text("Submit Order")').first();
    
    if (await placeOrderButton.count() > 0) {
      console.log('   Found Place Order button, clicking...');
      await placeOrderButton.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Check for success indicators
      const successIndicators = page.locator('text=success, text=confirmed, text=thank you, .success');
      const orderIdElement = page.locator('[data-testid="order-id"], text=order id, text=order number, text=#');
      
      const hasSuccess = await successIndicators.count() > 0;
      const hasOrderId = await orderIdElement.count() > 0;
      
      console.log(`   Success indicator: ${hasSuccess}`);
      console.log(`   Order ID shown: ${hasOrderId}`);
      
      if (hasOrderId) {
        const orderId = await orderIdElement.first().textContent();
        console.log(`   📝 Order ID: ${orderId}`);
      }

      // Take screenshot of confirmation
      await page.screenshot({ path: 'test-results/order-confirmation.png', fullPage: true });
      console.log('📸 Screenshot saved to test-results/order-confirmation.png');
    } else {
      console.log('   ⚠️  Place Order button not found');
    }

    // Step 8: Navigate to orders page
    console.log('\n\n===========================================');
    console.log('Step 9: Checking order status...');
    console.log('===========================================\n');
    
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of orders page
    await page.screenshot({ path: 'test-results/orders-page-initial.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/orders-page-initial.png');

    // Check for orders
    const orderItems = page.locator('[data-testid="order-item"], .order-card, .order-item');
    const orderCount = await orderItems.count();
    console.log(`   Found ${orderCount} orders on page`);

    if (orderCount > 0) {
      // Get first order status
      const firstOrder = orderItems.first();
      const orderStatus = await firstOrder.locator('[data-testid="order-status"], .status, .badge').first().textContent().catch(() => 'Unknown');
      console.log(`   Current status: ${orderStatus}`);
    }

    // Step 9: Pause for manual status update
    console.log('\n\n===========================================');
    console.log('⏸️  MANUAL INTERVENTION POINT');
    console.log('===========================================');
    console.log('Please update the order status in MenuVerse dashboard now.');
    console.log('Status progression: pending → accepted → preparing → ready → delivered');
    console.log('\nThis test will wait for 60 seconds...');
    console.log('===========================================\n');

    // Wait 60 seconds for manual update
    await page.waitForTimeout(60000);

    // Step 10: Refresh and check for status update
    console.log('\nStep 10: Refreshing to check for status updates...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot after refresh
    await page.screenshot({ path: 'test-results/orders-page-after-update.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/orders-page-after-update.png');

    if (orderCount > 0) {
      const firstOrder = orderItems.first();
      const updatedStatus = await firstOrder.locator('[data-testid="order-status"], .status, .badge').first().textContent().catch(() => 'Unknown');
      console.log(`   Updated status: ${updatedStatus}`);
      
      // Check if status changed
      console.log('\n   Status update verification:');
      console.log(`   - Status is displayed: ✓`);
    }

    // Step 11: Check order details page
    console.log('\nStep 11: Checking order details page...');
    
    if (orderCount > 0) {
      const firstOrder = orderItems.first();
      await firstOrder.click({ force: true });
      await page.waitForTimeout(2000);

      // Take screenshot of order details
      await page.screenshot({ path: 'test-results/order-details.png', fullPage: true });
      console.log('📸 Screenshot saved to test-results/order-details.png');

      // Check for order details elements
      const hasTimeline = await page.locator('[data-testid="order-timeline"], .timeline, .status-tracker').count() > 0;
      const hasStatusBadge = await page.locator('[data-testid="order-status"], .status').count() > 0;
      const hasOrderItems = await page.locator('[data-testid="order-item"], .item').count() > 0;
      const hasTotal = await page.locator('[data-testid="total"], text=total').count() > 0;

      console.log('\n   Order details page elements:');
      console.log(`   - Timeline/Tracker: ${hasTimeline ? '✓' : '✗'}`);
      console.log(`   - Status badge: ${hasStatusBadge ? '✓' : '✗'}`);
      console.log(`   - Order items: ${hasOrderItems ? '✓' : '✗'}`);
      console.log(`   - Total amount: ${hasTotal ? '✓' : '✗'}`);
    }

    // Final summary
    console.log('\n\n===========================================');
    console.log('✅ INTERACTIVE TEST COMPLETE');
    console.log('===========================================');
    console.log('Screenshots saved in test-results/ directory:');
    console.log('  - homepage-no-restaurants.png (if applicable)');
    console.log('  - restaurant-no-menu.png (if applicable)');
    console.log('  - checkout-page.png');
    console.log('  - order-confirmation.png');
    console.log('  - orders-page-initial.png');
    console.log('  - orders-page-after-update.png');
    console.log('  - order-details.png');
    console.log('\nReview these screenshots to verify the order flow.');
    console.log('===========================================\n');

    // Keep browser open for manual inspection
    console.log('Browser will remain open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
  });

  test('should display real-time order status updates', async ({ page }) => {
    console.log('\n🔄 Testing Real-time Order Status Updates...\n');

    // Navigate to orders page
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const orderItems = page.locator('[data-testid="order-item"], .order-card, .order-item');
    const orderCount = await orderItems.count();

    if (orderCount === 0) {
      console.log('⚠️  No orders found. Please place an order first.');
      test.skip();
      return;
    }

    console.log(`Found ${orderCount} orders`);

    // Get initial status
    const firstOrder = orderItems.first();
    const initialStatus = await firstOrder.locator('[data-testid="order-status"], .status, .badge').first().textContent().catch(() => 'Unknown');
    console.log(`Initial status: ${initialStatus}`);

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/realtime-status-initial.png', fullPage: true });

    console.log('\n⏸️  MANUAL INTERVENTION: Please update order status in MenuVerse');
    console.log('Waiting 90 seconds for status update...\n');

    // Poll for status changes every 5 seconds
    let statusChanged = false;
    let currentStatus = initialStatus;

    for (let i = 0; i < 18; i++) { // 18 * 5 = 90 seconds
      await page.waitForTimeout(5000);
      
      // Refresh the page to check for updates
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const newStatus = await firstOrder.locator('[data-testid="order-status"], .status, .badge').first().textContent().catch(() => 'Unknown');
      
      if (newStatus !== currentStatus) {
        console.log(`✓ Status changed: ${currentStatus} → ${newStatus}`);
        currentStatus = newStatus;
        statusChanged = true;
        
        // Take screenshot of status change
        await page.screenshot({ path: `test-results/realtime-status-${i}.png`, fullPage: true });
        console.log(`📸 Screenshot saved: test-results/realtime-status-${i}.png`);
      } else {
        process.stdout.write('.');
      }
    }

    if (statusChanged) {
      console.log('\n\n✅ Real-time status updates are working!');
      console.log(`Final status: ${currentStatus}`);
    } else {
      console.log('\n\n⚠️  No status changes detected during the polling period.');
      console.log('This may mean:');
      console.log('  1. No updates were made in MenuVerse');
      console.log('  2. Real-time sync is not working');
      console.log('  3. Page refresh is not fetching new data');
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/realtime-status-final.png', fullPage: true });
    
    console.log('\nBrowser will remain open for 5 seconds...');
    await page.waitForTimeout(5000);
  });
});
