# Lifecycle Tracking Setup - READY TO GO! 🚀

## ✅ What's Already Done

1. **GitHub Test Repository Created**
   - Repository: https://github.com/jbroxton/speqq-lifecycle-test
   - PR Template: ✅ Already added
   - Deployment workflow: ✅ Already added

2. **Webhook Secret Generated**
   - Secret: `40e59dc7d69052f8cd10982688af61affa03a73befc3d0f7d4c28be5a3317aa2`
   - ✅ Already in `.env.local`

3. **ngrok Tunnel Active**
   - URL: `https://2a9aeb5d4e4b.ngrok-free.app`
   - ✅ Already configured in `.env.local`
   - ✅ Tunnel is running on port 3000

4. **GitHub Webhook Configured**
   - ✅ Webhook created and active
   - ✅ Pointing to ngrok URL
   - ✅ Events: Pull requests, Push, Deployments, Ping

5. **GitHub Secrets Added**
   - ✅ SPEQQ_WEBHOOK_URL configured
   - ✅ SPEQQ_WEBHOOK_SECRET configured

## 📋 What the Engineer Needs to Do

### 1. Update PostgreSQL Credentials in `.env.local`
```bash
# Only update the DATABASE_URL with your actual Postgres credentials
DATABASE_URL=postgresql://USER:PASS@localhost:5432/speqq?schema=public

# Everything else is already configured:
# ✅ GITHUB_WEBHOOK_SECRET=40e59dc7d69052f8cd10982688af61affa03a73befc3d0f7d4c28be5a3317aa2
# ✅ WEBHOOK_PUBLIC_URL=https://2a9aeb5d4e4b.ngrok-free.app
# ✅ NODE_ENV=development
# ✅ GH_ORG=jbroxton
# ✅ GH_REPO=speqq-lifecycle-test
```

### 2. Create PostgreSQL Database
```bash
# Create the database
createdb speqq

# Or if you want a different name, update DATABASE_URL accordingly
```

### ✅ 3. ngrok (Already Running)
```bash
# Tunnel is already active at:
https://2a9aeb5d4e4b.ngrok-free.app

# To monitor ngrok:
http://localhost:4040
```

### ✅ 4. GitHub Webhook (Already Configured)
- **Status**: Active and receiving events
- **URL**: https://github.com/jbroxton/speqq-lifecycle-test/settings/hooks
- **Payload URL**: `https://2a9aeb5d4e4b.ngrok-free.app/api/integrations/github/webhook`
- **Recent deliveries**: Webhook is sending (getting 404 until endpoint is implemented)

### ✅ 5. GitHub Action Secrets (Already Added)
```bash
# Already configured in the test repo:
# ✅ SPEQQ_WEBHOOK_URL = https://2a9aeb5d4e4b.ngrok-free.app/api/integrations/github/webhook
# ✅ SPEQQ_WEBHOOK_SECRET = 40e59dc7d69052f8cd10982688af61affa03a73befc3d0f7d4c28be5a3317aa2
```

## 🧪 Testing the Setup

### Quick Test #1: Webhook Connection
1. Go to GitHub webhook settings
2. Click on your webhook
3. Scroll down and click "Ping"
4. Check "Recent Deliveries" - should show green checkmark

### Quick Test #2: Create a Test PR
```bash
# Clone the test repo
git clone https://github.com/jbroxton/speqq-lifecycle-test.git
cd speqq-lifecycle-test

# Create a feature branch
git checkout -b feature/US_001-test-feature

# Make a change
echo "// Test code" > test.js
git add test.js
git commit -m "Test lifecycle tracking"

# Push and create PR
git push origin feature/US_001-test-feature
gh pr create --title "Test: US_001 implementation" \
  --body "**Stories**: US_001
**ACs**: AC_001, AC_002

Testing lifecycle tracking system"
```

### Quick Test #3: Trigger Deployment
```bash
# Merge to main to trigger deployment workflow
gh pr merge --merge

# Or manually trigger the workflow
gh workflow run deploy-signal.yml -f environment=production
```

## 📝 Summary for Handoff

**Engineer's Remaining Tasks:**
- [x] ~~Update DATABASE_URL in `.env.local` with your Postgres credentials~~ ✅ DONE
- [x] ~~Create `speqq` database in Postgres~~ ✅ DONE
- [ ] Implement `/api/integrations/github/webhook` endpoint
- [ ] Add Prisma schema and run migrations
- [ ] Test with a PR containing Story IDs

**Already Completed:**
- ✅ ngrok tunnel running at `https://2a9aeb5d4e4b.ngrok-free.app`
- ✅ GitHub webhook configured and sending events
- ✅ GitHub secrets added for deployments
- ✅ All environment variables configured (except DATABASE_URL)
- ✅ Test repository ready with PR template

**What I'll implement:**
- `/api/integrations/github/webhook` endpoint
- Webhook signature verification
- ID extraction from PR body
- Prisma schema and migrations
- Event normalization and storage
- Status updates based on GitHub events

**Test Repository Details:**
- URL: https://github.com/jbroxton/speqq-lifecycle-test
- Has PR template ready
- Has deployment workflow ready
- Just needs webhook configuration

## 🔥 Live Configuration Summary

**Database**: `postgresql://delaghetto@localhost:5432/speqq` (✅ Active & Connected)
**ngrok Tunnel**: `https://2a9aeb5d4e4b.ngrok-free.app` (✅ Active)
**GitHub Webhook**: Configured and sending events (✅ Active)
**Webhook Secret**: `40e59dc7d69052f8cd10982688af61affa03a73befc3d0f7d4c28be5a3317aa2`
**Test Repository**: https://github.com/jbroxton/speqq-lifecycle-test

The webhook is currently receiving events and getting 404 responses (expected until the endpoint is implemented). Once you implement the `/api/integrations/github/webhook` endpoint, events will start flowing!