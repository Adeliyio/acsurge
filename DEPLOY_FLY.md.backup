# AdCopySurge Fly.io Deployment Guide

Deploy your AdCopySurge AI-powered ad copy analysis platform to Fly.io in minutes.

## 🚀 Quick Start

Fly.io offers generous free tier and is developer-friendly for getting started!

## 📋 Prerequisites

1. **Fly.io Account**: [Sign up for free](https://fly.io/app/sign-up)
2. **Fly CLI**: Install the Fly.io CLI
3. **Docker**: Make sure Docker is installed locally
4. **Supabase Account**: [Create a Supabase project](https://supabase.com) for authentication
5. **OpenAI API Key**: [Get your API key](https://platform.openai.com/api-keys)

## 🛠️ Install Fly CLI

### Windows (PowerShell)
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation
```bash
fly version
fly auth login
```

## 🏗️ Architecture Overview

Your Fly.io deployment will include:

- **Backend API** (`adcopysurge-backend`) - FastAPI application with AI processing
- **Frontend** (`adcopysurge-frontend`) - React static site
- **PostgreSQL Database** - Fly.io Postgres (or external)
- **Redis Cache** - Fly.io Redis (optional)

## 📦 Deployment Steps

### 1. Clone and Prepare Repository

```bash
git clone https://github.com/Adeliyio/acsurge.git
cd acsurge
```

### 2. Deploy Backend API

Navigate to the backend directory:

```bash
cd backend
```

#### Create and Deploy Backend App

```bash
# Create the app (this reads fly.toml automatically)
fly launch

# Choose app name: adcopysurge-backend
# Choose region: Choose closest to you (ord for Chicago, iad for Virginia, etc.)
# Don't deploy yet - we need to set secrets first
```

#### Set Required Secrets

```bash
# Generate a secure secret key
fly secrets set SECRET_KEY=$(openssl rand -hex 32)

# Set Supabase configuration
fly secrets set REACT_APP_SUPABASE_URL="https://your-project-ref.supabase.co"
fly secrets set REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
fly secrets set SUPABASE_JWT_SECRET="your_supabase_jwt_secret"

# Set AI service keys
fly secrets set OPENAI_API_KEY="sk-proj-your-openai-key-here"
fly secrets set HUGGINGFACE_API_KEY="hf_your-huggingface-key-here"  # Optional

# Set email configuration (optional)
fly secrets set SMTP_USERNAME="your-email@gmail.com"
fly secrets set SMTP_PASSWORD="your-app-password"

# Set payment configuration (optional)
fly secrets set PADDLE_VENDOR_ID="your-vendor-id"
fly secrets set PADDLE_API_KEY="your-paddle-api-key"
fly secrets set PADDLE_WEBHOOK_SECRET="your-webhook-secret"

# Set monitoring (optional)
fly secrets set SENTRY_DSN="https://your-dsn@sentry.io/project-id"
```

#### Create Database

```bash
# Create PostgreSQL database
fly postgres create --name adcopysurge-db --region ord

# Attach database to your app
fly postgres attach --app adcopysurge-backend adcopysurge-db
```

#### Create Redis (Optional)

```bash
# Create Redis instance
fly redis create --name adcopysurge-redis --region ord

# Attach Redis to your app  
fly redis attach --app adcopysurge-backend adcopysurge-redis
```

#### Deploy Backend

```bash
# Deploy the backend
fly deploy

# Check deployment status
fly status
fly logs
```

### 3. Deploy Frontend

Navigate to the frontend directory:

```bash
cd ../frontend
```

#### Create and Deploy Frontend App

```bash
# Create the app
fly launch

# Choose app name: adcopysurge-frontend  
# Choose same region as backend
# Don't deploy yet - need to set API URL
```

#### Set Frontend Configuration

```bash
# Set API URL (use your backend app URL)
fly secrets set REACT_APP_API_BASE_URL="https://adcopysurge-backend.fly.dev"
fly secrets set REACT_APP_API_URL="https://adcopysurge-backend.fly.dev/api"

# Set Supabase configuration (same as backend)
fly secrets set REACT_APP_SUPABASE_URL="https://your-project-ref.supabase.co"
fly secrets set REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Optional: Analytics and monitoring
fly secrets set REACT_APP_GOOGLE_ANALYTICS_ID="your_ga_id"
fly secrets set REACT_APP_SENTRY_DSN="your_sentry_dsn"
```

#### Deploy Frontend

```bash
# Deploy the frontend
fly deploy

# Check deployment status
fly status
fly logs
```

## 🔧 Configuration Details

### Environment Variables

#### Required Backend Variables
- `SECRET_KEY` - JWT secret (generate with openssl)
- `DATABASE_URL` - Auto-set when attaching Postgres
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anon key
- `OPENAI_API_KEY` - OpenAI API key for AI features

#### Required Frontend Variables
- `REACT_APP_API_BASE_URL` - Backend API URL
- `REACT_APP_SUPABASE_URL` - Same as backend
- `REACT_APP_SUPABASE_ANON_KEY` - Same as backend

### Health Checks

Both apps include health checks:
- **Backend**: `GET /health` - Returns API status
- **Frontend**: `GET /health` - Returns nginx status

## 🔍 Monitoring & Debugging

### Check Application Status

```bash
# List all your apps
fly apps list

# Check app status
fly status --app adcopysurge-backend
fly status --app adcopysurge-frontend

# View logs
fly logs --app adcopysurge-backend
fly logs --app adcopysurge-frontend --follow

# Check secrets (don't show values)
fly secrets list --app adcopysurge-backend
```

### Scale Applications

```bash
# Scale backend (if needed)
fly scale count 2 --app adcopysurge-backend
fly scale memory 512 --app adcopysurge-backend

# Scale frontend (if needed)  
fly scale count 1 --app adcopysurge-frontend
fly scale memory 256 --app adcopysurge-frontend
```

### Database Management

```bash
# Connect to database
fly postgres connect --app adcopysurge-db

# Create database backup
fly postgres backup --app adcopysurge-db

# View database info
fly postgres info --app adcopysurge-db
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Python dependency installation fails
```
Error: Failed to build wheels for package
```
**Solution**: Check `constraints-py312.txt` and ensure Docker can access files:
```bash
# Rebuild with no cache
fly deploy --no-cache --app adcopysurge-backend
```

#### Database Connection Issues

**Issue**: Database connection refused
```
Error: could not connect to server: Connection refused
```
**Solution**:
```bash
# Check database status
fly status --app adcopysurge-db

# Verify database attachment
fly postgres list --app adcopysurge-backend

# Re-attach if needed
fly postgres detach --app adcopysurge-backend
fly postgres attach --app adcopysurge-backend adcopysurge-db
```

#### Frontend API Connection Issues

**Issue**: Frontend can't reach backend API
```
Error: Network Error / CORS issues
```
**Solution**:
```bash
# Verify backend URL in frontend
fly secrets list --app adcopysurge-frontend

# Update API URL if needed
fly secrets set REACT_APP_API_BASE_URL="https://adcopysurge-backend.fly.dev" --app adcopysurge-frontend

# Redeploy frontend
fly deploy --app adcopysurge-frontend
```

#### Memory Issues

**Issue**: App killed due to memory limit
```
Error: Process killed (OOM)
```
**Solution**:
```bash
# Scale memory up
fly scale memory 512 --app adcopysurge-backend
fly scale memory 256 --app adcopysurge-frontend
```

### Performance Optimization

#### Backend Optimization
- Use Redis for caching API responses
- Optimize database queries with indexes
- Use connection pooling (configured in database.py)
- Monitor with fly logs and fly metrics

#### Frontend Optimization  
- Static assets served via nginx with compression
- React build optimized for production
- CDN caching with proper headers

## 💰 Costs

Fly.io offers generous free tier:
- **Apps**: 3 shared-cpu-1x apps free
- **Database**: PostgreSQL with 1GB storage free
- **Redis**: 25MB free tier
- **Traffic**: 160GB/month free outbound

Paid plans start at $1.94/month for additional resources.

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app adcopysurge-backend --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  
  deploy-frontend:
    runs-on: ubuntu-latest  
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app adcopysurge-frontend --remote-only
        working-directory: ./frontend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## 🚀 Custom Domains

Add custom domains to your apps:

```bash
# Add domain to backend
fly certs create api.yourdomain.com --app adcopysurge-backend

# Add domain to frontend  
fly certs create app.yourdomain.com --app adcopysurge-frontend

# Update DNS records as instructed
# Update Supabase allowed origins
# Update CORS settings in backend
```

## 📞 Support & Next Steps

### Getting Help

1. **Fly.io Documentation**: [fly.io/docs](https://fly.io/docs)
2. **Community**: [community.fly.io](https://community.fly.io)
3. **Discord**: [Fly.io Discord](https://fly.io/discord)

### Post-Deployment Tasks

1. **Configure Supabase**: Add Fly.io URLs to Supabase allowed origins
2. **Test API endpoints**: Verify all functionality works
3. **Set up monitoring**: Configure logging and error tracking
4. **Configure custom domains**: Point your domains to Fly.io
5. **Set up backups**: Configure database backups

## ✅ Deployment Checklist

- [ ] Fly CLI installed and authenticated
- [ ] Backend deployed with secrets configured
- [ ] Database created and attached
- [ ] Frontend deployed with API URL configured
- [ ] Health checks passing
- [ ] Supabase configured with Fly.io URLs
- [ ] Domain names configured (optional)
- [ ] Monitoring set up
- [ ] Backups configured

## 🎉 You're Live!

Your AdCopySurge application is now running on Fly.io!

- **Frontend**: `https://adcopysurge-frontend.fly.dev`
- **Backend API**: `https://adcopysurge-backend.fly.dev`
- **API Docs**: `https://adcopysurge-backend.fly.dev/api/docs`

Your platform is ready to analyze ad copy with AI-powered insights! 🚀

---

**Need help?** Check the troubleshooting section above or reach out via the Fly.io community channels.
