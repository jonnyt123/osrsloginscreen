<#
.SYNOPSIS
  Start a local static server and open the demo in the default browser (Windows PowerShell version).

USAGE
  ./run.ps1                 # start server on port 8000 and open file-qfr.html
  ./run.ps1 -Simulate       # start and open with ?simulate=1
  ./run.ps1 -Port 9000      # use a custom port
#>

param(
  [switch]$Simulate,
  [int]$Port = 8000
)

function Start-Server {
  param($Port)
  # Prefer python3/python, else npx/http-server, else offer to npm install http-server
  if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $p = Start-Process -FilePath python3 -ArgumentList "-m","http.server","$Port" -PassThru
    return $p
  }
  if (Get-Command python -ErrorAction SilentlyContinue) {
    $p = Start-Process -FilePath python -ArgumentList "-m","http.server","$Port" -PassThru
    return $p
  }
  if (Get-Command npx -ErrorAction SilentlyContinue) {
    $p = Start-Process -FilePath npx -ArgumentList "http-server","-p","$Port" -PassThru
    return $p
  }
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "npx not found. npm is available. Install http-server locally? [y/N]"
    $yn = Read-Host
    if ($yn -match '^[Yy]') {
      npm install --no-audit --no-fund http-server
      if (Get-Command npx -ErrorAction SilentlyContinue) {
        $p = Start-Process -FilePath npx -ArgumentList "http-server","-p","$Port" -PassThru
        return $p
      }
    }
  }
  throw "No supported server found. Install Python or Node (npx) and retry."
}

# Check port usage
try {
  $listener = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
  if ($listener) {
    $pid = $listener.OwningProcess
    Write-Host "Port $Port is in use by PID $pid." -ForegroundColor Yellow
    $yn = Read-Host "Kill that process and continue? [y/N]"
    if ($yn -match '^[Yy]') { Stop-Process -Id $pid -Force }
    else { Write-Host "Aborting."; exit 1 }
  }
} catch { }

$proc = Start-Server -Port $Port
Write-Host "Started server (PID $($proc.Id)) on port $Port"

$uri = "http://localhost:$Port/file-qfr.html"
if ($Simulate) { $uri = "$uri?simulate=1" }
Start-Process $uri

Write-Host "Server will keep running. To stop it, kill PID $($proc.Id) or close this window."
