$Size = if ($args.Count -gt 0) { $args[0].ToLowerInvariant() } else { "small" }
$sizes = @{
  small = @{ arg = "320,500"; width = 320; height = 500; x = 40; y = 40 }
  medium = @{ arg = "380,640"; width = 380; height = 640; x = 40; y = 40 }
  large = @{ arg = "430,720"; width = 430; height = 720; x = 40; y = 40 }
}
$windowConfig = if ($sizes.ContainsKey($Size)) { $sizes[$Size] } else { $sizes.small }

$widgetPath = Join-Path $PSScriptRoot "quick-widget.html"
$resolvedPath = (Resolve-Path $widgetPath).Path
$widgetUrl = (New-Object System.Uri $resolvedPath).AbsoluteUri

Start-Process msedge -ArgumentList "--app=$widgetUrl", "--window-size=$($windowConfig.arg)"

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WindowTools {
  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll")]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
}
"@

$topMost = [IntPtr]::new(-1)
$showWindow = 0x0040
$restoreWindow = 9

for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
  Start-Sleep -Milliseconds 250
  $window = Get-Process msedge -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*Puppy Quick Log*" } |
    Select-Object -First 1

  if ($window) {
    [WindowTools]::ShowWindow($window.MainWindowHandle, $restoreWindow) | Out-Null
    [WindowTools]::SetWindowPos(
      $window.MainWindowHandle,
      $topMost,
      $windowConfig.x,
      $windowConfig.y,
      $windowConfig.width,
      $windowConfig.height,
      $showWindow
    ) | Out-Null
    break
  }
}
