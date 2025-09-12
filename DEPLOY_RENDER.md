# AdCopySurge Render Deployment Guide

Deploy your AdCopySurge AI-powered ad copy analysis platform to Render cloud in minutes.

## 🚀 Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/adcopysurge)

## 📋 Prerequisites

1. **Render Account**: [Sign up for free](https://render.com)
2. **GitHub Repository**: Your AdCopySurge code should be in a GitHub repository
3. **Supabase Account**: [Create a Supabase project](https://supabase.com) for authentication
4. **OpenAI API Key**: [Get your API key](https://platform.openai.com/api-keys)
5. **Email Account**: For transactional emails (Gmail or similar)

## 🏗️ Architecture Overview

Your Render deployment will include:

- **PostgreSQL Database** (`adcopysurge-db`) - For application data
- **Redis Cache** (`adcopysurge-redis`) - For session storage and caching
- **Backend API** (`adcopysurge-backend`) - FastAPI application with AI processing
- **Frontend** (`adcopysurge-frontend`) - React static site

## 📦 Deployment Steps

### 1. Repository Setup

Ensure your repository has these Render configuration files:
- `render.yaml` - Infrastructure as Code configuration
- `backend/Dockerfile.render` - Backend container configuration
- `backend/build.sh` - Build script with dependency installation
- `backend/start.sh` - Production startup script

### 2. Deploy to Render

#### Option A: One-Click Deploy
Click the "Deploy to Render" button above and follow the prompts.

#### Option B: Manual Deploy
1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will detect the `render.yaml` file automatically
6. Click "Apply" to start deployment

### 3. Configure Environment Variables

In the Render Dashboard, set these environment variables for your backend service:

#### Required Variables ⚠️

```bash
# Security (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-32-character-minimum-secret-key-here

# Supabase Authentication
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services
OPENAI_API_KEY=sk-proj-your-openai-key-here
```

#### Optional but Recommended

```bash
# Email Configuration (for transactional emails)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
MAIL_FROM=noreply@yourdomain.com

# Monitoring & Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Payment Processing (Paddle)
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_API_KEY=your-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=production

# AI Configuration
HUGGINGFACE_API_KEY=hf_your-huggingface-key
OPENAI_MAX_TOKENS=2000
OPENAI_RATE_LIMIT=100
```

### 4. Set Frontend Environment Variables

For the frontend service, set these variables:

```bash
# API Configuration (automatically set by Render)
REACT_APP_API_BASE_URL=https://adcopysurge-backend.onrender.com

# Supabase Configuration (same as backend)
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Environment
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### 5. Configure Custom Domains (Optional)

1. In Render Dashboard, go to your service → Settings
2. Scroll to "Custom Domains"  
3. Add your domain (e.g., `api.yourdomain.com` for backend, `app.yourdomain.com` for frontend)
4. Follow Render's DNS configuration instructions
5. Update CORS settings with your custom domains

## 🔧 Configuration Details

### Database Configuration

Render automatically:
- Creates PostgreSQL database with SSL enabled
- Generates `DATABASE_URL` environment variable  
- Handles connection pooling and backups
- Provides database GUI access

### Redis Configuration

Render automatically:
- Creates Redis instance for caching
- Generates `REDIS_URL` environment variable
- Handles memory management and persistence

### SSL & Security

Render automatically provides:
- Free SSL certificates for all services
- HTTPS redirects
- DDoS protection
- Security headers

## 🔍 Health Checks & Monitoring

### Built-in Health Endpoints

- **Basic Health**: `GET /health` - Returns service status
- **Detailed Health**: `GET /healthz` - Database, Redis, and AI service checks
- **API Documentation**: `GET /api/docs` - Interactive API documentation

### Monitoring Render Services

1. **Logs**: View real-time logs in Render Dashboard
2. **Metrics**: Built-in CPU, memory, and request metrics
3. **Alerts**: Configure uptime monitoring and alerts
4. **Events**: Deployment and service event history

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Python dependency installation fails
```bash
Error: Failed to build wheels for package
```
**Solution**: Check `constraints-py312.txt` for compatible versions, or add to `build.sh`:
```bash
pip install --upgrade pip setuptools wheel
pip install --no-cache-dir --prefer-binary package-name
```

**Issue**: Node.js build fails
```bash
Error: npm ERR! code ELIFECYCLE
```
**Solution**: Check Node.js version in frontend build, ensure dependencies are in `package.json`

#### Runtime Errors

**Issue**: Database connection fails
```bash
Error: could not connect to server: Connection refused
```
**Solution**: 
1. Check DATABASE_URL environment variable is set
2. Verify PostgreSQL service is running in Render Dashboard
3. Check database connection in startup script logs

**Issue**: CORS errors in browser
```bash
Error: Access to fetch blocked by CORS policy
```
**Solution**:
1. Add frontend URL to CORS_ORIGINS in backend environment variables
2. Update `render.yaml` with correct frontend URL
3. Restart backend service after changing environment variables

**Issue**: 502 Bad Gateway
```bash
Error: The server returned a 502 Bad Gateway error
```
**Solution**:
1. Check backend service health endpoint: `/health`
2. Review application logs for startup errors
3. Verify PORT environment variable is being used correctly
4. Check if Gunicorn workers are starting properly

### Database Issues

**Issue**: Migration failures
```bash
Error: alembic.util.exc.CommandError: Can't locate revision
```
**Solution**:
```bash
# Access Render Shell and run:
python -m alembic stamp head
python -m alembic revision --autogenerate -m "Initial migration"  
python -m alembic upgrade head
```

**Issue**: Database connection SSL errors
```bash
Error: server does not support SSL, but SSL was required
```
**Solution**: Render PostgreSQL requires SSL. Ensure your database URL includes `?sslmode=require`

### Performance Issues

**Issue**: Slow API responses
**Solution**: 
1. Check database query performance
2. Enable Redis caching for frequently accessed data
3. Optimize AI processing with request queuing
4. Consider upgrading Render plan for more resources

**Issue**: Memory limit exceeded
```bash
Error: Process killed (OOM)
```
**Solution**:
1. Reduce Gunicorn workers in `start.sh`
2. Implement request-based scaling
3. Optimize memory usage in AI processing
4. Upgrade to higher Render plan

### AI Integration Issues

**Issue**: OpenAI API errors
```bash
Error: openai.error.RateLimitError
```
**Solution**:
1. Implement exponential backoff retry logic
2. Add request queuing for high traffic
3. Check OpenAI API usage limits and billing

**Issue**: HuggingFace model loading fails  
```bash
Error: OSError: Can't load model
```
**Solution**: 
1. Pre-download models in Docker build stage
2. Use HuggingFace API instead of local models
3. Implement fallback to rule-based analysis

## 📊 Performance Optimization

### Backend Optimization

1. **Connection Pooling**: Configured automatically via SQLAlchemy
2. **Worker Processes**: Adjusted based on available memory
3. **Request Timeouts**: Set to 120s for AI processing
4. **Caching**: Redis for session data and API responses

### Frontend Optimization  

1. **Static Assets**: Served via Render's CDN
2. **Code Splitting**: Automatic via Create React App
3. **Compression**: Gzip enabled automatically
4. **Caching**: Browser caching headers set

### Database Optimization

1. **Indexing**: Applied to frequently queried columns
2. **Connection Limits**: Managed by Render PostgreSQL
3. **Query Optimization**: Reviewed via database performance tab

## 🔄 CI/CD Integration

### Automatic Deployments

Render automatically deploys when you push to your main branch:

1. **Backend**: Triggers on changes to `backend/` directory
2. **Frontend**: Triggers on changes to `frontend/` directory  
3. **Infrastructure**: Triggers on changes to `render.yaml`

### Deploy Hooks

Configure in `render.yaml`:
```yaml
deployHooks:
  - type: pre-deploy  
    command: echo "Starting deployment..."
  - type: post-deploy
    command: python scripts/post_deploy_tasks.py
```

### Environment-Specific Deployments

1. **Staging**: Deploy feature branches to staging environment
2. **Production**: Deploy main branch to production
3. **Review Apps**: Automatic deployments for pull requests

## 📞 Support & Next Steps

### Getting Help

1. **Render Documentation**: [docs.render.com](https://docs.render.com)
2. **Community**: [Render Community Forum](https://community.render.com)
3. **Support**: Available via Render Dashboard for paid plans

### Post-Deployment Tasks

1. **Configure Supabase**: Add Render URLs to Supabase allowed origins
2. **Setup Monitoring**: Configure uptime monitoring and alerts
3. **Custom Domain**: Point your domain to Render services
4. **SSL Certificate**: Automatic, but verify custom domains
5. **Performance Testing**: Load test your deployed application

### Scaling Your Application

1. **Horizontal Scaling**: Add more web service instances  
2. **Database Scaling**: Upgrade PostgreSQL plan or add read replicas
3. **CDN**: Render includes CDN for static assets
4. **Background Jobs**: Add worker services for heavy processing

## 🔐 Security Best Practices

### Environment Variables
- Use Render's environment variable management
- Never commit secrets to version control
- Rotate API keys regularly

### Database Security
- Render PostgreSQL includes SSL by default
- Use connection pooling to prevent connection exhaustion
- Regular backups included automatically

### Application Security
- CORS configured for specific origins only
- Security headers enabled via middleware
- Input validation on all API endpoints
- Rate limiting implemented for API abuse prevention

---

## 🚀 Ready to Deploy?

1. Click the **Deploy to Render** button at the top of this guide
2. Configure your environment variables
3. Wait for deployment to complete (~10-15 minutes)  
4. Test your application at the provided Render URLs
5. Configure custom domains if needed

Your AdCopySurge platform will be live and ready to analyze ad copy with AI-powered insights!

**Need help?** Check the troubleshooting section above or reach out to the development team.
