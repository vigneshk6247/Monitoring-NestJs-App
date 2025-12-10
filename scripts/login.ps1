# Quick Login Script
# This script logs in and saves the token for use in other requests

$baseUrl = "http://10.159.191.161:3000/api/v1"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "API Login Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Login credentials
$email = "admin@example.com"
$password = "admin123456"

Write-Host "Logging in as: $email" -ForegroundColor Yellow

# Login request
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Info:" -ForegroundColor Cyan
    Write-Host "  - Name: $($response.user.name)" -ForegroundColor White
    Write-Host "  - Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  - Role: $($response.user.role)" -ForegroundColor White
    Write-Host ""
    Write-Host "Access Token:" -ForegroundColor Cyan
    Write-Host $response.access_token -ForegroundColor Green
    Write-Host ""
    
    # Save token to a file for later use
    $response.access_token | Out-File -FilePath "token.txt" -NoNewline
    Write-Host "✅ Token saved to: token.txt" -ForegroundColor Green
    Write-Host ""
    
    # Example: Test the token by getting namespaces
    Write-Host "Testing token with /namespaces endpoint..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $($response.access_token)"
    }
    
    try {
        $namespaces = Invoke-RestMethod -Uri "$baseUrl/namespaces" -Method Get -Headers $headers
        Write-Host "✅ Namespaces retrieved successfully!" -ForegroundColor Green
        Write-Host "Found $($namespaces.Count) namespace(s)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "⚠️  Could not retrieve namespaces: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "You can now use this token in your API requests:" -ForegroundColor Cyan
    Write-Host 'Authorization: Bearer ' -NoNewline -ForegroundColor White
    Write-Host $response.access_token -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure:" -ForegroundColor Yellow
    Write-Host "  1. The server is running (npm start)" -ForegroundColor White
    Write-Host "  2. The admin user exists" -ForegroundColor White
    Write-Host "  3. The credentials are correct" -ForegroundColor White
}
