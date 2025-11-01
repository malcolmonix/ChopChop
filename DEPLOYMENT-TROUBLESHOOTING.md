# Deployment Troubleshooting Guide

## Current Issue: Health Check Failure

The deployment is failing at the "Verify deployment" step with `Connection reset by peer` errors when trying to reach `https://chopchop.com/api/health`.

---

## Root Cause Analysis

### Primary Issue: Missing GitHub Secrets/Variables ⚠️

**The container cannot start properly because the required environment variables are not configured in GitHub yet.**

Without these variables:
- Firebase initialization fails
- NextAuth cannot authenticate
- The app crashes or doesn't start properly
- Health checks fail because there's no app to check

### Secondary Issue: Domain Configuration

The external health check tries to reach `https://chopchop.com` which may:
- Not be configured yet (DNS not pointing to VPS)
- SSL certificate not installed
- Reverse proxy (nginx) not set up

---

## Solution Steps (In Order)

### ✅ Step 1: Add GitHub Secrets and Variables (CRITICAL)

**This must be done first!** Follow the checklist in `GITHUB-SETUP-CHECKLIST.md`:

1. Go to: https://github.com/malcolmonix/ChopChop/settings/secrets/actions
2. Add **3 Secrets**:
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. Switch to **Variables** tab and add **10 Variables**:
   - `NEXT_PUBLIC_SERVER_URL`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**All values are in `GITHUB-SETUP-CHECKLIST.md`**

---

### ✅ Step 2: Re-run the Deployment

After adding the secrets/variables:

1. Go to Actions tab: https://github.com/malcolmonix/ChopChop/actions
2. Select the latest failed workflow
3. Click "Re-run all jobs"

The deployment should now succeed because:
- ✅ Container will receive all environment variables
- ✅ App will start properly
- ✅ Health check will pass

---

### 🔍 Step 3: Verify Container is Running

SSH into your VPS and check:

```bash
ssh root@145.14.158.29

# Check if container is running
docker ps | grep chopchop-app

# View container logs
docker logs chopchop-app --tail 50

# Check environment variables in container
docker exec chopchop-app env | grep NEXT_PUBLIC

# Test local health check
curl http://localhost:3000/api/health

# You should see:
# {"status":"healthy","timestamp":"...","app":"ChopChop","version":"1.0.0"}
```

---

### 📡 Step 4: Configure Domain (Optional)

If you want `https://chopchop.com` to work:

#### Option A: Point DNS to VPS

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an A record:
   ```
   Type: A
   Name: @
   Value: 145.14.158.29
   TTL: 300
   ```

#### Option B: Use the IP Address

Your app is already accessible at:
```
http://145.14.158.29:3000
```

#### Option C: Set up Nginx Reverse Proxy with SSL

SSH into VPS and configure nginx:

```bash
# Install nginx and certbot
apt update
apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
cat > /etc/nginx/sites-available/chopchop <<'EOF'
server {
    listen 80;
    server_name chopchop.com www.chopchop.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/chopchop /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

# Get SSL certificate (only after DNS is configured)
certbot --nginx -d chopchop.com -d www.chopchop.com
```

---

## Verification Commands

### Check Container Status
```bash
ssh root@145.14.158.29 "docker ps -a | grep chopchop"
```

### Check Container Logs
```bash
ssh root@145.14.158.29 "docker logs chopchop-app --tail 100"
```

### Test Local Health Check
```bash
ssh root@145.14.158.29 "curl -f http://localhost:3000/api/health"
```

### Test from Your Machine
```bash
# Test IP directly
curl http://145.14.158.29:3000/api/health

# Test domain (if configured)
curl https://chopchop.com/api/health
```

---

## Common Errors and Solutions

### Error: "Connection reset by peer"
**Cause**: App not running or crashed
**Solution**: 
1. Check if GitHub secrets/variables are added
2. Check container logs: `docker logs chopchop-app`
3. Restart container: `docker restart chopchop-app`

### Error: "Container is not running"
**Cause**: Missing environment variables or app crash
**Solution**:
1. Add GitHub secrets/variables
2. Check logs for error messages
3. Verify environment variables in container

### Error: "Health check timeout"
**Cause**: App taking too long to start
**Solution**:
1. Increase sleep time in workflow (currently 15s)
2. Check if backend server (port 4000) is accessible
3. Verify `NEXT_PUBLIC_API_URL` points to correct endpoint

### Error: "curl: (35) Recv failure"
**Cause**: SSL/TLS issue or domain not configured
**Solution**:
1. Use IP address instead: http://145.14.158.29:3000
2. Configure nginx with SSL
3. Test without https first

---

## Quick Status Check Script

Run this from your local machine:

```bash
# Check if container is running
ssh root@145.14.158.29 "docker ps | grep chopchop-app && echo '✅ Container running' || echo '❌ Container not running'"

# Check if app responds
curl -f http://145.14.158.29:3000/api/health && echo '✅ Health check passed' || echo '❌ Health check failed'
```

---

## Next Deployment After Fix

Once you've added the GitHub secrets/variables:

1. ✅ Commit something (or re-run workflow)
2. ✅ Watch the Actions tab
3. ✅ Deployment should succeed
4. ✅ App accessible at http://145.14.158.29:3000

---

## Support Contacts

**VPS IP**: 145.14.158.29  
**App Port**: 3000  
**Backend Port**: 4000  
**Health Check**: http://145.14.158.29:3000/api/health  

**Key Files**:
- Workflow: `.github/workflows/deploy.yml`
- Setup Guide: `GITHUB-ENV-SETUP.md`
- Checklist: `GITHUB-SETUP-CHECKLIST.md`

---

## Latest Improvements (Just Pushed)

✅ Better verification step that:
- Checks if container is running first
- Shows container logs for debugging
- Tests local health check before external
- Doesn't fail if domain isn't configured yet
- Shows fallback IP address

**Status**: Ready to deploy once GitHub secrets/variables are added! 🚀
