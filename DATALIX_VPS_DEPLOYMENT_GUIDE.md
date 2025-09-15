# 🚀 AdCopySurge Datalix VPS Deployment Guide

**Server:** v44954.datalix.de  
**Status:** Updated for production deployment with critical fixes  
**Last Updated:** September 15, 2025

## 📋 Pre-Deployment Checklist

### ✅ **Critical Fixes Applied**
- [x] Tool architecture consolidated (unified SDK)
- [x] Netlify configuration updated to point to VPS
- [x] Environment variables standardized
- [x] Security configurations hardened
- [ ] Database schema validated (next step)
- [ ] SSL certificate configured (next step)

### 📝 **Required Information**
Before starting deployment, gather:
- **Custom domain** (if you have one) or use `v44954.datalix.de`
- **Supabase database password** for connection string
- **OpenAI API key** (required for core functionality)
- **Netlify site URL** (for CORS configuration)

## 🔧 Step 1: VPS Initial Setup

### 1.1 Access Your Server
```bash
# SSH into your Datalix VPS
ssh root@v44954.datalix.de

# Create deploy user (recommended)
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 1.2 System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    build-essential git redis-server nginx certbot python3-certbot-nginx \
    postgresql-client htop curl unzip
```

### 1.3 Configure Firewall
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📦 Step 2: Deploy Application

### 2.1 Clone Repository
```bash
# Clone to deploy directory
cd /home/deploy
git clone https://github.com/yourusername/adcopysurge.git
cd adcopysurge/backend
```

### 2.2 Setup Python Environment
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.3 Configure Environment Variables
```bash
# Copy template and edit
cp ../.env.production.template .env
nano .env
```

**Required Changes in .env:**
```bash
# Update these with your actual values:
SECRET_KEY=your-super-secure-32-character-secret-key-here
DATABASE_URL=postgresql+psycopg2://postgres.your-ref:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=https://your-netlify-site.netlify.app
SERVER_NAME=v44954.datalix.de  # Or your custom domain
```

### 2.4 Test Application
```bash
# Test the app starts correctly
source venv/bin/activate
python main_launch_ready.py

# Should see: "Uvicorn running on http://0.0.0.0:8000"
# Press Ctrl+C to stop
```

## 🌐 Step 3: Configure Nginx

### 3.1 Setup Nginx Configuration
```bash
# Copy nginx config
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/adcopysurge

# If you have a custom domain, update the config:
sudo sed -i 's/v44954\.datalix\.de/your-custom-domain.com/g' /etc/nginx/sites-available/adcopysurge

# Enable the site
sudo ln -s /etc/nginx/sites-available/adcopysurge /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3.2 Create Required Directories
```bash
# Create runtime directories
sudo mkdir -p /run/adcopysurge /var/log/adcopysurge
sudo chown www-data:www-data /run/adcopysurge /var/log/adcopysurge
```

## 🔧 Step 4: Setup Systemd Service

### 4.1 Install Service File
```bash
# Copy and enable gunicorn service
sudo cp ../deploy/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn.service
```

### 4.2 Start Services
```bash
# Start the backend service
sudo systemctl start gunicorn.service

# Check status
sudo systemctl status gunicorn.service

# If there are errors, check logs:
sudo journalctl -u gunicorn.service -f
```

## 🔒 Step 5: SSL Certificate (Recommended)

### 5.1 Option A: Custom Domain (Recommended)
```bash
# If you have a custom domain pointing to v44954.datalix.de
sudo certbot --nginx -d your-custom-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5.2 Option B: Use Datalix Hostname
```bash
# For v44954.datalix.de (may not work with Let's Encrypt)
# Consider using a custom domain instead
```

## 🌍 Step 6: Update Netlify Configuration

### 6.1 Update Environment Variables in Netlify Dashboard

**Go to:** Netlify Dashboard → Your Site → Site Settings → Environment Variables

**Add/Update:**
```
REACT_APP_API_BASE_URL=/api
REACT_APP_SUPABASE_URL=https://tqzlsajhhtkhljdbjkyg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxemxzYWpoaHRraGxqZGJqa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTYzOTMsImV4cCI6MjA3MjU3MjM5M30.0uI56qJGE5DQwEvcfYlcOIz2NGC-msMVrTRw6d-RQuI
REACT_APP_ENVIRONMENT=production
```

### 6.2 Deploy Frontend
The `netlify.toml` has been updated to proxy API calls to your VPS. Simply push your changes to trigger a new deploy.

