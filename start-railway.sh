#!/bin/bash
set -e

echo "🚀 Starting AdCopySurge on Railway..."

# Change to backend directory
cd backend

# Set Python path to ensure imports work
export PYTHONPATH="/app/backend:$PYTHONPATH"

# Print environment info for debugging
echo "📍 Working directory: $(pwd)"
echo "🐍 Python path: $PYTHONPATH"
echo "🌍 Environment: ${ENVIRONMENT:-production}"
echo "🚢 Railway PORT: ${PORT:-not_set}"
echo ""
echo "🔍 Environment Variables Check:"
echo "🔑 SECRET_KEY: $(if [ -n "$SECRET_KEY" ]; then echo "✅ Set (${#SECRET_KEY} chars)"; else echo "❌ Missing"; fi)"
echo "🗄️ DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo "✅ Set"; else echo "❌ Missing"; fi)"
echo "🤖 OPENAI_API_KEY: $(if [ -n "$OPENAI_API_KEY" ]; then echo "✅ Set"; else echo "❌ Missing"; fi)"
echo "🔧 REACT_APP_SUPABASE_URL: $(if [ -n "$REACT_APP_SUPABASE_URL" ]; then echo "✅ Set"; else echo "❌ Missing"; fi)"
echo "🔧 REACT_APP_SUPABASE_ANON_KEY: $(if [ -n "$REACT_APP_SUPABASE_ANON_KEY" ]; then echo "✅ Set"; else echo "❌ Missing"; fi)"
echo ""
echo "🔍 All Environment Variables:"
env | grep -E "^(SECRET_KEY|DATABASE_URL|OPENAI_API_KEY|REACT_APP_|ENVIRONMENT|DEBUG|PORT)" | sort
echo ""

# Test configuration loading
echo "🧪 Testing configuration loading..."
python -c "
import sys
sys.path.insert(0, '.')
try:
    from app.core.config import settings
    print('✅ Configuration loaded successfully!')
    print(f'✅ Environment: {settings.ENVIRONMENT}')
    print(f'✅ DEBUG: {settings.DEBUG}')
    print(f'✅ SECRET_KEY length: {len(settings.SECRET_KEY)} chars')
    print(f'✅ DATABASE_URL configured: {bool(settings.DATABASE_URL)}')
except Exception as e:
    print(f'❌ Configuration loading failed: {e}')
    exit(1)
"

echo "🚀 Starting Gunicorn server..."
# Start the application
exec gunicorn -c gunicorn-railway.conf.py main_production:app
