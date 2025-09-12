# AdCopySurge Backend Deployment Script for Fly.io
# This script ensures Docker is used instead of buildpacks

Write-Host "🚀 AdCopySurge Backend Deployment to Fly.io" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if flyctl is installed
if (!(Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Fly CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   1. Download from: https://github.com/superfly/flyctl/releases" -ForegroundColor Yellow
    Write-Host "   2. Or use: winget install fly" -ForegroundColor Yellow
    Write-Host "   3. Or use: choco install flyctl" -ForegroundColor Yellow
    exit 1
}

# Change to backend directory
Set-Location backend

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Blue

# Check if fly.toml exists
if (!(Test-Path "fly.toml")) {
    Write-Host "❌ fly.toml not found in backend directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found fly.toml configuration" -ForegroundColor Green

# Check if Dockerfile.fly exists
if (!(Test-Path "Dockerfile.fly")) {
    Write-Host "❌ Dockerfile.fly not found in backend directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Dockerfile.fly" -ForegroundColor Green

# Display current configuration
Write-Host "`n📋 Current Configuration:" -ForegroundColor Blue
Write-Host "App Name: adcopysurge-backend"
Write-Host "Dockerfile: Dockerfile.fly"
Write-Host "Builder: dockerfile (forced)"

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to proceed with deployment? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔨 Starting deployment..." -ForegroundColor Blue

# Method 1: Try with explicit dockerfile flag
Write-Host "📦 Attempting deployment with explicit Docker flags..." -ForegroundColor Blue
try {
    flyctl deploy --dockerfile Dockerfile.fly --strategy=immediate --no-cache
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    Write-Host "`n📊 Checking deployment status..." -ForegroundColor Blue
    flyctl status
    
    Write-Host "`n📋 Recent logs:" -ForegroundColor Blue
    flyctl logs --limit 50
    
    Write-Host "`n🎉 Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your API is available at: https://adcopysurge-backend.fly.dev" -ForegroundColor Cyan
    Write-Host "📖 API docs: https://adcopysurge-backend.fly.dev/api/docs" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Deployment failed with explicit flags. Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Method 2: Try destroying and recreating the app
    Write-Host "`n🔄 Trying alternative approach: recreate app..." -ForegroundColor Yellow
    
    $recreate = Read-Host "Do you want to destroy and recreate the app? This will reset all settings. (y/N)"
    if ($recreate -eq 'y' -or $recreate -eq 'Y') {
        try {
            Write-Host "🗑️ Destroying existing app..." -ForegroundColor Yellow
            flyctl apps destroy adcopysurge-backend --yes
            
            Write-Host "🆕 Creating new app with Docker..." -ForegroundColor Blue
            flyctl launch --dockerfile Dockerfile.fly --no-deploy --name adcopysurge-backend
            
            Write-Host "⚠️ IMPORTANT: You now need to set all secrets again!" -ForegroundColor Yellow
            Write-Host "Run the following commands to set your secrets:" -ForegroundColor Yellow
            Write-Host "flyctl secrets set SECRET_KEY=`$(openssl rand -hex 32)" -ForegroundColor Cyan
            Write-Host "flyctl secrets set OPENAI_API_KEY=your-openai-key" -ForegroundColor Cyan
            Write-Host "flyctl secrets set REACT_APP_SUPABASE_URL=your-supabase-url" -ForegroundColor Cyan
            Write-Host "# ... (see DEPLOY_FLY.md for complete list)" -ForegroundColor Cyan
            
            Write-Host "`nAfter setting secrets, run: flyctl deploy --dockerfile Dockerfile.fly" -ForegroundColor Green
            
        } catch {
            Write-Host "❌ App recreation failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please check the logs and try manual deployment" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📝 Next steps:" -ForegroundColor Blue
Write-Host "1. Verify health check: curl https://adcopysurge-backend.fly.dev/health"
Write-Host "2. Check API docs: https://adcopysurge-backend.fly.dev/api/docs"
Write-Host "3. Deploy frontend next: cd ../frontend && flyctl deploy"

# Return to original directory
Set-Location ..
