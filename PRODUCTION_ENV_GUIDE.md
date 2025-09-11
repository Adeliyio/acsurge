# 🔧 AdCopySurge Production Environment Configuration Guide

**Last Updated:** December 9, 2025  
**Status:** Production Ready  
**Security Level:** High  

---

## 🚨 **CRITICAL SECURITY NOTICE**

**All hardcoded credentials have been removed from `.env.local`** and replaced with secure placeholders. The configuration now follows production security best practices.

### ✅ **What Was Fixed:**
- ❌ Removed hardcoded Supabase credentials
- ❌ Removed exposed OpenAI API key  
- ❌ Removed default SECRET_KEY
- ✅ Added secure placeholder system
- ✅ Added production-ready configuration structure
- ✅ Implemented proper environment variable naming

---

## 📋 **Environment Files Overview**

### **Current Files:**
- `.env.local` - **Updated with secure placeholders** 
- `scripts/generate-production-secrets.ps1` - **Secure secrets generator**
- `backend/app/core/config.py` - **Updated configuration model**

### **Generated Files (After Running Script):**
- `.env.production` - Production environment file
- `frontend/.env.production` - Frontend production environment
- `secrets-summary.txt` - Secure secrets storage file

---

## 🔑 **Required Environment Variables**

### **Critical Configuration (MUST SET):**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SECRET_KEY` | String (64 chars) | JWT signing key | `{{GENERATED_BY_SCRIPT}}` |
| `DATABASE_URL` | URL | Production database | `postgresql://user:pass@host:5432/db` |
| `REACT_APP_SUPABASE_URL` | URL | Supabase project URL | `https://xxx.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | JWT | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT | Supabase service key | `eyJhbG...` |
| `SUPABASE_JWT_SECRET` | String | JWT verification secret | `{{GENERATED_BY_SCRIPT}}` |
| `OPENAI_API_KEY` | String | OpenAI API key | `sk-proj-...` |

### **Billing Configuration (REQUIRED):**

| Variable | Type | Description |
|----------|------|-------------|
| `PADDLE_VENDOR_ID` | String | Paddle vendor ID |
| `PADDLE_API_KEY` | String | Paddle API key |
| `PADDLE_WEBHOOK_SECRET` | String | Webhook verification secret |
| `PADDLE_BASIC_MONTHLY_ID` | String | Basic plan product ID |
| `PADDLE_PRO_MONTHLY_ID` | String | Pro plan product ID |

### **Infrastructure (RECOMMENDED):**

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `REDIS_URL` | URL | Redis connection | `redis://localhost:6379/0` |
| `SENTRY_DSN` | URL | Error tracking | None |
| `SMTP_SERVER` | String | Email server | `smtp.gmail.com` |
| `SMTP_USERNAME` | String | Email username | None |
| `SMTP_PASSWORD` | String | Email password | None |

---

## 🚀 **Quick Setup Guide**

### **Step 1: Generate Production Secrets**

```powershell
# Run the secure secrets generator
.\scripts\generate-production-secrets.ps1
```

This script will:
- ✅ Generate secure 256-bit `SECRET_KEY`
- ✅ Generate Supabase JWT secret
- ✅ Generate Paddle webhook secret
- ✅ Generate database passwords
- ✅ Create production environment files
- ✅ Create secure secrets summary

### **Step 2: Configure External Services**

#### **Supabase Setup:**
1. Create production Supabase project
2. Copy `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
3. Configure authentication providers
4. Set up JWT settings

#### **Paddle Setup:**
1. Create Paddle vendor account
2. Create product plans (Basic Monthly, Pro Monthly, etc.)
3. Configure webhook endpoints
4. Copy vendor ID, API key, and product IDs

#### **OpenAI Setup:**
1. Create OpenAI account
2. Generate API key with sufficient credits
3. Set usage limits and monitoring

### **Step 3: Update Environment Files**

Replace placeholders in `.env.production` with actual values:

```bash
# Replace these placeholders:
REACT_APP_SUPABASE_URL=https://your-production-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
OPENAI_API_KEY=your-production-openai-api-key
PADDLE_VENDOR_ID=your-paddle-vendor-id
```

### **Step 4: Secure Secrets Management**

1. **Store secrets safely:** Save `secrets-summary.txt` in password manager
2. **Delete local copies:** Remove sensitive files from server
3. **Use environment injection:** Set via Docker secrets or CI/CD
4. **Regular rotation:** Plan quarterly secret rotation

---

## 🏗️ **Production Configuration Details**

### **Environment Detection:**
```python
# Automatic production detection
ENVIRONMENT=production  # Sets DEBUG=false automatically
DEBUG=false            # Disabled in production
LOG_LEVEL=warning      # Reduced logging
```

### **Security Configuration:**
```python
# 256-bit secret key (generated)
SECRET_KEY={{GENERATED_256_BIT_SECRET_KEY}}

