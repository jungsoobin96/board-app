---
doc_type: feature-risk
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-07]
  F-ID: [F-01, F-02, F-03, F-04, F-07]
  supersedes: null
---

# E2E 골든 패스 (Playwright 5건) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — 4 F-RISK 모두 Low/Med |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | Playwright 브라우저 다운로드 실패 (네트워크/방화벽) — 첫 실행 시 ~150MB chromium download 차단 | 3 | 2 | Low |
| F-RISK-02 | webServer 자동 부팅 race — backend(:3000) ready 전 frontend가 baseURL 호출 → ECONNREFUSED | 2 | 2 | Low |
| F-RISK-03 | dev.db 데이터 누적 — 매 실행마다 Editor·Comment spec이 새 데이터 추가, baseline drift 가능성 | 2 | 3 | Low |
| F-RISK-04 | Windows PowerShell 환경 — `setup-playwright.sh`는 Linux apt-get 의존, Windows에서는 별 경로 (`npx playwright install`만 사용) | 2 | 3 | Low |

## 2. 리스크 상세

### F-RISK-01 — Playwright 브라우저 다운로드 실패

`npx playwright install chromium` 첫 실행 시 ~150MB chromium 다운로드. 네트워크 차단·proxy·corporate firewall 시 실패.

**완화책**: 
- `e2e/package.json scripts.test:e2e:install`로 명령 명시 (사람이 수동 1회 실행 가능)
- `PLAYWRIGHT_BROWSERS_PATH` 환경 변수로 사전 다운로드한 브라우저 경로 지정 가능 (corporate 환경)
- 실패 시 BLOCKED comment로 사용자 대응 요청 — 추측 진행 금지
- 본 PR에는 chromium 1 project만 (firefox/webkit 미포함) — 다운로드 부담 최소화

### F-RISK-02 — webServer race

`playwright.config.ts` `webServer` 옵션은 default `reuseExistingServer=true` + `timeout=120000ms`. backend는 tsx watch 시작 시간 ~3s, frontend는 vite ~2s. baseURL hit는 webServer ready 신호 (default `port` 옵션 hit) 후에 발생.

**완화책**:
- `webServer.url` 옵션을 `http://localhost:3000/api/articles?limit=1` (backend ready signal) 또는 `http://localhost:5173/` (frontend ready signal) 두 개 명시 → Playwright가 둘 다 ready 후 진입
- global-setup에서 추가 polling — `fetch('/api/articles?limit=1')` 200 응답까지 ≤30s retry
- backend·frontend 부팅 시간 합산 ~5s ≪ Playwright timeout 120s — 충분한 margin

### F-RISK-03 — dev.db 누적

upsert seed는 글 5·태그 8 baseline은 보장. 단 Editor spec이 매번 새 slug 글을 추가하면 dev.db에 글 6, 7, 8... 누적. 단 home-list spec은 "5건 이상" assert (정확히 5건 아님)로 누적에 강건.

**완화책**:
- global-setup에서 글 slug `e2e-article-*` 패턴 사전 deleteMany 후 baseline 시드 (idempotent)
- 또는 home-list spec assert를 "최소 5건" 패턴으로 (정확히 5건 X) → 누적에 강건
- 누적이 100건+ 도달 시 home-list 페이지네이션이 첫 페이지에 baseline 5건 노출 → 자연 흡수
- Sprint 6+ 후속: dev.db reset 자동화 (afterAll cleanup) 후보

### F-RISK-04 — Windows PowerShell

`scripts/setup-playwright.sh`는 sudo apt-get 의존 (Linux). Windows에서는 본 스크립트 미실행. 단 Playwright는 `npx playwright install chromium`이 Windows에서도 정상 작동 (Playwright가 OS별 binary 자동 선택).

**완화책**:
- `e2e/package.json scripts.test:e2e:install` 명령은 cross-platform (npx playwright install) — Windows 정상
- `scripts/setup-playwright.sh`는 Linux/WSL 전용으로 유지 (변경 X). README 또는 LOCAL.md에 cross-platform 안내는 후속
- 본 PR 작성자 환경 Windows PowerShell — 사전 검증 OK 확인 후 PR open

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 4 RISK 모두 Low. 본 PR은 신규 도구 도입 + 회귀 위험 0 (기존 src 무변경) 이므로 단계적 롤아웃 N/A. 1단계 머지로 충분.

## 4. 데이터 영속성 변경

- dev.db에 글 5·댓글 10·태그 8 baseline seed (idempotent upsert)
- Editor spec이 매번 새 글 1건 추가 → 누적 가능성 있으나 home-list assert 패턴으로 강건 (F-RISK-03 완화)
- Comment spec이 매번 새 댓글 1건 추가 → 누적 가능성 있으나 spec assert는 "새 댓글 노출"만 (정확 개수 X)
- Delete cascade spec은 첫 글 삭제 → global-setup 재시드 시 복원
- 영구 변경 없음, stg/prod 무영향

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. F-RISK-03(dev.db 누적)·F-RISK-04(cross-platform)는 본 feature scope 한정 — Sprint 6+ E2E job CI 도입 시 본 항목 재검토 후보.
