# keefe's soiety

세계 경제와 한국 경제 흐름을 한 화면에서 정리하는 PWA형 경제 대시보드입니다.

## 실행

```powershell
.\start.ps1
```

브라우저에서 `http://127.0.0.1:4173`을 열면 됩니다.

Node.js가 PATH에 잡혀 있는 환경에서는 `npm start` 또는 `node server.mjs`도 사용할 수 있습니다.

## 현재 구성

- 기준시각을 표시하는 시장 지표 프록시: KOSPI, USD/KRW, S&P 500, VIX, 원자재 등
- Google News RSS 기반 경제·전쟁·사고·재난 헤드라인 수집과 사건 단위 중복 제거
- 한국 관점 위험 점수와 체크포인트 자동 생성
- 기사별 상세 분석: 핵심 의미, 시장 영향, 한국 영향, 다음 확인 항목
- PWA manifest와 service worker 포함

## 예약 AI 뉴스 분석

공개 사이트의 예약 분석은 Codex 구독 사용량이 아니라 OpenAI API 키를 사용합니다. GitHub Actions가 매시 17분에 실행되며, 컴퓨터가 꺼져 있어도 새 기사 최대 6건을 `low` 추론으로 한 번에 분석합니다. 같은 사건 키는 7일 동안 재분석하지 않고, 동시에 두 작업이 겹치면 이전 작업을 취소합니다.

1. GitHub 저장소에서 `Settings > Secrets and variables > Actions`로 이동합니다.
2. `New repository secret`을 눌러 이름을 `OPENAI_API_KEY`로 만들고 API 키를 저장합니다.
3. `Actions > Update news cache > Run workflow`로 한 번 수동 실행해 확인합니다.

기본 모델은 `gpt-5.6-luna`입니다. 저장소의 Actions variable `AI_MODEL`로 바꿀 수 있습니다. 공개 사용자의 클릭으로 API 비용이 반복 발생하지 않도록 온디맨드 AI는 기본적으로 꺼져 있으며, 예약 결과가 없는 기사는 데이터 기반 자동 요약을 사용합니다.

로컬에서 실제 AI를 시험할 때는 다음 환경 변수를 설정합니다.

```powershell
$env:OPENAI_API_KEY="..."
$env:AI_MODEL="gpt-5.6-luna"
$env:AI_REASONING_EFFORT="low"
$env:AI_ON_DEMAND_ENABLED="true"
```
## Play Store로 확장할 때

- TWA 또는 Capacitor 래핑
- 실제 운영 API 키 연결: 한국은행 ECOS, FRED, News API, 거래소/증권사 시세
- 사용자 알림, 관심 지표 저장, 서버 캐시와 장애 모니터링 추가
