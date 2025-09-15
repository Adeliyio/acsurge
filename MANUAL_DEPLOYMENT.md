# AdCopySurge Manual VPS Deployment Guide

**Server Details:**
- IP: 46.247.108.207
- Domain: api.adcopysurge.com
- Login: root / nnDaU6YqILZAzl7Sn0CI

## Prerequisites

1. **DNS Setup**: Make sure `api.adcopysurge.com` points to `46.247.108.207`
2. **Repository Access**: Your AdCopySurge repository should be accessible (you'll need to set up the correct Git URL in Step 5)

## Step-by-Step Deployment

### 1. Connect to VPS and Basic Setup

```bash
# SSH into your VPS (enter password when prompted)
clea

# Update system
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone UTC

# Install security tools
apt install -y ufw fail2ban unattended-upgrades

# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo "✅ Step 1 Complete: Basic security configured"
```

### 2. Create Deploy User

```bash
# Create deploy user
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy

# Create SSH directory
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chown deploy:deploy /home/deploy/.ssh

echo "✅ Step 2 Complete: Deploy user created"
```

### 3. Install System Dependencies

```bash
# Install basic packages
apt install -y \
    build-essential \
    curl \
    git \
    pkg-config \
    libpq-dev \
    software-properties-common \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    tree

# Add Python 3.11 repository
add-apt-repository ppa:deadsnakes/ppa -y
apt update

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3.11-dev python3.11-distutils

# Install pip for Python 3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11

# Create symlinks
update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

echo "✅ Step 3 Complete: System dependencies installed"
```

### 4. Install and Configure Redis

```bash
# Install Redis
apt install -y redis-server

# Configure Redis
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf

# Restart Redis
systemctl restart redis-server
systemctl enable redis-server

# Test Redis
redis-cli ping

echo "✅ Step 4 Complete: Redis installed and configured"
```

### 5. Set Up Application Directory and Code

```bash
# Create application directory
mkdir -p /srv/adcopysurge/{logs,run}
chown -R deploy:deploy /srv/adcopysurge

# Switch to deploy user
su - deploy

# Navigate to app directory
cd /srv/adcopysurge

# Clone your repository
# IMPORTANT: Replace the URL below with your actual repository URL
# If your repo is private, you'll need to set up SSH keys or use HTTPS with token
git clone https://github.com/yourusername/adcopysurge.git app

# Go back to root user
exit

echo "✅ Step 5 Complete: Application code downloaded"
```

### 6. Python Virtual Environment

```bash
# As deploy user, set up Python environment
sudo -u deploy bash << 'EOF'
cd /srv/adcopysurge

# Create virtual environment
python3.11 -m venv venv

# Activate and upgrade pip
source venv/bin/activate
pip install --upgrade pip wheel

# Install dependencies
cd app/backend
pip install -r requirements.txt

# Verify installation
python -c "import fastapi, uvicorn, gunicorn, celery, redis; print('✅ All packages installed successfully')"
EOF

echo "✅ Step 6 Complete: Python environment configured"
```

### 7. Configure Environment Variables

```bash
# Create production environment file
cat > /etc/adcopysurge.env << 'EOF'
# AdCopySurge Production Environment
ENVIRONMENT=production
DEBUG=false
APP_NAME=AdCopySurge
HOST=0.0.0.0
PORT=8000

# Security - CHANGE THIS SECRET KEY!
SECRET_KEY=your-super-secure-secret-key-change-this-32-chars-minimum-xyz123
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# Server Configuration
SERVER_NAME=api.adcopysurge.com
CORS_ORIGINS=https://adcopysurge.netlify.app,https://adcopysurge.com

# Database (Supabase)
DATABASE_URL=postgresql://postgres:qvF0YRAfKjnVVvLd@db.tqzlsajhhtkhljdbjkyg.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://tqzlsajhhtkhljdbjkyg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxemxzYWpoaHRraGxqZGJqa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTYzOTMsImV4cCI6MjA3MjU3MjM5M30.0uI56qJGE5DQwEvcfYlcOIz2NGC-msMVrTRw6d-RQuI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxemxzYWpoaHRraGxqZGJqa3lnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5NjM5MywiZXhwIjoyMDcyNTcyMzkzfQ.I4Bs0UL5UD3eGAXQmxmTa6zof17XHgl1AyeN-p4fyYg

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# AI Services
OPENAI_API_KEY=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

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PDF_REPORTS=true
ENABLE_RATE_LIMITING=true

# Performance Settings
WORKERS=2
CELERY_WORKERS=2
MAX_CONNECTIONS=50

# Monitoring
LOG_LEVEL=info
EOF

# Set proper permissions
chmod 640 /etc/adcopysurge.env
chown root:deploy /etc/adcopysurge.env

echo "✅ Step 7 Complete: Environment variables configured"
```

### 8. Run Database Migrations

```bash
# Run Alembic migrations as deploy user
sudo -u deploy bash << 'EOF'
cd /srv/adcopysurge/app/backend
source /srv/adcopysurge/venv/bin/activate
source /etc/adcopysurge.env

# Run migrations
alembic upgrade head
EOF

echo "✅ Step 8 Complete: Database migrations completed"
```

### 9. Create Systemd Services

```bash
# Create API service file
cat > /etc/systemd/system/adcopysurge-api.service << 'EOF'
[Unit]
Description=AdCopySurge FastAPI Application
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=notify
User=deploy
Group=deploy
WorkingDirectory=/srv/adcopysurge/app/backend
Environment=PATH=/srv/adcopysurge/venv/bin
EnvironmentFile=/etc/adcopysurge.env
ExecStart=/srv/adcopysurge/venv/bin/gunicorn main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 2 \
    --bind unix:/srv/adcopysurge/run/gunicorn.sock \
    --timeout 30 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload \
    --access-logfile /srv/adcopysurge/logs/gunicorn.access.log \
    --error-logfile /srv/adcopysurge/logs/gunicorn.error.log \
    --log-level info
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=3

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/adcopysurge/run /srv/adcopysurge/logs /tmp
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true

[Install]
WantedBy=multi-user.target
EOF

# Create Celery service file
cat > /etc/systemd/system/adcopysurge-celery.service << 'EOF'
[Unit]
Description=AdCopySurge Celery Worker
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=forking
User=deploy
Group=deploy
WorkingDirectory=/srv/adcopysurge/app/backend
Environment=PATH=/srv/adcopysurge/venv/bin
EnvironmentFile=/etc/adcopysurge.env
ExecStart=/srv/adcopysurge/venv/bin/celery -A app.celery_app worker \
    --loglevel=info \
    --concurrency=2 \
    --detach \
    --pidfile=/srv/adcopysurge/run/celery.pid \
    --logfile=/srv/adcopysurge/logs/celery.log
ExecStop=/srv/adcopysurge/venv/bin/celery -A app.celery_app control shutdown
ExecReload=/srv/adcopysurge/venv/bin/celery -A app.celery_app control reload
PIDFile=/srv/adcopysurge/run/celery.pid
Restart=always
RestartSec=3

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/adcopysurge/run /srv/adcopysurge/logs /tmp
PrivateDevices=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable services
systemctl daemon-reload
systemctl enable adcopysurge-api.service
systemctl enable adcopysurge-celery.service

echo "✅ Step 9 Complete: Systemd services created"
```

### 10. Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/adcopysurge << 'EOF'
# AdCopySurge Nginx Configuration

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

# Upstream backend
upstream adcopysurge_backend {
    server unix:/srv/adcopysurge/run/gunicorn.sock;
}

server {
    listen 80;
    server_name api.adcopysurge.com;

    # Logs
    access_log /var/log/nginx/adcopysurge_access.log;
    error_log /var/log/nginx/adcopysurge_error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Client settings
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;

    # API routes with rate limiting
    location /api/auth {
        limit_req zone=auth burst=10 nodelay;
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        access_log off;
    }

    # API Documentation
    location /docs {
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /openapi.json {
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Root and other routes
    location / {
        proxy_pass http://adcopysurge_backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/adcopysurge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Step 10 Complete: Nginx configured"
```

### 11. Start Services

```bash
# Start AdCopySurge services
systemctl start adcopysurge-api.service
systemctl start adcopysurge-celery.service

# Wait a moment then check status
sleep 5
systemctl is-active adcopysurge-api.service
systemctl is-active adcopysurge-celery.service

# Check detailed status
systemctl status adcopysurge-api.service --no-pager -l
systemctl status adcopysurge-celery.service --no-pager -l

echo "✅ Step 11 Complete: Services started"
```

### 12. Set Up SSL Certificate

**IMPORTANT**: Before running this step, make sure `api.adcopysurge.com` is pointing to your server IP `46.247.108.207`.

```bash
# Obtain SSL certificate
certbot --nginx -d api.adcopysurge.com --non-interactive --agree-tos --email admin@adcopysurge.com --redirect

echo "✅ Step 12 Complete: SSL certificate configured"
```

### 13. Configure Log Rotation

```bash
# Set up log rotation
cat > /etc/logrotate.d/adcopysurge << 'EOF'
/srv/adcopysurge/logs/*.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    create 644 deploy deploy
}

/var/log/nginx/adcopysurge_*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
EOF

echo "✅ Step 13 Complete: Log rotation configured"
```

## Final Verification

```bash
# Check all services
systemctl status adcopysurge-api adcopysurge-celery nginx redis-server

# Test health endpoint locally
curl -f http://localhost/health

# Test external endpoint (make sure DNS is pointing to your server)
curl -f http://api.adcopysurge.com/health

# Test HTTPS (after SSL setup)
curl -f https://api.adcopysurge.com/health
```

## Post-Deployment Testing

1. **Visit API Documentation**: https://api.adcopysurge.com/docs
2. **Test Health Endpoint**: https://api.adcopysurge.com/health
3. **Check Logs**: `tail -f /srv/adcopysurge/logs/gunicorn.access.log`

## Useful Commands

```bash
# View service logs
journalctl -u adcopysurge-api.service -f
journalctl -u adcopysurge-celery.service -f

# Restart services
systemctl restart adcopysurge-api.service
systemctl restart adcopysurge-celery.service

# Update code (after making changes)
cd /srv/adcopysurge/app
git pull
systemctl restart adcopysurge-api.service

# Check service status
systemctl status adcopysurge-api adcopysurge-celery nginx redis-server

# View application logs
tail -f /srv/adcopysurge/logs/gunicorn.access.log
tail -f /srv/adcopysurge/logs/gunicorn.error.log
tail -f /srv/adcopysurge/logs/celery.log
```

## Troubleshooting

If services fail to start:

1. **Check logs**: `journalctl -u adcopysurge-api.service -n 50`
2. **Check file permissions**: `ls -la /srv/adcopysurge/`
3. **Test database connection**: 
   ```bash
   sudo -u deploy bash
   cd /srv/adcopysurge/app/backend
   source /srv/adcopysurge/venv/bin/activate
   source /etc/adcopysurge.env
   python -c "import os; from sqlalchemy import create_engine; engine = create_engine(os.environ['DATABASE_URL']); conn = engine.connect(); print('Database connection successful')"
   ```
4. **Test Redis**: `redis-cli ping`

## Important Notes

1. **Repository URL**: Make sure to update the Git repository URL in Step 5 with your actual repository
2. **Secret Key**: Change the SECRET_KEY in `/etc/adcopysurge.env` to a secure random string
3. **DNS**: Ensure `api.adcopysurge.com` points to `46.247.108.207` before SSL setup
4. **Frontend Configuration**: Update your Netlify frontend to point to `https://api.adcopysurge.com` for API calls

Your AdCopySurge backend should now be running at https://api.adcopysurge.com!