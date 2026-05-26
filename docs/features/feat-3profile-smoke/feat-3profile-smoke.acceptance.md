---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-04]
  F-ID: [F-09]
  supersedes: null
---

# feat-3profile-smoke — Acceptance Criteria

> Issue #5 · mode=add · P6 산출. Issue body AC-1·AC-2 + DoD 6항목 → Given/When/Then + 4블록 Test Plan 시드.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

### AC-01 — `pnpm smoke:3profiles` 단일 명령으로 3 profile 자동 부팅 + 응답 검증

- **Given**: 사용자가 fresh checkout(`git clone`) 후 `pnpm install --frozen-lockfile` 완료한 상태. `.env.dev`·`.env.stg`·`.env.prod` 3종이 `.env.*.example`에서 cp 됨.
- **When**: 사용자가 root에서 `pnpm smoke:3profiles` 1회 실행.
- **Then**:
  - dev(PORT=3000) → stg(PORT=3001) → prod(PORT=3002) 순차 부팅
  - 각 profile별 backend 부팅 후 5초 이내 GET `/api/articles` 응답 200
  - 각 profile별 ready 시간(ms) 콘솔 로그 출력 (예: `[smoke] backend ready in 1240ms`)
  - 3 profile 모두 PASS 시 stdout `[smoke] 3/3 profiles PASSED` + exit code 0
  - 한 profile이라도 timeout 또는 GET ≠ 200 시 fail-fast (`&&`) — 후속 profile 미실행, exit code 1

### AC-02 — fresh checkout 사용자가 LOCAL.md §3만 따라 3 profile 모두 부팅 성공

- **Given**: 신규 합류자가 본 repo를 처음 clone. README 또는 LOCAL.md만 참조.
- **When**: 사용자가 LOCAL.md §2 (Initial Setup) + §3.1·3.2·3.3 (Profile별 부팅) 절차를 그대로 실행 (cp .env + prisma:push + seed:dev + 각 profile 부팅 + smoke).
- **Then**:
  - §2 셋업 명령 0건 실패 (cp 3종·prisma generate·push·seed 모두 PASS)
  - §3.1 dev 부팅 — `[server] Listening on http://localhost:3000 (profile=development)` 콘솔 확인
  - §3.2 stg 부팅 — `[server] Listening on http://localhost:3001 (profile=staging)` 콘솔 확인 (backend `start:stg` script 실 동작)
  - §3.3 prod 부팅 — `[server] Listening on http://localhost:3002 (profile=production)` 콘솔 확인 (backend `start:prod` script 실 동작)
  - 각 절 끝의 "smoke 검증: `pnpm smoke:3profiles`" 1줄 실행 → AC-01과 동일 결과
  - 사용자가 LOCAL.md 외부 문서(예: 12-scaffolding/typescript.md)를 추가 참조하지 않아도 3 profile 부팅 가능

### AC-03 — fail-fast 동작 (의도된 회귀 안전망)

- **Given**: dev `.env.dev` 의도적 삭제 또는 잘못된 DATABASE_URL 설정 (회귀 안전망 검증).
- **When**: `pnpm smoke:3profiles` 실행.
- **Then**:
  - dev profile 부팅 시도 → 5초 timeout 또는 prisma error → 콘솔 `[smoke] profile=dev — FAIL (timeout|error: <msg>)` + exit 1
  - stg·prod profile 미실행 (chain `&&` 끊김)
  - child backend process 좀비 잔존 없음 (SIGTERM + 1초 후 SIGKILL fallback)
  - 사용자에게 명확한 진단 메시지 제공 (child stderr 첫 5줄 첨부 권고)

### AC-04 — child process cleanup (zombie 방지)

- **Given**: smoke 실행 중 사용자가 Ctrl+C로 강제 중단 또는 smoke timeout 발생.
- **When**: smoke.ts가 SIGINT 또는 timeout fail handler 진입.
- **Then**:
  - spawn 된 backend child process에 SIGTERM 전송
  - 1초 후 child가 살아있으면 SIGKILL fallback
  - smoke.ts exit 후 `lsof -i :3000` (또는 `Get-NetTCPConnection -LocalPort 3000`) 점유 0건
  - 동일 PORT로 즉시 재실행 가능 (EADDRINUSE 회귀 없음)

