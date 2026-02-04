# Check if running as Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "관리자 권한이 필요합니다. 이 창을 닫고 스크립트를 우클릭하여 'PowerShell에서 실행'을 관리자 권한으로 다시 해주세요." -ForegroundColor Red
    Start-Sleep -Seconds 5
    Exit
}

Write-Host "The Golf App 방화벽 설정 중..." -ForegroundColor Cyan

# Remove existing rule if any
Remove-NetFirewallRule -DisplayName "TheGolfApp Backend" -ErrorAction SilentlyContinue

# Add new rule
New-NetFirewallRule -DisplayName "TheGolfApp Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

if ($?) {
    Write-Host "성공! 포트 3000이 열렸습니다." -ForegroundColor Green
    Write-Host "이제 모바일 앱에서 접속이 가능합니다." -ForegroundColor Green
} else {
    Write-Host "실패했습니다." -ForegroundColor Red
}

Write-Host "5초 뒤 종료됩니다..."
Start-Sleep -Seconds 5
