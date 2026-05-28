---
doc_type: feature-code-review
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

# E2E 골든 패스 (Playwright 5건) — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — verdict PASS + 발견 사항 3건 분류 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-28

5 spec 모두 PASS (16.8s) + 기존 회귀 무영향 (backend 36 + frontend 86) + 3 profile smoke 3/3 PASS. PR 생성 허가.

## 1. 컨트랙트 충실도

- Contract §2 Before/After 10행 모두 PR diff에 매핑 ✅
  - `e2e/package.json` devDep + scripts 추가 ✅
  - `e2e/playwright.config.ts` 신설 (testDir/projects/webServer/globalSetup/headless=false/channel=chrome) ✅
  - `e2e/global-setup.ts` 신설 (waitForBackend + clearSeedArticles + seedArticles + seedComments) ✅
  - `e2e/specs/{home-list, article-create, article-detail-comment, article-delete-cascade, tag-filter}.spec.ts` 신설 5건 ✅
  - `pnpm-lock.yaml` @playwright/test 추가 ✅
- Contract §3 호출자 11행 — backend·frontend dev 서버 read-only, dev.db idempotent seed, e2e workspace self-contained ✅
- Contract §4 Backward=no, §5 Rollback=yes 1단계 revert — 영향 없음 ✅
- Contract §0 Referenced-IDs 5행 모두 정합 — R-F-01~04+07 / F-01~04+07 / e2e/specs+global-setup+config / 6 endpoint / (none) ✅

## 2. 테스트 커버리지

- Plan §3 테스트 매핑 5건 + 회귀 1건 모두 PR diff에 매핑 ✅
- E2E 5 spec 실 PASS (16.8s, Windows Chrome):
  - home-list (F-01) ✅
  - article-create (F-02) ✅
  - article-detail-comment (F-03+F-05) ✅
  - article-delete-cascade (F-04) ✅
  - tag-filter (F-07) ✅
- 회귀 무영향:
  - backend integration **36 passed** (perf 1건 포함, PR #62 baseline 유지)
  - frontend unit **86 passed** (1 skipped, Sprint 4 baseline 유지)
- 3 profile smoke:
  - dev: backend ready 52ms → 200 PASS
  - stg: backend ready 142ms → 200 PASS
  - prod: backend ready 108ms → 200 PASS

## 3. 보안 / 시크릿

- 시크릿 스캔 0건 — 5 spec + global-setup + config 모두 URL·locator·seed payload만
- API 호출은 `http://localhost:3000/api` 하드코드 (LOCAL dev only, 외부 노출 없음)
- 시드 author는 `e2e-seed` / `e2e-create` / `e2e-commenter` 등 dummy
- backend·frontend src 무변경 — 보안 surface 영향 0

## 4. 가독성 / 단순성

- 5 spec 각각 ~20~30 lines, 단일 시나리오 명확
- locator는 role-based 우선 (`getByRole`, `getByText`) + id-based 보조 (Editor 폼은 `#editor-title` 등)
- global-setup의 `waitForBackend` polling 30회 retry (충분 margin)
- `process.env.E2E_FIRST_ARTICLE_ID`로 spec 간 데이터 공유 (단순)
- `headless: false` + `channel: 'chrome'` 채택 사유는 contract §0 외 본 review 발견 사항 §5 Q1에 명시

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| Q1. Playwright `headless: false` + `channel: 'chrome'` 채택 — 본래 contract §2 After는 `chromium` project default. 단 로컬 install 시 chromium_headless_shell extract 무한 stuck → 우회로 Windows 시스템 Chrome 사용 | True (contract §2 deviation) | False (5 spec PASS로 acceptance 충족) | False (같은 e2e/playwright.config) | **같은 PR 보정** — playwright.config.ts headless·channel 옵션 추가됨. contract §2 Before/After 갱신 후속 후보 (별 docs PR 또는 본 PR에서 lock-in) |
| Q2. Sprint 6+ Linux/WSL 환경 또는 GitHub Actions runner에서는 chromium_headless_shell 정상 작동 가능 — `channel: 'chrome'` override 제거 후보 | False (Sprint 6+ 후보) | False | True (별 환경 영역) | **A.Derived** — Sprint 6+ 별 이슈 후보 (`/flow-feature "E2E playwright.config headless 표준화"`) |
| Q3. frontend build TS 3건 (#48 백로그) — `import.meta.env` + `string\|undefined` 타입 에러. frontend stg/prod preview 부팅 차단 | False (#48 별 이슈) | False (본 PR는 e2e만, dev profile + e2e 5 PASS로 충족) | True (frontend/src 별 영역) | **이미 #48 등록** — 별 이슈 PR로 진행. 본 PR에서 미해결 명시 |
| Q4. global-setup의 SEED_ARTICLES 5건은 매 spec 실행마다 deleteMany 후 재시드 — Editor·Comment spec 추가 데이터는 누적되지만 home-list assert ≥5 패턴으로 강건 | False (Plan §5 decision) | False | False (같은 e2e/global-setup) | **risk §F-RISK-03 완화 적용 확인** — upsert 패턴 정상 작동 (5 spec 재실행 시 baseline 동일) |
| Q5. `headless: false` 모드 — CI 환경(GitHub Actions)에서는 display 없음. 본 PR은 로컬만 가정, CI job 도입 시 headless 표준화 필요 | False (CI 도입 Sprint 6+) | False | True (별 CI 환경) | **A.Derived** — Sprint 6+ CI job 도입 시 같은 이슈 |

## 6. NEEDS-WORK 항목

(없음 — verdict=PASS)
