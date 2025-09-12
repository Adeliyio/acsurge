# Netlify Environment Variables Setup

## 🚀 Required Environment Variables for Netlify

Copy these environment variables to your Netlify dashboard:

### Backend Configuration
```
REACT_APP_API_URL=https://adcopysurge.fly.dev
REACT_APP_API_BASE_URL=https://adcopysurge.fly.dev
```

### Supabase Configuration
```
REACT_APP_SUPABASE_URL=https://tqzlsajhhtkhljdbjkyg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxemxzYWpoaHRraGxqZGJqa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTYzOTMsImV4cCI6MjA3MjU3MjM5M30.0uI56qJGE5DQwEvcfYlcOIz2NGC-msMVrTRw6d-RQuI
```

### Build Configuration
```
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
NODE_VERSION=18
NPM_VERSION=9
CI=false
```

### Optional (Feature Flags)
```
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_PADDLE_VENDOR_ID=
REACT_APP_PADDLE_ENVIRONMENT=sandbox
```

## 📝 How to Set These in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site Settings** > **Environment Variables**
4. Click **Add a new variable** for each one above
5. Redeploy your site

## 🔧 Quick Deploy:
After setting the variables, trigger a redeploy by:
1. Going to **Deploys** tab
2. Click **Deploy Settings** > **Clear cache and retry deploy**
