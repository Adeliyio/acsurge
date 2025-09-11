#!/usr/bin/env python3
"""
Railway Environment Variable Debug Script
This script helps diagnose Railway environment variable issues.
"""

import os
import sys

def main():
    print("🔍 Railway Environment Variable Debug")
    print("=" * 50)
    
    # Check Python and system info
    print(f"🐍 Python version: {sys.version}")
    print(f"📍 Working directory: {os.getcwd()}")
    print(f"🗂️ Python path: {sys.path[:3]}")
    print("")
    
    # Check for critical environment variables
    critical_vars = [
        "SECRET_KEY",
        "DATABASE_URL", 
        "OPENAI_API_KEY",
        "REACT_APP_SUPABASE_URL",
        "REACT_APP_SUPABASE_ANON_KEY",
        "ENVIRONMENT",
        "PORT",
        "DEBUG"
    ]
    
    print("🔑 Critical Environment Variables:")
    print("-" * 40)
    
    missing_vars = []
    for var in critical_vars:
        value = os.environ.get(var)
        if value:
            # Don't show full value for security
            if var in ["SECRET_KEY", "DATABASE_URL", "OPENAI_API_KEY"]:
                display_value = f"SET (length: {len(value)})"
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    print("")
    
    # Show all environment variables that look like config
    print("🌍 All Configuration-like Environment Variables:")
    print("-" * 50)
    
    all_vars = sorted(os.environ.items())
    config_vars = [
        (k, v) for k, v in all_vars 
        if any(pattern in k.upper() for pattern in [
            'SECRET', 'KEY', 'URL', 'DATABASE', 'API', 'HOST', 
            'PORT', 'DEBUG', 'ENV', 'REACT_APP'
        ])
    ]
    
    if config_vars:
        for key, value in config_vars:
            if key in ["SECRET_KEY", "DATABASE_URL", "OPENAI_API_KEY"]:
                display_value = f"SET (length: {len(value)})"
            else:
                display_value = value
            print(f"  {key}: {display_value}")
    else:
        print("  No configuration variables found!")
    
    print("")
    print("📊 Summary:")
    print(f"  Total environment variables: {len(os.environ)}")
    print(f"  Critical variables missing: {len(missing_vars)}")
    
    if missing_vars:
        print(f"  Missing: {', '.join(missing_vars)}")
        print("")
        print("🚨 ISSUE DETECTED: Critical environment variables are missing!")
        print("   This suggests Railway is not injecting environment variables.")
        print("   Check Railway dashboard → Service → Variables")
        return False
    else:
        print("  ✅ All critical variables are present!")
        
        # Test Pydantic Settings loading
        print("")
        print("🧪 Testing Pydantic Settings Loading...")
        try:
            sys.path.insert(0, '.')
            from app.core.config import settings
            print(f"  ✅ Settings loaded successfully!")
            print(f"  ✅ Environment: {settings.ENVIRONMENT}")
            print(f"  ✅ DEBUG: {settings.DEBUG}")
            print(f"  ✅ SECRET_KEY length: {len(settings.SECRET_KEY)}")
            print(f"  ✅ DATABASE_URL set: {bool(settings.DATABASE_URL)}")
            return True
        except Exception as e:
            print(f"  ❌ Settings loading failed: {e}")
            return False

if __name__ == "__main__":
    success = main()
    print("")
    if success:
        print("🎉 Environment configuration is working correctly!")
        print("   You can now start your application.")
    else:
        print("💥 Environment configuration has issues!")
        print("   Fix the missing variables in Railway dashboard before proceeding.")
    
    sys.exit(0 if success else 1)
