# Skill Bridge Native Messaging Host Installer for Windows
# Registers the host for Current User (no Administrator access needed)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Skill Bridge Native Host Installer (Windows) " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ExtensionId = Read-Host "Enter your Skill Bridge Extension ID (from chrome://extensions)"
$ExtensionId = $ExtensionId.Trim()

if (-not $ExtensionId) {
    Write-Host "Error: Extension ID cannot be empty!" -ForegroundColor Red
    Exit
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BinaryPath = Join-Path $ScriptDir "bin\skill-bridge-sync-win.exe"
$BatchPath = Join-Path $ScriptDir "run.bat"
$ManifestPath = Join-Path $ScriptDir "com.skillbridge.sync.json"

# Check if packaged standalone binary is available
$HostExecutablePath = $BatchPath
if (Test-Path $BinaryPath) {
    $HostExecutablePath = $BinaryPath
    Write-Host "Detected compiled standalone binary. Registering binary directly (Node-free mode)." -ForegroundColor Yellow
} else {
    Write-Host "No compiled binary found. Falling back to development wrapper (Node.js mode)." -ForegroundColor Cyan
}

# Escape backslashes for JSON formatting
$EscapedHostPath = $HostExecutablePath -replace '\\', '\\\\'

# Generate native manifest
$ManifestContent = @"
{
  "name": "com.skillbridge.sync",
  "description": "Skill Bridge Native Sync Companion",
  "path": "$EscapedHostPath",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$ExtensionId/"
  ]
}
"@

# Save manifest file
[System.IO.File]::WriteAllText($ManifestPath, $ManifestContent)
Write-Host "Generated native host manifest at: $ManifestPath" -ForegroundColor Green

# Register for Google Chrome
$ChromeRegPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.skillbridge.sync"
if (-not (Test-Path $ChromeRegPath)) {
    New-Item -Path $ChromeRegPath -Force | Out-Null
}
Set-ItemProperty -Path $ChromeRegPath -Name "(Default)" -Value $ManifestPath
Write-Host "Registered native host in Google Chrome registry." -ForegroundColor Green

# Register for Microsoft Edge
$EdgeRegPath = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\com.skillbridge.sync"
if (-not (Test-Path $EdgeRegPath)) {
    New-Item -Path $EdgeRegPath -Force | Out-Null
}
Set-ItemProperty -Path $EdgeRegPath -Name "(Default)" -Value $ManifestPath
Write-Host "Registered native host in Microsoft Edge registry." -ForegroundColor Green

Write-Host ""
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "Please reload your Skill Bridge browser extension." -ForegroundColor Cyan
