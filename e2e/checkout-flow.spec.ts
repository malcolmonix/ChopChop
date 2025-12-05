import { test, expect } from '@playwright/test';

test.describe('Enhanced Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with google/i }).click({ force: true });
    
    // Wait for redirect to home page
    await page.waitForURL('/');
    
    // Add items to cart (mock this for now)
    await page.evaluate(() => {
      const cartEvent = new CustomEvent('addToCart', {
        detail: {
          restaurantId: 'test-restaurant',
          restaurantName: 'Test Restaurant',
          item: {
            id: 'item-1',
            title: 'Test Pizza',
            price: 2500,
            quantity: 2
          }
        }
      });
      window.dispatchEvent(cartEvent);
    });
  });

  test('should complete full checkout flow', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');

    // Verify we're on cart review step
    await expect(page.getByText('Review Your Order')).toBeVisible();
    await expect(page.getByText('Test Restaurant')).toBeVisible();
    await expect(page.getByText('Test Pizza')).toBeVisible();

    // Step 1: Cart Review
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });

    // Step 2: Address Selection
    await expect(page.getByText('Delivery Address')).toBeVisible();
    
    // Select an address
    await page.getByText('Home').click({ force: true });
    await page.getByRole('button', { name: 'Continue to Payment' }).click({ force: true });

    // Step 3: Payment Method
    await expect(page.getByText('Payment Method')).toBeVisible();
    
    // Select cash payment
    await page.getByText('Cash on Delivery').click({ force: true });
    
    // Add special instructions
    await page.getByPlaceholder('Any special requests').fill('Please ring the doorbell');
    
    // Add tip
    await page.getByText('₦100').click({ force: true });

    // Place order
    await page.getByRole('button', { name: 'Place Order' }).click({ force: true });

    // Step 4: Confirmation
    await expect(page.getByText('Order Confirmed!')).toBeVisible();
    await expect(page.getByText('Thank you for your order')).toBeVisible();
    
    // Verify order details are shown
    await expect(page.getByText(/Order ID/)).toBeVisible();
    await expect(page.getByText(/Total Amount/)).toBeVisible();
  });

  test('should allow address addition', async ({ page }) => {
    await page.goto('/checkout');
    
    // Go to address step
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });
    
    // Click add new address
    await page.getByText('+ Add New Address').click({ force: true });
    
    // Fill address form
    await page.getByPlaceholder('e.g., Home, Office').fill('Work');
    await page.getByPlaceholder('House number and street name').fill('789 Business Avenue');
    await page.getByPlaceholder('City').fill('Abuja');
    await page.selectOption('select', 'FCT');
    await page.getByPlaceholder('100001').fill('900001');
    await page.getByPlaceholder('+234 801 234 5678').fill('+234 802 345 6789');
    
    // Save address
    await page.getByRole('button', { name: 'Save Address' }).click({ force: true });
    
    // Verify address was added (in real implementation)
    await expect(page.getByText('Work')).toBeVisible();
  });

  test('should show order summary correctly', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check order summary sidebar
    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.getByText(/Subtotal \(\d+ items\)/)).toBeVisible();
    await expect(page.getByText('Delivery Fee')).toBeVisible();
    await expect(page.getByText('Tax (7.5%)')).toBeVisible();
    
    // Values should update when moving through steps
    const totalBefore = await page.getByText(/Total/).textContent();
    
    // Go to payment step and add tip
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });
    await page.getByRole('button', { name: 'Continue to Payment' }).click({ force: true });
    await page.getByText('₦200').click({ force: true });
    
    // Total should update with tip
    await expect(page.getByText('Tip')).toBeVisible();
    const totalAfter = await page.getByText(/Total/).last().textContent();
    expect(totalAfter).not.toBe(totalBefore);
  });

  test('should handle payment method selection', async ({ page }) => {
    await page.goto('/checkout');
    
    // Navigate to payment step
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });
    await page.getByRole('button', { name: 'Continue to Payment' }).click({ force: true });
    
    // Test different payment methods
    await page.getByText('Debit Card').click({ force: true });
    await expect(page.getByText('**** **** **** 1234')).toBeVisible();
    
    await page.getByText('Mobile Money').click({ force: true });
    await expect(page.getByText('MTN MoMo')).toBeVisible();
    
    // Order summary should show selected payment method
    await expect(page.getByText('Payment:')).toBeVisible();
    await expect(page.getByText('Mobile Money')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout');
    
    // Try to proceed without address selection
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });
    
    // Should not allow proceeding without address
    await page.getByRole('button', { name: 'Continue to Payment' }).click({ force: true });
    
    // Go to payment and try to place order without selection
    await page.getByRole('button', { name: 'Place Order' }).click({ force: true });
    
    // Should show error message
    await expect(page.getByText(/Please select delivery address and payment method/)).toBeVisible();
  });

  test('should show step progress correctly', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check initial step indicator
    await expect(page.getByText('Cart Review')).toBeVisible();
    await expect(page.getByText('🛒')).toBeVisible();
    
    // Move to next step
    await page.getByRole('button', { name: 'Continue to Delivery' }).click({ force: true });
    await expect(page.getByText('🛒')).toHaveClass(/bg-green-500/); // Completed
    await expect(page.getByText('📍')).toHaveClass(/bg-orange-500/); // Current
    
    // Move to payment step
    await page.getByRole('button', { name: 'Continue to Payment' }).click({ force: true });
    await expect(page.getByText('💳')).toHaveClass(/bg-orange-500/); // Current
  });
});

test.describe('Cart Integration', () => {
  test('should show cart button in header when items exist', async ({ page }) => {
    // Mock adding items to cart
    await page.goto('/');
    
    await page.evaluate(() => {
      localStorage.setItem('enatega_cart', JSON.stringify({
        items: [{ id: '1', title: 'Test Item', price: 1000, quantity: 2 }],
        restaurantId: 'test-restaurant',
        restaurantName: 'Test Restaurant'
      }));
    });
    
    await page.reload();
    
    // Cart button should be visible
    await expect(page.getByText('🛒')).toBeVisible();
    await expect(page.getByText('Cart')).toBeVisible();
    await expect(page.getByText('2')).toBeVisible(); // Item count
    await expect(page.getByText('₦2,000')).toBeVisible(); // Total
  });

  test('should navigate to checkout when cart button clicked', async ({ page }) => {
    // Setup cart items
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('enatega_cart', JSON.stringify({
        items: [{ id: '1', title: 'Test Item', price: 1000, quantity: 1 }],
        restaurantId: 'test-restaurant'
      }));
    });
    
    await page.reload();
    
    // Click cart button
    await page.getByRole('link', { name: /🛒.*Cart/ }).click({ force: true });
    
    // Should navigate to checkout
    await expect(page).toHaveURL('/checkout');
  });
});