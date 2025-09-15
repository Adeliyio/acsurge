# Enhanced Supabase Authentication Middleware

## Overview

The enhanced Supabase authentication middleware provides a robust, production-ready authentication system with proper JWT verification, anonymous fallback support, and comprehensive health monitoring.

## Key Features

### 1. **Centralized Configuration**
- All Supabase settings managed through `app/core/config.py`
- Supports both `SUPABASE_*` and `REACT_APP_SUPABASE_*` environment variables
- Automatic configuration validation and logging

### 2. **Proper JWT Verification**
- **Production**: JWKS (JSON Web Key Set) verification with RSA/RS256
- **Development**: Fallback to JWT secret (HS256) or unverified mode
- **Caching**: JWKS keys cached for 1 hour to reduce API calls
- **Validation**: Comprehensive token structure and claims validation

### 3. **Anonymous Fallback Support**
- Controlled via `ALLOW_ANON` environment variable
- Creates anonymous user objects when authentication fails
- Graceful degradation when Supabase is unavailable
- Maintains API functionality without requiring authentication setup

### 4. **User Management**
- Automatic user creation from Supabase JWT tokens
- Links existing users to Supabase IDs for migration
- Extracts user metadata from various JWT claim locations
- Database-backed user persistence

### 5. **Health Monitoring**
- Integrated with main health check system
- Tests JWKS endpoint accessibility
- Validates anonymous user creation
- Reports configuration status and availability

## Configuration

### Environment Variables

```bash
# Primary Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Alternative Configuration (for compatibility)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Anonymous Access Control
ALLOW_ANON=true  # Set to true to allow anonymous users when auth fails
```

### Configuration Priority

1. `SUPABASE_*` environment variables (preferred)
2. `REACT_APP_SUPABASE_*` environment variables (fallback)
3. Default values (mostly None/False)

## Usage

### FastAPI Dependencies

```python
from app.auth.supabase_enhanced import (
    get_current_user,                    # Required auth (raises 401 if fails)
    get_current_user_or_anonymous,       # Required auth with anonymous fallback
    get_optional_current_user            # Optional auth (returns None if fails)
)

# Require authentication
@router.get("/protected")
async def protected_endpoint(user: User = Depends(get_current_user)):
    return {"user": user.email}

# Allow anonymous access when configured
@router.get("/public") 
async def public_endpoint(user: User = Depends(get_current_user_or_anonymous)):
    if user.id == "anonymous":
        return {"message": "Welcome, anonymous user!"}
    return {"message": f"Welcome, {user.email}!"}

# Optional authentication
@router.get("/optional")
async def optional_endpoint(user: Optional[User] = Depends(get_optional_current_user)):
    if user:
        return {"authenticated": True, "user": user.email}
    return {"authenticated": False}
```

### Manual Authentication

```python
from app.auth.supabase_enhanced import enhanced_supabase_auth

async def manual_auth_example(request: Request, db: Session):
    # Get optional user
    user = await enhanced_supabase_auth.get_optional_user(request, db)
    
    if user and user.id != "anonymous":
        print(f"Authenticated user: {user.email}")
    elif user and user.id == "anonymous":
        print("Anonymous user")
    else:
        print("No authentication")
```

## API Endpoints

### Authentication Status (`GET /api/auth/status`)
Returns authentication system configuration and status:

```json
{
  "authentication_system": "supabase_enhanced",
  "version": "2.0",
  "status": "healthy",
  "supabase_configured": true,
  "supabase_url": "https://your-project.supabase.co",
  "has_anon_key": true,
  "has_service_role_key": true,
  "has_jwt_secret": false,
  "allow_anonymous": true,
  "available_auth_methods": ["supabase_jwt", "anonymous"]
}
```

### User Information (`GET /api/auth/user`)
Returns current user information:

```json
{
  "authenticated": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com", 
    "full_name": "John Doe",
    "is_active": true,
    "email_verified": true
  },
  "auth_method": "supabase"
}
```

### Authentication Test (`POST /api/auth/test`)
Comprehensive authentication testing endpoint:

```json
{
  "config": { /* auth status */ },
  "request_has_auth_header": true,
  "auth_header_preview": "Bearer eyJ0eXAiOiJKV1...",
  "authentication_attempts": [
    {
      "method": "optional",
      "success": true,
      "user_type": "authenticated",
      "user_id": "user-uuid",
      "user_email": "user@example.com"
    }
  ]
}
```

### Health Check (`GET /api/auth/health`)
Detailed authentication system health check:

```json
{
  "status": "healthy",
  "checks": {
    "config_loaded": true,
    "supabase_configured": true,
    "database_available": true,
    "anonymous_fallback": true,
    "jwks_accessible": true,
    "anonymous_user_creation": true
  },
  "details": {
    "has_supabase_url": true,
    "has_anon_key": true,
    "has_jwt_secret": false,
    "auth_url": "https://your-project.supabase.co/auth/v1",
    "jwks_url": "https://your-project.supabase.co/auth/v1/jwks",
    "jwks_keys_count": 2
  }
}
```

