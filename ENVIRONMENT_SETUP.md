# Environment Configuration Guide

## Overview

AdCopySurge uses environment variables for configuration management. All sensitive settings like API keys, database URLs, and secret keys must be properly configured before running the application.

## ⚠️ Security Notice

**NEVER commit sensitive environment variables to version control.** All production secrets should be:
- Stored in `backend/.env` (for local development)  
- Set as environment variables in deployment platforms
- Managed through secure secret management systems in production

## Required Environment Variables

The following environment variables are **required** and must be set:

### Security
- `SECRET_KEY`: JWT signing key (minimum 32 characters, use a cryptographically secure random string)
- `DATABASE_URL`: PostgreSQL database connection string

### Example for Development
```bash
# In backend/.env file
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
DATABASE_URL=sqlite:///./adcopysurge.db
```

### Example for Production
```bash
# Set as environment variables in deployment platform
SECRET_KEY=prod-cryptographically-secure-random-key-min-32-characters-long
DATABASE_URL=postgresql://user:password@localhost:5432/adcopysurge_prod
```

## Optional Environment Variables

### Application Settings
- `APP_NAME`: Application name (default: "AdCopySurge")
- `APP_VERSION`: Application version (default: "1.0.0")
- `ENVIRONMENT`: Environment type - development/staging/production (default: "development")
- `DEBUG`: Enable debug mode (default: True)
- `HOST`: Host to bind to (default: "127.0.0.1")
- `PORT`: Port to bind to (default: 8000)

### Database & Caching
- `REDIS_URL`: Redis connection URL (default: "redis://localhost:6379/0")

### AI Services
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `HUGGINGFACE_API_KEY`: HuggingFace API key for additional AI models

### Email Configuration
- `SMTP_SERVER`: SMTP server host (default: "smtp.gmail.com")
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_USERNAME`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `MAIL_FROM`: Default from email (default: "noreply@adcopysurge.com")

### Payment Processing (Paddle)
- `PADDLE_VENDOR_ID`: Paddle vendor ID
- `PADDLE_API_KEY`: Paddle API key
- `PADDLE_WEBHOOK_SECRET`: Paddle webhook secret
- `PADDLE_ENVIRONMENT`: sandbox or production (default: "sandbox")

### Monitoring & Logging
- `SENTRY_DSN`: Sentry DSN for error tracking
- `SENTRY_ENVIRONMENT`: Sentry environment identifier
- `LOG_LEVEL`: Logging level (default: "info")

## Setup Instructions

### 1. Development Setup

```bash
# 1. Navigate to the backend directory
cd backend/

# 2. Create your .env file from the example
cp .env.example .env

# 3. Edit the .env file and set required variables
nano .env  # or your preferred editor

# 4. Ensure minimum required variables are set:
#    - SECRET_KEY (32+ characters)
#    - DATABASE_URL

# 5. Test configuration loading
python -c "from app.core.config import settings; print('✅ Configuration loaded successfully!')"
```

### 2. Production Deployment

#### Option A: Environment File (Digital Ocean, VPS)
```bash
# Create .env file on server
sudo nano /var/www/adcopysurge/backend/.env

# Set proper permissions
sudo chown www-data:www-data /var/www/adcopysurge/backend/.env
sudo chmod 600 /var/www/adcopysurge/backend/.env
```

#### Option B: System Environment Variables (Railway, Heroku)
Set environment variables directly in your deployment platform:
- Railway: Project Settings → Variables
- Heroku: Config Vars in dashboard
- Docker: Pass as `-e` flags or environment section in docker-compose

#### Option C: Docker Deployment
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    # OR use env_file
    env_file:
      - backend/.env
```

### 3. Environment Validation

Run the configuration test to ensure all required variables are loaded:

```bash
cd backend/
python -c "
import sys
sys.path.insert(0, '.')
from app.core.config import settings

print('🔍 Validating configuration...')
print(f'✅ SECRET_KEY: {\"✓\" if settings.SECRET_KEY and len(settings.SECRET_KEY) >= 32 else \"✗ Missing or too short\"}')
print(f'✅ DATABASE_URL: {\"✓\" if settings.DATABASE_URL else \"✗ Missing\"}')
print(f'✅ Environment: {settings.ENVIRONMENT}')
print(f'✅ Debug mode: {settings.DEBUG}')
print('🎉 Configuration validation complete!')
"
```

## Production Security Checklist

- [ ] `SECRET_KEY` is at least 32 characters and cryptographically secure
- [ ] `DATABASE_URL` points to production database (not localhost)
- [ ] `DEBUG` is set to `False`
- [ ] All API keys are properly secured and not in version control
- [ ] `.env` file has restricted permissions (600) in production
- [ ] SSL/TLS is enabled for database and Redis connections
- [ ] Environment variables are not logged in application output

## Troubleshooting

### "ValidationError: Field required" for SECRET_KEY or DATABASE_URL

This error means the required environment variables are not being loaded. Check:

1. **File Location**: Ensure `.env` file is in the `backend/` directory
2. **File Permissions**: Ensure the application can read the `.env` file
3. **Syntax**: Ensure no quotes around values unless needed
4. **Working Directory**: Ensure the application is started from the correct directory

### Configuration Not Loading in Production

1. **Check working directory**: Gunicorn/systemd should start from the backend directory
2. **Verify environment file path**: Ensure EnvironmentFile points to correct path
3. **Check file permissions**: Ensure the service user can read the .env file
4. **Test manually**: SSH into server and test configuration loading

### Example Working Directory Check
```bash
# In production, verify working directory is correct
pwd  # Should be /var/www/adcopysurge/backend
ls -la .env  # Should show the .env file

# Test configuration loading
python -c "from app.core.config import settings; print(settings.SECRET_KEY[:8] + '...')"
```

## Environment File Structure

The `.env` file should follow this format:
```bash
# Comments start with #
VARIABLE_NAME=value_without_quotes
SECRET_KEY=your-secret-key-here

# For values with spaces, use quotes
MAIL_FROM_NAME="AdCopySurge Team"

# Boolean values
DEBUG=true
ENABLE_ANALYTICS=false

# Numeric values  
PORT=8000
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Support

If you encounter issues with environment configuration:

1. Check the application logs for specific error messages
2. Validate your `.env` file syntax and permissions
3. Test configuration loading manually as shown above
4. Review the deployment-specific setup for your platform

For development questions, ensure you're following the exact setup steps and have all required dependencies installed.
