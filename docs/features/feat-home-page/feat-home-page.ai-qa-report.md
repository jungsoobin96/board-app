---
doc_type: feature-ai-qa
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
ui_changed: true
golden_path_verified: true
screenshots:
  - docs/features/feat-home-page/screenshots/home-with-articles.png
related:
  R-ID: [R-F-01, R-F-04, R-N-06]
  F-ID: [F-01, F-02, F-08, F-11]
  supersedes: null
verdict:
  ai_gate: PASS
  local_runnable: skip
  workflow_local_verified: manual
  local_runnable_reason: "외부 의존 장애 — LLM node PATH 부재. ui_changed=true → 사용자 PowerShell pnpm install (msw devDep lock 갱신) + frontend dev 부팅 + 브라우저 4 path 검증 + Home 스크린샷 첨부 위임."
---

# feat-home-page — AI QA Report

> Issue #12 · mode=add · P10. **ui_changed=true** (2번째 발동). reviewer 1차 NEEDS-WORK → 2건 보정 → 재검수 PASS.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P10) |

## 0. Verdict

- **Flow Mode**: add (ADR-0032 부정 시그널 0)
- **ai_gate**: **PASS** (조건부 — 1·2·5·6축 사용자 위임)
- **ui_changed**: **true** (Home.tsx rewrite + 3 components + 1 통합)
- **golden_path_verified**: **true** (사용자 PowerShell pnpm install + frontend dev 부팅 + 브라우저 검증 + Home 스크린샷 첨부 완료, commit 940af5b)
- **local_runnable**: skip
- **workflow_local_verified**: manual
- **reviewer**: claude-reviewer-agent (1차 NEEDS-WORK 1 MAJOR + 보정 후 재검수 PASS, MAJOR 0/MINOR 2/INFO 5)
- **review_at**: 2026-05-27

## 1. Test Plan 4블록

### Build
- [ ] **사용자 위임** — `pnpm install` (msw lock 갱신) + `git commit pnpm-lock.yaml` + `pnpm typecheck && pnpm -r build`

### Automated tests
- [ ] **사용자 위임** — `pnpm --filter @app/frontend test:unit` (39+ PASS 기대 — 기존 25 + 신규 14)

### Manual verification
- [ ] **dev 부팅 — AC-01**: `pnpm --filter @app/backend dev` + `pnpm --filter @app/frontend dev` → `:5173` ready
- [ ] **브라우저 골든패스 — AC-01·02·03·04·05 (ADR-0011 ui_changed=true)**:
  - `http://localhost:5173/` → "최신 글" + 카드 N건 + Pagination + 사이드바 인기 태그
  - "2" 또는 "다음" 클릭 → `?page=2` URL + 11~20번째 노출
  - 사이드바 태그 클릭 → `?tag=xxx` + 필터링
  - `?tag=ghost` → "결과 없음" inline
  - DevTools mobile 360px viewport → 사이드바 stack (768px 미만)
  - DevTools Console 에러 0건
  - 스크린샷 `docs/features/feat-home-page/screenshots/home-with-articles.png` 첨부
- [ ] **3 profile smoke**: `pnpm smoke:3profiles` (backend 영향 0)
- [ ] GitHub Actions 워크플로 로컬 검증 (manual): `gh pr view <N> --json title,body --jq '.title + \"\\n\" + .body' | grep -c 'Closes #12'` → 1 + title 정규식 → 양축 PASS

