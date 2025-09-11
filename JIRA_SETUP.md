# 🎯 Jira Test Instance Setup Guide

## ✅ CLI Installation Complete
- **Jira CLI Version:** 1.7.0
- **Platform:** macOS (darwin/arm64)
- **Location:** `/opt/homebrew/bin/jira`

---

## 📋 Step 1: Create Your Free Jira Cloud Instance

### Quick Setup (5 minutes)

1. **Open this link in your browser:**
   ```
   https://www.atlassian.com/try/cloud/signup?product=jira-software
   ```

2. **Sign up with these details:**
   - Email: Use your work or personal email
   - Site name: `speqq-demo-2025`
   - Your URL will be: `https://speqq-demo-2025.atlassian.net`

3. **During initial setup:**
   - Template: Choose **"Software development"**
   - Method: Select **"Scrum"**
   - Skip team invites (click "Skip" at bottom)
   - Project name: **"Speqq Integration"**
   - Project key: **"SPQ"**

---

## 🔑 Step 2: Generate API Token

1. **After logging in, go to:**
   ```
   https://id.atlassian.com/manage-profile/security/api-tokens
   ```

2. **Create token:**
   - Click "Create API token"
   - Label: "Speqq Development"
   - **COPY THE TOKEN IMMEDIATELY** (you only see it once!)

3. **Save your credentials:**
   Create/update `.env.local` in project root:
   ```bash
   JIRA_URL=https://speqq-demo-2025.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=PASTE_YOUR_TOKEN_HERE
   JIRA_PROJECT_KEY=SPQ
   ```

---

## 🖥️ Step 3: Configure Jira CLI

Run this configuration command:

```bash
jira init
```

When prompted, enter:
- **Server:** `https://speqq-demo-2025.atlassian.net` (or your chosen subdomain)
- **Login:** Your email address
- **API Token:** Paste your API token
- **Default project:** `SPQ`
- **Default board:** Press Enter to skip

---

## 🧪 Step 4: Verify Connection

Test that everything works:

```bash
# Check connection
jira me

# List projects (should show SPQ)
jira project list

# Create a test issue
jira issue create \
  --type="Story" \
  --summary="Test: User Authentication Story" \
  --description="As a user, I can sign in with email and password" \
  --project="SPQ"

# List created issues
jira issue list --project="SPQ"
```

---

## 📝 Step 5: Create Test Data

Run these commands to create sample stories matching our Speqq demo:

```bash
# Story 1: Authentication
jira issue create -tStory \
  -s"As a returning user, I can sign in with email and password" \
  -d"User authentication with email/password validation and 30-day session persistence" \
  -pSPQ

# Story 2: Payment Processing  
jira issue create -tStory \
  -s"Guest can pay with credit card securely" \
  -d"Secure payment processing with Visa/Mastercard, optimistic UI, and clear error messages" \
  -pSPQ

# Story 3: Order History
jira issue create -tStory \
  -s"View last 12 months of orders with search and export" \
  -d"Order history with date filtering, search, and CSV/PDF export functionality" \
  -pSPQ

# Story 4: Profile Management
jira issue create -tStory \
  -s"User can update profile photo and notification preferences" \
  -d"Profile management including avatar upload, display name, and notification settings" \
  -pSPQ
```

---

## 🔧 Step 6: Test API Connection

Verify API access with cURL:

```bash
# Test authentication (replace with your credentials)
curl -u your-email@example.com:your-api-token \
  -X GET \
  -H "Accept: application/json" \
  "https://speqq-demo-2025.atlassian.net/rest/api/3/myself" \
  | json_pp

# Should return your user profile
```

---

## ✅ Setup Checklist

Before proceeding with development:

- [ ] Jira CLI installed (`jira version` works)
- [ ] Jira Cloud account created
- [ ] API token generated and saved
- [ ] `.env.local` file created with credentials
- [ ] CLI configured (`jira me` returns your profile)
- [ ] Test project "SPQ" exists
- [ ] At least 4 test stories created
- [ ] API connection verified with cURL

---

## 🚀 Ready for Development!

Once everything above is checked, you can start implementing the Jira sync feature.

Your test instance details:
- **URL:** `https://speqq-demo-2025.atlassian.net` (or your subdomain)
- **Project:** SPQ (Speqq Integration)
- **Issues:** SPQ-1, SPQ-2, SPQ-3, SPQ-4 (your test stories)

---

## 🆘 Troubleshooting

**"Unauthorized" errors:**
- Regenerate API token
- Check for spaces/newlines in token
- Use token, not password

**CLI config issues:**
- Delete `~/.config/.jira/.config.yml` and run `jira init` again
- Check your email is correct
- Verify site URL includes `.atlassian.net`

**Can't create account:**
- Try different email
- Use incognito/private browsing
- Choose different site name

---

## 📌 Next Steps

1. Complete the setup checklist above
2. Share your Jira URL and project key with the team
3. Start implementing the sync feature with TDD approach
4. Use the test stories (SPQ-1 through SPQ-4) for integration testing