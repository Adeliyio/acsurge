# 🚨 IMMEDIATE DEPLOYMENT FIX

## Problem
Your app is crashing because `SECRET_KEY` is missing from environment variables.

## Quick Fix (Fly.io)

1. **Generate and set required secrets:**
```bash
# Essential secrets (minimum to start)
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)
flyctl secrets set ENVIRONMENT=production
flyctl secrets set DATABASE_URL="postgresql://username:password@hostname:port/database"

# AI Services
flyctl secrets set OPENAI_API_KEY="your_openai_key"

# Supabase (if using)
flyctl secrets set REACT_APP_SUPABASE_URL="your_supabase_url"
flyctl secrets set REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key"
flyctl secrets set SUPABASE_JWT_SECRET="your_supabase_jwt_secret"
```

2. **Deploy:**
```bash
flyctl deploy
```

## Database Setup
You need PostgreSQL. Options:

1. **Fly Postgres (Recommended):**
```bash
flyctl postgres create --name adcopysurge-db
flyctl postgres attach --app adcopysurge adcopysurge-db
```

2. **External (Supabase, Neon, etc.):**
Set DATABASE_URL to your external PostgreSQL connection string.

## Verification
After fixing, test endpoints:
```bash
curl https://adcopysurge.fly.dev/health
curl https://adcopysurge.fly.dev/api/docs
```