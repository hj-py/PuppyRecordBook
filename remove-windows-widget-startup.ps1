$shortcutPath = Join-Path ([Environment]::GetFolderPath("Startup")) "Puppy Quick Log.lnk"
$desktopShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "Puppy Quick Log.lnk"

if (Test-Path $shortcutPath) {
  Remove-Item -LiteralPath $shortcutPath
  Write-Host "Puppy Quick Log auto-start has been removed."
} else {
  Write-Host "Puppy Quick Log auto-start was not installed."
}

if (Test-Path $desktopShortcutPath) {
  Remove-Item -LiteralPath $desktopShortcutPath
  Write-Host "Puppy Quick Log desktop shortcut has been removed."
}
