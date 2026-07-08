Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinFocus {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr h, int nCmdShow);
}
"@

$p = Get-Process | Where-Object { $_.MainWindowTitle -like "*Open Design*" } | Select-Object -First 1
if ($p) {
    [WinFocus]::ShowWindow($p.MainWindowHandle, 9)
    [WinFocus]::SetForegroundWindow($p.MainWindowHandle)
    Write-Output "Focused Open Design"
} else {
    Write-Output "Open Design not found"
}
