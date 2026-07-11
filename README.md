# keefe's soiety

세계 경제와 한국 경제 흐름을 한 화면에서 정리하는 PWA형 경제 대시보드입니다.

## 실행

```powershell
.\start.ps1
```

브라우저에서 `http://127.0.0.1:4173`을 열면 됩니다.

Node.js가 PATH에 잡혀 있는 환경에서는 `npm start` 또는 `node server.mjs`도 사용할 수 있습니다.

## 현재 구성

- 실시간 시장 지표 프록시: KOSPI, USD/KRW, S&P 500, VIX, 원자재 등
- Google News RSS 기반 경제 헤드라인 수집
- 한국 관점 위험 점수와 체크포인트 자동 생성
- 기사별 상세 분석: 핵심 의미, 시장 영향, 한국 영향, 다음 확인 항목
- PWA manifest와 service worker 포함

## 생성형 AI 연결

AI 키가 없어도 데이터 기반 자동 분석이 작동합니다. 실제 생성형 AI 분석을 사용하려면 실행 전에 OpenAI 호환 API 값을 설정합니다.

```powershell
$env:AI_API_URL="https://example.com/v1/chat/completions"
$env:AI_API_KEY="..."
$env:AI_MODEL="..."
```

## Play Store로 확장할 때

- TWA 또는 Capacitor 래핑
- 실제 운영 API 키 연결: 한국은행 ECOS, FRED, News API, 거래소/증권사 시세
- 사용자 알림, 관심 지표 저장, 서버 캐시와 장애 모니터링 추가
