---
doc_type: feature-ai-qa
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06, R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: [F-11]
  supersedes: null
ui_changed: false
golden_path_verified: false
screenshots: []
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — AI QA Report

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 6축 PASS, 86 passed, 3 profile smoke PASS |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- **verdict: PASS**
- reviewer_at: 2026-05-27
- ui_changed: **false** (자동 판정 — `git diff --cached --name-only`에 `frontend/tests/` 매칭만, `frontend/src/` 매칭 0건)
- golden_path_verified: false (ui_changed=false N/A)
- Flow Mode: **add** (ADR-0032 규칙 4 기본값 — type:test 라벨, 부정 시그널 0건 무질문 add)
- Mode Decision Trace: type:test 라벨 + "snapshot 5종 추가" → modify 시그널 0건 → mode=add 자동 결정
- Touched Areas: 2개 (`frontend/tests/` + `docs/features/feat-snapshot-regression/`) — < 3, Touched Areas 절 생략 가능

## 1. Test Plan 4블록

### Build

- [x] `bash .claude/scripts/validate-doc.sh` — 7 feature docs(brief·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report) 모두 OK
- [x] `pnpm typecheck` — 0 신규 errors

### Automated tests

- [x] `pnpm --filter @app/frontend run test:unit` — **86 passed + 1 skipped** (Sprint 5 #18 baseline 85 + 신규 1 it). 첫 실행 시 `Snapshots: 2 written` (Toast-success + Toast-error)
- [x] `pnpm run smoke:3profiles` — 3/3 PASS (dev 42ms / stg 46ms / prod 54ms) — R-OPS-SMOKE 자기 검증
- [x] manual reproduction (workflow 양축 ADR-0047): `printf 'Closes #19' | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#'` → `19` PASS — R-OPS-WORKFLOW
- [x] AC-01 — `ls frontend/tests/unit/components/__snapshots__/*.snap | wc -l` = **5** PASS
- [x] AC-02 — `grep -cE '^exports\[' Toast.test.tsx.snap` ≥ 2 PASS
- [x] AC-03 — 86 passed 확인 PASS

### Manual verification

- [ ] 사람이 PR diff 확인 — Toast.test.tsx 신규 it 5 (line 61~73) 명확성 + Toast.test.tsx.snap 신설 2 sub-snap (Toast-success, Toast-error) 자동 생성 확인
- [ ] 회귀-01 — 기존 Toast 4 it 모두 PASS (success role=alert + error 닫기 + auto-dismiss 3000ms + durationMs null)
- [ ] 5 컴포넌트 snapshot 도달 확인 (ArticleCard + CommentList + Pagination + TagList + Toast)
- [ ] GitHub Actions 워크플로 로컬 검증 (manual reproduction): `printf 'Closes #19' | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#'` → `19` → PASS (workflow YAML 미변경 PR 양축, ADR-0047)
- [ ] #19 본문 viewport/Playwright/gstack qa/스크린샷 4항은 **#21 이관** 확인 (사용자 (C) 결정)

### DoD coverage

| Acceptance | PR diff | 검증 |
| --- | --- | --- |
| AC-01 (snapshot 5종) | `__snapshots__/Toast.test.tsx.snap` 신설 | ls count PASS |
| AC-02 (Toast 2 sub-snap) | snap 파일 내용 | grep PASS |
| AC-03 (86 passed) | Toast.test.tsx it +1 | vitest 출력 PASS |
| DoD 1~7 | acceptance.md §2 | 자동 + 사람 |

## 2. AI 게이트 6축

| # | 축 | 결과 | 근거 |
| --- | --- | --- | --- |
| 1 | 자동 테스트 (단위/통합) | **PASS** | `pnpm --filter @app/frontend run test:unit` 86 passed + 1 skipped (+1 신규 it, 2 sub-snap written). 기존 4 it 회귀 0건 |
| 2 | 코드 리뷰 (Generator≠Evaluator) | **PASS** | reviewer subagent → `code-review.md` verdict=PASS, MAJOR 0, MINOR 0 |
| 3 | Test Plan 4블록 | **PASS** | §1 Build/Automated/Manual/DoD 4블록 모두 채움 |
| 4 | 시크릿 스캔 | **PASS** | Toast.test.tsx + snap + 7 docs 검토 — 시크릿 0건 |
| 5 | 브라우저 골든패스 실증 (ADR-0011) | **N/A** | ui_changed=false (frontend/src/ 매칭 0건, frontend/tests/만). stylesheet 적용 확인 N/A |
| 6 | 로컬 부팅 가능성 (ADR-0037 v1.1) | **PASS** | §7 표 dev/stg/prod 3 profile 모두 ready + 에러 0건. 부팅 자산 변경 0건 → LOCAL.md 동기 N/A — R-OPS-DOCS-SYNC 자기 검증 |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| AC-01 snapshot 5 컴포넌트 | acceptance.md §1 AC-01 | **PASS** (ls count = 5) |
| AC-02 Toast 2 sub-snap | acceptance.md §1 AC-02 | **PASS** (grep count ≥ 2) |
| AC-03 86 passed | acceptance.md §1 AC-03 | **PASS** (vitest 출력 확인) |
| 회귀-01 Toast 기존 4 it 회귀 보호 | acceptance.md §4 | **PASS** (5/5 모두 통과) |
| #21 이관 항목 | contract.md §6 + risk.md F-RISK-02 | viewport 4×5 + Playwright + gstack qa + 스크린샷 → **#21 이관** (사용자 (C) 결정) |
| 비기능 R-OPS-* 4건 자기 검증 | acceptance.md §3 | PASS (smoke + workflow trigger + LOCAL.md 동기 N/A + 라벨 자동 전이 P11) |

## 4. FAIL 항목

(없음 — verdict=PASS, MAJOR 0)

## 5. 발견 사항 (Found Issues) — 파생 이슈 후보

| 후보 | 3축 OX | 권장 Command |
| --- | --- | --- |
| #19 본문 DoD viewport/Playwright/gstack qa/스크린샷 4항 → #21 이관 본 PR 머지 후 #21 본문 갱신 또는 코멘트 권고 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 이슈 ✅) → A.Derived 또는 자연 흡수 | 본 PR 머지 후 #21 진입 시점에 자연 흡수 |
| snapshot diff 폭증 시 운영 절차 명문화 (토큰 변경 PR template 보강) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 운영 정책 ✅) → A.Derived | Sprint 6+ 토큰 변경 PR 발생 시점 등록 |
| snapshot 5종 외 추가 컴포넌트 (ConfirmModal/EditorForm/CommentForm/NotFound/ErrorBoundary) coverage 확대 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 컴포넌트 ✅) → A.Derived | Sprint 6+ coverage 확대 |
| CI snapshot diff gate (Sprint 1 follow-up (i) CI smoke job과 묶음) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes CI 영역 ✅) → A.Derived | Sprint 1 backlog (i)와 통합 |

