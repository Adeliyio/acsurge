# 🚀 AdCopySurge Production Environment Setup Guide

## Overview
This guide covers setting up all required environment variables for deploying AdCopySurge to production (Netlify + Fly.io).

---

## 📋 Environment Variables Checklist

### ✅ Frontend (Netlify)
| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `REACT_APP_API_URL` | ✅ | Backend API URL | `https://adcopysurge.fly.dev` |
| `REACT_APP_API_BASE_URL` | 🔄 | Alternative API URL | `https://adcopysurge.fly.dev` |
| `REACT_APP_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ...` |
| `REACT_APP_PADDLE_VENDOR_ID` | ✅ | Paddle billing vendor ID | `12345` |
| `REACT_APP_PADDLE_ENVIRONMENT` | ✅ | Paddle environment | `production` or `sandbox` |

### ✅ Backend (Fly.io)
| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `SECRET_KEY` | ✅ | JWT signing secret | Generate with `openssl rand -hex 32` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REACT_APP_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJ...` |
| `SUPABASE_JWT_SECRET` | ✅ | Supabase JWT secret | From Supabase settings |
| `OPENAI_API_KEY` | ✅ | OpenAI API key | `sk-...` |
| `HUGGINGFACE_API_KEY` | 🔄 | HuggingFace API key | `hf_...` |
| `SMTP_USERNAME` | ✅ | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ✅ | Email password | `app-specific-password` |
| `PADDLE_VENDOR_ID` | ✅ | Paddle vendor ID | `12345` |
| `PADDLE_API_KEY` | ✅ | Paddle API key | `xxx` |
| `PADDLE_WEBHOOK_SECRET` | ✅ | Paddle webhook secret | `xxx` |
| `SENTRY_DSN` | 🔄 | Error tracking DSN | `https://xxx@sentry.io/xxx` |

---

## 🔧 Setup Instructions

### Step 1: Generate Required Secrets

```bash
# Generate SECRET_KEY for JWT signing
openssl rand -hex 32

# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 2: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - Project URL (`REACT_APP_SUPABASE_URL`)
   - Anon public key (`REACT_APP_SUPABASE_ANON_KEY`)
   - Service role key (`SUPABASE_SERVICE_ROLE_KEY`)
5. Go to **Settings** → **Auth** → **JWT** 
6. Copy JWT Secret (`SUPABASE_JWT_SECRET`)

### Step 3: Setup External Services

#### OpenAI API
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (`OPENAI_API_KEY`)

#### Paddle Billing (Optional for MVP)
1. Go to [Paddle Dashboard](https://vendors.paddle.com/)
2. Get your Vendor ID from Developer Tools → Vendor Info
3. Create API key in Developer Tools → API Keys
4. Set up webhook endpoint and get secret

#### Email (SMTP)
For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your email as `SMTP_USERNAME`
4. Use the app password as `SMTP_PASSWORD`

---

## 🌐 Deployment Commands

### Frontend to Netlify

```bash
# Navigate to frontend directory
cd frontend

# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables (run these one by one)
netlify env:set REACT_APP_API_URL "https://adcopysurge.fly.dev"
netlify env:set REACT_APP_API_BASE_URL "https://adcopysurge.fly.dev"  
netlify env:set REACT_APP_SUPABASE_URL "YOUR_SUPABASE_URL"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY"
netlify env:set REACT_APP_PADDLE_VENDOR_ID "YOUR_PADDLE_VENDOR_ID"
netlify env:set REACT_APP_PADDLE_ENVIRONMENT "production"

# Build and deploy
npm run build
netlify deploy --build --prod
```

### Backend to Fly.io

```bash
# Navigate to backend directory
cd backend

# Install Fly CLI (if not already installed)
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux: curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Set secrets (run these one by one)
fly secrets set SECRET_KEY="YOUR_GENERATED_SECRET_KEY"
fly secrets set DATABASE_URL="YOUR_POSTGRESQL_URL"
fly secrets set REACT_APP_SUPABASE_URL="YOUR_SUPABASE_URL"
fly secrets set REACT_APP_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_KEY"
fly secrets set SUPABASE_JWT_SECRET="YOUR_SUPABASE_JWT_SECRET"
fly secrets set OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
fly secrets set SMTP_USERNAME="your-email@gmail.com"
fly secrets set SMTP_PASSWORD="your-app-specific-password"
fly secrets set PADDLE_VENDOR_ID="YOUR_PADDLE_VENDOR_ID"
fly secrets set PADDLE_API_KEY="YOUR_PADDLE_API_KEY"
fly secrets set PADDLE_WEBHOOK_SECRET="YOUR_PADDLE_WEBHOOK_SECRET"

# Optional: Set additional secrets
fly secrets set HUGGINGFACE_API_KEY="YOUR_HF_API_KEY"
fly secrets set SENTRY_DSN="YOUR_SENTRY_DSN"

# Deploy
fly deploy
```

---

## 🔍 Verification Steps

### 1. Check Frontend Build
```bash
# In frontend directory
npm run build
# Should complete without errors
```

### 2. Check Backend Health
```bash
# After deployment
curl https://adcopysurge.fly.dev/health
# Should return {"status": "healthy"}
```

### 3. Test API Connectivity
```bash
# Test API ping from frontend
curl https://your-frontend-url.netlify.app/api/ping
# Should proxy to backend and return success
```

### 4. Test Authentication Flow
1. Visit your deployed frontend URL
2. Try registering a new account
3. Check email for confirmation
4. Try logging in
5. Check dashboard loads correctly

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Frontend API Calls Failing
- **Problem**: CORS errors or 404s on API calls
- **Solution**: Verify `REACT_APP_API_URL` matches your Fly.io app URL
- **Check**: Browser network tab shows calls to correct URL

#### 2. Backend Authentication Errors
- **Problem**: 401 Unauthorized errors
- **Solution**: Verify Supabase keys are correctly set
- **Check**: `fly logs` for authentication errors

#### 3. Environment Variables Not Loading
- **Problem**: Variables showing as undefined
- **Solution**: Verify variables are set with correct names
- **Check Frontend**: `netlify env:list`
- **Check Backend**: `fly secrets list`

#### 4. Database Connection Issues
- **Problem**: Database connection errors
- **Solution**: Verify `DATABASE_URL` format and credentials
- **Check**: Test connection string locally first

### Debug Commands

```bash
# Check Netlify environment variables
netlify env:list

# Check Fly.io secrets
fly secrets list

# View Fly.io logs
fly logs

# SSH into Fly.io container
fly ssh console

# Check build logs
fly logs --app adcopysurge-backend
```

---

## 📝 Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Frontend builds without errors
- [ ] Backend deploys successfully
- [ ] Health endpoints return 200
- [ ] Authentication flow works end-to-end
- [ ] Email sending works (test registration)
- [ ] API calls succeed from frontend to backend
- [ ] Database migrations ran successfully
- [ ] Error tracking (Sentry) configured
- [ ] Domain names configured (if using custom domains)
- [ ] SSL certificates active
- [ ] Paddle webhook endpoint configured (if using billing)

---

## 🔗 Useful Links

- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Fly.io Secrets Management](https://fly.io/docs/reference/secrets/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Paddle Developer Docs](https://developer.paddle.com/)

---

*Last Updated: 2024-01-XX*
*Environment: Production Deployment Guide*