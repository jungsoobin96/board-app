---
doc_type: feature-ai-qa
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-07]
  F-ID: [F-01, F-02, F-03, F-04, F-07]
  supersedes: null
ui_changed: false
---

# E2E 골든 패스 (Playwright 5건) — AI QA Report

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — 6축 + 3 profile smoke + workflow 양축 결과 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- at: 2026-05-28
- ui_changed: **false** — e2e/specs/*.ts + e2e/global-setup.ts + e2e/playwright.config.ts + e2e/package.json + pnpm-lock.yaml + docs/features/feat-e2e-golden-path/* (frontend src·*.css·*.html 무변경)
- Flow Mode: **add** (ADR-0032)
- Mode Decision Trace: **규칙 4 (부정 시그널 0건, type:test 라벨 + area:frontend + 신규 동작 E2E 도입)** — type:bug 없음, UI/design 키워드 없음, 기존 동작 변경 없음. 자동 결정 진행.

## 1. Test Plan 4블록

### Build

- [x] `pnpm install` — @playwright/test 1.49.1 추가, lockfile 갱신
- [x] `pnpm --filter @app/backend build` — 0 errors (tsc -b)
- [x] `pnpm --filter @app/frontend build` — **TS 3건 에러 (#48 백로그 알려진 이슈)** — 본 PR scope 밖 (frontend src 무변경). dev profile은 vite dev로 정상 (e2e 5 PASS로 자기 증명)
- [x] `pnpm exec playwright install chromium` 시도 → chromium_headless_shell extract stuck → `channel: 'chrome'` Windows 시스템 Chrome 우회로 정합

### Automated tests

- [x] `pnpm --filter @app/backend test:integration` — **36 passed** (PR #62 baseline 25 + 11 추가 무변경 유지)
- [x] `pnpm --filter @app/frontend test:unit` — **86 passed** (1 skipped) Sprint 4 baseline 무변경
- [x] `pnpm --filter @app/e2e test` — **5 passed** (16.8s, chromium=Windows Chrome): home-list / article-create / article-detail-comment / article-delete-cascade / tag-filter

### Manual verification

- [ ] AC-01 Home — http://localhost:5173/ 방문 → 글 카드 5건 + 사이드바 태그 8개 표시 + 콘솔 0 에러 확인
- [ ] AC-02 Editor — /editor → title·author·body·tags 입력 → 발행 → /article/:id 이동 + 본문 노출
- [ ] AC-03 Article + 댓글 — global-setup 첫 글 방문 → 댓글 작성 → 목록 노출
- [ ] AC-04 Delete cascade — global-setup 마지막 글 방문 → 삭제 → Home 미노출
- [ ] AC-05 Tag 필터 — 태그 칩 클릭 → ?tag=name URL + 재클릭으로 해제
- [ ] gstack `/qa` 1회 실행 — 5 화면 스크린샷 docs/features/feat-e2e-golden-path/screenshots/에 저장
- [ ] GitHub Actions 워크플로 로컬 검증 (act 또는 manual): `gh pr view 21 --json body --jq '.body' | awk '/^### Manual verification/{f=1;next} /^### |^---/{f=0} f' | grep -cE '^[[:space:]]*-[[:space:]]*\[ \]'` → 결과 > 0 = pr-body-checkboxes status check PASS 예상

### DoD coverage

- [ ] R-F-01 (Home) ↔ e2e/specs/home-list.spec.ts ↔ 단위 회귀 86 frontend
- [ ] R-F-02 (Editor) ↔ e2e/specs/article-create.spec.ts ↔ 단위 회귀 86 frontend
- [ ] R-F-03 (Article) ↔ e2e/specs/article-detail-comment.spec.ts ↔ 단위 회귀 86 frontend
- [ ] R-F-04 (Delete cascade) ↔ e2e/specs/article-delete-cascade.spec.ts ↔ 단위 회귀 86 + 통합 36 backend
- [ ] R-F-07 (Tag 필터) ↔ e2e/specs/tag-filter.spec.ts ↔ 단위 회귀 86 frontend (PR #58 active 재클릭 해제 정합)

## 2. AI 게이트 6축

| # | 축 | 결과 | 근거 |
|---|---|---|---|
| 1 | **자동 테스트 통과** | PASS | backend 36 + frontend 86 + e2e 5 = 127 total |
| 2 | **AI 코드 리뷰 PASS** | PASS | feat-e2e-golden-path.code-review.md verdict=PASS |
| 3 | **Test Plan 4블록 첨부** | PASS | §1 4 subsection 모두 충족 |
| 4 | **시크릿·보안 스캔 통과** | PASS | 시크릿 0건 (URL·locator·dummy seed payload만) |
| 5 | **브라우저 골든패스 실증** | N/A | ui_changed=false (frontend src 무변경, e2e 신설만) — 단 본 PR이 E2E 자체이므로 5 spec PASS = 자기 실증 |
| 5b | **stylesheet 적용 확인** | N/A | ui_changed=false (조건부) |
| 6 | **로컬 부팅 가능성** | PASS | §7 3 profile smoke 3/3 PASS |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| AC-01 Home 글 목록 + 인기 태그 | acceptance.md §1 AC-01 (R-F-01, F-01) | ✅ e2e home-list.spec.ts PASS (2.2s) |
| AC-02 Editor 신규 글 작성 → Article 이동 | acceptance.md §1 AC-02 (R-F-02, F-02) | ✅ e2e article-create.spec.ts PASS (3.2s) |
| AC-03 Article 상세 + 댓글 작성 | acceptance.md §1 AC-03 (R-F-03, F-03+F-05) | ✅ e2e article-detail-comment.spec.ts PASS (2.3s) |
| AC-04 Article 삭제 → Home 이동 + cascade | acceptance.md §1 AC-04 (R-F-04, F-04) | ✅ e2e article-delete-cascade.spec.ts PASS (2.8s) |
| AC-05 Tag 칩 클릭 → URL ?tag= → 재클릭 해제 | acceptance.md §1 AC-05 (R-F-07, F-07) | ✅ e2e tag-filter.spec.ts PASS (2.7s) |
| 회귀 backend integration 36 | (베이스라인 유지) | ✅ |
| 회귀 frontend unit 86 + 1 skipped | (베이스라인 유지) | ✅ |
| 회귀 3 profile smoke | scripts/smoke.ts × 3 | ✅ dev 52ms / stg 142ms / prod 108ms 모두 200 |

## 4. FAIL 항목

(없음 — 6축 모두 PASS 또는 N/A 정합)

## 5. 발견 사항

- **#48 백로그 (frontend TS 3건)** — `import.meta.env` + `string|undefined` — frontend stg/prod preview 부팅 차단 (본 PR scope 밖, frontend src 무변경)
- **A.Derived 후보 1**: Sprint 6+ E2E playwright.config headless 표준화 (chromium_headless_shell 정상 환경에서) — 3축 OX 통과 (in_scope=False / blocks_merge=False / same_area=False), `/flow-feature "E2E playwright.config headless 표준화"`로 별 이슈 등록 후보
- **A.Derived 후보 2**: Sprint 6+ E2E CI GitHub Actions job 도입 + viewport 4종 매트릭스 (#19 이관) + cross-browser (firefox/webkit) + visual regression + a11y — 5 후보 모두 별 이슈
- **같은 PR 보정 적용**: code-review Q1 Q4 — contract §2 v0.3에 `channel='chrome'` + `headless=false` 반영, F-RISK-03 upsert 패턴 정합 확인

## 6. UI/FE 변경 검증

ui_changed=false — frontend src 무변경, e2e 신설만. 본 절은 schema 강제로 N/A 표만 작성.

- gstack_qa_used: N/A 사전 합의 (ui_changed=false, **playwright** 5 spec PASS로 자기 검증 — 실제 브라우저 골든패스 5회 자동 실행)
- console_errors: N/A 사전 합의 (ui_changed=false, e2e spec 내부 pageerror 검증 0건)
- stylesheet 적용 근거: N/A — ui_changed=false (frontend src 무변경, 기존 **tailwind** css bundle stylesheet 그대로 유지)

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| N/A | ui_changed=false (e2e 신설만) | N/A | N/A — 기존 tailwind 유지 |

## 7. 로컬 부팅 가능성

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 |
| --- | --- | --- | --- | --- |
| dev | `pnpm run smoke:dev` (LOCAL.md §3.1) | backend ready in 52ms → GET /api/articles → 200 → PASS | 0건 | LOCAL.md 동기 ✅ N/A 부팅 자산 변경 없음 (e2e self-contained, .env.{dev,stg,prod}.example·migrations·lockfile·LOCAL.md §3 무변경 — pnpm-lock.yaml만 @playwright/test 추가, 부팅 명령 영향 0) |
| stg | `pnpm run smoke:stg` (LOCAL.md §3.2) | backend ready in 142ms → GET /api/articles → 200 → PASS | 0건 | LOCAL.md 동기 ✅ N/A 부팅 자산 변경 없음 |
| prod | `pnpm run smoke:prod` (LOCAL.md §3.3) | backend ready in 108ms → GET /api/articles → 200 → PASS | 0건 | LOCAL.md 동기 ✅ N/A 부팅 자산 변경 없음 |

- 부팅 명령: LOCAL.md §3 dev/stg/prod profile별 명령 그대로 사용 (12-scaffolding §5 SoT 정합)
- 에러: 0건 (3 profile 모두 ready 신호 + 200 응답)
- 부팅 자산 변경 영향: pnpm-lock.yaml에 @playwright/test devDep 추가 — backend·frontend 부팅 영향 0 (별 workspace e2e self-contained)
- LOCAL.md 동기: ✅ N/A 부팅 자산 변경 없음 (ADR-0040 §2.4 정합)
- frontend stg/prod preview는 #48 백로그(별 이슈)로 부팅 차단 — 본 PR scope 밖, dev profile + e2e 5 PASS로 자기 검증
