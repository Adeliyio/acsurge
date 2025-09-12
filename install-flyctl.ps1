# Install Fly CLI for Windows
Write-Host "🛠️ Installing Fly CLI..." -ForegroundColor Blue

# Method 1: Try winget (most reliable)
try {
    Write-Host "Trying winget..." -ForegroundColor Yellow
    winget install fly
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Fly CLI installed via winget!" -ForegroundColor Green
        Write-Host "Please restart your PowerShell and run: flyctl version" -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "winget not available or failed" -ForegroundColor Yellow
}

# Method 2: Try direct PowerShell install
try {
    Write-Host "Trying PowerShell installer..." -ForegroundColor Yellow
    iwr https://fly.io/install.ps1 -useb | iex
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Fly CLI installed via PowerShell!" -ForegroundColor Green
        Write-Host "Please restart your PowerShell and run: flyctl version" -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "PowerShell installer failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Method 3: Manual download instructions
Write-Host "❌ Automatic installation failed. Please install manually:" -ForegroundColor Red
Write-Host "" -ForegroundColor White
Write-Host "📥 Manual Installation:" -ForegroundColor Blue
Write-Host "1. Go to: https://github.com/superfly/flyctl/releases" -ForegroundColor White
Write-Host "2. Download: flyctl_*_Windows_x86_64.zip" -ForegroundColor White
Write-Host "3. Extract to a folder (e.g., C:\\flyctl)" -ForegroundColor White
Write-Host "4. Add the folder to your PATH environment variable" -ForegroundColor White
Write-Host "5. Restart PowerShell and run: flyctl version" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "🔗 Direct download link:" -ForegroundColor Blue
Write-Host "https://github.com/superfly/flyctl/releases/latest/download/flyctl_windows_amd64.zip" -ForegroundColor Cyan
