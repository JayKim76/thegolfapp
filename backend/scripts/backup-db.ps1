# Backs up the SQLite database (backend\prisma\dev.db) with a timestamp.
# Uses sqlite3's .backup when available; otherwise a plain copy.
# Keeps the newest 14 backups in backend\backups\.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$Db = 'prisma\dev.db'
$DestDir = 'backups'
$Keep = 14

if (-not (Test-Path $Db)) { throw "DB not found: $Db" }
New-Item -ItemType Directory -Force $DestDir | Out-Null

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$Dest = Join-Path $DestDir "dev-$Stamp.db"

if (Get-Command sqlite3 -ErrorAction SilentlyContinue) {
    sqlite3 $Db ".backup '$Dest'"
} else {
    Copy-Item $Db $Dest
    Write-Host 'note: sqlite3 not found, used plain file copy.'
}
Write-Host "backup created: $Dest"

Get-ChildItem "$DestDir\dev-*.db" | Sort-Object LastWriteTime -Descending |
    Select-Object -Skip $Keep | Remove-Item -Force
