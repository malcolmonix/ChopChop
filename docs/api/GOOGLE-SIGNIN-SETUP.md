# 🔐 Google Sign-In Setup (Optional)

The test dashboard already works with **Manual Token** entry, but if you want to enable Google Sign-In, follow these steps:

---

## Option 1: Get Client ID from Firebase Console

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/chopchop-67750/settings/general

### Step 2: Find Your Web App
1. Scroll down to **"Your apps"** section
2. Look for a **Web app** (globe icon)
3. If you don't have one, click **"Add app"** → Choose **"Web"**

### Step 3: Get the Config
You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc...",
  // This is what you need for Google Sign-In:
  // But we need the OAuth Client ID instead
};
```

### Step 4: Get OAuth Client ID
1. Go to: https://console.firebase.google.com/project/chopchop-67750/authentication/providers
2. Click on **"Google"** provider
3. Make sure it's **Enabled**
4. You'll see **"Web SDK configuration"**
5. Copy the **Web client ID**

**OR** use Google Cloud Console:

---

## Option 2: Get Client ID from Google Cloud Console

### Step 1: Open Credentials Page
Visit: https://console.cloud.google.com/apis/credentials?project=chopchop-67750

### Step 2: Find OAuth 2.0 Client ID
1. Look for **"OAuth 2.0 Client IDs"** section
2. You should see a client ID named like:
   - "Web client (auto created by Google Service)"
   - Or any custom web client you created

### Step 3: Copy the Client ID
1. Click on the client ID name
2. Copy the **"Client ID"** value
3. It will look like: `123456789-abc...def.apps.googleusercontent.com`

---

## Step 3: Update Dashboard

Open `test-dashboard.html` and find line ~210:

```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
```

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:

```html
<div id="g_id_onload"
     data-client_id="123456789-abc...def.apps.googleusercontent.com"
     data-callback="handleCredentialResponse">
</div>
```

Save the file and refresh the dashboard!

---

## ✅ Verify It Works

1. Open http://localhost:3000
2. You should see a blue **"Sign in with Google"** button
3. Click it and choose your Google account
4. The dashboard will automatically:
   - Send ID token to your API
   - Get JWT token back
   - Show your profile info
   - Enable all tests

---

## 🎯 But You Don't Need This!

**The Manual Token method already works perfectly:**

1. Get token from GraphQL Playground:
   ```graphql
   mutation {
     signUp(
       email: "test@chopchop.com"
       password: "SecureTestPassword2024!"
       displayName: "Test User"
     ) {
       token
     }
   }
   ```

2. Paste it in the dashboard
3. Start testing immediately!

Google Sign-In is just a convenience feature. 😊

---

## 🐛 Troubleshooting

### "400 Error" or "Request is malformed"
- Client ID is not set or incorrect
- Use Manual Token method instead

### "Unauthorized domain"
- Add `localhost` to authorized domains in Firebase Console
- Go to: Firebase Console → Authentication → Settings → Authorized domains
- Add `localhost` if not already there

### Google Sign-In button doesn't appear
- Check browser console for errors
- Make sure Client ID is properly formatted
- Try clearing browser cache

---

**Remember: Manual Token works great and is faster for development!** 🚀
