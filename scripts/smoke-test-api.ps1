# Nesso API smoke test - exercises every route group with the seeded admin.
#
# Usage:
#   pwsh ./scripts/smoke-test-api.ps1
#   pwsh ./scripts/smoke-test-api.ps1 -BaseUrl http://192.168.1.4:4000/api/v1
#
# Exits 0 if every test passes, 1 if any fail.

[CmdletBinding()]
param(
  [string] $BaseUrl = 'http://localhost:4000/api/v1',
  [string] $Phone = '9066666481',
  [string] $Password = 'Nesso!Admin!2026'
)

$ErrorActionPreference = 'Continue'
$script:Pass = 0
$script:Fail = 0
$script:State = @{}

function Step {
  param(
    [string]$Name,
    [scriptblock]$Action,
    [switch]$ExpectFail
  )
  $start = [DateTime]::Now
  try {
    $result = & $Action
    $ms = [int]([DateTime]::Now - $start).TotalMilliseconds
    if ($ExpectFail) {
      Write-Host ("  FAIL  {0,-50} {1}ms  (expected to fail but did not)" -f $Name, $ms) -ForegroundColor Red
      $script:Fail++
    } else {
      Write-Host ("  PASS  {0,-50} {1}ms" -f $Name, $ms) -ForegroundColor Green
      $script:Pass++
    }
    return $result
  } catch {
    $ms = [int]([DateTime]::Now - $start).TotalMilliseconds
    if ($ExpectFail) {
      Write-Host ("  PASS  {0,-50} {1}ms  (failed as expected)" -f $Name, $ms) -ForegroundColor Green
      $script:Pass++
      return $null
    }
    $status = $null
    try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
    if (-not $status) { $status = '???' }
    Write-Host ("  FAIL  {0,-50} {1}ms  [{2}] {3}" -f $Name, $ms, $status, $_.Exception.Message) -ForegroundColor Red
    $script:Fail++
    return $null
  }
}

function Section {
  param([string]$Title)
  Write-Host ""
  Write-Host "==> $Title" -ForegroundColor Cyan
}

function Req {
  param(
    [string]$Method,
    [string]$Path,
    $Body = $null,
    [switch]$NoAuth
  )
  $headers = @{ 'Content-Type' = 'application/json' }
  if (-not $NoAuth -and $script:State.AccessToken) {
    $headers['Authorization'] = "Bearer $($script:State.AccessToken)"
  }
  $params = @{
    Method     = $Method
    Uri        = "$BaseUrl$Path"
    Headers    = $headers
    TimeoutSec = 15
  }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress) }
  Invoke-RestMethod @params
}

Write-Host "Nesso API smoke test" -ForegroundColor White
Write-Host "Base URL: $BaseUrl"
Write-Host "Admin:    $Phone"
Write-Host ""

Section "Health"
Step "GET /health" { Req GET '/health' -NoAuth } | Out-Null

Section "Auth"
$auth = Step "POST /auth/password" {
  Req POST '/auth/password' @{ username = $Phone; password = $Password } -NoAuth
}
if (-not $auth) { Write-Host "Cannot continue without a session." -ForegroundColor Red; exit 1 }
$script:State.AccessToken = $auth.accessToken
$script:State.RefreshToken = $auth.refreshToken
$script:State.UserId = $auth.user.id

Step "GET /auth/me" { Req GET '/auth/me' } | Out-Null
Step "POST /auth/refresh" {
  $r = Req POST '/auth/refresh' @{ refreshToken = $script:State.RefreshToken } -NoAuth
  $script:State.RefreshToken2 = $r.refreshToken
  $r
} | Out-Null

Step "POST /auth/otp/verify (no Firebase token, expect 4xx)" -ExpectFail {
  Req POST '/auth/otp/verify' @{ firebaseIdToken = ('x' * 60) } -NoAuth
} | Out-Null

Section "Catalog"
Step "GET /catalog/inputs" { Req GET '/catalog/inputs' } | Out-Null
$pops = Step "GET /catalog/pop" { Req GET '/catalog/pop' }
if ($pops -and $pops.Count -gt 0) {
  $popId = $pops[0]._id
  Step "GET /catalog/pop/:id" { Req GET "/catalog/pop/$popId" } | Out-Null
}

Section "Farmers"
Step "GET /farmers/stats"   { Req GET '/farmers/stats' } | Out-Null
$farmers = Step "GET /farmers" { Req GET '/farmers?pageSize=5' }
Step "GET /farmers/pending" { Req GET '/farmers/pending' } | Out-Null

if ($farmers -and $farmers.data.Count -gt 0) {
  $script:State.FarmerId = $farmers.data[0]._id
  Step "GET /farmers/:id" { Req GET "/farmers/$($script:State.FarmerId)" } | Out-Null
}