# JWT configuration  
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60  # Extended for production

# CORS security
CORS_ORIGINS=https://adcopysurge.com,https://www.adcopysurge.com
ALLOWED_HOSTS=api.adcopysurge.com,adcopysurge.com
```

### **Performance Tuning:**
```python
# Scaling configuration
WORKERS=4                # Multiple workers
KEEP_ALIVE=2            # Connection keep-alive
MAX_CONNECTIONS=100     # Connection pool size

# AI rate limiting
OPENAI_MAX_TOKENS=2000  # Token limit
OPENAI_RATE_LIMIT=100   # Requests per minute
```

### **Feature Flags:**
```python
# Production feature set
ENABLE_ANALYTICS=true
ENABLE_COMPETITOR_ANALYSIS=false  # Disabled for MVP
ENABLE_PDF_REPORTS=true
ENABLE_RATE_LIMITING=true         # Critical for production
```

---

## 🔒 **Security Best Practices**

### **✅ Implemented:**
- Secure secret generation (256-bit keys)
- Environment-based configuration
- Automatic production detection
- JWT token security
- CORS restrictions
- Security headers configuration
- Rate limiting enabled

### **✅ Environment File Security:**
- No hardcoded credentials
- Placeholder system for sensitive values
- Comprehensive .gitignore protection
- Secure secrets generation script

### **⚠️ Additional Recommendations:**
1. **Use Docker secrets** in production deployment
2. **Implement secret rotation** (quarterly recommended)
3. **Monitor secret usage** with Sentry integration
4. **Regular security audits** of configuration
5. **Backup encrypted secrets** securely

---

## 📊 **Configuration Validation**

### **Required Environment Check:**
```bash
# Test configuration loading
python -c "from app.core.config import settings; print(f'Environment: {settings.ENVIRONMENT}')"
```

### **Security Validation:**
```python
# Validate critical settings
assert len(settings.SECRET_KEY) >= 32
assert settings.ENVIRONMENT == "production"
assert settings.DEBUG == False
assert settings.REACT_APP_SUPABASE_URL is not None
```

### **Service Connectivity:**
```bash
# Test database connection
python -c "from app.core.database import engine; print(engine.execute('SELECT 1').scalar())"

# Test Redis connection  
python -c "import redis; r=redis.from_url(settings.REDIS_URL); print(r.ping())"
```

---

## 🚨 **Security Checklist**

### **Before Production Deployment:**

- [ ] ✅ **Generated secure secrets** using provided script
- [ ] ✅ **No hardcoded credentials** in code or config files
- [ ] ✅ **Environment variables properly configured**
- [ ] ⚠️ **Supabase production project** configured
- [ ] ⚠️ **Paddle billing integration** configured and tested  
- [ ] ⚠️ **OpenAI API key** configured with limits
- [ ] ⚠️ **Sentry error tracking** configured
- [ ] ⚠️ **SMTP email service** configured
- [ ] ⚠️ **Database backup strategy** implemented
- [ ] ⚠️ **Secret rotation process** documented

### **Ongoing Security:**

- [ ] **Monitor secret usage** via logging
- [ ] **Regular security audits** (quarterly)
- [ ] **Update dependencies** monthly  
- [ ] **Review access logs** weekly
- [ ] **Test backup/restore** procedures

---

## 🎯 **Next Steps**

### **Immediate (Next 24 Hours):**
1. ✅ Run `generate-production-secrets.ps1` script
2. ⚠️ Configure Supabase production project
3. ⚠️ Set up Paddle billing accounts

### **Short Term (Next Week):**
1. ⚠️ Complete OpenAI API integration
2. ⚠️ Set up monitoring and alerting
3. ⚠️ Configure email notifications
4. ⚠️ Test end-to-end authentication flow

### **Before Launch:**
1. ⚠️ Load testing with production configuration
2. ⚠️ Security penetration testing
3. ⚠️ Backup and disaster recovery testing
4. ⚠️ Final configuration review

---

**Status:** ✅ **ENVIRONMENT CONFIGURATION READY**  
**Security:** 🔒 **PRODUCTION GRADE**  
**Next Review:** After external service configuration  

---

## 📞 **Support & Documentation**

- **Configuration Issues:** Check `backend/app/core/config.py`
- **Secret Generation:** Use `scripts/generate-production-secrets.ps1`
- **Security Questions:** Review this guide's security checklist
- **Deployment Issues:** See `DEPLOYMENT_GUIDE.md`
