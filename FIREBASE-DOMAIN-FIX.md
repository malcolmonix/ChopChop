# Fix: Firebase auth/unauthorized-domain Error

## Problem
When trying to sign in, you see:
```
Firebase: Error (auth/unauthorized-domain).
```

This means your VPS IP address (`145.14.158.29`) is not authorized in Firebase Console.

---

## Solution: Add Domain to Firebase Authorized Domains

### Step 1: Go to Firebase Console
🔗 https://console.firebase.google.com/project/chopchop-67750/authentication/settings

Or manually:
1. Go to https://console.firebase.google.com/
2. Select project: **chopchop-67750**
3. Click **Authentication** in left sidebar
4. Click **Settings** tab
5. Scroll to **Authorized domains** section

---

### Step 2: Add Your Domain/IP

Click **Add domain** button and add:

1. **Your VPS IP:**
   ```
   145.14.158.29
   ```

2. **Localhost (for development):**
   ```
   localhost
   ```

3. **(Optional) Your production domain when ready:**
   ```
   chopchop.com
   ```

---

### Step 3: Save and Test

1. Click **Add** for each domain
2. Wait 1-2 minutes for Firebase to propagate changes
3. Refresh your app: http://145.14.158.29:3000
4. Try signing in again ✅

---

## Expected Authorized Domains

After setup, your Firebase Console should show:

✅ `localhost` (default - for local development)  
✅ `chopchop-67750.firebaseapp.com` (default - Firebase hosting)  
✅ `145.14.158.29` (your VPS IP - **ADD THIS**)  
✅ `chopchop.com` (your domain - optional, add when DNS is configured)

---

## Why This Happens

Firebase Authentication restricts which domains can use your Firebase project for security. By default, only:
- `localhost` (development)
- `*.firebaseapp.com` (Firebase hosting)

Are authorized. When you deploy to your own VPS or custom domain, you must explicitly whitelist it.

---

## Alternative: Use Domain Instead of IP

If you want to use `chopchop.com` instead:

1. **Configure DNS** (at your domain registrar):
   - Type: `A`
   - Name: `@`
   - Value: `145.14.158.29`
   - TTL: `300`

2. **Set up Nginx + SSL** on VPS (see DEPLOYMENT-TROUBLESHOOTING.md)

3. **Add to Firebase authorized domains:**
   - `chopchop.com`
   - `www.chopchop.com` (if using www)

---

## Verification

After adding the domain, test sign-in:

```bash
# Open your app
http://145.14.158.29:3000

# Try signing in with Google, Email, or whatever method you use
# Should work without the unauthorized-domain error! ✅
```

---

## Additional Notes

- Changes take 1-2 minutes to propagate
- No code changes needed - this is purely a Firebase Console configuration
- You can have multiple authorized domains (dev, staging, production)
- Wildcards are NOT supported (can't use `*.chopchop.com`)

---

## Still Having Issues?

Check:
1. Domain/IP is spelled correctly in Firebase Console (no trailing slashes, no http://)
2. You're using the correct Firebase project (chopchop-67750)
3. Wait a few minutes after adding the domain
4. Clear browser cache and try again
5. Check browser console for other errors

**Quick test:** If sign-in works on `localhost:3000` but not on VPS, it's definitely the authorized domains issue.

---

**File:** FIREBASE-DOMAIN-FIX.md  
**Status:** Ready to deploy - just add domain to Firebase Console! 🚀
