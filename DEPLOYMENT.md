# 🚀 AdCopySurge Production Deployment Guide

This guide covers the complete production deployment process for AdCopySurge on your Datalix VPS, including both automated CI/CD via GitHub Actions and manual deployment options.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Server Setup](#initial-server-setup)
- [GitHub Actions CI/CD Setup](#github-actions-cicd-setup)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Database Migration](#database-migration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

## 🛠️ Prerequisites

### Local Development Machine
- Git
- Docker and Docker Compose
- SSH client
- Node.js and npm (for frontend builds)
- Python 3.9+ (for backend)

### Production Server (Datalix VPS)
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose
- Nginx (handled by Docker container)
- PostgreSQL database (Supabase)
- Domain name configured (adcopysurge.com, api.adcopysurge.com)
- SSL certificates

### External Services
- Supabase account with PostgreSQL database
- OpenAI API key
- GitHub repository with Actions enabled
- Domain registrar with DNS control

## 🏗️ Initial Server Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo mkdir -p /opt/adcopysurge
sudo chown deploy:deploy /opt/adcopysurge
```

### 2. SSH Key Setup

```bash
# On your local machine, generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "deployment@adcopysurge.com"

# Copy public key to server
ssh-copy-id deploy@your-datalix-server.com

# Test connection
ssh deploy@your-datalix-server.com
```

### 3. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 🔄 GitHub Actions CI/CD Setup

### 1. Repository Secrets Configuration

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add:

#### Server Access
```
DATALIX_SSH_PRIVATE_KEY=<your-private-ssh-key>
DATALIX_USER=deploy
DATALIX_HOST=your-datalix-server.com
```

#### Database Configuration
```
STAGING_DATABASE_URL=postgresql://user:pass@host:5432/adcopysurge_staging
PRODUCTION_DATABASE_URL=postgresql://user:pass@host:5432/adcopysurge_production
```

#### Application Secrets
```
PRODUCTION_SECRET_KEY=<generate-with-python-secrets>
STAGING_SECRET_KEY=<generate-with-python-secrets>
OPENAI_API_KEY=sk-your-openai-api-key
HUGGINGFACE_API_KEY=hf_your-huggingface-token
```

#### Supabase Configuration
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

#### Monitoring and Notifications
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook-url
```

### 2. Environment File Updates

Update the production environment variables in `.env.production`:

```bash
# Replace placeholder values with real configuration
SECRET_KEY=your-generated-secret-key
DATABASE_URL=your-supabase-database-url
OPENAI_API_KEY=your-openai-key
# ... etc
```

### 3. Docker Image Registry

The CI/CD pipeline uses GitHub Container Registry (ghcr.io). Update the image names in:
- `docker-compose.prod.yml`
- `.github/workflows/deploy-to-vps.yml`
- `scripts/deploy-production.sh`

Replace `yourusername/adcopysurge` with your actual GitHub username/organization.

### 4. Trigger Deployment

```bash
# Automatic deployment on push to main branch
git push origin main

# Or manually trigger via GitHub UI
# Go to Actions tab → "Deploy to VPS" → "Run workflow"
```

## 📖 Manual Deployment

### 1. Prepare Deployment Script

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Update server details in the script
nano scripts/deploy-production.sh
# Change PROD_SERVER, PROD_USER, and Docker registry settings
```

### 2. Build and Deploy

```bash
# Deploy latest version
./scripts/deploy-production.sh

# Deploy specific version
./scripts/deploy-production.sh deploy v1.2.3

# Health check
./scripts/deploy-production.sh health

# Rollback if needed
./scripts/deploy-production.sh rollback
```

## 🌐 Environment Configuration

### 1. Production Environment Variables

Create and configure `.env.production`:

```bash
# Copy template and fill in real values
cp .env.production .env.production.local
nano .env.production.local

# Key variables to update:
ENVIRONMENT=production
SECRET_KEY=<your-secure-secret-key>
DATABASE_URL=<your-supabase-connection-string>
OPENAI_API_KEY=<your-openai-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
CORS_ORIGINS=https://adcopysurge.com,https://www.adcopysurge.com
```

### 2. Domain Configuration

Update DNS records for your domain:

```
Type  | Name | Value
------|------|------
A     | @    | your-server-ip
A     | www  | your-server-ip
A     | app  | your-server-ip
A     | api  | your-server-ip
```

## 🔒 SSL Certificate Setup

### 1. Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot

# Obtain certificates
sudo certbot certonly --standalone \
  -d adcopysurge.com \
  -d www.adcopysurge.com \
  -d api.adcopysurge.com \
  --email your-email@domain.com \
  --agree-tos

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Copy Certificates to Docker Volume

```bash
# Create SSL directory
sudo mkdir -p /opt/adcopysurge/ssl/adcopysurge.com

# Copy certificates
sudo cp /etc/letsencrypt/live/adcopysurge.com/* /opt/adcopysurge/ssl/adcopysurge.com/
sudo chown -R deploy:deploy /opt/adcopysurge/ssl
```

## 🗄️ Database Migration

### 1. Run Database Initialization

```bash
# On the server
cd /opt/adcopysurge
python backend/scripts/init_passport_schema.py --environment=production

# Or via Docker
docker compose -f docker-compose.prod.yml exec backend python scripts/init_passport_schema.py --environment=production
```

### 2. Verify Database Setup

```bash
# Check database connectivity
docker compose -f docker-compose.prod.yml exec backend python -c "from app.database import get_db; next(get_db()); print('Database connected successfully')"

# Check tables
docker compose -f docker-compose.prod.yml exec backend python -c "
from app.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
print('Tables:', inspector.get_table_names())
"
```

## 📊 Monitoring Setup

### 1. Prometheus Configuration

The production setup includes Prometheus for monitoring. Access it at:
- `http://your-server-ip:9090` (internal only)

### 2. Application Metrics

Add metrics endpoints to your FastAPI backend:

```python
# backend/app/metrics.py
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.get("/api/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 3. Log Monitoring

Logs are stored in Docker volumes and can be accessed:

```bash
# View application logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# View Nginx logs
docker compose -f docker-compose.prod.yml logs -f nginx
```

### 4. Health Checks

The setup includes health check endpoints:
- Frontend: `https://adcopysurge.com/health`
- Backend: `https://api.adcopysurge.com/api/health`

## 💾 Backup Strategy

### 1. Database Backups

```bash
# Create backup script
cat > /opt/adcopysurge/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/adcopysurge/backups"
mkdir -p $BACKUP_DIR

# Database backup (adjust for your Supabase connection)
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Compress and clean old backups
gzip $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/adcopysurge/backup.sh
```

### 2. Application Data Backups

```bash
# Backup uploaded files and logs
tar -czf /opt/adcopysurge/backups/app_data_$(date +%Y%m%d).tar.gz \
  /opt/adcopysurge/uploads \
  /opt/adcopysurge/logs
```

### 3. Automated Backups

```bash
# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/adcopysurge/backup.sh
```

## 🐞 Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Check container status
docker compose -f docker-compose.prod.yml ps

# Restart specific service
docker compose -f docker-compose.prod.yml restart [service-name]
```

#### 2. Database Connection Issues

```bash
# Test database connection
docker compose -f docker-compose.prod.yml exec backend python -c "
from app.database import engine
try:
    engine.connect()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

#### 3. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test SSL
openssl s_client -connect adcopysurge.com:443

# Renew certificates
sudo certbot renew --dry-run
```

#### 4. Memory/Resource Issues

```bash
# Check resource usage
docker stats

# Check system resources
htop
df -h
free -h

# Adjust Docker resource limits in docker-compose.prod.yml
```

### Debugging Commands

```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# View resource usage
docker compose -f docker-compose.prod.yml top

# Access container shell
docker compose -f docker-compose.prod.yml exec backend bash
docker compose -f docker-compose.prod.yml exec frontend sh

# Check network connectivity
docker compose -f docker-compose.prod.yml exec backend ping frontend
docker compose -f docker-compose.prod.yml exec backend ping redis

# View detailed logs with timestamps
docker compose -f docker-compose.prod.yml logs -f -t backend
```

### Recovery Procedures

#### 1. Service Recovery

```bash
# Restart all services
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Rebuild and restart
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

#### 2. Database Recovery

```bash
# Restore from backup
gunzip -c /opt/adcopysurge/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL
```

#### 3. Complete System Recovery

```bash
# Pull latest images and restart everything
cd /opt/adcopysurge
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Check logs and system resources
2. **Monthly**: Update system packages and Docker images
3. **Quarterly**: Review and rotate SSL certificates
4. **Bi-annually**: Full backup testing and disaster recovery drills

### Monitoring Checklist

- [ ] All services are running and healthy
- [ ] SSL certificates are valid and auto-renewing
- [ ] Database backups are completing successfully
- [ ] Disk usage is within acceptable limits
- [ ] Application logs show no critical errors
- [ ] Response times are within expected ranges

### Emergency Contacts

- **Primary**: Your email/phone
- **Secondary**: Backup contact
- **VPS Provider**: Datalix support
- **Domain Registrar**: Your registrar support

---

## 📚 Additional Resources

- [Docker Compose Production Best Practices](https://docs.docker.com/compose/production/)
- [Nginx Production Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PostgreSQL Backup and Recovery](https://www.postgresql.org/docs/current/backup.html)

For additional support or questions about the deployment process, please refer to the project documentation or create an issue in the repository.