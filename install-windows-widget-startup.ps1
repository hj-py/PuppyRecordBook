$shortcutName = "Puppy Quick Log.lnk"
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder $shortcutName
$desktopShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) $shortcutName
$targetPath = Join-Path $PSScriptRoot "start-windows-widget-small.bat"
$iconPath = Join-Path $PSScriptRoot "leo-widget.ico"

$shell = New-Object -ComObject WScript.Shell
foreach ($path in @($shortcutPath, $desktopShortcutPath)) {
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $targetPath
  $shortcut.WorkingDirectory = $PSScriptRoot
  if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
  }
  $shortcut.Description = "Open Puppy Quick Log"
  $shortcut.Save()
}

Write-Host "Puppy Quick Log will now open automatically when Windows starts."
Write-Host "Startup shortcut:"
Write-Host $shortcutPath
Write-Host "Desktop shortcut:"
Write-Host $desktopShortcutPath
