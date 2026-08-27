param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$OutputDirectory = ".\backups"
)
if (-not $DatabaseUrl) { throw "DATABASE_URL is required." }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path $OutputDirectory "jkadb-$stamp.dump"
pg_dump --format=custom --file=$out $DatabaseUrl
Write-Host "Backup written to $out"
