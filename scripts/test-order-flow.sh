#!/bin/bash

# Interactive Order Flow Test Runner
# This script runs the order flow test in headed mode for manual testing

echo "=================================================="
echo "  ChopChop Interactive Order Flow Test"
echo "=================================================="
echo ""
echo "This test will:"
echo "  1. Complete an order flow from browse to checkout"
echo "  2. Pause for you to update order status in MenuVerse"
echo "  3. Verify status updates are displayed correctly"
echo ""
echo "Make sure:"
echo "  - Dev server is running (npm run dev)"
echo "  - MenuVerse dashboard is accessible"
echo "  - You have test restaurant data"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo ""
echo "Starting test in headed mode..."
echo "The browser will open automatically."
echo ""

# Run the interactive test in headed mode with a single worker
npx playwright test e2e/order-flow-interactive.spec.ts \
  --headed \
  --workers=1 \
  --reporter=list \
  --timeout=300000

echo ""
echo "=================================================="
echo "  Test Complete"
echo "=================================================="
echo ""
echo "Screenshots saved in test-results/ directory:"
echo "  - checkout-page.png"
echo "  - order-confirmation.png"
echo "  - orders-page-initial.png"
echo "  - orders-page-after-update.png"
echo "  - order-details.png"
echo ""
echo "Review these screenshots to verify the order flow."
echo ""
