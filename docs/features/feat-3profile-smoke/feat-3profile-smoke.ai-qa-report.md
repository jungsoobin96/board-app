---
doc_type: feature-ai-qa
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
ui_changed: false
golden_path_verified: false
screenshots: []
related:
  R-ID: [R-N-04]
  F-ID: [F-09]
  supersedes: null
verdict:
  ai_gate: PASS
  local_runnable: skip
  workflow_local_verified: manual
  local_runnable_reason: "외부 의존 장애 — LLM 세션 node PATH 부재. 사용자 명시 승인(2026-05-26) 후 P14 휴먼 게이트에서 실 검증 위임. ADR-0037 §3 외부 의존 장애 시 승인 후 skip 절차 정합."
---

# feat-3profile-smoke — AI QA Report

> Issue #5 · mode=add · P10 산출 (D-06 1단 AI 게이트). ui_changed=false (backend infra only).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P10 qa-test --ai) |

## 0. Verdict

- **Flow Mode**: add (ADR-0032 부정 시그널 0 자동 결정)
- **ai_gate**: **PASS** (조건부 — Build·Tests·smoke는 사용자 P14 실 실행 위임)
- **ui_changed**: false (.tsx/.jsx/.vue/.svelte/.html/.css 등 UI 확장자 0건 변경)
- **golden_path_verified**: false (N/A — UI 변경 0)
- **local_runnable**: skip (외부 의존 장애 — LLM 세션 node PATH 부재. 사용자 명시 승인 2026-05-26)
- **workflow_local_verified**: manual reproduction (act docker 부재 + node PATH 부재 → manual 양식)
- **reviewer**: claude-sonnet (AI) + woosung.ahn@bespinglobal.com (휴먼 승인)

## 1. Test Plan 4블록

### Build
- [ ] **사용자 위임** — `pnpm install --frozen-lockfile && pnpm typecheck && pnpm -r build` 실 실행 후 결과 첨부 (외부 의존 장애 승인)
- 기대: tsx devDeps 동기, 0 typecheck error, backend dist/server.js 생성

### Automated tests
- [ ] **사용자 위임** — `pnpm --filter @app/backend test` (30+ passed baseline 유지) + `pnpm --filter @app/backend test:integration` (11 passed baseline 유지)
- 신규 단위 테스트 0건 (Issue body 정합 — smoke 자체가 통합 검증)

### Manual verification
- [ ] **3 profile 부팅 smoke**: `pnpm smoke:3profiles` → `[smoke] 3/3 profiles PASSED` 확인 (AC-01·DoD-3, R-N-04 정식 충족)
- [ ] **fresh checkout 시뮬레이션** (선택): 별 디렉토리 clone → LOCAL.md §2·§3 절차 그대로 → 3 profile PASS (AC-02)
- [ ] **LOCAL.md §3·§4 + v0.3 + 12-scaffolding §5·§7 + v0.2** 시각 검토 (AC-06·DoD-4·DoD-5)
- [ ] **GitHub Actions 워크플로 로컬 검증 (manual reproduction)**: `gh pr view <N> --json title | jq -r '.title' | grep -E '^(feat|fix|chore|docs|refactor|test|style|build|ci|perf|revert)\([a-z0-9-]+\): .+ \(#[0-9]+\)$'` → title 정규식 시뮬레이션 PASS (issue-pr-title-lint.yml 본문 step 대체) + `gh pr view <N> --json body --jq '.body' | grep -c 'Closes #5'` → 1 (sync-issue-labels.yml lifecycle 대체) → 양축 검증 PASS (ADR-0047). 단 docker/node PATH 부재로 `act` 직접 실행 N/A — manual 양식 채택

