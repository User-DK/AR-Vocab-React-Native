# Copy AR Assets to Android Project
# This script copies 3D models and audio files to the Android assets folder
# Required for ViroReact to access models in AR view

Write-Host "Copying AR assets to Android project..." -ForegroundColor Cyan

# Define paths
$sourceAssets = ".\assets\ar"
$androidAssets = ".\android\app\src\main\assets\ar"

# Create Android assets directory if it doesn't exist
if (-Not (Test-Path $androidAssets)) {
    Write-Host "Creating Android assets directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $androidAssets -Force | Out-Null
}

# Copy models
Write-Host "Copying 3D models..." -ForegroundColor Green
if (Test-Path "$sourceAssets\models") {
    Copy-Item -Path "$sourceAssets\models" -Destination "$androidAssets\" -Recurse -Force
    Write-Host "✓ Models copied" -ForegroundColor Green
} else {
    Write-Host "⚠ Models folder not found at $sourceAssets\models" -ForegroundColor Yellow
}

# Copy sounds
Write-Host "Copying audio files..." -ForegroundColor Green
if (Test-Path "$sourceAssets\sounds") {
    Copy-Item -Path "$sourceAssets\sounds" -Destination "$androidAssets\" -Recurse -Force
    Write-Host "✓ Sounds copied" -ForegroundColor Green
} else {
    Write-Host "⚠ Sounds folder not found at $sourceAssets\sounds" -ForegroundColor Yellow
}

# Copy vocabulary data
Write-Host "Copying vocabulary data..." -ForegroundColor Green
if (Test-Path "$sourceAssets\vocabulary-data.json") {
    Copy-Item -Path "$sourceAssets\vocabulary-data.json" -Destination "$androidAssets\" -Force
    Write-Host "✓ Vocabulary data copied" -ForegroundColor Green
}

Write-Host "`n✅ Asset copy complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. For iOS: Add the assets/ar folder to your Xcode project" -ForegroundColor White
Write-Host "2. Run: npm run android (or npm run ios)" -ForegroundColor White
Write-Host "3. Make sure AR models are in the correct format (GLB recommended)" -ForegroundColor White

# List copied files
Write-Host "`nCopied files:" -ForegroundColor Cyan
Get-ChildItem -Path $androidAssets -Recurse -File | ForEach-Object {
    Write-Host "  - $($_.FullName.Replace($androidAssets, 'assets/ar'))" -ForegroundColor Gray
}
