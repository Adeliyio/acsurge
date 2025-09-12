# AdCopySurge Netlify Frontend Deployment Guide

Deploy your React frontend to Netlify with automatic builds from GitHub.

## 🚀 Quick Setup

### 1. Prerequisites
- GitHub repository with your code
- Netlify account (free tier available)
- Backend deployed to Fly.io first

### 2. Deploy to Netlify

#### Option A: Connect GitHub Repository (Recommended)

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Build command**: `CI=false npm run build`
   - **Publish directory**: `build`
   - **Base directory**: `frontend` (if monorepo)

#### Option B: Drag & Drop Deploy

1. Build locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Drag the `build/` folder to Netlify dashboard

### 3. Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
# Required - Backend API Configuration
REACT_APP_API_BASE_URL=https://adcopysurge-backend.fly.dev
REACT_APP_API_URL=https://adcopysurge-backend.fly.dev/api

# Required - Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional - Third-party services
REACT_APP_PADDLE_VENDOR_ID=your_paddle_vendor_id
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_tracking_id
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Build Configuration
REACT_APP_ENVIRONMENT=production
NODE_ENV=production
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
CI=false
```

### 4. Configure Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. Add your domain (e.g., `app.adcopysurge.com`)
3. Update DNS records as instructed
4. Netlify will automatically provision SSL certificate

### 5. Update Backend CORS

After deployment, update your backend CORS settings to allow your Netlify domain:

In your backend `main.py` or configuration, add:
```python
# Add your Netlify domain to CORS origins
CORS_ORIGINS = [
    "https://your-app.netlify.app",
    "https://app.adcopysurge.com",  # if using custom domain
    "http://localhost:3000",  # for development
]
```

## 🔧 Build Configuration

Your `netlify.toml` is already configured with:
- ✅ Build commands
- ✅ Security headers
- ✅ API proxy to Fly.io backend
- ✅ SPA routing fallback
- ✅ Static asset caching

## 📊 Monitoring

### Build Logs
- View in Netlify dashboard under **Deploys**
- Each deploy shows build status and logs

### Performance
- Netlify provides analytics and Core Web Vitals
- Global CDN for fast loading worldwide

## 🐛 Troubleshooting

### Build Failures

**Issue**: `npm install` fails
```
Error: Module not found
```
**Solution**: Check Node.js version in `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

**Issue**: Environment variables not working
```
Error: process.env.REACT_APP_API_URL is undefined
```
**Solution**: 
1. Ensure variables start with `REACT_APP_`
2. Check they're set in Netlify dashboard
3. Redeploy after adding variables

### API Connection Issues

**Issue**: CORS errors
```
Error: Access to fetch blocked by CORS policy
```
**Solution**:
1. Update backend CORS to include Netlify domain
2. Check API URL in environment variables
3. Verify backend is running on Fly.io

### Routing Issues

**Issue**: 404 on page refresh
```
Error: Page not found on direct URL access
```
**Solution**: The `netlify.toml` SPA fallback should handle this. If not working:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## ⚡ Performance Optimization

### Already Configured:
- Static asset caching (1 year for immutable files)
- Gzip compression
- Security headers
- CDN distribution

### Additional Optimizations:
1. **Image optimization**: Use WebP format
2. **Code splitting**: React.lazy() for route-based splitting
3. **Bundle analysis**: `npm run build -- --analyze`

## 🔄 Continuous Deployment

### Automatic Deploys
- ✅ Auto-deploy on push to `main` branch
- ✅ Deploy previews for pull requests
- ✅ Branch deploys for testing

### Manual Deploys
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

## 💰 Costs

**Netlify Free Tier Includes:**
- 100GB bandwidth/month
- 300 build minutes/month
- Deploy previews
- Custom domains with SSL

**Paid plans** start at $19/month for teams.

## ✅ Deployment Checklist

- [ ] GitHub repository connected to Netlify
- [ ] Build settings configured (command & publish directory)
- [ ] Environment variables set
- [ ] Backend CORS updated for Netlify domain
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] First deploy successful

## 🎉 You're Live!

Your frontend will be available at:
- **Netlify subdomain**: `https://your-app.netlify.app`
- **Custom domain**: `https://app.adcopysurge.com` (if configured)

The frontend will automatically proxy API requests to your Fly.io backend!

---

**Need help?** Check Netlify docs or their excellent support community.
