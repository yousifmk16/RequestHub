# Sets up a Turso database for Request Hub: applies the migrations, then adds
# the demo data (only if the table is empty). Safe to run more than once.
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-turso.ps1 -DatabaseUrl "libsql://..."
#
# The token is read at a hidden prompt and only lives in this process's
# environment, so it never lands in .env, shell history or the screen.
param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"

if (-not $DatabaseUrl.StartsWith("libsql://")) {
  throw "The URL must start with libsql:// (copy it from the Turso database page)."
}

$secureToken = Read-Host "Paste the Turso token for this database (input is hidden)" -AsSecureString
$token = [System.Net.NetworkCredential]::new("", $secureToken).Password
if ([string]::IsNullOrWhiteSpace($token)) { throw "No token entered." }

$env:DATABASE_URL = $DatabaseUrl
$env:DATABASE_AUTH_TOKEN = $token.Trim()
try {
  Write-Host "`nApplying migrations..."
  npm run db:deploy
  if ($LASTEXITCODE -ne 0) { throw "db:deploy failed (see the message above)." }

  Write-Host "`nAdding demo data..."
  npx tsx prisma/seed.ts
  if ($LASTEXITCODE -ne 0) { throw "Seeding failed (see the message above)." }

  Write-Host "`nDone. The live site uses this database straight away."
}
finally {
  Remove-Item Env:DATABASE_URL, Env:DATABASE_AUTH_TOKEN -ErrorAction SilentlyContinue
}
