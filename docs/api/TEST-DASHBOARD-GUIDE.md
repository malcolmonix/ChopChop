# 🧪 API Test Dashboard Guide

A beautiful web interface for testing your ChopChop API with Google Authentication.

---

## 🚀 Quick Start

### Step 1: Start Your API Server

Make sure your main API server is running:

```bash
npm start
```

Your API should be available at: **http://localhost:4000/graphql**

### Step 2: Start the Test Dashboard Server

In a new terminal, run:

```bash
npm run test:dashboard
```

The test dashboard will start at: **http://localhost:3000**

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

---

## 🔐 Authentication Options

### Option 1: Google Sign-In (Recommended)

1. Click the "Sign in with Google" button
2. Choose your Google account
3. The dashboard will automatically:
   - Send the Google ID token to your API
   - Call the `signInWithGoogle` mutation
   - Extract the JWT token
   - Display your user info

**Note:** Make sure your Firebase project has Google Sign-In enabled.

### Option 2: Manual Token Entry

If Google Sign-In doesn't work or you want to use an existing token:

1. Get a token from GraphQL Playground:
   ```graphql
   mutation {
     signIn(email: "your@email.com", password: "yourpassword") {
       token
     }
   }
   ```

2. Copy the token value

3. Paste it in the "Manual Token" field on the dashboard

4. Click "Use Token"

---

## 🧪 Running Tests

Once authenticated, you'll see:

### Test Suite Options

**Run All Tests** - Executes all 7 tests in sequence:
1. ✅ Query Restaurants (No auth required)
2. ✅ View Orders
3. ✅ Place Order
4. ✅ Update Order Status
5. ✅ Webhook Update
6. ✅ Sync from MenuVerse
7. ✅ View Order Details

**Run Selected Test** - Run individual tests (coming soon)

### Test Results

Each test card shows:
- **Test Name** - What's being tested
- **Status Badge** - Pending → Running → Passed/Failed
- **Description** - What the test does
- **Result Details** - Response data or error messages

### Summary Statistics

After running all tests, see:
- **Total Tests** - Number of tests run
- **Passed** - Tests that succeeded
- **Failed** - Tests with errors
- **Pass Rate** - Success percentage

---

## 📊 Test Details

### Test 1: Query Restaurants
**Purpose:** Verify API connectivity and restaurant data  
**Auth Required:** No  
**What it tests:**
- GraphQL endpoint responds
- Restaurant query works
- Data structure is correct

**Success Criteria:**
```
✅ Found X restaurant(s)
First: Restaurant Name
```

---

### Test 2: View Orders
**Purpose:** Fetch user's order history  
**Auth Required:** Yes  
**What it tests:**
- Authentication works
- Orders query authorized
- MenuVerse fields present

**Success Criteria:**
```
✅ Found X order(s)
```

---

### Test 3: Place Order
**Purpose:** Create new order with MenuVerse integration  
**Auth Required:** Yes  
**What it tests:**
- Order creation mutation
- MenuVerse vendor ID assignment
- Order items processing

**Success Criteria:**
```
✅ Order created: ORDER_ID
Status: PENDING
MenuVerse Vendor ID: 0GI3MojVnLfvzSEqMc25oCzAmCz2
```

---

### Test 4: Update Order Status
**Purpose:** Change order status  
**Auth Required:** Yes  
**What it tests:**
- Status update mutation
- Status transitions
- Timestamp updates

**Success Criteria:**
```
✅ Status updated: PENDING → CONFIRMED
```

---

### Test 5: Webhook Update
**Purpose:** Simulate MenuVerse webhook  
**Auth Required:** Yes  
**What it tests:**
- Webhook mutation accepts data
- Rider info updates
- Status sync from MenuVerse

**Success Criteria:**
```
✅ Webhook processed
Status: OUT_FOR_DELIVERY
Rider: Name, Phone
```

---

### Test 6: Sync from MenuVerse
**Purpose:** Pull order data from MenuVerse  
**Auth Required:** Yes  
**What it tests:**
- Sync mutation works
- MenuVerse order ID assigned
- Data mapping correct

**Success Criteria:**
```
✅ Order synced
MenuVerse Order ID: MV_123
Last Synced: Timestamp
```

---

### Test 7: View Order Details
**Purpose:** Get complete order information  
**Auth Required:** Yes  
**What it tests:**
- Order query with all fields
- MenuVerse fields populated
- Nested data loads correctly

**Success Criteria:**
```
✅ Order details retrieved
All MenuVerse fields present
Rider info available
```

---

## 🎨 Dashboard Features

### Visual Indicators

**Card Colors:**
- ⚪ **White** - Test pending
- 🔵 **Blue** - Test running
- 🟢 **Green** - Test passed
- 🔴 **Red** - Test failed

