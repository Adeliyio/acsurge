# Render Environment Variables Setup

This guide helps you configure all required environment variables for your AdCopySurge deployment on Render.

## 🔑 Required Environment Variables

### Backend Service (`adcopysurge-backend`)

#### Security & Authentication
```bash
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-32-character-minimum-secret-key-here

# JWT Configuration
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

#### Supabase Configuration
```bash
# Get these from your Supabase project dashboard
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase
```

#### AI Services
```bash
# OpenAI API Key (required for AI features)
OPENAI_API_KEY=sk-proj-your-openai-key-here
OPENAI_MAX_TOKENS=2000
OPENAI_RATE_LIMIT=100

# HuggingFace API Key (optional, for additional AI models)
HUGGINGFACE_API_KEY=hf_your-huggingface-key-here
```

#### Application Configuration
```bash
ENVIRONMENT=production
DEBUG=false
APP_NAME=AdCopySurge API
APP_VERSION=1.0.0
HOST=0.0.0.0
# PORT is automatically set by Render
```

#### CORS & Security
```bash
# Update with your actual Render URLs
CORS_ORIGINS=https://adcopysurge-frontend.onrender.com,http://localhost:3000,http://127.0.0.1:3000
ALLOWED_HOSTS=adcopysurge-backend.onrender.com,*.onrender.com,localhost,127.0.0.1
```

### Frontend Service (`adcopysurge-frontend`)

#### API Configuration
```bash
# This should match your backend service URL
REACT_APP_API_BASE_URL=https://adcopysurge-backend.onrender.com

# Alternative configuration
REACT_APP_API_URL=https://adcopysurge-backend.onrender.com/api
```

#### Supabase Configuration (same as backend)
```bash
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Build Configuration
```bash
NODE_ENV=production
GENERATE_SOURCEMAP=false
REACT_APP_ENVIRONMENT=production
```

## 🔧 Optional Environment Variables

### Email Configuration
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=AdCopySurge
```

### Payment Processing (Paddle)
```bash
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_API_KEY=your-paddle-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=production
PADDLE_API_URL=https://vendors.paddle.com/api

# Product IDs
PADDLE_BASIC_MONTHLY_ID=your-basic-monthly-product-id
PADDLE_PRO_MONTHLY_ID=your-pro-monthly-product-id
PADDLE_BASIC_YEARLY_ID=your-basic-yearly-product-id
PADDLE_PRO_YEARLY_ID=your-pro-yearly-product-id
```

### Monitoring & Error Tracking
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Performance Configuration
```bash
WORKERS=2
KEEP_ALIVE=2
MAX_CONNECTIONS=100
```

### Feature Flags
```bash
ENABLE_ANALYTICS=true
ENABLE_COMPETITOR_ANALYSIS=false
ENABLE_PDF_REPORTS=true
ENABLE_RATE_LIMITING=true
```

### Business Configuration
```bash
BASIC_PLAN_PRICE=49
PRO_PLAN_PRICE=99
FREE_TIER_LIMIT=5
BASIC_TIER_LIMIT=100
PRO_TIER_LIMIT=500
```

## 🚨 Automatically Set by Render

These variables are automatically injected by Render and don't need to be set manually:

```bash
# Database connection (from PostgreSQL service)
DATABASE_URL=postgresql://username:password@host:port/database

# Redis connection (from Redis service)
REDIS_URL=redis://username:password@host:port/database

# Port assignment (Render sets this automatically)
PORT=10000

# Render-specific variables
RENDER_EXTERNAL_URL=https://your-service.onrender.com
RENDER_EXTERNAL_HOSTNAME=your-service.onrender.com
```

## 📝 How to Set Environment Variables in Render

### Via Render Dashboard
1. Go to your service in the Render Dashboard
2. Click on the "Environment" tab
3. Click "Add Environment Variable"
4. Enter the key and value
5. Click "Save Changes"
6. Redeploy your service if needed

### Via `render.yaml` (for defaults)
Some non-secret values can be set in your `render.yaml` file:

```yaml
envVars:
  - key: ENVIRONMENT
    value: production
  - key: DEBUG
    value: false
  - key: WORKERS
    value: 2
```

### Security Best Practices
- ✅ Set sensitive values (API keys, secrets) only in Render Dashboard
- ✅ Use strong, randomly generated SECRET_KEY
- ✅ Rotate API keys regularly
- ❌ Never commit secrets to version control
- ❌ Don't include sensitive values in `render.yaml`

## 🔍 Validating Your Configuration

After setting environment variables, you can validate them by checking your application logs:

1. Deploy your application
2. Check the logs in Render Dashboard
3. Look for configuration validation messages during startup
4. Test API endpoints to ensure services are working

### Test Commands (via Render Shell)
```bash
# Test database connection
python -c "import os, psycopg2; print('DB OK' if psycopg2.connect(os.environ['DATABASE_URL']) else 'DB Failed')"

# Test Redis connection  
python -c "import os, redis; r=redis.from_url(os.environ['REDIS_URL']); print('Redis OK' if r.ping() else 'Redis Failed')"

# Test OpenAI API
python -c "import os, openai; openai.api_key=os.environ.get('OPENAI_API_KEY'); print('OpenAI OK' if openai.api_key else 'OpenAI Key Missing')"

# Check configuration loading
python -c "from app.core.config import settings; print(f'Environment: {settings.ENVIRONMENT}, Debug: {settings.DEBUG}')"
```

## 🚀 Ready to Deploy?

Once you have all the required environment variables set:

1. Make sure your `render.yaml` is configured correctly
2. Push your code to your GitHub repository
3. Deploy using Render's Blueprint feature
4. Monitor the deployment logs
5. Test your deployed application

Your AdCopySurge application should be fully operational on Render!
