# Interactive Order Flow Testing Guide

This guide explains how to run interactive tests for order flow and status updates with MenuVerse integration.

## Overview

The interactive test suite (`order-flow-interactive.spec.ts`) allows you to manually test the complete order flow and verify that order status updates from MenuVerse are displayed correctly to users.

## Prerequisites

1. **Dev Server Running**
   ```bash
   npm run dev
   ```
   The server should be running on `http://localhost:3000`

2. **MenuVerse Dashboard Access**
   - You need access to the MenuVerse vendor dashboard
   - You'll update order statuses manually during the test

3. **Test Data**
   - At least one restaurant with menu items in the system
   - Or use the seed data scripts to populate test data

## Running the Interactive Test

### Option 1: Using npm script (Recommended)
```bash
npm run test:order-flow
```

This will:
- Open a browser window (headed mode)
- Run through the complete order flow
- Pause for 60 seconds for you to update status in MenuVerse
- Check for status updates and take screenshots

### Option 2: Using the shell script
```bash
./scripts/test-order-flow.sh
```

### Option 3: Direct Playwright command
```bash
npx playwright test e2e/order-flow-interactive.spec.ts --headed --workers=1 --reporter=list
```

## What the Test Does

### Test 1: Complete Order Flow with Manual Status Updates

1. **Navigate to Homepage**
   - Loads the homepage
   - Waits for restaurants to load
   - Takes screenshots if issues occur

2. **Select Restaurant**
   - Clicks on the first available restaurant
   - Navigates to the restaurant/menu page
   - Waits for menu items to load

3. **Add Items to Cart**
   - Adds 1-2 menu items to the cart
   - Displays cart count

4. **Checkout**
   - Navigates to checkout page
   - Fills in customer details:
     - Name: "E2E Test User"
     - Phone: "+234 801 234 5678"
     - Address: "123 Test Street, Lagos, Nigeria"
   - Selects "Cash on Delivery" payment
   - Takes screenshot of checkout page

5. **Place Order**
   - Clicks "Place Order" button
   - Waits for confirmation
   - Captures order ID if displayed
   - Takes screenshot of confirmation page

6. **View Orders Page**
   - Navigates to `/orders`
   - Displays current order status
   - Takes screenshot of initial state

7. **⏸️ PAUSE FOR MANUAL UPDATE**
   - **The test pauses for 60 seconds**
   - **During this time, update the order status in MenuVerse dashboard:**
     - Go to MenuVerse vendor dashboard
     - Find the new order
     - Change status: `pending` → `accepted` → `preparing` → `ready` → `delivered`
   - The console will show a countdown

8. **Verify Status Update**
   - Refreshes the orders page
   - Checks if status has changed
   - Takes screenshot of updated state
   - Displays new status in console

9. **View Order Details**
   - Clicks on the order to view details
   - Checks for timeline/tracker elements
   - Takes screenshot of order details page

10. **Generate Report**
    - Saves all screenshots to `test-results/` directory
    - Displays summary in console

### Test 2: Real-time Status Updates

This test polls the orders page every 5 seconds for 90 seconds to detect status changes:

1. Loads orders page
2. Gets initial status
3. Polls every 5 seconds for changes
4. Screenshots when status changes
5. Reports if real-time updates are working

## Screenshots Generated

All screenshots are saved in the `test-results/` directory:

| Screenshot | Purpose |
|------------|---------|
| `homepage-no-restaurants.png` | If no restaurants load (debugging) |
| `restaurant-no-menu.png` | If menu items don't load (debugging) |
| `checkout-page.png` | Checkout form before submission |
| `order-confirmation.png` | Confirmation page after order placed |
| `orders-page-initial.png` | Orders list before status update |
| `orders-page-after-update.png` | Orders list after MenuVerse update |
| `order-details.png` | Order details page with timeline |
| `realtime-status-*.png` | Status changes during polling |

## Console Output

The test provides detailed console output:

```
🚀 Starting Interactive Order Flow Test...

Step 1: Loading homepage...
Step 2: Waiting for restaurants to load...
   Found 5 restaurants

Step 3: Selecting first restaurant...
   Restaurant: Mama Cass Kitchen
   Current URL: http://localhost:3000/menuverse/12345

Step 4: Waiting for menu items...
   Found 12 menu items

Step 5: Adding items to cart...
   Found 12 add-to-cart buttons
   ✓ Added first item to cart
   ✓ Added second item to cart
   Cart items: 2

...

===========================================
⏸️  MANUAL INTERVENTION POINT
===========================================
Please update the order status in MenuVerse dashboard now.
Status progression: pending → accepted → preparing → ready → delivered

This test will wait for 60 seconds...
===========================================
```