### DoD coverage
| Acceptance | PR diff | 검증 |
|---|---|---|
| AC-01 (`pnpm smoke:3profiles` 단일 명령 3 profile PASS) | scripts/smoke.ts + package.json scripts.smoke:* | 사용자 P14 실 실행 |
| AC-02 (fresh checkout LOCAL.md §3 절차 PASS) | LOCAL.md §2 6) + §3.1/3.2/3.3 + §4 행 + v0.3 | 사용자 P14 시뮬레이션 |
| AC-03 (fail-fast — dev FAIL 시 stg/prod skip) | package.json scripts.smoke:3profiles `&&` chain | 사용자 P14 의도 시뮬레이션 |
| AC-04 (child cleanup — SIGTERM + SIGKILL fallback) | scripts/smoke.ts:`killChild()` + `process.on("SIGINT")` | 사용자 P14 PORT 점유 검사 |
| AC-05 (회귀 0건 — typecheck/build/test/integration) | 기존 코드 무변경 (런타임 모듈 0) | 사용자 P14 회귀 명령 |
| AC-06 (부팅 자산 동기 ADR-0040) | LOCAL.md + 12-scaffolding §7 양축 갱신 | 본 report §7 확인 |
| DoD-1 (.env.example 3종) | (#3 PR 산출 그대로, 무변경) | 자동 충족 |
| DoD-2 (scripts/smoke.ts 신설) | scripts/smoke.ts (+172 lines) | code-review PASS |
| DoD-3 (3 profile PASS) | scripts.smoke:3profiles | 사용자 P14 |
| DoD-4 (LOCAL.md §3 동기) | LOCAL.md v0.3 | 본 report §7 |
| DoD-5 (LOCAL.md §4 자산 표) | LOCAL.md §4 +1행 | 본 report §7 |
| DoD-6 (CI smoke job, 선택) | **본 PR 비목표** — 별 follow-up 이슈 분리 | contract §6 명시 |

## 2. AI 게이트 6축

| # | 축 (ADR-0011·0037·0038) | 결과 | 근거 |
|---|---|---|---|
| 1 | Build | **사용자 위임** (skip + 승인) | LLM node PATH 부재, P14 실 실행 |
| 2 | Automated tests | **사용자 위임** (skip + 승인) | 동일 사유 |
| 3 | Test Plan 4블록 | ✅ PASS | §1 작성 완료 |
| 4 | 시크릿 스캔 | ✅ PASS | code-review reviewer agent grep 검증 0건 — `console.log(process.env|DATABASE_URL|JWT_SECRET` 직접 출력 0, `.env.{dev,stg,prod}` staged 0, smoke.ts 화이트리스트 출력 |
| 5 | UI 골든패스 + stylesheet (ADR-0011·0038) | ✅ **N/A** | ui_changed=false (확장자 0건). frontend는 Sprint 3 #10 placeholder |
| 6 | 로컬 부팅 가능성 3 profile (ADR-0037 v1.1) | **사용자 위임** (skip + 승인) | §7 참조. P14 휴먼 게이트 위임. 본 PR이 자체로 6번째 축 정식 충족 baseline 제공 — 단 검증 자체는 node 실행 필요 |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| 3 profile 순차 부팅 + GET /api/articles 200 | docs/features/feat-3profile-smoke/feat-3profile-smoke.acceptance.md AC-01 | 사용자 P14 실 실행 위임 |
| fresh checkout LOCAL.md §3 절차 PASS | acceptance.md AC-02 | 사용자 P14 시뮬레이션 |
| fail-fast dev FAIL 시 cascading skip | acceptance.md AC-03 | 사용자 P14 의도 검증 |
| child cleanup PORT 점유 0건 | acceptance.md AC-04 | 사용자 P14 lsof/netstat 확인 |
| 회귀 typecheck/build/unit/integration PASS | acceptance.md AC-05 + plan §4 단계 1 | 사용자 P14 회귀 명령 |
| 부팅 자산 동기 (LOCAL.md + 12-scaffolding 양축) | acceptance.md AC-06 + ADR-0040 §2.4 | 본 report §7 정합 확인 |

## 4. FAIL 항목

없음. **단**, 다음 3개 축(1·2·6)은 verdict "skip + 사용자 승인" — P14 휴먼 게이트에서 실 PASS 확인 필요.

- 1번 축 (Build): 사용자 위임
- 2번 축 (Automated tests): 사용자 위임
- 6번 축 (3 profile boot smoke): 사용자 위임

## 5. 발견 사항

### A. Derived (3축 OX 모두 ✅ — 별 follow-up 이슈 등록 후보)

#### Found-Q-1: GitHub Actions smoke 워크플로 신설 (.github/workflows/smoke.yml)
- [x] Q1. in_scope == False (DoD-6 "선택" + contract §6 비목표 명시)
- [x] Q2. blocks_parent_merge == False (본 PR 머지에 CI smoke 불필요)
- [x] Q3. same_area == False (.github/workflows/ 영역, 본 PR scripts/ + package.json과 다름)
- 권장 Command: `/flow-feature "feat(ci): GitHub Actions smoke 워크플로 신설 (act 호환 + PR 트리거 + 3 profile matrix)"`
- 근거: F-RISK-01 모니터링 (CI runner 측정) + ADR-0047 N/A 사유 영구 해소
- Origin: Discovered-in=`#5-PR`, Discovered-by=`/qa-test --ai`, Discovered-at=`2026-05-26 KST`, Pattern=A.Derived, 3-axis=`[True, True, True]`

#### Found-Q-2: pollReady fetch 응답 body 소비 (reviewer MINOR-1)
- [x] Q1. in_scope == False (code-review MINOR)
- [x] Q2. blocks_parent_merge == False
- [x] Q3. same_area == False (안정성 미세 개선)
- 권장 Command: `/flow-feature --mode=modify "mod(infra): scripts/smoke.ts pollReady fetch body 명시 cancel/text 처리 (resource leak 회피)"`
- 근거: code-review.md MINOR-1
- Origin: Discovered-by=`/qa-test --ai (reviewer agent fan-in)`, Pattern=A.Derived

#### Found-Q-3: engines `>=20.11.0` 또는 `import.meta.dirname` fallback (reviewer INFO-1)
- [x] Q1·Q2·Q3 모두 ✅
- 권장 Command: `/flow-feature --mode=modify "mod(infra): package.json engines >=20.11.0 정정 (import.meta.dirname Node 20.0~20.10 미지원 호환성)"`
- Origin: Discovered-by=`/qa-test --ai`, Pattern=A.Derived

#### Found-Q-4: GitHub Actions 0 runs 진단 + sync-issue-labels.yml 동작 복구 (`bug`)
- [x] Q1·Q2·Q3 모두 ✅
- 권장 Command: `/flow-feature --mode=bug "bug(ci): GitHub Actions workflows 0 runs — 트리거 설정 점검 + sync-issue-labels.yml 동작 복구"`
- Origin: Discovered-by=`/context-loader 누적 + /qa-test --ai`, Pattern=C.Bug

### B. 같은 PR 보정 필요 (3축 미통과)

없음. 같은 PR 보정 4건은 P8 implement에서 commit 1·4에 모두 통합 완료 (F-RISK-01 SMOKE_TIMEOUT_MS · F-RISK-04 LOCAL.md §2 6) · F-RISK-05 PORT 검사 · F-RISK-07 화이트리스트).

