# AdCopySurge VPS Deployment Guide

This guide will help you deploy the AdCopySurge FastAPI backend to a traditional VPS running Ubuntu 22.04.

## Prerequisites

- Ubuntu 22.04 VPS with at least 2GB RAM and 20GB storage
- Domain name pointing to your VPS IP address
- Supabase PostgreSQL database (existing setup)
- Frontend deployed on Netlify (existing setup)

## 1. VPS Initial Setup

### 1.1 Create Deploy User

```bash
# SSH into your VPS as root
ssh root@your-server-ip

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Create SSH directory (if using SSH keys)
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### 1.2 System Updates and Firewall

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Set timezone (adjust as needed)
sudo timedatectl set-timezone UTC

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. Install Dependencies

### 2.1 Install System Packages

```bash
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    build-essential git redis-server nginx certbot python3-certbot-nginx \
    postgresql-client htop curl
```

### 2.2 Configure Redis

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Make these changes:
# bind 127.0.0.1
# requirepass your-strong-redis-password
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
```

## 3. Deploy Application

### 3.1 Clone and Setup Project

```bash
# Create application directory
sudo mkdir -p /home/deploy/adcopysurge
sudo chown deploy:deploy /home/deploy/adcopysurge

# Clone repository
cd /home/deploy
git clone https://github.com/yourusername/adcopysurge.git
cd adcopysurge/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.2 Configure Environment Variables

```bash
# Create environment file
sudo mkdir -p /home/deploy/adcopysurge
sudo cp backend/.env.vps /home/deploy/adcopysurge/.env
sudo chown deploy:deploy /home/deploy/adcopysurge/.env
sudo chmod 600 /home/deploy/adcopysurge/.env

# Edit the environment file
nano /home/deploy/adcopysurge/.env
```

Update the following variables in the `.env` file:
- `SECRET_KEY`: Generate a secure 32+ character string
- `SERVER_NAME`: Your domain name
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SUPABASE_*`: Your Supabase configuration
- `REDIS_URL`: Update with Redis password if set
- `CORS_ORIGINS`: Your Netlify frontend URL
- `OPENAI_API_KEY`: Your OpenAI API key

### 3.3 Database Migration

```bash
# Source environment and run migrations
cd /home/deploy/adcopysurge/backend
source venv/bin/activate
source /home/deploy/adcopysurge/.env

# Run Alembic migrations
alembic upgrade head
```

## 4. Setup Systemd Services

### 4.1 Create Runtime Directories

```bash
sudo mkdir -p /run/adcopysurge /var/log/adcopysurge
sudo chown www-data:www-data /run/adcopysurge /var/log/adcopysurge
```

### 4.2 Install Systemd Service Files

```bash
# Copy service files
sudo cp /home/deploy/adcopysurge/deploy/gunicorn.service /etc/systemd/system/
sudo cp /home/deploy/adcopysurge/deploy/celery.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable gunicorn.service
sudo systemctl enable celery.service

# Start services
sudo systemctl start gunicorn.service
sudo systemctl start celery.service

# Check status
sudo systemctl status gunicorn.service
sudo systemctl status celery.service
```

## 5. Configure Nginx

### 5.1 Setup Nginx Configuration

```bash
# Copy Nginx configuration
sudo cp /home/deploy/adcopysurge/deploy/nginx.conf /etc/nginx/sites-available/adcopysurge

# Edit the configuration
sudo nano /etc/nginx/sites-available/adcopysurge
# Update 'server_name' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/adcopysurge /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5.2 Setup SSL Certificate

```bash
# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 6. Configure Automated Deployments

### 6.1 Create Deploy Script

```bash
# Create deploy script
nano /home/deploy/deploy.sh
```

Add the following content:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /home/deploy/adcopysurge

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Run database migrations
alembic upgrade head

# Restart services
sudo systemctl restart gunicorn.service
sudo systemctl restart celery.service

# Check service status
sudo systemctl is-active gunicorn.service
sudo systemctl is-active celery.service

echo "✅ Deployment completed successfully!"
```

Make it executable:

```bash
chmod +x /home/deploy/deploy.sh
```

## 7. Monitoring and Maintenance

### 7.1 Service Status Commands

```bash
# Check service status
sudo systemctl status gunicorn.service celery.service nginx redis

# View logs
sudo journalctl -u gunicorn.service -f
sudo journalctl -u celery.service -f

# Check application logs
sudo tail -f /var/log/adcopysurge/access.log
sudo tail -f /var/log/adcopysurge/error.log
sudo tail -f /var/log/adcopysurge/celery.log
```

### 7.2 Health Checks

```bash
# Test API endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/docs

# Test Redis connection
redis-cli -a your-redis-password ping

# Test Celery worker
python3 -c "
from app.celery_app import celery_app
from app.tasks import health_check
result = health_check.delay()
print(f'Task ID: {result.id}')
print(f'Result: {result.get(timeout=10)}')
"
```

## 8. Troubleshooting

### 8.1 Common Issues

**Service won't start:**
```bash
# Check service logs
sudo journalctl -u gunicorn.service --no-pager
sudo journalctl -u celery.service --no-pager

# Check file permissions
ls -la /home/deploy/adcopysurge/
ls -la /run/adcopysurge/
```

**Database connection issues:**
```bash
# Test database connection
python3 -c "
import os
from sqlalchemy import create_engine
engine = create_engine(os.environ['DATABASE_URL'])
conn = engine.connect()
print('Database connection successful')
"
```

**Redis connection issues:**
```bash
# Check Redis service
sudo systemctl status redis-server
redis-cli ping
```

### 8.2 Performance Tuning

For VPS with limited resources, consider:

1. **Reduce worker processes**: Edit `/etc/systemd/system/gunicorn.service` and reduce `--workers` count
2. **Optimize Redis memory**: Adjust `maxmemory` in Redis configuration
3. **Enable swap**: If RAM < 2GB, configure swap space

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 9. Security Best Practices

1. **Regular updates**: Keep system packages updated
2. **Firewall**: Only open necessary ports (22, 80, 443)
3. **SSH keys**: Use SSH key authentication instead of passwords
4. **Environment variables**: Keep sensitive data in environment files
5. **SSL/TLS**: Always use HTTPS in production
6. **Monitoring**: Set up log monitoring and alerting

## 10. Backup Strategy

1. **Database**: Supabase handles database backups
2. **Application files**: Regular git commits
3. **Environment configuration**: Backup `.env` file securely
4. **SSL certificates**: Certbot handles automatic renewal

Your AdCopySurge backend should now be successfully deployed on your VPS!

## Project Structure

After deployment, your project structure should look like:

```
/home/deploy/adcopysurge/
├── backend/
│   ├── app/
│   ├── venv/
│   ├── main.py
│   ├── requirements.txt
│   ├── start.sh
│   ├── celery.sh
│   └── gunicorn.conf.py
├── deploy/
│   ├── gunicorn.service
│   ├── celery.service
│   └── nginx.conf
├── .env (sensitive - not in git)
└── README.md
```