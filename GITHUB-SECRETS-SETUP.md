# 🔐 GitHub Secrets Setup for ChopChop CI/CD

## Issue Resolution
The CI/CD build is failing because Firebase environment variables are not available in the GitHub Actions environment. The build process needs access to Firebase configuration to complete successfully.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 🔧 How to Add Secrets:
1. Go to your GitHub repository: `https://github.com/malcolmonix/ChopChop`
2. Click on `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret` for each of the following:

### 📋 Secrets to Add:

```bash
# Server Configuration
NEXT_PUBLIC_SERVER_URL = http://localhost:4000/

# NextAuth Configuration  
NEXTAUTH_URL = http://localhost:3000
NEXTAUTH_SECRET = 794ab8855dae52389f40c78e6f002e9987c98004d6b6f7b096880aa990f813b4

# Firebase Configuration (from your .env.local)
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = chopchop-67750.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = chopchop-67750
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = chopchop-67750.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 835361851966
NEXT_PUBLIC_FIREBASE_APP_ID = 1:835361851966:web:78810ea4389297a8679f6f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-DNTXZG5ESQ

# Optional (leave blank if not using)
NEXT_PUBLIC_MENUVERSE_API_KEY = (leave blank or add your key)
```

### 🚀 After Adding Secrets:

1. **Commit and Push** the updated workflow file (already done)
2. **Re-run the Failed Build** in GitHub Actions
3. **Verify** the build completes successfully

### 📝 Note:
- These secrets are secure and won't be visible in logs
- The `NEXT_PUBLIC_` prefixed variables are safe to use in client-side builds
- Never commit actual secret values to your repository

### ✅ Expected Result:
After adding these secrets, your CI/CD pipeline should build successfully with all 33 pages generated without the Firebase API key error.

---

**Next Steps:**
1. Add the secrets to GitHub repository
2. Re-run the failed workflow
3. Verify successful deployment