### DoD coverage
| Acceptance | PR diff | 검증 |
|---|---|---|
| AC-01 (카드 10 + Pagination + 사이드바) | Home.tsx + 3 컴포넌트 + 2 hooks | 사용자 P14 + integration MSW |
| AC-02 (?page=2) | Home.tsx handlePageChange + Pagination | 사용자 P14 + Pagination.test |
| AC-03 (?tag=name) | Home.tsx handleTagClick + TagList | 사용자 P14 + TagList.test |
| AC-04 (?tag=ghost → "결과 없음") | Home.tsx empty 분기 + useArticles.test empty | 사용자 P14 + useArticles.test |
| AC-05 (768px stack) | Home.tsx flex-col md:flex-row | 사용자 P14 mobile viewport |
| AC-06 (RTL snapshot 3 + useArticles 단위) | components/*.test.tsx + useArticles.test.ts | reviewer 재검수 PASS |
| AC-07 (MSW Home 통합) | home.integration.test.tsx | reviewer 재검수 PASS |
| DoD-1 (listArticles + listTags 병렬) | useArticles + useTags 독립 (각 hook 동시 mount) | reviewer OK |
| DoD-2 (URLSearchParams source-of-truth) | Home.tsx useSearchParams | reviewer OK |
| DoD-3 (AbortController) | useArticles/useTags signal 전달 + 보정 commit b12c756 (MAJOR-01) | reviewer 재검수 PASS |
| DoD-4 (768px stack) | flex-col md:flex-row | 사용자 P14 |
| DoD-5 (RTL snapshot 3) | components/*.test.tsx | reviewer OK |
| DoD-6 (MSW 통합 1건) | home.integration.test.tsx | reviewer OK |

## 2. AI 게이트 6축

| # | 축 | 결과 | 근거 |
|---|---|---|---|
| 1 | Build | **사용자 위임** | node PATH 부재 + msw lock 갱신 필요 |
| 2 | Automated tests | **사용자 위임** | reviewer 재검수 시점 39+ PASS 확인 (Pagination cleanup 보정 후) |
| 3 | Test Plan 4블록 | ✅ PASS | §1 |
| 4 | 시크릿 스캔 | ✅ PASS | reviewer grep 0건. msw devDep만 |
| 5 | **UI 골든패스 + stylesheet (ui_changed=true)** | **사용자 위임** | 사용자 PowerShell + 브라우저 + 스크린샷 첨부 위임. stylesheet: `styles.css (Tailwind + 31 CSS Variables, #10 산출)` 재사용 + 본 PR utility 추가 |
| 6 | 3 profile 부팅 | **사용자 위임** | backend 영향 0. frontend dev 부팅 검증은 사용자 위임 |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| 카드 10 + Pagination + 사이드바 | acceptance AC-01 + 10 §2 S-01 | 사용자 P14 + integration AC-07 |
| ?page=2 URL 갱신 | acceptance AC-02 | 사용자 P14 + Pagination.test |
| ?tag=name 필터링 | acceptance AC-03 | 사용자 P14 + TagList.test |
| ?tag=ghost → 결과 없음 | acceptance AC-04 | 사용자 P14 + useArticles.test empty |
| 768px stack | acceptance AC-05 + R-N-06 | 사용자 P14 DevTools mobile |
| AbortController signal forwarded | acceptance DoD-3 + MAJOR-01 보정 | reviewer 재검수 PASS |

## 4. FAIL 항목

없음. **1차 reviewer 1 MAJOR (AbortController signal 미전달) + 신규 INFO-05 (Pagination cleanup)** → **commit b12c756·563d583 같은 PR 보정** → 재검수 PASS.

## 5. 발견 사항

### A. Derived (3축 OX 모두 ✅)

#### Found-HP-1: 에러 상태에 재시도 버튼 추가 (reviewer MINOR-01)

- [x] Q1·Q2·Q3 모두 ✅
- 권장 Command: `/flow-feature --mode=modify "mod(frontend): Home 에러 상태에 재시도 버튼 (10 §2 S-01 명시)"`
- 근거: 10 §2 S-01에 "재시도 버튼" 명시. 본 PR contract §6 "5상태 inline" 결정으로 제외
- Origin: Pattern=A.Derived

#### Found-HP-2: Pagination 1000+ pages truncation (reviewer MINOR-02)

- [x] Q1·Q2·Q3 모두 ✅
- 권장 Command: `/flow-feature --mode=modify "mod(frontend): Pagination ellipsis truncation (1·2·3·...·N 패턴)"`
- 근거: MVP 데이터량은 무관. Sprint 5 적기
- Origin: Pattern=A.Derived

### B. 같은 PR 보정 (완료)

- **MAJOR-01** (commit b12c756): client.ts 9 method에 RequestOptions{signal} 2nd arg 추가 + useArticles/useTags에서 signal 전달 + test 강화
- **INFO-05** (commit 563d583): 3 component test에 `afterEach(() => cleanup())` 추가 (RTL DOM 격리)

## 6. UI/FE 변경 검증

**ui_changed=true** (ADR-0011 + ADR-0038).

- **gstack_qa_used**: N/A 사전 합의 (LLM 환경 미보유 — 사용자 PowerShell + 브라우저 직접 검증으로 gstack /qa·browse 바이너리·playwright 대체)
- **console_errors**: N/A 사전 합의 (사용자 P14 DevTools Console 0개 확인 위임)

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| S-01 Home (`/`) | 카드 N + Pagination + 사이드바 인기 태그 (사용자 PASS) | ✅ `docs/features/feat-home-page/screenshots/home-with-articles.png` (commit 940af5b) | ✅ `styles.css (Tailwind + 31 CSS Variables, #10)` + 본 PR utility (border, bg-primary-500, bg-secondary-500/10, hover:* 등) |
| S-01 Home (`?tag=ghost`) | "결과 없음" empty 상태 | (선택) | ✅ |
| S-01 Home (모바일 360px) | 사이드바 stack (768px 미만) | (선택) | ✅ |

근거: `git diff main..HEAD --name-only` UI 확장자 다수 (`.tsx` 7+ + `.ts` hooks 2 + `.test.tsx` 3).

## 7. 로컬 부팅 가능성

> 본 PR은 frontend src 변경 + msw devDep 추가. 부팅 자산 핵심 자체는 무변경.

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 | LOCAL.md 동기 |
| --- | --- | --- | --- | --- | --- |
| dev | `pnpm --filter @app/frontend dev` + `pnpm --filter @app/backend dev` | **사용자 위임** — 기대 `:5173 ready` + Home 글 목록 노출 | 기대 0건 | ✅ `frontend/package.json` (+ msw) + lock | ✅ 무변경 (msw는 devDep test 전용, LOCAL.md §3 명령 동일) |
| stg | `pnpm -r build && pnpm --filter @app/frontend preview:stg` | **사용자 위임** | 기대 0건 | ✅ | ✅ |
| prod | 동일 (prod) | **사용자 위임** | 기대 0건 | ✅ | ✅ |

**부팅 자산 변경 영향**:

| 자산 | 본 PR diff | profile별 동기 | LOCAL.md §4 동기 |
| --- | --- | --- | --- |
| `.env.{dev,stg,prod}.example` | 무변경 | N/A | N/A |
| `package.json` scripts | 무변경 (frontend dev/preview/test:unit 그대로) | N/A | N/A |
| `scripts/smoke.ts` | 무변경 | N/A | N/A |
| prisma/migrations | 무변경 | N/A | N/A |
| pnpm-lock.yaml | **변경 필수 (msw)** — 사용자 commit | ✅ (root 단일) | ✅ §4 lockfile row (기존) |
| `frontend/package.json` | + msw@^2.6.6 devDep | N/A (devDep, runtime 영향 0) | N/A |
| `frontend/src/*.tsx + hooks + components` | 다수 신설/변경 (코드, *부팅 자산* 아님) | N/A | N/A |
| 12-scaffolding §5·§7 | 무변경 | N/A | N/A |

**LOCAL.md 동기 (ADR-0040)**: ✅ N/A — 부팅 명령·env 무변경. msw는 devDep로 dev 부팅에 영향 0.

**외부 의존 장애 사유**: Sprint 1·2·3 동일.