### AC-05 — 빌드·typecheck·테스트 회귀 0건

- **Given**: 본 PR 변경 적용된 상태.
- **When**: 사용자가 `pnpm typecheck && pnpm -r build && pnpm --filter @app/backend test && pnpm --filter @app/backend test:integration` 순차 실행.
- **Then**:
  - typecheck 0 error
  - backend build → dist/server.js 생성
  - 단위 테스트 30+ passed (PR #32 baseline 유지)
  - 통합 테스트 11 passed (PR #29·#32 baseline 유지)
  - 회귀 0건

### AC-06 — 부팅 자산 동기 갱신 (ADR-0040 BLOCK 통과)

- **Given**: 본 PR이 부팅 자산을 변경한 상태 (`backend/package.json scripts` + `scripts/smoke.ts` 신설 + `package.json scripts.smoke:3profiles` + tsx devDeps).
- **When**: AI 게이트 6번째 축이 부팅 자산 diff + LOCAL.md 동기 + 12-scaffolding §7 동기 검증.
- **Then**:
  - LOCAL.md §3.1·3.2·3.3 각 끝에 "smoke 검증" 1줄 추가 확인
  - LOCAL.md §4 부팅 자산 표에 smoke 행 1줄 추가 확인
  - LOCAL.md 변경 이력 v0.3 행 추가 확인
  - 12-scaffolding/typescript.md §7 부팅 자산 표에 smoke 행 1줄 추가 확인
  - 한쪽만 변경 시 ADR-0040 §2.4 BLOCK 가동 (본 PR에서는 통과)

## 2. Definition of Done (D-06)

> Issue #5 body DoD 6항목 + Strict Harness Rules 9·10·12 매핑.

- [ ] **DoD-1**: 3종 `.env.{dev,stg,prod}.example` — 이미 존재(#3 PR 산출), 본 PR 무변경 → 자동 충족 (cross-check: AC-01 Given)
- [ ] **DoD-2**: `scripts/smoke.ts` 신설 (Node tsx + 5초 polling + GET /api/articles 200 검증) → AC-01·AC-03·AC-04 충족
- [ ] **DoD-3**: 3 profile 모두 PASS (`pnpm smoke:3profiles` 실 실행) → AC-01 Then 충족, P10 AI 게이트 6축 + P14 휴먼 게이트 검증
- [ ] **DoD-4**: LOCAL.md §3 동기 갱신 → AC-02·AC-06 충족
- [ ] **DoD-5**: LOCAL.md §4 부팅 자산 표 갱신 → AC-06 Then 충족
- [ ] **DoD-6**: (선택) CI smoke job 추가 → **본 PR 비목표** (GitHub Actions 0 runs 미해결 follow-up 이슈로 분리, contract §6 명시)
- [ ] **단위 테스트**: 본 PR 0건 추가 (Issue body 명시 "단위: N/A · 통합: smoke 자체") + 회귀 0건 (AC-05)
- [ ] **AI 게이트 6축** (ADR-0011 + ADR-0037 v1.1): Build·Tests·Manual·DoD·UI(N/A)·**3-profile boot(본 PR 정식 충족)**
- [ ] **PR Test Plan 4블록** (§4 참조)
- [ ] **PR body `Closes #5`** (squash 영구 보존, ADR-0046 §2.4)
- [ ] **`pr-body-checkboxes` status check 통과** (D-06 2단, ADR-0046 §3 — `tested` 라벨 자체 폐지 v1.2)
- [ ] **Approve ≥ 1 + CI green + Squash and merge** (사용자, P15)

## 3. 비기능 인수

- **성능**: smoke 1회 총 소요 시간 ≤ 30초 (3 profile × 평균 7~10초 부팅 + 5초 polling 여유). CI runner는 ≤ 60초 (별 follow-up 이슈에서 측정).
- **안정성**: 동일 명령 3회 연속 실행 시 PASS율 100% (flake 0건). PORT 점유 회귀 없음 (AC-04).
- **보안 (CLAUDE.md §보안)**:
  - `.env.{dev,stg,prod}` 실파일 commit 0건 (`.gitignore` 검증)
  - smoke.ts·LOCAL.md·12-scaffolding 본문에 시크릿 값 0건 (placeholder만)
  - smoke 실행 로그에 환경변수 값 출력 0건 (PORT만 표시, DATABASE_URL 등 미출력)
  - `.env.*` 직접 cat·echo·printenv 0건 — smoke.ts는 dotenv-cli 또는 Node `process.env`로만 로드, 본문 출력 없음
- **호환성**: Node 20 LTS + pnpm 9 + Windows 11 Pro / macOS / Linux / WSL2 (LOCAL.md §1.4 가정).

## 4. 회귀 인수

> mode=add — 회귀 인수 최소. 단, 본 PR이 backend/package.json scripts 추가 + LOCAL.md 갱신이므로 기존 사용자 회귀 시나리오 확인.

- **회귀-1**: 기존 `pnpm --filter @app/backend dev` 동작 무변경 → `[server] Listening on http://localhost:3000 (profile=development)` 콘솔 확인 (tsx watch + hot reload 유지)
- **회귀-2**: 기존 `pnpm --filter @app/backend dev:stg` 동작 무변경 → tsx 1회 실행 + stg env 로드 (#2 산출 그대로)
- **회귀-3**: 기존 `pnpm --filter @app/backend start` 동작 무변경 → `dotenv -e ../.env.prod -- node dist/server.js` alias 유지 (Backward compat). 신규 `start:prod`로도 동일 동작
- **회귀-4**: 기존 `pnpm --filter @app/backend test`·`test:integration` PASS 유지 → 30+ unit + 11 integration (AC-05)
- **회귀-5**: 기존 LOCAL.md §1·§2 사전 셋업 절차 무변경 → 신규 v0.3 변경 이력은 §3·§4·변경 이력만 영향
- **회귀-6**: `.env.dev`·`.env.stg`·`.env.prod` 변수 추가/제거 0건 → 기존 사용자 cp 절차 무변경
- **회귀-7**: 기존 `prisma:push`·`seed:dev` 동작 무변경 → #3 산출 그대로

## (참고) Test Plan 4블록 시드 — P10 PR body 변환용

> 본 절은 P10 `/qa-test --ai`가 PR body로 변환하는 시드. 실 체크는 D-06 게이트에서 사용자 책임. **체크박스는 항상 미체크 상태로 PR body에 박힘 (ADR-0046 §2.3 + validate-doc.sh §5f BLOCK)**.

### Build
- [ ] `pnpm install --frozen-lockfile` 성공 (tsx devDeps 동기)
- [ ] `pnpm typecheck` 0 error
- [ ] `pnpm -r build` 성공 (backend tsc -b → dist/)

### Automated tests
- [ ] `pnpm --filter @app/backend test` → 30+ passed (PR #32 baseline 유지)
- [ ] `pnpm --filter @app/backend test:integration` → 11 passed (PR #29·#32 baseline 유지)
- [ ] 신규 단위 테스트 0건 (Issue body 정합 — smoke 자체가 통합 검증)

### Manual verification
- [ ] `pnpm smoke:3profiles` 실행 → 3 profile 모두 PASS + 콘솔 `[smoke] 3/3 profiles PASSED` 확인 (AC-01·DoD-3)
- [ ] LOCAL.md §3·§4 + 변경 이력 v0.3 + 12-scaffolding §7 갱신 1회 시각 검토 (AC-06·DoD-4·DoD-5)
- [ ] (선택) fresh checkout 시뮬레이션 — 별 디렉토리 clone → §2·§3 절차 그대로 → 3 profile PASS (AC-02)
- [ ] (ADR-0047) GitHub Actions 워크플로 로컬 검증 (act 또는 manual): **N/A — `.github/workflows/` 디렉토리 부재 (별 follow-up 이슈로 분리)** → 사유 명시 후 통과

### DoD coverage
- [ ] DoD-1·2·3·4·5 모두 PR diff에 매핑됨 (DoD-6 비목표 사유 contract §6 명시)
- [ ] AC-01~06 모두 검증 가능
- [ ] 회귀-1~7 모두 PASS
- [ ] AI 게이트 6축 PASS — Build·Tests·Manual·DoD·UI(N/A)·**3-profile boot(정식 충족)**
- [ ] `Closes #5` PR body commit 영구 보존 (squash, ADR-0046 §2.4)

