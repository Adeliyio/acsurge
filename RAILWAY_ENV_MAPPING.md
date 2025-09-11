# Railway Environment Variables - Required Updates

## 🚨 Action Required

Based on your current Railway environment variables, you need to make the following changes in your Railway dashboard:

### Environment Variable Name Changes

1. **OpenAI API Key**
   - **Current in Railway**: `OPEN_AI_KEY`
   - **Expected by App**: `OPENAI_API_KEY`
   - **Action**: Rename `OPEN_AI_KEY` to `OPENAI_API_KEY` in Railway dashboard

### Verify These Variables Exist

Make sure these variables are set in Railway (they should already be there based on your screenshot):

✅ **Required Variables (must be set):**
- `SECRET_KEY` - JWT signing key (appears to be set ✓)
- `DATABASE_URL` - PostgreSQL connection (appears to be set ✓)
- `OPENAI_API_KEY` - OpenAI API key (rename from `OPEN_AI_KEY`)

✅ **Supabase Variables (appears to be set):**
- `REACT_APP_SUPABASE_URL` (appears to be set ✓)
- `REACT_APP_SUPABASE_ANON_KEY` (appears to be set ✓)

### Additional Recommended Variables

Add these to Railway if not already set:

```
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=your-app.railway.app,*.railway.app
CORS_ORIGINS=https://your-frontend.railway.app
LOG_LEVEL=info
```

## Quick Fix Steps

1. **In Railway Dashboard:**
   - Go to your project → Settings → Variables
   - Find `OPEN_AI_KEY`
   - Rename it to `OPENAI_API_KEY` (or create a new one and delete the old)
   - Save changes

2. **Redeploy:**
   - Your app should automatically redeploy with the new environment variables
   - Check the deployment logs for the startup script output

## Expected Startup Log Output

After the fix, you should see in Railway logs:
```
🚀 Starting AdCopySurge on Railway...
📍 Working directory: /app/backend  
🐍 Python path: /app/backend
🌍 Environment: production
🔑 SECRET_KEY loaded: ✅ Yes
🗄️ DATABASE_URL loaded: ✅ Yes  
🤖 OPENAI_API_KEY loaded: ✅ Yes
🧪 Testing configuration loading...
✅ Configuration loaded successfully!
✅ Environment: production
✅ DEBUG: False
✅ SECRET_KEY length: XX chars
✅ DATABASE_URL configured: True
🚀 Starting Gunicorn server...
```

## If Still Having Issues

If you still get validation errors after renaming the environment variable:

1. Check the Railway deployment logs for the startup script output
2. Verify all required variables are showing "✅ Yes" in the startup logs
3. Ensure the "✅ Configuration loaded successfully!" message appears

The startup script will now provide detailed debugging information to identify any remaining issues.
