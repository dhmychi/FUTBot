# Test KeyAuth Seller Key
param(
    [Parameter(Mandatory=$true)]
    [string]$SellerKey
)

Write-Host "Testing Seller Key: $SellerKey" -ForegroundColor Cyan
Write-Host "Length: $($SellerKey.Length)" -ForegroundColor Yellow

if ($SellerKey.Length -ne 32) {
    Write-Host "ERROR: Seller key must be exactly 32 characters!" -ForegroundColor Red
    exit 1
}

# Use GET method with query parameters (like the working example from KeyAuth dashboard)
$queryParams = @{
    sellerkey = $SellerKey
    type = "add"
    expiry = "1"
    amount = "1"
    level = "1"
    mask = "******-******-******-******-******-******"
    format = "JSON"
    note = "Test from PowerShell Script"
}

$queryString = ($queryParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$([uri]::EscapeDataString($_.Value))" }) -join "&"
$url = "https://keyauth.win/api/seller/?$queryString"

try {
    $response = Invoke-WebRequest -Uri $url -Method GET
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "SUCCESS! Seller key is valid." -ForegroundColor Green
        Write-Host "License key created: $($result.key)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