## Manual Testing Steps

While the test is paused:

1. **Open MenuVerse Dashboard**
   - Log in to the vendor dashboard
   - Navigate to orders section

2. **Find the Test Order**
   - Look for the most recent order
   - Should be from "E2E Test User"
   - Address: "123 Test Street, Lagos, Nigeria"

3. **Update Order Status**
   - Change status from `pending` to `accepted`
   - Observe if the status change reflects in the test browser
   - Optionally continue through: `preparing` → `ready` → `delivered`

4. **Watch Test Browser**
   - After 60 seconds, the test will refresh
   - The new status should be displayed
   - Screenshot will be captured

## Troubleshooting

### No Restaurants Loading
- **Check:** Dev server is running
- **Check:** Database has restaurant data
- **Fix:** Run seed data scripts or add restaurants manually

### Navigation Not Working
- **Issue:** Clicking restaurant cards doesn't navigate
- **Check:** Restaurant cards have proper links
- **Workaround:** Test will try alternative methods

### Status Not Updating
- **Check:** MenuVerse integration is configured correctly
- **Check:** Firebase connection is working
- **Check:** Order sync function is enabled
- **Debug:** Check browser console for errors

### Test Timing Out
- **Increase timeout:** The test has a 5-minute timeout
- **Modify:** Change `test.setTimeout(300000)` in the test file

## Advanced Usage

### Run Specific Test
```bash
# Run only the main order flow test
npx playwright test e2e/order-flow-interactive.spec.ts --headed -g "should complete order"

# Run only the real-time polling test
npx playwright test e2e/order-flow-interactive.spec.ts --headed -g "should display real-time"
```

### Debug Mode
```bash
# Run with Playwright inspector for step-by-step debugging
PWDEBUG=1 npx playwright test e2e/order-flow-interactive.spec.ts
```

### Change Wait Time
Edit `order-flow-interactive.spec.ts` and modify:
```typescript
// Change from 60 seconds to 120 seconds
await page.waitForTimeout(120000);
```

### Keep Browser Open Longer
Modify the final wait time:
```typescript
// Keep browser open for 30 seconds instead of 10
await page.waitForTimeout(30000);
```

## Expected Results

### ✅ Success Criteria

1. **Order Placed Successfully**
   - Order ID is generated and displayed
   - Confirmation page shows success message
   - Order appears on orders page

2. **Status Updates Work**
   - Initial status is "pending"
   - After MenuVerse update, status changes
   - New status is displayed on orders page
   - Order details page shows updated status

3. **UI Elements Present**
   - Status badge/tag is visible
   - Order timeline/tracker exists (if implemented)
   - Order details are complete
   - Real-time updates reflect within reasonable time

### ❌ Failure Scenarios

1. **Order Not Created**
   - Check backend logs
   - Verify Firebase connection
   - Check form validation

2. **Status Doesn't Update**
   - Verify MenuVerse webhook is configured
   - Check Firebase sync function
   - Look for console errors

3. **UI Not Updating**
   - Check if page refresh is needed
   - Verify real-time listeners are attached
   - Check component state management

## Integration with CI/CD

This test is designed for **manual testing only** and should not be included in automated CI/CD pipelines because it requires manual intervention.

For automated testing, use the non-interactive tests:
```bash
npm run test:e2e  # Runs all automated E2E tests
```

## Next Steps

After running this test:

1. **Review Screenshots**
   - Check `test-results/` directory
   - Verify UI elements are displayed correctly
   - Ensure status updates are visible

2. **Fix Any Issues**
   - Navigation problems
   - Missing UI elements
   - Status update delays

3. **Document Findings**
   - Note any bugs discovered
   - Record status update timing
   - Identify UX improvements

## Support

For issues or questions:
- Check `E2E-TEST-REPORT.md` for known issues
- Review Playwright documentation: https://playwright.dev
- Check console output for detailed logs
- Review screenshots in `test-results/` directory

---

**Last Updated:** November 11, 2025  
**Test Suite Version:** 1.0.0  
**Purpose:** Interactive testing of order flow and MenuVerse integration