## 6. UI/FE 변경 검증

**N/A — ui_changed=false** (ADR-0011 §3.2 BE-only 케이스).

- **gstack_qa_used**: N/A 사전 합의 (ui_changed=false → playwright/browse 바이너리 호출 불필요)
- **console_errors**: N/A 사전 합의 (브라우저 세션 0건)

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| N/A | N/A — ui_changed=false (backend infra only) | N/A | N/A — ui_changed=false |

근거: `git diff main..HEAD --name-only`:
```
LOCAL.md
backend/package.json
docs/features/feat-3profile-smoke/feat-3profile-smoke.{brief,contract,plan,eng-review,acceptance,risk,code-review}.md
docs/planning/12-scaffolding/typescript.md
package.json
scripts/smoke.ts
```
- UI 확장자 (`.tsx`·`.jsx`·`.vue`·`.svelte`·`.html`·`.css`·`.scss`·`.module.*`) 0건
- `public/`·`static/`·`assets/` 변경 0건
- 5번째 축 (UI 골든패스 + stylesheet) 자동 N/A

frontend 도입은 Sprint 3 #10에서 별 PR 진행 예정 (현재 frontend/는 placeholder 상태).

## 7. 로컬 부팅 가능성

> ADR-0037 v1.1 6번째 축. 본 PR이 *6번째 축 정식 충족 baseline* 자체를 도입. **단** 검증 실행은 node CLI 필요 → 외부 의존 장애 승인 + 사용자 P14 위임.

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 | LOCAL.md 동기 |
| --- | --- | --- | --- | --- | --- |
| dev | `pnpm smoke:dev` (또는 `pnpm --filter @app/backend dev`) | **사용자 위임** — 기대 `[smoke] backend ready in ~1500ms → GET /api/articles → 200 → PASS` + Express `[server] Listening on http://localhost:3000 (profile=development)` | 기대 0건 (사용자 확인) | ✅ scripts/smoke.ts 신설 + scripts.smoke:dev 추가 | ✅ LOCAL.md §3.1 smoke 1줄 + §4 행 + v0.3 |
| stg | `pnpm smoke:stg` (또는 `pnpm --filter @app/backend start:stg`) | **사용자 위임** — 기대 `ready in ~1500ms → 200 → PASS` + Express `Listening on http://localhost:3001 (profile=staging)` | 기대 0건 (단 stg.db 미존재 시 prisma error — LOCAL.md §2 6) `dotenv -e .env.stg -- pnpm --filter @app/backend exec prisma db push` 사전 실행 안내) | ✅ scripts.smoke:stg + backend scripts.start:stg 추가 | ✅ LOCAL.md §3.2 smoke 1줄 + §2 6) DB push |
| prod | `pnpm smoke:prod` (또는 `pnpm --filter @app/backend start:prod`) | **사용자 위임** — 기대 `ready in ~1500ms → 200 → PASS` + Express `Listening on http://localhost:3002 (profile=production)` | 기대 0건 (prod.db도 §2 6) DB push 사전) | ✅ scripts.smoke:prod + backend scripts.start:prod 추가 | ✅ LOCAL.md §3.3 smoke 1줄 + §2 6) DB push |

