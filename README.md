# ANVIL Frontend

ANVIL 관리자 대시보드 (React + Vite).

## 실행 방법
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 로 빌드
```
백엔드(`anvil-backend/platform-api`, 기본 8080)를 먼저 켜 두면 화면이 연결됩니다.
개발 서버가 `/api`를 백엔드로 전달하므로 CORS 설정은 필요 없습니다.

## 백엔드 없이 화면만 개발할 때
`.env`에 아래 한 줄을 넣고 `npm run dev` 하면 `src/mock/report.json`으로 화면이 그려집니다.
```
VITE_USE_MOCK=true
```
mock 모드는 0세대(룰 없음)에서 시작하고, 실행할 때마다 5단계 진행 연출 후 1세대씩 쌓입니다. 수치는 흉내 낸 값이고, 후보·배포 룰 등은 `report.json`의 예시 데이터를 씁니다.

## 폴더 구조
- `src/api/client.js` : 백엔드 호출과 SSE 구독 (끊기면 3초 폴링으로 대체)
- `src/hooks/useReport.js` : 최신 report와 연결 상태
- `src/pages/Dashboard.jsx` : 사이드바 메뉴(홈 · 리포트 · 방어 · 알림, `#/report` 같은 해시로 이동), 화면 조립, 자동 진화 루프
- `src/components/` : 사이드바, 파이프라인, 조작 패널, KPI 카드, 최근 세대, 후보 규칙 표, 성능 차트, 배포 룰셋, 요청 테스트, 학습 데이터, 이벤트 로그
- `src/lib/format.js` : 라벨, 상태 표시, 퍼센트 포맷
- `src/mock/` : 목 데이터 (형식은 `anvil-backend/docs/api.md`)
- `src/styles/global.css` : 공통 스타일

## 화면과 API
| 화면 | 사용하는 API |
|---|---|
| 전체 상태 | `GET /api/report`, SSE `/api/events` |
| 1세대 실행 / 자동 진화 | `POST /api/run` |
| 초기화 | `POST /api/reset` |
| 실시간 요청 테스트 | `POST /api/test`, `GET /api/samples` |
