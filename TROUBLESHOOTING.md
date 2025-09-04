# Troubleshooting Guide

## Common Runtime Errors

### "Script error" in React Frontend

**Symptoms:**
```
Uncaught runtime errors:
×
ERROR
Script error.
    at handleError (http://localhost:3000/static/js/bundle.js:108320:58)
    at http://localhost:3000/static/js/bundle.js:108339:7
```

**Cause:** Missing environment variables causing JavaScript runtime errors.

**Solution:**

1. **Check Environment Variables**
   ```bash
   cd frontend
   # Make sure .env file exists and has required variables
   cat .env
   ```

2. **Required Environment Variables for Frontend:**
   ```bash
   # Add these to your frontend/.env file:
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_PADDLE_VENDOR_ID=
   REACT_APP_PADDLE_ENVIRONMENT=sandbox
   ```

3. **Restart Development Server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

### Paddle Integration Not Working

**Symptoms:**
- "Paddle billing is not configured yet" error message
- Console message: "🛍️ Paddle not configured"

**This is expected behavior during development!**

**Solution:**
1. The app is designed to work without Paddle credentials during development
2. You'll see helpful messages instead of actual checkout
3. To enable real Paddle integration:
   - Follow the setup guide in `PADDLE_SETUP.md`
   - Add your real Paddle Vendor ID to `REACT_APP_PADDLE_VENDOR_ID`

### Backend Connection Issues

**Symptoms:**
```
Proxy error: Could not proxy request from localhost:3001 to http://localhost:8000/
```

**Cause:** Backend FastAPI server not running.

**Solution:**
```bash
cd backend
python main.py
```

### Import Errors

**Symptoms:**
- "Module not found" errors
- Import/export errors

**Solution:**
1. **Check file paths** - Make sure all imports use correct relative paths
2. **Clear node_modules** if needed:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

## Development Workflow

### Safe Development Mode

The app is designed to work in development mode even without:
- ✅ Paddle credentials configured
- ✅ Backend running (some features won't work)
- ✅ Database connected (auth might not work)

### What Works Without Full Setup:
- ✅ UI components and layouts
- ✅ Pricing page display
- ✅ Navigation
- ✅ Error handling

### What Needs Full Setup:
- ❌ Authentication (needs Supabase)
- ❌ Actual payments (needs Paddle)
- ❌ API calls (needs backend running)

## Quick Fix Checklist

When you encounter runtime errors:

1. **Check Environment Variables**
   - [ ] Frontend `.env` file exists
   - [ ] Required `REACT_APP_*` variables are present
   - [ ] No syntax errors in `.env` file

2. **Check Console Logs**
   - [ ] Open browser DevTools (F12)
   - [ ] Look for specific error messages
   - [ ] Check Network tab for failed requests

3. **Restart Services**
   - [ ] Stop React dev server (Ctrl+C)
   - [ ] Start React dev server (`npm start`)
   - [ ] If using backend, restart it too

4. **Check File Syntax**
   - [ ] Look for missing imports
   - [ ] Check for typos in file names
   - [ ] Verify all brackets/parentheses are balanced

## Getting Help

1. **Check Console Logs**: Most issues show specific error messages in the browser console
2. **Check Network Tab**: Look for failed API requests
3. **Check This Guide**: Most common issues are covered above
4. **Check Environment**: Make sure you're in the correct directory when running commands

## Development vs Production

**Development Mode (Current):**
- Graceful fallbacks for missing services
- Helpful error messages
- Console logging for debugging
- Works without full Paddle setup

**Production Mode (Later):**
- All services must be properly configured
- Real payment processing
- Full error monitoring
- Production environment variables required

---

💡 **Remember**: The current setup is designed to be development-friendly. You can work on UI and features even before setting up Paddle billing!