**Status Badges:**
- 🟡 **Pending** - Not yet run
- 🔵 **Running** - In progress
- 🟢 **Passed** - Successful
- 🔴 **Failed** - Error occurred

### User Info Display

Shows after authentication:
- Profile picture (if available)
- Display name
- Email address
- Token preview (first 20 characters)

### Configuration Display

Shows your current setup:
- API Endpoint URL
- MenuVerse Vendor ID
- Environment variables used

---

## 🔧 Configuration

### Updating API URL

If your API runs on a different port, edit `test-dashboard.html`:

```javascript
const API_URL = 'http://localhost:YOUR_PORT/graphql';
```

### Updating MenuVerse Vendor ID

To test with a different vendor:

```javascript
const MENUVERSE_VENDOR_ID = 'YOUR_VENDOR_ID_HERE';
```

### Google Client ID

For Google Sign-In to work, update the client ID in `test-dashboard.html`:

```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
```

Get your Client ID from:
1. [Firebase Console](https://console.firebase.google.com)
2. Go to Project Settings → General
3. Scroll to "Your apps" → Web App
4. Copy the "Web client ID"

---

## 🐛 Troubleshooting

### Google Sign-In Not Working

**Problem:** "Sign in with Google" button doesn't appear

**Solutions:**
1. Check if you've added your Google Client ID
2. Verify Google Sign-In is enabled in Firebase Console
3. Check browser console for errors
4. Try manual token entry instead

---

### CORS Errors

**Problem:** "Access-Control-Allow-Origin" error

**Solutions:**
1. Make sure test-server.js is running (npm run test:dashboard)
2. Check if your API has CORS enabled
3. Verify URLs are correct (localhost:3000 → localhost:4000)

---

### Authentication Errors

**Problem:** "Authentication required" or "Invalid token"

**Solutions:**
1. Try signing out and in again
2. Get a fresh token from GraphQL Playground
3. Check if token is properly formatted
4. Verify Firebase configuration

---

### Tests Failing

**Problem:** All tests show "Failed" status

**Solutions:**
1. Verify API server is running (http://localhost:4000/graphql)
2. Check if you have valid authentication
3. Look at error messages in test results
4. Try running tests in GraphQL Playground manually

---

## 📝 Manual Testing Alternative

If the dashboard has issues, you can always test manually:

1. Open GraphQL Playground: http://localhost:4000/graphql
2. Follow steps in `MANUAL-TEST-STEPS.md`
3. Copy/paste mutations and queries
4. Verify responses

---

## 🎯 Next Steps

### After All Tests Pass:

1. ✅ **Deploy to Production**
   - API structure validated
   - Authentication working
   - MenuVerse integration confirmed

2. ✅ **Configure MenuVerse Webhooks**
   - Set webhook URL in MenuVerse dashboard
   - Test webhook endpoint
   - Monitor real-time updates

3. ✅ **Test with Real Orders**
   - Place actual orders through MenuVerse
   - Verify sync works with live data
   - Check rider info updates

---

## 📊 Expected Results

### Successful Test Run:

```
📊 TEST SUMMARY
✅ 1. Query Restaurants
✅ 2. View Orders
✅ 3. Place Order
✅ 4. Update Order Status
✅ 5. Webhook Update
✅ 6. Sync from MenuVerse
✅ 7. View Order Details

Passed: 7/7 (100%)

🎉 ALL TESTS PASSED!
```

---

## 🆘 Need Help?

### Common Issues:

1. **Dashboard won't load**
   - Check if port 3000 is available
   - Try a different port in test-server.js

2. **Can't authenticate**
   - Use manual token entry
   - Check Firebase configuration
   - Verify API is running

3. **Tests hang/timeout**
   - Check API logs for errors
   - Verify database connection
   - Check network connectivity

### Resources:

- **API Documentation:** `API-ENDPOINTS.md`
- **Manual Testing:** `MANUAL-TEST-STEPS.md`
- **Integration Guide:** `DEVELOPER-INTEGRATION-GUIDE.md`
- **GraphQL Playground:** http://localhost:4000/graphql

---

## 🎨 Customization

### Styling

The dashboard uses inline CSS. To customize:

1. Open `test-dashboard.html`
2. Find the `<style>` section
3. Modify colors, fonts, layouts
4. Save and refresh browser

### Adding New Tests

To add more tests:

1. Add test definition to `tests` array
2. Create test function (e.g., `testNewFeature()`)
3. Add case to switch statement in `runTest()`
4. Reload dashboard

---

**Dashboard Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Compatible With:** ChopChop API v1.0+

---

## 🎉 Happy Testing!

Your API is production-ready when all tests pass! 🚀
