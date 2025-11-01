# GitHub Environment Variables Setup Guide

## Problem
The GitHub Actions deployment was failing during health checks because environment variables were not being passed from GitHub to the Docker container. The app needs Firebase configuration, NextAuth secrets, and API endpoints to function properly.

## Solution
Updated the deployment workflow to pass all required environment variables to the Docker container at runtime. These variables must be configured in your GitHub repository settings.

---

## Required GitHub Configuration

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository: `https://github.com/malcolmonix/ChopChop`
2. Click **Settings** tab
3. In the left sidebar, expand **Secrets and variables**
4. Click **Actions**

---

## Step 2: Add GitHub Secrets (Sensitive Data)

Click the **Secrets** tab and add these secrets:

| Secret Name | Value | Notes |
|------------|-------|-------|
| `NEXTAUTH_SECRET` | `794ab8855dae52389f40c78e6f002e9987c98004d6b6f7b096880aa990f813b4` | Authentication secret for NextAuth |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q` | Firebase API key (sensitive) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:835361851966:web:78810ea4389297a8679f6f` | Firebase App ID |

**⚠️ Security Note:** Secrets are encrypted and only exposed during workflow execution.

---

## Step 3: Add GitHub Variables (Non-Sensitive Data)

Click the **Variables** tab and add these variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_SERVER_URL` | `http://145.14.158.29:4000/` | Backend server URL |
| `NEXT_PUBLIC_API_URL` | `http://145.14.158.29:4000/graphql` | GraphQL API endpoint |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | `http://145.14.158.29:4000/graphql` | GraphQL endpoint (backup) |
| `NEXT_PUBLIC_APP_NAME` | `ChopChop` | Application name |
| `NEXTAUTH_URL` | `https://chopchop.com` | Production URL for NextAuth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `chopchop-67750.firebaseapp.com` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `chopchop-67750` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `chopchop-67750.firebasestorage.app` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `835361851966` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-DNTXZG5ESQ` | Firebase analytics measurement ID |

---

## Step 4: Verify Existing Secrets

Make sure you already have these secrets configured (they should already exist):

- ✅ `VPS_SSH_KEY` - SSH private key for VPS access
- ✅ `GITHUB_TOKEN` - Automatically provided by GitHub Actions

---

## What Changed in the Workflow

### Before (Only 2 variables):
```yaml
docker run -d \
  --name chopchop-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://145.14.158.29:4000/graphql \
  -e NEXT_PUBLIC_APP_NAME="ChopChop" \
  ghcr.io/malcolmonix/chopchop:latest
```

### After (All 13 variables):
```yaml
docker run -d \
  --name chopchop-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SERVER_URL="${{ vars.NEXT_PUBLIC_SERVER_URL }}" \
  -e NEXT_PUBLIC_API_URL="${{ vars.NEXT_PUBLIC_API_URL }}" \
  -e NEXT_PUBLIC_GRAPHQL_ENDPOINT="${{ vars.NEXT_PUBLIC_GRAPHQL_ENDPOINT }}" \
  -e NEXT_PUBLIC_APP_NAME="${{ vars.NEXT_PUBLIC_APP_NAME }}" \
  -e NEXTAUTH_URL="${{ vars.NEXTAUTH_URL }}" \
  -e NEXTAUTH_SECRET="${{ secrets.NEXTAUTH_SECRET }}" \
  -e NEXT_PUBLIC_FIREBASE_API_KEY="${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}" \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="${{ vars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}" \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="${{ vars.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}" \
  -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="${{ vars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}" \
  -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="${{ vars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}" \
  -e NEXT_PUBLIC_FIREBASE_APP_ID="${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}" \
  -e NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="${{ vars.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}" \
  ghcr.io/malcolmonix/chopchop:latest
```

---

## How to Add Secrets and Variables

### Adding a Secret:
1. Go to **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab
2. Click **New repository secret**
3. Enter the **Name** (e.g., `NEXTAUTH_SECRET`)
4. Enter the **Secret** value
5. Click **Add secret**
6. Repeat for all secrets listed above

### Adding a Variable:
1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Enter the **Name** (e.g., `NEXT_PUBLIC_SERVER_URL`)
4. Enter the **Value**
5. Click **Add variable**
6. Repeat for all variables listed above

---

## Testing the Fix

After adding all secrets and variables:

1. **Commit and push** the updated workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "fix: pass all environment variables to Docker container for health check"
   git push origin main
   ```

2. **Monitor the deployment**:
   - Go to **Actions** tab in GitHub
   - Watch the deployment workflow run
   - The health check should now pass because the app has all required environment variables

3. **Verify the deployment**:
   ```bash
   curl -f http://145.14.158.29:3000
   # or
   curl -f https://chopchop.com
   ```

---

## Production URLs to Update

Once deployed, update your production URLs in GitHub Variables:

| Variable | Current (Development) | Production |
|----------|----------------------|------------|
| `NEXT_PUBLIC_SERVER_URL` | `http://145.14.158.29:4000/` | `https://api.chopchop.com/` or keep current |
| `NEXT_PUBLIC_API_URL` | `http://145.14.158.29:4000/graphql` | `https://api.chopchop.com/graphql` or keep current |
| `NEXTAUTH_URL` | Should be `https://chopchop.com` | `https://chopchop.com` |

---

## Troubleshooting

### Health check still fails?

1. **Check container logs**:
   ```bash
   ssh root@145.14.158.29
   docker logs chopchop-app
   ```

2. **Verify environment variables are set**:
   ```bash
   docker exec chopchop-app env | grep NEXT_PUBLIC
   docker exec chopchop-app env | grep NEXTAUTH
   ```

3. **Test the app manually**:
   ```bash
   docker exec chopchop-app curl -f http://localhost:3000
   ```

### Missing variables error?

If the workflow fails with "Context access might be invalid", it means the variable/secret doesn't exist in GitHub yet. Double-check you've added all required secrets and variables.

### Firebase errors?

Make sure all Firebase variables match your Firebase console configuration exactly:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `chopchop-67750`
3. Go to **Project Settings** → **General**
4. Scroll to **Your apps** section
5. Verify all values match

---

## Security Best Practices

✅ **Secrets** are used for: API keys, authentication secrets, and app IDs
✅ **Variables** are used for: Non-sensitive configuration like URLs and project IDs
✅ Never commit `.env.local` or secrets to version control
✅ Use different values for development and production
✅ Rotate secrets regularly (especially `NEXTAUTH_SECRET`)

---

## Quick Reference: Secrets vs Variables

**Use Secrets for:**
- API keys
- Authentication secrets
- Private tokens
- Passwords
- Any sensitive data that should be encrypted

**Use Variables for:**
- Public URLs
- Project IDs
- Non-sensitive configuration
- Feature flags
- Public identifiers

---

## Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Add all variables to GitHub
3. ✅ Commit and push the updated workflow
4. ✅ Monitor the deployment
5. ✅ Verify the health check passes
6. 🎉 Enjoy automated deployments!

---

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review container logs on the VPS
3. Verify all secrets/variables are correctly set
4. Ensure Firebase configuration matches your console

**File Modified:** `.github/workflows/deploy.yml`
**Date:** November 1, 2025
