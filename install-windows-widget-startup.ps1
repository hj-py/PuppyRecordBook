$nativeInstaller = Join-Path $PSScriptRoot "NativeWidget\install-native-widget-startup.ps1"
if (!(Test-Path $nativeInstaller)) {
  Write-Host "Native widget installer was not found."
  exit 1
}
& $nativeInstaller
