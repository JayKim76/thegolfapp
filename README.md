<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Fyq3PzOKzW8J6oXz1pt6Wdo6GZcZbCLE

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 운영 문서 (설치·서버·유지보수)

- 설치: [docs/install/설치-가이드.md](docs/install/설치-가이드.md) — 백엔드 설치, 폰 앱 빌드(APK), 설치 완료 체크리스트
- 서버 세팅: [docs/install/서버-세팅.md](docs/install/서버-세팅.md) — 환경변수 전체 목록, pm2/systemd 상시 실행, 방화벽·HTTPS
- 유지보수: [docs/install/유지보수.md](docs/install/유지보수.md) — DB 백업/복원, 업데이트 절차, 계정·키 교체, 장애 대응
- 구조 설명: [docs/club-admin-model.md](docs/club-admin-model.md)

## 배포 상태

- API: https://thegolfapp-api.vercel.app (Vercel 프로젝트 thegolfapp-api, Root: backend)
- 웹 콘솔: https://thegolfapp-oh75.vercel.app (Vercel 프로젝트 thegolfapp-web)
- DB: Supabase PostgreSQL (풀러 연결, 환경변수는 Vercel 프로젝트에 설정)
- 관리자 로그인 계정은 Vercel 환경변수 `ADMIN_ID`/`ADMIN_PASSWORD`로 관리한다 (변경 후 재배포 필요)