## Authentication Flow

### With Valid Token

1. Extract Bearer token from Authorization header
2. Decode token to get header and payload info
3. Validate basic token structure (sub, email, exp, iss)
4. Try JWT verification methods in order:
   - JWT secret (HS256) if configured
   - JWKS verification (RS256) if available
   - Development fallback (unverified but validated)
5. Get or create user in database from token payload
6. Return authenticated User object

### With Invalid/Missing Token

1. Check if anonymous access is allowed (`ALLOW_ANON=true`)
2. If allowed, return anonymous User object
3. If not allowed, return None or raise 401 depending on dependency

### Anonymous User Object

```python
User(
    id="anonymous",
    email="anonymous@localhost", 
    full_name="Anonymous User",
    is_active=True,
    email_verified=False,
    supabase_user_id=None,
    hashed_password=None
)
```

## Testing

### Run the Test Suite

```bash
# Start the FastAPI server
python backend/main.py

# Run authentication tests  
python backend/test_auth_enhanced.py

# Test against different server
python backend/test_auth_enhanced.py http://localhost:8080
```

### Test Scenarios

The test suite covers:
- Configuration status checking
- Endpoints without authentication
- Endpoints with dummy/invalid tokens
- Health check integration
- Environment variable detection

### Manual Testing

```bash
# Check auth status
curl http://localhost:8000/api/auth/status

# Test with Bearer token
curl -H "Authorization: Bearer your-token" \
     http://localhost:8000/api/auth/user

# Test authentication functionality
curl -X POST -H "Authorization: Bearer your-token" \
     http://localhost:8000/api/auth/test

# Check health including auth
curl http://localhost:8000/health
```

## Integration with Existing Code

### Migration from Old Auth

The enhanced system is designed as a drop-in replacement:

```python
# Old way
from app.auth.supabase import get_current_user

# New way  
from app.auth.supabase_enhanced import get_current_user
# Same interface, enhanced functionality
```

### Health Check Integration

The enhanced authentication is automatically integrated with the main health check endpoint at `/health`. It reports as a separate component with status:

- **healthy**: Everything working correctly
- **degraded**: Partial functionality (e.g., JWKS unavailable but fallback works)
- **unhealthy**: Major issues but may have anonymous fallback
- **disabled**: Authentication not configured

## Error Handling

### Graceful Degradation

- **JWKS Unavailable**: Falls back to JWT secret or development mode
- **Database Unavailable**: Still allows token verification (user creation fails)
- **Supabase Down**: Falls back to anonymous users if enabled
- **Invalid Configuration**: Logs warnings but continues with limited functionality

### Logging

All authentication attempts, errors, and configuration issues are logged:

```python
# Successful authentication
logger.debug("Token verified using JWKS")

# Configuration warnings
logger.warning("SUPABASE_ANON_KEY not configured - some features may not work")

# Authentication failures
logger.warning("Token verification failed - no valid verification method")

# System errors
logger.error("Error getting/creating user: Database connection failed")
```

## Security Considerations

### Production Setup

1. **Always set SUPABASE_JWT_SECRET** for production HMAC verification
2. **Use JWKS verification** when possible for RSA key rotation
3. **Disable anonymous access** (`ALLOW_ANON=false`) unless specifically needed
4. **Monitor authentication health** through `/api/auth/health` endpoint
5. **Review logs regularly** for authentication failures and security issues

### Token Validation

- Validates `sub` (subject) claim for user ID
- Validates `email` claim for user identity  
- Validates `exp` (expiration) claim for token freshness
- Validates `iss` (issuer) claim against configured Supabase URL
- Validates `aud` (audience) claim for "authenticated" audience

### Anonymous Access

- Anonymous users have no persistent database record
- Anonymous access should be limited to read-only operations
- Always check `user.id == "anonymous"` before allowing sensitive operations
- Anonymous users cannot perform user-specific actions

## Troubleshooting

### Common Issues

1. **"Supabase not configured"**
   - Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables

2. **"Token verification failed"**  
   - Check if `SUPABASE_JWT_SECRET` is set correctly
   - Verify JWKS endpoint is accessible
   - Enable debug mode to see detailed token validation

3. **"Authentication health check failed"**
   - Check database connectivity
   - Verify Supabase project is accessible
   - Review authentication endpoint logs

4. **"User creation failed"**
   - Verify database connection and User model
   - Check if user already exists with conflicting data
   - Review database migration status

### Debug Mode

Set `DEBUG=true` in environment to enable:
- Unverified token acceptance (development only)
- Detailed authentication logging
- Extended error messages

### Monitoring

Monitor these endpoints for production health:
- `/health` - Overall system health including auth
- `/api/auth/health` - Detailed authentication health
- `/api/auth/status` - Configuration and capability status

## Future Enhancements

Planned improvements:
- **Role-based access control** with Supabase RLS integration
- **Multi-tenant support** with organization-based user isolation  
- **Session management** with refresh token support
- **Rate limiting** per user/anonymous session
- **Audit logging** for security monitoring
- **SSO integration** beyond Supabase providers