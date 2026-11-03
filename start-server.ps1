param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

try {
  $Host.UI.RawUI.WindowTitle = "w记账 · 本地服务"
} catch {
  # Some non-interactive hosts do not expose RawUI.
}

function Test-WLedger {
  param([int]$TestPort)
  try {
    $response = Invoke-WebRequest -Uri ("http://127.0.0.1:{0}/" -f $TestPort) -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -eq 200 -and $response.Content -match "w记账")
  } catch {
    return $false
  }
}

function Get-LanAddresses {
  $addresses = @()
  try {
    $addresses = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
      Where-Object {
        $_.IPAddress -notmatch "^(127\.|169\.254\.)" -and
        $_.PrefixOrigin -ne "WellKnown"
      } |
      Select-Object -ExpandProperty IPAddress)
  } catch {
    $text = (ipconfig 2>$null | Out-String)
    $matches = [regex]::Matches($text, "IPv4[^:：]*[:：]\s*([0-9]{1,3}(\.[0-9]{1,3}){3})")
    foreach ($match in $matches) {
      $ip = $match.Groups[1].Value
      if ($ip -notmatch "^(127\.|169\.254\.)") {
        $addresses += $ip
      }
    }
  }
  return @($addresses | Select-Object -Unique)
}

$existing = $false
$chosenPort = $Port
for ($attempt = 0; $attempt -lt 20; $attempt++) {
  $testPort = $Port + $attempt
  if (Test-WLedger -TestPort $testPort) {
    $existing = $true
    $chosenPort = $testPort
    break
  }
  $listener = Get-NetTCPConnection -LocalPort $testPort -State Listen -ErrorAction SilentlyContinue
  if (-not $listener) {
    $chosenPort = $testPort
    break
  }
}

if (-not $existing) {
  $pythonExe = $null
  $pythonPrefix = @()
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    $pythonExe = $python.Source
  } else {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
      $pythonExe = $py.Source
      $pythonPrefix = @("-3")
    }
  }
  if (-not $pythonExe) {
    Write-Host ""
    Write-Host "没有找到 Python，无法启动本地服务。" -ForegroundColor Red
    Write-Host "请安装 Python 3，或把整个文件夹部署到任意 HTTPS 静态空间。"
    Write-Host ""
    Read-Host "按回车关闭"
    exit 1
  }
}

$lanAddresses = @(Get-LanAddresses)
$localUrl = "http://127.0.0.1:{0}/" -f $chosenPort
$lanUrl = $null
if ($lanAddresses.Count -gt 0) {
  $lanUrl = "http://{0}:{1}/" -f $lanAddresses[0], $chosenPort
}

Write-Host ""
Write-Host "  ┌──────────────────────────────────────────────┐" -ForegroundColor DarkGray
Write-Host "  │           w 记 账 · 本 地 服 务            │" -ForegroundColor Green
Write-Host "  └──────────────────────────────────────────────┘" -ForegroundColor DarkGray
Write-Host ""

if ($existing) {
  Write-Host "  服务已经在运行，没有再启动第二个。" -ForegroundColor Yellow
} else {
  Write-Host "  启动中… 这个窗口不要关，关了服务就会停。" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  电脑打开： $localUrl" -ForegroundColor White
if ($lanUrl) {
  Write-Host "  手机打开： $lanUrl" -ForegroundColor Green
  Write-Host "  （手机和电脑要连同一个 Wi-Fi）" -ForegroundColor DarkGray
} else {
  Write-Host "  没有检测到局域网 IPv4 地址，手机暂时无法访问。" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  首次启动若弹出 Windows 防火墙提示，请允许访问。" -ForegroundColor DarkGray
Write-Host "  公司网络可能禁止手机访问电脑；若打不开，请用 HTTPS 部署。" -ForegroundColor DarkGray
Write-Host "  想装到手机桌面并离线使用，需通过 HTTPS 打开。" -ForegroundColor DarkGray
Write-Host ""

if ($existing) {
  Start-Process $localUrl
  Read-Host "按回车关闭此窗口（不会停止已经在运行的服务）"
  exit 0
}

# Open the browser only after the server has actually answered.
try {
  Start-Job -ScriptBlock {
    param($Url)
    for ($attempt = 0; $attempt -lt 25; $attempt++) {
      try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 1
        if ($response.StatusCode -eq 200) {
          Start-Process $Url
          return
        }
      } catch {
        # The server is still starting.
      }
      Start-Sleep -Milliseconds 400
    }
  } -ArgumentList $localUrl | Out-Null
} catch {
  Write-Host "  浏览器没有自动打开，请手动打开上面的电脑地址。" -ForegroundColor Yellow
}

Write-Host "  服务已启动。按 Ctrl+C 可以停止。" -ForegroundColor DarkGray
Write-Host ""
try {
  & $pythonExe @pythonPrefix -m http.server $chosenPort --bind 0.0.0.0
} catch {
  Write-Host ""
  Write-Host "服务启动失败：$($_.Exception.Message)" -ForegroundColor Red
  Write-Host "可以换一个端口，或检查 Python 是否可用。"
  Read-Host "按回车关闭"
}
