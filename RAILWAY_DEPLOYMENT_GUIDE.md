# Railway Deployment Guide for AdCopySurge

This guide covers deploying AdCopySurge to Railway with all fixes applied.

## 🚀 Quick Deployment Checklist

### 1. Railway Project Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project (run from repo root)
railway new

# Link to existing project (if already created)
railway link
```

### 2. Add Required Services in Railway Dashboard

#### PostgreSQL Database
1. Go to Railway Dashboard → Your Project
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically create `DATABASE_URL` environment variable

#### Redis (Optional but Recommended)
1. Click "New Service" → "Database" → "Redis"
2. Railway will automatically create `REDIS_URL` environment variable

### 3. Configure Environment Variables

Copy these variables to Railway Dashboard (Variables tab):

#### **Required Variables** ⚠️
```bash
# Security (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-super-secret-32-character-minimum-key-here

# Supabase Authentication
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# AI Services
OPENAI_API_KEY=sk-proj-...
```

#### **Security & CORS**
```bash
# Update with your actual domains
ALLOWED_HOSTS=*.railway.app,your-custom-domain.com
CORS_ORIGINS=https://your-frontend.railway.app,https://your-custom-domain.com
```

#### **Optional but Recommended**
```bash
# Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Email (for transactional emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com

# Payment Processing (Paddle)
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_API_KEY=your-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=production
```

### 4. Deploy

```bash
# Deploy from repo root
railway up

# Or deploy specific service
railway up --service backend
```

## 🔧 Key Fixes Applied

### 1. **XMLResponse Import Error** ✅ FIXED
- Replaced non-existent `XMLResponse` with standard `Response` class
- Updated sitemap and RSS endpoints
- Fixed Pydantic `regex` → `pattern` parameter

### 2. **Missing Dependencies** ✅ FIXED
- Added `python-frontmatter==1.1.0` to production requirements
- Added `asyncpg==0.29.0` for async PostgreSQL
- Added `markdown==3.7` for blog content processing

### 3. **Database Configuration** ✅ FIXED
- Enhanced database connection with retry logic
- Added async PostgreSQL support for scalability
- Proper URL handling for Railway's PostgreSQL

### 4. **Resource Optimization** ✅ FIXED
- Optimized Gunicorn for Railway's memory limits
- Reduced worker connections and requests
- Added Railway-specific environment detection

### 5. **Environment Configuration** ✅ FIXED
- Auto-detection of Railway environment
- Automatic CORS configuration for Railway domains
- Proper debug mode handling

## 📁 File Structure

The following files have been optimized for Railway:

```
adcopysurge/
├── railway.toml              # Railway configuration
├── .env.railway.example      # Environment variables template
├── backend/
│   ├── requirements-production.txt  # Updated with missing deps
│   ├── gunicorn-railway.conf.py    # Optimized for Railway
│   ├── main_production.py           # Production app entry
│   ├── app/core/
│   │   ├── config.py        # Enhanced Railway detection
│   │   └── database.py      # Async PostgreSQL support
│   └── app/blog/
│       ├── router.py        # Fixed XMLResponse issue
│       └── models/blog_models.py  # Fixed Pydantic patterns
```

## ⚡ Performance Optimizations

### Railway-Specific Settings
- **Workers**: Auto-configured based on `WEB_CONCURRENCY`
- **Memory**: Limited to 256MB per worker
- **Connections**: Reduced to 512 per worker
- **Timeouts**: Increased to 120s for AI processing

### Database Optimizations
- **Connection Pooling**: Enabled with 1-hour recycle
- **Health Checks**: Pool pre-ping enabled
- **Async Support**: Ready for async endpoints

## 🚨 Common Issues & Solutions

### Issue: "Cannot import name 'XMLResponse'"
**Status**: ✅ FIXED
**Solution**: Updated to use `Response` class with `media_type`

### Issue: "No module named 'frontmatter'"
**Status**: ✅ FIXED
**Solution**: Added to `requirements-production.txt`

### Issue: Database connection fails
**Status**: ✅ FIXED
**Solution**: Enhanced error handling and Railway URL detection

### Issue: Memory limit exceeded
**Status**: ✅ FIXED
**Solution**: Optimized worker configuration for Railway

### Issue: Slow startup times
**Status**: ✅ ADDRESSED
**Solution**: Pre-loading app and optimized import structure

## 🔍 Monitoring & Debugging

### Health Checks
- **Basic**: `/health`
- **Detailed**: `/healthz` (includes database, Redis, OpenAI checks)
- **Metrics**: `/metrics` (Prometheus format if installed)

### Railway Logs
```bash
# View deployment logs
railway logs --service backend

# Follow real-time logs
railway logs --service backend --follow
```

### Environment Verification
```bash
# Check environment variables
railway variables --service backend

# Test database connection
railway run --service backend python -c "from app.core.database import engine; engine.connect(); print('DB OK')"
```

## 📋 Pre-Deployment Testing

Run these commands locally to verify deployment readiness:

```bash
cd backend

# Test imports
python test_import_fix.py

# Verify requirements
pip install -r requirements-production.txt

# Test database connection (with local DB)
python -c "from app.core.config import settings; print('Config loaded:', settings.APP_NAME)"

# Test main application
python main_production.py
```

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Railway
- [ ] PostgreSQL service connected
- [ ] Domain configured (if using custom domain)
- [ ] CORS origins include your frontend domain
- [ ] Supabase authentication configured
- [ ] OpenAI API key valid and has credits
- [ ] SSL certificate active (Railway provides this)
- [ ] Health checks responding (visit `/health`)
- [ ] Database tables created (check `/healthz`)

## 📞 Support

If deployment fails:

1. Check Railway logs: `railway logs --service backend`
2. Verify all required environment variables are set
3. Ensure PostgreSQL service is running
4. Check that `requirements-production.txt` includes all dependencies
5. Verify the build is using Python 3.11 (set in `railway.toml`)

## 🎉 Success!

Once deployed successfully:
- Your API will be available at `https://your-app-name.up.railway.app`
- Documentation at `https://your-app-name.up.railway.app/api/docs` (in dev mode)
- Health check at `https://your-app-name.up.railway.app/health`

Remember to update your frontend to point to the new Railway backend URL!