$unique = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
$newFarmer = Step "POST /farmers (create throwaway)" {
  Req POST '/farmers' @{
    firstName = 'Smoke'
    lastName = 'Test'
    mobileNumber = '9' + $unique.Substring($unique.Length - 9)
    groupAssociation = 'INDEPENDENT'
    productionPractice = 'Conventional'
  }
}
if ($newFarmer) {
  $script:State.ThrowawayFarmerId = $newFarmer._id
  Step "PATCH /farmers/:id" {
    Req PATCH "/farmers/$($script:State.ThrowawayFarmerId)" @{ lastName = 'Updated' }
  } | Out-Null
  Step "POST /farmers/:id/approve" {
    Req POST "/farmers/$($script:State.ThrowawayFarmerId)/approve" @{ approved = $true }
  } | Out-Null
}

Section "Farms"
$farms = Step "GET /farms" { Req GET '/farms?pageSize=5' }
Step "GET /farms/nearby" { Req GET '/farms/nearby?lat=12.97&lng=77.59&radiusKm=50' } | Out-Null
if ($farms -and $farms.data.Count -gt 0) {
  $script:State.FarmId = $farms.data[0]._id
  Step "GET /farms/:id" { Req GET "/farms/$($script:State.FarmId)" } | Out-Null
}

Section "Crops"
$crops = Step "GET /crops" { Req GET '/crops?pageSize=5' }
if ($crops -and $crops.data.Count -gt 0) {
  $cropId = $crops.data[0]._id
  Step "GET /crops/:id" { Req GET "/crops/$cropId" } | Out-Null
}

Section "Activities"
Step "GET /activities/stats" { Req GET '/activities/stats' } | Out-Null
$acts = Step "GET /activities" { Req GET '/activities?pageSize=5' }
if ($acts -and $acts.data.Count -gt 0) {
  $aId = $acts.data[0]._id
  Step "GET /activities/:id" { Req GET "/activities/$aId" } | Out-Null
}

Section "Samples"
Step "GET /samples/stats" { Req GET '/samples/stats' } | Out-Null
Step "GET /samples"       { Req GET '/samples?pageSize=5' } | Out-Null

Section "Audits"
Step "GET /audits/stats" { Req GET '/audits/stats' } | Out-Null
Step "GET /audits"       { Req GET '/audits?pageSize=5' } | Out-Null

Section "Procurement"
Step "GET /procurement/stats" { Req GET '/procurement/stats' } | Out-Null
Step "GET /procurement"       { Req GET '/procurement?pageSize=5' } | Out-Null

Section "Warehouses"
Step "GET /warehouses" { Req GET '/warehouses' } | Out-Null

Section "Inventory"
Step "GET /inventory/stats" { Req GET '/inventory/stats' } | Out-Null
Step "GET /inventory"       { Req GET '/inventory?pageSize=5' } | Out-Null

Section "Notifications"
Step "GET /notifications"          { Req GET '/notifications' } | Out-Null
Step "PATCH /notifications/read-all" { Req PATCH '/notifications/read-all' } | Out-Null

Section "Reports"
Step "GET /reports/pre-harvest" { Req GET '/reports/pre-harvest' } | Out-Null
if ($script:State.FarmerId) {
  Step "GET /reports/farmer-summary" {
    Req GET "/reports/farmer-summary?farmerId=$($script:State.FarmerId)"
  } | Out-Null
}

Section "Weather"
Step "GET /weather (lat/lng)" { Req GET '/weather?lat=12.97&lng=77.59' } | Out-Null

Section "QR / Trace"
Step "GET /public/trace/INVALID (expect 404)" -ExpectFail {
  Req GET '/public/trace/NESSO-DOES-NOT-EXIST' -NoAuth
} | Out-Null

Section "Debug routes (smoke for Sentry)"
Step "GET /debug/sentry/message" { Req GET '/debug/sentry/message' -NoAuth } | Out-Null
Step "GET /debug/sentry/throw (expect 500)" -ExpectFail {
  Req GET '/debug/sentry/throw' -NoAuth
} | Out-Null

Section "Cleanup (cascade delete)"
if ($script:State.ThrowawayFarmerId) {
  Step "DELETE /farmers/:id (cascade)" {
    Req DELETE "/farmers/$($script:State.ThrowawayFarmerId)"
  } | Out-Null
}

Section "Logout / revocation"
Step "POST /auth/logout (blacklist refresh)" {
  Req POST '/auth/logout' @{ refreshToken = $script:State.RefreshToken2 }
} | Out-Null
Step "POST /auth/refresh with revoked token (expect 401)" -ExpectFail {
  Req POST '/auth/refresh' @{ refreshToken = $script:State.RefreshToken2 } -NoAuth
} | Out-Null

Write-Host ""
Write-Host "==================================" -ForegroundColor White
Write-Host ("  $script:Pass passed,  $script:Fail failed") -ForegroundColor White
Write-Host "==================================" -ForegroundColor White

if ($script:Fail -gt 0) { exit 1 } else { exit 0 }
