# Simple Fly.io Deployment - Nuclear Option
# This script bypasses all buildpack detection

Write-Host "🚀 AdCopySurge Backend - Simple Docker Deploy" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if flyctl is installed
if (!(Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Fly CLI not found. Please install flyctl first." -ForegroundColor Red
    Write-Host "Download from: https://github.com/superfly/flyctl/releases" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend
Set-Location backend

Write-Host "📍 Working directory: $(Get-Location)" -ForegroundColor Blue

# Check if app exists, if not create it
Write-Host "🔍 Checking if app exists..." -ForegroundColor Blue
$appStatus = flyctl status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "📱 App doesn't exist. Creating new app..." -ForegroundColor Yellow
    
    # Create app with explicit Docker settings
    flyctl launch --dockerfile Dockerfile.fly --no-deploy --name adcopysurge-backend --region ord --org personal
    
    Write-Host "⚠️ App created. You need to set secrets now:" -ForegroundColor Yellow
    Write-Host "flyctl secrets set SECRET_KEY=`$(openssl rand -hex 32)" -ForegroundColor Cyan
    Write-Host "flyctl secrets set OPENAI_API_KEY=your-key-here" -ForegroundColor Cyan
    Write-Host "flyctl secrets set REACT_APP_SUPABASE_URL=your-url-here" -ForegroundColor Cyan
    Write-Host "flyctl secrets set REACT_APP_SUPABASE_ANON_KEY=your-key-here" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "After setting secrets, run this script again." -ForegroundColor Green
    exit 0
}

Write-Host "✅ App exists. Proceeding with deployment..." -ForegroundColor Green

# The nuclear deployment option
Write-Host "🚀 Deploying with Docker (bypassing buildpacks)..." -ForegroundColor Blue

try {
    # Try method 1: Explicit Docker with all flags
    flyctl deploy --dockerfile Dockerfile.fly --strategy=immediate --no-cache --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        
        Write-Host "`n📊 App Status:" -ForegroundColor Blue
        flyctl status
        
        Write-Host "`n🌐 Your API is live at: https://adcopysurge-backend.fly.dev" -ForegroundColor Cyan
        Write-Host "📖 API docs: https://adcopysurge-backend.fly.dev/api/docs" -ForegroundColor Cyan
        Write-Host "❤️ Health check: https://adcopysurge-backend.fly.dev/health" -ForegroundColor Cyan
        
    } else {
        throw "Deployment failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Host "❌ Docker deployment failed. Trying nuclear option..." -ForegroundColor Red
    
    # Method 2: Destroy and recreate (nuclear option)
    Write-Host "💥 Nuclear option: Destroying and recreating app..." -ForegroundColor Yellow
    
    $confirm = Read-Host "This will destroy all data and settings. Continue? (yes/no)"
    if ($confirm -eq "yes") {
        try {
            Write-Host "🗑️ Destroying app..." -ForegroundColor Yellow
            flyctl apps destroy adcopysurge-backend --yes
            
            Write-Host "🆕 Creating fresh app with forced Docker..." -ForegroundColor Blue
            flyctl apps create adcopysurge-backend --org personal
            
            # Force Dockerfile in fly.toml
            Write-Host "🔧 Ensuring fly.toml forces Docker..." -ForegroundColor Blue
            $flyToml = Get-Content "fly.toml" | ForEach-Object {
                if ($_ -match "^\[build\]") {
                    $_
                    "  dockerfile = `"Dockerfile.fly`""
                    "  builder = `"dockerfile`""
                } else {
                    $_
                }
            }
            $flyToml | Set-Content "fly.toml"
            
            Write-Host "🚀 Deploying to fresh app..." -ForegroundColor Blue
            flyctl deploy --dockerfile Dockerfile.fly --no-cache
            
            Write-Host "⚠️ IMPORTANT: Reset all secrets!" -ForegroundColor Yellow
            Write-Host "flyctl secrets set SECRET_KEY=`$(openssl rand -hex 32)" -ForegroundColor Cyan
            Write-Host "# ... set other secrets as needed" -ForegroundColor Cyan
            
        } catch {
            Write-Host "❌ Nuclear option failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please check Fly.io dashboard and try manual deployment" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Blue
Write-Host "1. Test API: curl https://adcopysurge-backend.fly.dev/health" -ForegroundColor White
Write-Host "2. Deploy frontend to Netlify using DEPLOY_NETLIFY.md guide" -ForegroundColor White
Write-Host "3. Update Netlify environment variables with backend URL" -ForegroundColor White

Set-Location ..
