# AdCopySurge Railway Deployment Guide

## Overview

This guide walks you through deploying your AdCopySurge FastAPI application on Railway.app.

## Files Created/Modified

1. **`railway.toml`** - Railway deployment configuration
2. **`backend/gunicorn-railway.conf.py`** - Railway-optimized Gunicorn config
3. **`backend/requirements-production.txt`** - Updated to include gunicorn
4. **`RAILWAY_DEPLOYMENT.md`** - This guide

## Quick Setup Steps

### 1. Push to Git Repository

First, commit and push the Railway configuration:

```bash
git add railway.toml backend/gunicorn-railway.conf.py backend/requirements-production.txt RAILWAY_DEPLOYMENT.md
git commit -m "feat: add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Connect your GitHub repository
5. Railway will automatically detect your Python application

### 3. Configure Environment Variables

In your Railway dashboard, go to **Variables** tab and add these **REQUIRED** variables:

#### Essential Variables

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-32-character-secret-key-here-minimum-length
```

#### AI Services (Choose One)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
# OR
HUGGINGFACE_API_KEY=hf_your-huggingface-key
```

#### Security & CORS
```bash
ALLOWED_HOSTS=your-app-name.railway.app,*.railway.app
CORS_ORIGINS=https://your-frontend.railway.app,https://yourdomain.com
```

### 4. Optional Variables

Add these if you're using these services:

#### Supabase Integration
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Email Service
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com
```

#### Paddle Payment Processing
```bash
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_API_KEY=your-paddle-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=production
```

#### Error Tracking & Monitoring
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
REDIS_URL=redis://user:pass@host:port/db
```

### 5. Deploy

1. Railway will automatically build and deploy your application
2. Monitor the build logs for any issues
3. Once deployed, you'll get a URL like `https://your-app.railway.app`

### 6. Verify Deployment

Test these endpoints to ensure everything works:

- **Health Check**: `https://your-app.railway.app/health`
- **API Documentation**: `https://your-app.railway.app/api/docs` (if DEBUG=true)
- **Root Endpoint**: `https://your-app.railway.app/`

## Database Setup

### Option 1: Railway PostgreSQL

1. In your Railway project, click "New Service"
2. Select "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable
4. Your FastAPI app will automatically connect to it

### Option 2: External Database

If using an external database (like Supabase):

1. Set `DATABASE_URL` to your external PostgreSQL connection string
2. Ensure the database is accessible from Railway's IP ranges

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that `requirements-production.txt` includes all necessary packages
2. **App Won't Start**: Verify `SECRET_KEY` and `DATABASE_URL` are set correctly  
3. **CORS Errors**: Update `CORS_ORIGINS` to include your frontend domain
4. **AI Features Don't Work**: Ensure `OPENAI_API_KEY` is set and valid

### Logs

View application logs in Railway dashboard:
- Go to your project
- Click on your service  
- Check the "Logs" tab

### Health Checks

The application includes health endpoints:
- `/health` - Basic health check
- `/healthz` - Detailed health check with dependencies

## Production Considerations

1. **Environment Variables**: Never commit secrets to git - use Railway's variable system
2. **Database Migrations**: Run migrations manually if needed
3. **Static Files**: Frontend static files should be served separately  
4. **Monitoring**: Consider setting up Sentry for error tracking
5. **Scaling**: Monitor CPU and memory usage in Railway dashboard

## Security Notes

- All traffic is HTTPS by default on Railway
- Security headers are configured in `main_production.py`
- CORS is properly configured for your domains
- JWT tokens use secure algorithms and proper expiration

## Cost Optimization

Railway offers:
- **Hobby Plan**: $5/month for basic apps
- **Pro Plan**: Pay-per-use for production apps
- **Free Tier**: Limited resources for testing

Monitor your usage in the Railway dashboard to optimize costs.

## Support

If you encounter issues:

1. Check Railway's documentation: https://docs.railway.app
2. Review application logs in Railway dashboard
3. Test locally first: `uvicorn main_production:app --host 0.0.0.0 --port 8000`
4. Ensure all environment variables are set correctly

## Next Steps After Deployment

1. Set up a custom domain (optional)
2. Configure DNS records for your domain
3. Set up monitoring and alerts
4. Configure backup strategies for your database
5. Set up CI/CD workflows for automatic deployments

---

Your AdCopySurge API should now be successfully deployed on Railway! 🚀
