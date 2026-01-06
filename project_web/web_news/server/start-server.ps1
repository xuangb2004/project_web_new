# PowerShell script to start the server with error checking

Write-Host "=== Starting Web News Server ===" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with database credentials" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Dependencies not installed. Running npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ npm install failed!" -ForegroundColor Red
        exit 1
    }
}

# Check if index.js exists
Write-Host "Checking index.js..." -ForegroundColor Yellow
if (Test-Path "index.js") {
    Write-Host "✓ index.js found" -ForegroundColor Green
} else {
    Write-Host "✗ index.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Starting server ===" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
npm start