## 같은 PR 보정 필요

(없음 — reviewer MAJOR 0/MINOR 0)

## 6. UI/FE 변경 검증

ui_changed=false. `git diff --cached --name-only` 결과: `frontend/tests/unit/components/Toast.test.tsx` + `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap` + docs/. `frontend/src/` 매칭 0건. 5번째 축 N/A. gstack /qa·browse 바이너리·playwright 호출 사유 없음. 콘솔 에러 N/A (테스트 코드만). stylesheet 적용 0개, none.

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| N/A | N/A — ui_changed=false (frontend/src/ 매칭 0건, frontend/tests/만), gstack /qa·browse 바이너리·playwright 호출 사유 없음 | N/A | N/A — 0개, none |

## 7. 로컬 부팅 가능성

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 |
| --- | --- | --- | --- | --- |
| dev | `pnpm run smoke:dev` | `[smoke] backend ready in 42ms → GET /api/articles → 200 → PASS` | 0건 (DEP0190 무관) | 없음 |
| stg | `pnpm run smoke:stg` | `[smoke] backend ready in 46ms → GET /api/articles → 200 → PASS` | 0건 | 없음 |
| prod | `pnpm run smoke:prod` | `[smoke] backend ready in 54ms → GET /api/articles → 200 → PASS` | 0건 | 없음 |

### 부팅 자산 변경 영향

| 자산 | 본 PR diff | 갱신 여부 |
| --- | --- | --- |
| `.env.dev.example` | 미포함 | 변경 없음 |
| `.env.stg.example` | 미포함 | 변경 없음 |
| `.env.prod.example` | 미포함 | 변경 없음 |
| `prisma/migrations/` | 미포함 | 변경 없음 |
| `pnpm-lock.yaml` | 미포함 | 변경 없음 |
| `package.json` (root + workspace) | 미포함 | 변경 없음 |
| `scripts/setup*.sh` | 미포함 | 변경 없음 |
| `LOCAL.md` | 미포함 | 변경 없음 → **LOCAL.md 동기 = N/A 부팅 자산 변경 없음** (ADR-0040 BLOCK 자연 통과, R-OPS-DOCS-SYNC 자기 검증) |

### LOCAL.md 동기 확인 (ADR-0040 / R-OPS-DOCS-SYNC)

부팅 자산 변경 0건 → LOCAL.md 갱신 불필요. N/A 사유: "본 PR은 frontend/tests/unit/components/Toast.test.tsx 신규 it 1 + 자동 생성 snap + 7 feature docs. .env / migrations / lockfile / setup scripts / 부팅 명령 모두 무변경."
