#!/bin/bash

# Railway Startup Script for AdCopySurge API
# This script ensures proper database initialization before starting the API

set -e  # Exit on any error

echo "🚀 Starting AdCopySurge on Railway..."

# Change to backend directory
cd /app/backend

# Set Python path
export PYTHONPATH=/app/backend

# Print environment info (without secrets)
echo "Environment: $ENVIRONMENT"
echo "Python version: $(python --version)"
echo "Working directory: $(pwd)"

# Test imports first
echo "🧪 Testing imports..."
python test_imports.py
if [ $? -ne 0 ]; then
    echo "❌ Import tests failed"
    exit 1
fi

# Wait for database to be ready (Railway PostgreSQL might take time to be available)
echo "⏳ Waiting for database to be ready..."
python -c "
import os
import time
import sys
from sqlalchemy import create_engine, text
from tenacity import retry, wait_fixed, stop_after_attempt

@retry(wait=wait_fixed(3), stop=stop_after_attempt(20))
def wait_for_db():
    db_url = os.environ['DATABASE_URL']
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    
    engine = create_engine(db_url, pool_pre_ping=True)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT version()'))
        version = result.scalar()
        print(f'✅ Database ready: {version[:50]}...')
        return True

try:
    wait_for_db()
    print('✅ Database connection verified')
except Exception as e:
    print(f'❌ Database connection failed after retries: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection check failed"
    exit 1
fi

# Run database migrations (if using Alembic)
if [ -f "alembic.ini" ]; then
    echo "🔄 Running database migrations..."
    alembic upgrade head
    if [ $? -ne 0 ]; then
        echo "❌ Database migrations failed"
        exit 1
    fi
    echo "✅ Database migrations completed"
fi

# Start the application
echo "🌟 Starting AdCopySurge API server..."
exec gunicorn -c gunicorn-railway.conf.py main_production:app