**부팅 자산 변경 영향** (12-scaffolding §7 ↔ git diff 대조):
| 자산 | 본 PR diff | profile별 동기 | LOCAL.md §4 동기 |
| --- | --- | --- | --- |
| 환경 변수 템플릿 `.env.{dev,stg,prod}.example` | 무변경 (#3 산출 그대로) | N/A — 변수 추가 0 | N/A |
| `package.json` scripts | + smoke:dev/stg/prod/3profiles (root) + start:stg/start:prod/smoke (backend) | ✅ 3 profile 모두 분기 | ✅ LOCAL.md §3 + §4 |
| `scripts/smoke.ts` | 신설 (+172 lines) | ✅ profile 인자 1개로 3 분기 | ✅ LOCAL.md §4 smoke 자동화 행 |
| migrations | 무변경 (#3 산출) | N/A | N/A |
| lockfile | 무변경 (devDeps 추가 0 — backend 기존 tsx + dotenv-cli 재사용) | N/A | N/A |
| 12-scaffolding §5·§7 | §5 smoke 코드블록 정합 갱신 + §7 +1행 (양축 SoT) | ✅ | ✅ 동기 |

**LOCAL.md 동기 (ADR-0040 BLOCK)**: ✅ 모두 갱신 완료 (변경 이력 v0.3 + §2 6) + §3.1·3.2·3.3 smoke 1줄 + §4 자산 표 1행).

**외부 의존 장애 사유** (verdict.local_runnable=skip):
- LLM Bash 세션 PATH에 node 미해결 (`where node` → not found, `cmd /c "where node"` → 빈 결과)
- pnpm 자체 실행 불가 (`/c/Users/.../pnpm: line 15: exec: node: not found`)
- 사용자 명시 승인 2026-05-26 (PR 일단 생성 + Manual 위임 옵션 선택)
- P14 휴먼 게이트에서 사용자가 PowerShell/cmd로 `pnpm install && pnpm typecheck && pnpm -r build && pnpm --filter @app/backend test && pnpm --filter @app/backend test:integration && pnpm smoke:3profiles` 실 실행 + Manual ✅
