# AdCopySurge Deployment Guide

This guide walks you through deploying AdCopySurge to production with DigitalOcean (backend) and Netlify (frontend).

## 🚀 Quick Summary

**Current Status**: ✅ Ready for production deployment
**Tech Stack**: React + FastAPI + PostgreSQL + Redis + GitHub Actions
**Hosting**: DigitalOcean (backend) + Netlify (frontend)
**Estimated Setup Time**: 45-60 minutes

## Prerequisites

1. **Supabase Account** - [Sign up](https://supabase.com)
2. **Vercel Account** - For frontend deployment 
3. **Railway Account** - For backend API (alternative: Render, Heroku)
4. **Stripe Account** - For payment processing
5. **OpenAI API Key** - For AI analysis features

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New project"
3. Choose organization and enter project details
4. Wait for project initialization (~2 minutes)

### 1.2 Configure Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql` 
3. Run the SQL script to create tables, RLS policies, and functions
4. Verify tables were created in the Table Editor

### 1.3 Get Supabase Credentials
Copy these from Settings > API:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR...` (starts with eyJ)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR...` (keep secret!)

## Step 2: Configure Environment Variables

### 2.1 Backend Environment (.env)
```env
# Core
NODE_ENV=production
DEBUG=false
SECRET_KEY=your-super-long-secret-key-for-production

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs (REQUIRED)
OPENAI_API_KEY=sk-your-openai-key
HUGGINGFACE_API_KEY=hf_your-huggingface-key

# Stripe (REQUIRED for payments)
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info
```

### 2.2 Frontend Environment (.env)
```env
# Supabase
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# API (if keeping FastAPI backend)
REACT_APP_API_URL=https://your-backend.railway.app/api

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Environment
REACT_APP_ENV=production
```

## Step 3: Deploy Backend (Railway)

### 3.1 Prepare Backend for Deployment
1. Update `requirements.txt` if needed
2. Ensure `Dockerfile` is configured correctly
3. Test locally: `docker build -t adcopysurge-backend .`

### 3.2 Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Connect your GitHub account and select the repository
4. Choose the `backend` directory as the root
5. Railway will auto-detect the Dockerfile

### 3.3 Configure Environment Variables
In Railway dashboard:
1. Go to your project > Variables
2. Add all the backend environment variables from Step 2.1
3. Deploy will happen automatically

### 3.4 Test Backend
- Visit your Railway app URL (e.g., `https://adcopysurge-backend.railway.app`)
- Check `/health` endpoint
- Verify `/api/docs` shows API documentation

## Step 4: Deploy Frontend (Vercel)

### 4.1 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Set **Framework Preset** to "Create React App"

### 4.2 Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add all the frontend environment variables from Step 2.2
3. Redeploy the project

### 4.3 Test Frontend
- Visit your Vercel app URL (e.g., `https://adcopysurge.vercel.app`)
- Test user registration/login
- Verify Supabase connection works

## Step 5: Configure Stripe

### 5.1 Set Up Products and Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products
3. Create products:
   - **Basic Plan**: $49/month
   - **Pro Plan**: $99/month
4. Note the Price IDs (price_xxx) - you'll need these

### 5.2 Update Stripe Price IDs
Edit `backend/app/services/subscription_service.py`:
```python
def _get_stripe_price_id(self, tier: SubscriptionTier) -> str:
    price_ids = {
        SubscriptionTier.BASIC: 'price_your_basic_price_id',
        SubscriptionTier.PRO: 'price_your_pro_price_id'
    }
    return price_ids.get(tier, '')
```

### 5.3 Set Up Webhooks
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-backend.railway.app/api/stripe/webhook`
3. Select events: `customer.subscription.*`, `invoice.payment_*`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Step 6: Final Configuration

### 6.1 Update CORS Settings
Ensure your backend allows requests from your frontend domain:
```python
# In backend/app/core/config.py
ALLOWED_HOSTS = [
    "https://adcopysurge.vercel.app",  # Your Vercel domain
    "https://your-custom-domain.com",  # Your custom domain
]
```

### 6.2 Set Up Custom Domain (Optional)
1. **Frontend**: In Vercel, go to Domains and add your domain
2. **Backend**: In Railway, go to Settings > Domains and add your API subdomain

### 6.3 Enable Analytics & Monitoring
1. **Sentry**: Set up error tracking for production
2. **Analytics**: Consider adding Google Analytics or Mixpanel

## Step 7: Testing Production

### 7.1 End-to-End Testing
1. ✅ User Registration/Login
2. ✅ Ad Analysis (with OpenAI)
3. ✅ Subscription Upgrade (with Stripe)
4. ✅ Payment Processing
5. ✅ Data Persistence (Supabase)

### 7.2 Performance Testing
1. Test with multiple concurrent users
2. Verify API response times
3. Check database query performance
4. Monitor error rates

## 🎉 Go Live!

Once everything is tested:

1. **Update DNS** if using custom domains
2. **Announce launch** to your users
3. **Monitor** error rates and performance
4. **Scale** as needed (Railway auto-scales)

## Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Check CORS settings
- Verify `REACT_APP_API_URL` is correct
- Check browser console for errors

**Supabase RLS errors:**
- Verify RLS policies are correctly set
- Check user authentication state
- Review Supabase logs

**Stripe payments failing:**
- Verify webhook endpoints are working
- Check Stripe test vs live keys
- Monitor Stripe dashboard for errors

**OpenAI API errors:**
- Check API key validity
- Monitor rate limits and usage
- Verify request format

## Support

- **Supabase**: [Documentation](https://supabase.com/docs)
- **Railway**: [Documentation](https://docs.railway.app)
- **Vercel**: [Documentation](https://vercel.com/docs)
- **Stripe**: [Documentation](https://stripe.com/docs)

---

**Estimated Total Cost (Monthly)**:
- Supabase Pro: $25
- Railway: $5-20 (based on usage)
- Vercel Pro: $20 (optional)
- **Total**: ~$50-65/month + usage costs
