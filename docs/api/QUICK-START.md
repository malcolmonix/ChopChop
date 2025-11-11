# 🚀 Quick Start - Test Dashboard in 3 Simple Steps

The easiest way to test your ChopChop API with a beautiful web interface!

---

## Step 1: Create Test User & Get Token

Open GraphQL Playground: **http://localhost:4000/graphql**

Run this mutation:

```graphql
mutation {
  signUp(
    email: "test@chopchop.com"
    password: "SecureTestPassword2024!"
    displayName: "Test User"
  ) {
    token
    user {
      id
      email
      displayName
    }
  }
}
```

**Copy the `token` from the response!**

Example response:
```json
{
  "data": {
    "signUp": {
      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "abc123",
        "email": "test@chopchop.com",
        "displayName": "Test User"
      }
    }
  }
}
```

---

## Step 2: Open Test Dashboard

Run this command:

```bash
npm run test:dashboard
```

Then open in your browser:
```
http://localhost:3000
```

---

## Step 3: Start Testing

1. **Paste your token** in the "Manual Token" field
2. **Click "Use Token & Start Testing"**
3. **Click "Run All Tests"**
4. **Watch the magic happen!** ✨

---

## 🎯 What You'll See

### Beautiful Interface
- 🎨 Modern gradient design
- 📊 Real-time test results
- ✅ Green cards for passed tests
- ❌ Red cards for failed tests
- 📈 Summary statistics

### 7 Comprehensive Tests
1. ✅ Query Restaurants
2. ✅ View Orders
3. ✅ Place Order
4. ✅ Update Order Status
5. ✅ Webhook Update
6. ✅ Sync from MenuVerse
7. ✅ View Order Details

---

## ⚠️ Troubleshooting

### "User not found" or "Invalid credentials"

**Solution:** Create a test user first. Update credentials in `get-token.js`:

```javascript
const TEST_USER = {
  email: 'your@email.com',  // ← Update this
  password: 'YourPassword123!'  // ← Update this
};
```

Or create a user in GraphQL Playground (http://localhost:4000/graphql):

```graphql
mutation {
  signUp(
    email: "test@example.com"
    password: "TestPass123!"
    displayName: "Test User"
  ) {
    token
    user {
      id
      email
    }
  }
}
```

### "Connection error"

**Solution:** Make sure API is running:
```bash
npm start
```

---

## 🎉 Success!

When all tests pass, you'll see:

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

**Your API is production-ready!** 🚀

---

## 📚 More Resources

- **Full Guide:** `TEST-DASHBOARD-GUIDE.md`
- **Manual Testing:** `MANUAL-TEST-STEPS.md`
- **API Docs:** `API-ENDPOINTS.md`
- **GraphQL Playground:** http://localhost:4000/graphql

---

## 🔧 Advanced Options

### Use Different Credentials

Edit `get-token.js` and change:
```javascript
const TEST_USER = {
  email: 'your@email.com',
  password: 'YourPassword123!'
};
```

### Configure Google Sign-In

1. Get Client ID from [Firebase Console](https://console.firebase.google.com)
2. Update `test-dashboard.html` line 210:
```html
data-client_id="YOUR_ACTUAL_CLIENT_ID"
```
3. Refresh dashboard
4. Click "Sign in with Google"

---

**That's it! Happy Testing!** 🎊