## 🧪 Step 7: Validation & Testing

### 7.1 Backend Health Checks
```bash
# Test backend directly
curl http://v44954.datalix.de/health
# Expected: {"status": "healthy", "timestamp": "..."}

curl http://v44954.datalix.de/
# Expected: {"message": "AdCopySurge API is running", "version": "1.0.0", "status": "MVP Ready"}
```

### 7.2 API Endpoint Tests
```bash
# Test analyze endpoint
curl -X POST "http://v44954.datalix.de/api/ads/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Test Headline",
    "body_text": "This is a test ad copy",
    "cta": "Click Now",
    "platform": "facebook"
  }'
```

### 7.3 Frontend-Backend Connection
1. Visit your Netlify site
2. Try creating an ad analysis
3. Check browser Network tab for successful API calls
4. Verify no CORS errors in console

## 🔄 Step 8: Continuous Deployment

### 8.1 Create Deploy Script
```bash
# Create deployment script
cat > /home/deploy/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project
cd /home/deploy/adcopysurge

# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Restart services
sudo systemctl restart gunicorn.service

# Check status
sudo systemctl is-active gunicorn.service

echo "✅ Deployment completed!"
EOF

chmod +x /home/deploy/deploy.sh
```

### 8.2 Future Deployments
```bash
# Run deployment script
/home/deploy/deploy.sh
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. Service Won't Start**
```bash
# Check logs
sudo journalctl -u gunicorn.service -n 50
sudo journalctl -u nginx -n 50

# Check file permissions
ls -la /home/deploy/adcopysurge/backend
```

**2. Frontend Can't Connect to Backend**
```bash
# Test nginx proxy
curl -H "Host: your-domain.com" http://127.0.0.1/api/
# Should proxy to backend

# Check CORS settings in backend .env
grep CORS_ORIGINS /home/deploy/adcopysurge/backend/.env
```

**3. Database Connection Issues**
```bash
# Test database connection
cd /home/deploy/adcopysurge/backend
source venv/bin/activate
python -c "
from sqlalchemy import create_engine
import os
from decouple import config
engine = create_engine(config('DATABASE_URL'))
conn = engine.connect()
print('Database connection successful')
"
```

**4. Tools SDK Import Errors**
```bash
# Check if tools SDK is properly initialized
cd /home/deploy/adcopysurge/backend
source venv/bin/activate
python -c "
from packages.tools_sdk.tools import register_all_tools
register_all_tools()
print('Tools SDK initialized successfully')
"
```

## 📊 Monitoring Commands

### Service Status
```bash
# Check all services
sudo systemctl status gunicorn.service nginx redis

# Check resource usage
htop
df -h
free -m
```

### Log Monitoring
```bash
# Follow application logs
sudo tail -f /var/log/adcopysurge/error.log
sudo tail -f /var/log/nginx/adcopysurge_error.log

# Follow service logs
sudo journalctl -u gunicorn.service -f
```

## ✅ Success Criteria

**Before declaring production-ready:**
- [ ] Backend API responds to health checks
- [ ] All analysis endpoints return 200 status
- [ ] Frontend can successfully communicate with backend
- [ ] No CORS errors in browser console  
- [ ] SSL certificate installed and working
- [ ] Services automatically restart on reboot
- [ ] Basic monitoring and log rotation configured

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# Revert to previous code version
cd /home/deploy/adcopysurge
git checkout HEAD~1

# Restart services
sudo systemctl restart gunicorn.service
```

### Emergency Disable
```bash
# Stop all services
sudo systemctl stop gunicorn.service
sudo systemctl stop nginx

# Show maintenance page
echo "Maintenance in progress" | sudo tee /var/www/html/index.html
```

---

## 📞 Support Information

**VPS Details:**
- **Hostname:** v44954.datalix.de
- **Provider:** Datalix
- **OS:** Ubuntu 22.04 (recommended)
- **Management:** Via Datalix control panel

**Key Files:**
- **Backend:** `/home/deploy/adcopysurge/backend/`
- **Config:** `/home/deploy/adcopysurge/backend/.env`
- **Logs:** `/var/log/adcopysurge/`
- **Nginx:** `/etc/nginx/sites-available/adcopysurge`
- **Service:** `/etc/systemd/system/gunicorn.service`

This guide has been updated with the critical fixes identified in the audit. Your application should now be ready for production deployment!