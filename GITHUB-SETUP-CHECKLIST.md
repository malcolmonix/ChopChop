# GitHub Secrets and Variables Checklist

## ✅ Quick Setup Guide

### Step 1: Go to Repository Settings
🔗 https://github.com/malcolmonix/ChopChop/settings/secrets/actions

---

## Step 2: Add Secrets (3 items)

Click **"New repository secret"** for each:

- [ ] **NEXTAUTH_SECRET**
  - Value: `794ab8855dae52389f40c78e6f002e9987c98004d6b6f7b096880aa990f813b4`

- [ ] **NEXT_PUBLIC_FIREBASE_API_KEY**
  - Value: `AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q`

- [ ] **NEXT_PUBLIC_FIREBASE_APP_ID**
  - Value: `1:835361851966:web:78810ea4389297a8679f6f`

---

## Step 3: Add Variables (10 items)

Click **"Variables"** tab, then **"New repository variable"** for each:

- [ ] **NEXT_PUBLIC_SERVER_URL**
  - Value: `http://145.14.158.29:4000/`

- [ ] **NEXT_PUBLIC_API_URL**
  - Value: `http://145.14.158.29:4000/graphql`

- [ ] **NEXT_PUBLIC_GRAPHQL_ENDPOINT**
  - Value: `http://145.14.158.29:4000/graphql`

- [ ] **NEXT_PUBLIC_APP_NAME**
  - Value: `ChopChop`

- [ ] **NEXTAUTH_URL**
  - Value: `https://chopchop.com`

- [ ] **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
  - Value: `chopchop-67750.firebaseapp.com`

- [ ] **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
  - Value: `chopchop-67750`

- [ ] **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
  - Value: `chopchop-67750.firebasestorage.app`

- [ ] **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
  - Value: `835361851966`

- [ ] **NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID**
  - Value: `G-DNTXZG5ESQ`

---

## Step 4: Deploy

- [ ] Commit and push the updated workflow:
  ```bash
  git add .github/workflows/deploy.yml GITHUB-ENV-SETUP.md GITHUB-SETUP-CHECKLIST.md
  git commit -m "fix: pass all environment variables to Docker container"
  git push origin main
  ```

- [ ] Watch the Actions tab for successful deployment

- [ ] Verify health check passes: http://145.14.158.29:3000

---

## Verification Commands

```bash
# Check if container is running
ssh root@145.14.158.29 "docker ps | grep chopchop"

# View container logs
ssh root@145.14.158.29 "docker logs chopchop-app --tail 50"

# Check environment variables in container
ssh root@145.14.158.29 "docker exec chopchop-app env | grep -E 'NEXT_PUBLIC|NEXTAUTH'"

# Test health check
curl -f http://145.14.158.29:3000
```

---

## 🎯 Total: 3 Secrets + 10 Variables = 13 Items

Once all checkboxes are marked, push your changes and the deployment should succeed! ✨
