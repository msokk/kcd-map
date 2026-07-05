# KCD live position bridge.
# Tails kcd.log for [LIVEMAP] lines written by the LiveMapTracker mod and
# serves the latest player position as JSON on http://localhost:8765/position
# with CORS enabled, so the map page can poll it from any origin.
#
# Usage:  powershell -ExecutionPolicy Bypass -File live\bridge.ps1
# Stop:   Ctrl+C

param(
    [string]$LogPath = "C:\Program Files (x86)\Steam\steamapps\common\KingdomComeDeliverance\kcd.log",
    [int]$Port = 8765
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "KCD live bridge: http://localhost:$Port/position"
Write-Host "Tailing: $LogPath"
Write-Host "Ctrl+C to stop."

$offset = 0
$last = $null
$pattern = '\[LIVEMAP\]\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)'

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
        if (Test-Path $LogPath) {
            $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
            $fs = New-Object System.IO.FileStream($LogPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share)
            try {
                # Log is recreated on every game launch; start over when it shrinks.
                if ($fs.Length -lt $offset) { $offset = 0 }
                if ($fs.Length -gt $offset) {
                    [void]$fs.Seek($offset, [System.IO.SeekOrigin]::Begin)
                    $buf = New-Object byte[] ($fs.Length - $offset)
                    [void]$fs.Read($buf, 0, $buf.Length)
                    $offset = $fs.Length
                    $text = [System.Text.Encoding]::UTF8.GetString($buf)
                    $found = [regex]::Matches($text, $pattern)
                    if ($found.Count -gt 0) {
                        $m = $found[$found.Count - 1]
                        $last = [ordered]@{
                            x  = [double]$m.Groups[1].Value
                            y  = [double]$m.Groups[2].Value
                            z  = [double]$m.Groups[3].Value
                            dx = [double]$m.Groups[4].Value
                            dy = [double]$m.Groups[5].Value
                            t  = [DateTimeOffset]::Now.ToUnixTimeSeconds()
                        }
                    }
                }
            } finally {
                $fs.Close()
            }
        }

        $res = $ctx.Response
        $res.Headers.Add('Access-Control-Allow-Origin', '*')
        $res.ContentType = 'application/json'
        if ($null -ne $last) { $json = $last | ConvertTo-Json -Compress } else { $json = '{}' }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.Close()
    } catch {
        try { $ctx.Response.Close() } catch {}
    }
}
