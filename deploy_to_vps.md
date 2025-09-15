# 🚀 Deploy AdCopySurge to VPS - Command Guide

**VPS:** v44954.datalix.de (46.247.108.207)  
**Domain:** api.adcopysurge.com  
**Status:** Ready to deploy

## 📋 **Pre-Deployment Check**
- ✅ DNS configured: api.adcopysurge.com → 46.247.108.207
- ✅ Code pushed to GitHub
- ✅ All fixes applied and tested

## 🔧 **Step 1: SSH into VPS and Initial Setup**

```bash
# SSH into your VPS
ssh root@v44954.datalix.de

# Create deploy user (if not exists)
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    build-essential git redis-server nginx certbot python3-certbot-nginx \
    postgresql-client htop curl unzip
```

## 📦 **Step 2: Clone and Setup Application**

```bash
# Clone your repository
cd /home/deploy
git clone https://github.com/Adeliyio/acsurge.git adcopysurge
cd adcopysurge/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

## ⚙️ **Step 3: Configure Environment**

```bash
# Copy environment template
cp ../.env.production.template .env

# Edit environment file
nano .env
```

**Update these values in .env (REQUIRED):**
```bash
# Generate secure secret key (32+ characters)
SECRET_KEY=your-super-secure-secret-key-change-this-now

# Your Supabase database URL (get from Supabase dashboard)
DATABASE_URL=postgresql+psycopg2://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# OpenAI API Key (get from OpenAI dashboard)
OPENAI_API_KEY=your-openai-api-key

# Supabase Service Role Key (get from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# The rest are already configured for your domain
```

## 🌐 **Step 4: Setup Nginx**

```bash
# Create runtime directories
sudo mkdir -p /run/adcopysurge /var/log/adcopysurge
sudo chown www-data:www-data /run/adcopysurge /var/log/adcopysurge

# Copy nginx configuration
sudo cp /home/deploy/adcopysurge/deploy/nginx.conf /etc/nginx/sites-available/adcopysurge

# Enable the site
sudo ln -s /etc/nginx/sites-available/adcopysurge /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 **Step 5: Setup SSL Certificate**

```bash
# Get SSL certificate for api.adcopysurge.com
sudo certbot --nginx -d api.adcopysurge.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## ⚙️ **Step 6: Setup Systemd Service**

```bash
# Copy service file
sudo cp /home/deploy/adcopysurge/deploy/gunicorn.service /etc/systemd/system/

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable gunicorn.service
sudo systemctl start gunicorn.service

# Check service status
sudo systemctl status gunicorn.service
```

## 🧪 **Step 7: Test Deployment**

```bash
# Test local backend
curl http://localhost:8000/health
# Should return: {"status": "healthy", ...}

# Test through nginx
curl http://46.247.108.207/health
# Should return: {"status": "healthy", ...}

# Test with domain (after SSL setup)
curl https://api.adcopysurge.com/health
# Should return: {"status": "healthy", ...}

# Test API endpoint
curl -X POST "https://api.adcopysurge.com/api/ads/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Test Headline",
    "body_text": "This is test content",
    "cta": "Click Now",
    "platform": "facebook"
  }'
```

## 🔄 **Step 8: Setup Redis (if needed)**

```bash
# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

## 📊 **Step 9: Monitoring Commands**

```bash
# Check all services status
sudo systemctl status gunicorn.service nginx redis-server

# View application logs
sudo journalctl -u gunicorn.service -f

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
htop
```

## 🚨 **Troubleshooting Commands**

```bash
# If gunicorn service fails to start
sudo journalctl -u gunicorn.service -n 50

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test application directly
cd /home/deploy/adcopysurge/backend
source venv/bin/activate
python main_launch_ready.py

# Check file permissions
ls -la /home/deploy/adcopysurge/backend/
ls -la /run/adcopysurge/
```

## ✅ **Success Criteria**

**Your deployment is successful when:**
- ✅ `sudo systemctl status gunicorn.service` shows "active (running)"
- ✅ `curl https://api.adcopysurge.com/health` returns healthy status
- ✅ SSL certificate is installed and working
- ✅ No errors in `sudo journalctl -u gunicorn.service`

## 🆘 **Need Help?**

**Common Issues:**
1. **Service won't start:** Check logs with `sudo journalctl -u gunicorn.service`
2. **Permission errors:** Check file ownership and permissions
3. **SSL issues:** Make sure domain points to correct IP
4. **Database errors:** Verify DATABASE_URL in .env file

## 🔄 **Future Deployments**

After initial setup, future deployments are simple:

```bash
# SSH into VPS
ssh deploy@v44954.datalix.de

# Pull latest code
cd /home/deploy/adcopysurge
git pull origin main

# Update dependencies (if needed)
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Restart service
sudo systemctl restart gunicorn.service

# Check status
sudo systemctl status gunicorn.service
```

---

**You're now ready to deploy! Start with Step 1 above.** 🚀