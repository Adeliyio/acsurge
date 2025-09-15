# 🚀 AdCopySurge Production Deployment - www.adcopysurge.com

**Domain:** www.adcopysurge.com (Frontend)  
**API Domain:** api.adcopysurge.com (Backend)  
**VPS:** v44954.datalix.de  
**Status:** Updated for your actual domain setup  

## 📋 **Domain Architecture**

```
Internet Traffic Flow:
├── www.adcopysurge.com (Frontend) → Netlify
├── api.adcopysurge.com (Backend API) → Datalix VPS (v44954.datalix.de)
└── adcopysurge.com (Redirect to www) → Netlify
```

## 🔧 **Step 1: DNS Configuration**

### **Add API Subdomain**
You need to add a DNS A record for the API subdomain:

**In your DNS provider (where adcopysurge.com is registered):**
```
Type: A
Host: api
Points to: [IP address of v44954.datalix.de]
TTL: 300 (or default)
```

**Find your VPS IP address:**
```bash
# SSH into your VPS first
ssh root@v44954.datalix.de

# Then get the public IP
curl ifconfig.me
# Copy this IP address for the DNS record above
```

### **Verify DNS Setup**
```bash
# Test that api.adcopysurge.com points to your VPS
nslookup api.adcopysurge.com
# Should return your VPS IP address
```

## 📦 **Step 2: VPS Setup (Same as Before)**

### 2.1 Access Your Server
```bash
# SSH into your VPS
ssh root@v44954.datalix.de

# Create deploy user if not exists
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 2.2 System Updates
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install requirements
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    build-essential git redis-server nginx certbot python3-certbot-nginx \
    postgresql-client htop curl unzip
```

## 🌐 **Step 3: Application Deployment**

### 3.1 Clone Repository
```bash
cd /home/deploy
git clone https://github.com/yourusername/adcopysurge.git
cd adcopysurge/backend
```

### 3.2 Setup Environment
```bash
# Create Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3 Configure Environment Variables
```bash
# Copy and edit environment file
cp ../.env.production.template .env
nano .env
```

**Update these values in .env:**
```bash
# Security - Generate a secure key
SECRET_KEY=your-super-secure-32-character-secret-key

# Database - Your Supabase connection
DATABASE_URL=postgresql+psycopg2://postgres.your-ref:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# API Keys - Required for functionality
OPENAI_API_KEY=your-openai-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Already configured for your domain:
SERVER_NAME=api.adcopysurge.com
CORS_ORIGINS=https://www.adcopysurge.com,https://adcopysurge.com
```

## 🔒 **Step 4: SSL Certificate Setup**

### 4.1 Install SSL for API Subdomain
```bash
# This will automatically configure SSL for api.adcopysurge.com
sudo certbot --nginx -d api.adcopysurge.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 4.2 Setup Nginx (Already Configured)
```bash
# Copy the updated nginx config (already points to api.adcopysurge.com)
sudo cp /home/deploy/adcopysurge/deploy/nginx.conf /etc/nginx/sites-available/adcopysurge

# Enable the site
sudo ln -s /etc/nginx/sites-available/adcopysurge /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

## ⚙️ **Step 5: Setup Services**

### 5.1 Install Systemd Service
```bash
# Copy service file
sudo cp /home/deploy/adcopysurge/deploy/gunicorn.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable gunicorn.service
sudo systemctl start gunicorn.service

# Check status
sudo systemctl status gunicorn.service
```

## 🌍 **Step 6: Update Netlify Configuration**

The `netlify.toml` has been updated to proxy API calls to **api.adcopysurge.com**.

### 6.1 Netlify Environment Variables
**Go to:** Netlify Dashboard → Your Site → Site Settings → Environment Variables

**Set these variables:**
```
REACT_APP_API_BASE_URL=/api
REACT_APP_SUPABASE_URL=https://tqzlsajhhtkhljdbjkyg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxemxzYWpoaHRraGxqZGJqa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTYzOTMsImV4cCI6MjA3MjU3MjM5M30.0uI56qJGE5DQwEvcfYlcOIz2NGC-msMVrTRw6d-RQuI
REACT_APP_ENVIRONMENT=production
```

### 6.2 Deploy Frontend
Push your updated code to trigger a Netlify deployment with the new API proxy configuration.

## 🧪 **Step 7: Testing & Validation**

### 7.1 Test API Directly
```bash
# Test API health
curl https://api.adcopysurge.com/health
# Expected: {"status": "healthy", "timestamp": "..."}

# Test root endpoint
curl https://api.adcopysurge.com/
# Expected: {"message": "AdCopySurge API is running", ...}

# Test analysis endpoint
curl -X POST "https://api.adcopysurge.com/api/ads/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Test Headline",
    "body_text": "Test content",
    "cta": "Click Here",
    "platform": "facebook"
  }'
```

### 7.2 Test Frontend → Backend Connection
1. Visit **https://www.adcopysurge.com**
2. Try creating an ad analysis
3. Check browser Network tab - API calls should go to `/api/*` and proxy to `api.adcopysurge.com`
4. Verify no CORS errors in console

## 🎯 **Architecture Benefits**

### **With Your Domain Setup:**
- ✅ **Professional URLs:** www.adcopysurge.com for users, api.adcopysurge.com for API
- ✅ **Clean Separation:** Frontend and backend have distinct subdomains
- ✅ **SSL Enabled:** Both domains will have valid SSL certificates
- ✅ **SEO Friendly:** www.adcopysurge.com is perfect for search engines
- ✅ **API Versioning:** Easy to add v1, v2 API versions later

## 🔄 **Quick Deployment Summary**

**Your deployment is simpler because you already have the domain!**

1. **Add DNS A record:** `api.adcopysurge.com → VPS IP`
2. **Deploy backend to VPS** (follow steps 2-5)
3. **Get SSL certificate:** `certbot --nginx -d api.adcopysurge.com`
4. **Deploy frontend:** Push code to trigger Netlify build
5. **Test end-to-end:** Verify www.adcopysurge.com can call api.adcopysurge.com

## 🆘 **Troubleshooting**

### **Common Issues:**

**1. DNS Not Propagating**
```bash
# Check DNS propagation
nslookup api.adcopysurge.com
# If it doesn't resolve, wait 5-10 minutes after adding DNS record
```

**2. SSL Certificate Issues**
```bash
# Try certbot with staging first
sudo certbot --nginx -d api.adcopysurge.com --staging

# Then get real certificate
sudo certbot --nginx -d api.adcopysurge.com
```

**3. CORS Errors**
```bash
# Check backend CORS configuration
grep CORS_ORIGINS /home/deploy/adcopysurge/backend/.env
# Should include: https://www.adcopysurge.com
```

## 🎉 **Success Criteria**

**Your deployment is successful when:**
- ✅ `https://api.adcopysurge.com/health` returns healthy status
- ✅ `https://www.adcopysurge.com` loads your frontend
- ✅ Frontend can create ad analyses without errors
- ✅ No CORS errors in browser console
- ✅ SSL certificates working for both domains

---

**This setup gives you a professional, production-ready deployment using your existing www.adcopysurge.com domain!** 🚀