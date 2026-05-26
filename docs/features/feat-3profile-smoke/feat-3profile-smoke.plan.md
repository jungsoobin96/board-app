---
doc_type: feature-plan
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

# feat-3profile-smoke — Implementation Plan

> Issue #5 · mode=add · P4 산출. contract §0 selective read 결과로 작성.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P4 implementation-planner FEATURE 분기) |

## 0. 참조 정본 인용 (selective read 결과, ADR-0018)

contract.md §0 표를 파싱하여 다음 절만 발췌 로드:

| 출처 | 발췌 범위 | 본 plan 사용처 |
| --- | --- | --- |
| `docs/planning/04-srs/04-srs.md` line 212~227 | R-N-04 본문 (3 profile 부팅 검증, AC, 테스트 결정 3축) | §1 commit 1 정합 + §3 AC 매핑 |
| `docs/planning/05-prd/05-prd.md` line 176~179 | F-09 본문 (README/LOCAL.md 친화적 설명, P0) | §1 commit 4 LOCAL.md 갱신 정합 |
| `docs/planning/09-lld-api-spec/09-lld-api-spec.md` line 50~80 | GET /api/articles spec (Response 200 schema) | §1 commit 1 smoke.ts polling target + §3 ready 신호 200 검증 |
| `docs/planning/12-scaffolding/typescript.md` line 188~280 | §5 빌드·실행 코드블록 + §7 부팅 자산 표 | §1 commit 2 backend scripts 정합 + §1 commit 5 §7 표 갱신 정합 |
| `docs/planning/11-coding-conventions/11-coding-conventions.md` | (none) — contract §0이 (none) — 본 PR은 코드 컨벤션 PREFIX 영향 없음 | skip |
| `docs/planning/08-lld-module-spec/08-lld-module-spec.md` | (none) — 본 PR은 런타임 모듈 무변경 | skip |

## 1. 커밋 시퀀스 (DAG)

> Issue #5는 부팅 자산 보강 PR이므로 7 commit (squash 시 1 commit). 자연스러운 의존 순서: scripts/smoke.ts(독립 leaf) → backend scripts → root scripts → LOCAL.md → 12-scaffolding §7 → 12-scaffolding §5 검증 → 변경 이력 v0.3.

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | feat(infra): 3 profile 부팅 smoke 스크립트 신설 (#5) | `scripts/smoke.ts` 신설. CLI 인자 1개(profile=dev/stg/prod). dev/stg/prod별 `pnpm --filter @app/backend dev` 또는 `start:<p>` spawn → child stdout/stderr 부모 stream pipe → 250ms × 20회 polling(`http://localhost:${PORT}/api/articles`) → 200 받으면 PASS+kill+exit 0, timeout 또는 child crash 시 FAIL+kill+exit 1. Node 20 내장 `fetch` 사용(외부 의존 0). | 본 commit 자체 검증: 단위 N/A (smoke 자체가 통합 검증). `pnpm tsx scripts/smoke.ts dev` 수동 1회. | 낮음 — 신규 파일, 기존 동작 무영향. timeout 5초가 짧을 risk → F-RISK-01 |
| 2 | feat(infra): backend package.json scripts에 start:stg·start:prod·smoke 추가 (#5) | `backend/package.json` scripts에 + 3줄: `start:stg`: `dotenv -e ../.env.stg -- node dist/server.js`, `start:prod`: `dotenv -e ../.env.prod -- node dist/server.js` (현 `start` 그대로 alias 유지 — backward compat), `smoke`: `dotenv -e ../.env.${SMOKE_PROFILE} -- tsx ../scripts/smoke.ts ${SMOKE_PROFILE}`. | `pnpm --filter @app/backend run start:stg` 수동 부팅 1회 + Ctrl+C. | 낮음 — 신규 scripts 추가. 기존 `start`·`dev`·`dev:stg` 등 무변경. |
| 3 | feat(infra): root package.json scripts에 smoke:3profiles 추가 + devDeps tsx (#5) | `package.json` (root) scripts에 + 1줄: `smoke:3profiles`: `tsx scripts/smoke.ts dev && tsx scripts/smoke.ts stg && tsx scripts/smoke.ts prod`. devDeps에 `tsx@^4.19.0` 추가(이미 backend에 있지만 root에서 호출하므로 명시. `pnpm-lock.yaml` 갱신). | `pnpm smoke:3profiles` 수동 1회(전체). | 중 — F-RISK-02 (chain `&&` 중간 실패 시 후속 profile 미실행). 의도된 동작 (fail-fast) — README 노트 |
| 4 | docs(local): LOCAL.md §3·§4 + 변경 이력 v0.3 동기 갱신 (#5) | `LOCAL.md` §3.1·3.2·3.3 끝에 "smoke 검증: `pnpm smoke:3profiles`" 1줄씩 + §4 표에 1행(`smoke 자동화` `scripts/smoke.ts` + `scripts.smoke:3profiles` + 갱신 trigger·책임) + 변경 이력 v0.3 행. | N/A (docs only). | 낮음 — 문서 정합. |
| 5 | docs(scaffolding): 12-scaffolding §7 부팅 자산 표에 smoke 행 추가 (#5) | `docs/planning/12-scaffolding/typescript.md` §7 표에 1행: `smoke 자동화` `scripts/smoke.ts` + root `scripts.smoke:3profiles` + backend `scripts.smoke`. §5 코드블록은 line 242~245 prefigure 그대로 유지(본 PR이 실 동작 baseline 제공). | N/A (docs only). | 낮음. |
| 6 | test(smoke): 3 profile 모두 부팅 PASS 실행 결과 첨부 (#5) | 본 commit은 코드 변경 0 — 사용자 facing 검증 단계. `pnpm smoke:3profiles` 실행 → 3 profile 모두 PASS 로그(profile + PORT + 응답 200 + ready 시간 ms) 캡처해 P10 PR body Manual verification 통합 1줄에 첨부. (실 commit은 만들지 않음 — squash 후 결과만 PR body) | smoke PASS 자체가 통합 검증. | 낮음. |
| 7 | (선택, plan에서 결정으로) chore: postinstall hook에서 smoke 사전 실행 disable | 본 PR 비도입 — postinstall은 prisma generate만 유지 (#3 산출). smoke는 사용자/CI 명시 호출 only. | N/A. | N/A. |

> **squash 시 1 commit 압축**. commit body에 단계별 sub 메시지 자동 보존. PR title은 `feat(infra): 3 profile 부팅 smoke 자동화 (#5)` (ADR-0021 정규식 PASS).

## 2. 의존성 그래프

```
선수 이슈 (모두 머지 완료, 본 PR baseline):
  #1 (feat-monorepo-bootstrap, PR #26) — pnpm workspaces, root package.json
  #2 (feat-backend-express-bootstrap, PR #28) — backend tsconfig, app.ts, server.ts
  #3 (feat-prisma-articles-schema, PR #29) — schema, dev.db, seed
  #4 (feat-articles-api, PR #32) — GET /api/articles endpoint (본 smoke의 polling target)

본 PR 내부 DAG:
  commit 1 (scripts/smoke.ts) ──┐
                                ├──→ commit 3 (root smoke:3profiles 호출자)
  commit 2 (backend start:stg·prod) ─┘
       (smoke가 start:<p> 호출하므로 의존, 단 dev profile은 `dev` script 그대로 사용)

  commit 1·2·3 → commit 4 (LOCAL.md §3·§4 + 변경 이력)
              → commit 5 (12-scaffolding §7)

  모든 commit → commit 6 (사용자 검증 결과 PR body 첨부)

후속 PR:
  GitHub Actions 0 runs 미해결 → 별 follow-up 이슈 (.github/workflows/smoke.yml 등)
  Sprint 3 #10 frontend vite 도입 → 별 PR (frontend smoke 추가는 본 PR 비목표)
  Sprint 2+ 모든 PR — 본 PR 머지 후 `pnpm smoke:3profiles` 결과를 Manual verification 1줄로 첨부 가능
```

## 3. 테스트 매핑

> Issue body 명시: "단위: N/A · 통합: smoke 자체가 통합 검증 · E2E: N/A". 본 PR는 별 vitest 파일 추가 없음 — smoke 명령 자체가 검증 단위.

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 (smoke.ts) | (자체) `pnpm tsx scripts/smoke.ts dev` 수동 실행 | dev profile만 부팅 → GET /api/articles 200 PASS within 5초 → exit 0 |
| 1 (smoke.ts) | (자체) `pnpm tsx scripts/smoke.ts stg` 수동 실행 | stg profile (PORT=3001) 부팅 → GET 200 PASS → exit 0 |
| 1 (smoke.ts) | (자체) `pnpm tsx scripts/smoke.ts prod` 수동 실행 | prod profile (PORT=3002) 부팅 → GET 200 PASS → exit 0 |
| 1 (smoke.ts) | (자체) timeout 시뮬레이션 | dev 부팅 후 5초 + 1초 sleep → exit 1 + child kill 확인 (수동) |
| 2 (backend scripts) | (자체) `pnpm --filter @app/backend run start:stg` 수동 부팅 | stg profile 부팅 성공 + 콘솔 `[server] Listening on http://localhost:3001 (profile=staging)` |
| 2 (backend scripts) | (자체) `pnpm --filter @app/backend run start:prod` 수동 부팅 | prod profile 부팅 성공 + 콘솔 `[server] Listening on http://localhost:3002 (profile=production)` |
| 3 (root smoke:3profiles) | (자체) `pnpm smoke:3profiles` 1회 실행 | 3 profile 순차 PASS 결과 로그 (대표 출력: `[dev PASS 1234ms]`·`[stg PASS 1456ms]`·`[prod PASS 1389ms]`) |
| 3 (root smoke:3profiles) | (자체) fail-fast 시뮬레이션 | dev `.env.dev` 의도적 삭제 → smoke:3profiles 실행 → dev FAIL exit 1 + stg/prod 미실행 확인 |
| 4·5 (docs) | N/A | 문서 변경 — `validate-doc.sh` PASS 확인만 |
| 6 (검증) | PR body Manual verification | 3 profile PASS 캡처 1줄 (ADR-0046 §2.3 미체크 유지, ADR-0047 양축 검증) |

> 단위 테스트 0건 추가 (R-N-04 testing strategy 정합: 단위=N/A, 통합=smoke 자체, E2E=LOCAL.md 절차).
> 기존 30+ 단위 + 11 통합(#3·#4 산출)은 회귀 없음 — `pnpm typecheck && pnpm --filter @app/backend test && pnpm --filter @app/backend test:integration` PASS 확인.

## 4. 빌드·실행 검증 단계

> 본 절은 P10 `/qa-test --ai` 6번째 축(3 profile boot smoke)에서 그대로 실행됨.

```bash
# 0. 의존성 동기 (tsx devDeps 추가)
pnpm install --frozen-lockfile

# 1. 회귀 회피 — 기존 빌드·typecheck·테스트 PASS 확인
pnpm typecheck
pnpm -r build                                     # backend tsc -b → dist/
pnpm --filter @app/backend test                   # 30+ passed
pnpm --filter @app/backend test:integration       # 11 passed

# 2. .env 파일 사전 준비 (fresh checkout 시뮬레이션은 사용자가 .env.* 제거 후 cp 재현, 일반 검증은 기존 .env.dev 사용)
cp .env.dev.example .env.dev    # 이미 존재하면 skip
cp .env.stg.example .env.stg
cp .env.prod.example .env.prod

# 3. dev profile DB schema 적용(최초 1회) + seed(선택 — smoke는 빈 배열 200도 PASS)
pnpm --filter @app/backend prisma:push
pnpm --filter @app/backend seed:dev

# 4. (선택 — stg/prod DB도 schema 적용 필요 시. 본 PR smoke는 dev seed 데이터에 의존 안 함, 빈 stg.db도 OK)
SMOKE_PROFILE=stg  dotenv -e .env.stg  -- pnpm --filter @app/backend prisma db push --schema ./prisma/schema.prisma
SMOKE_PROFILE=prod dotenv -e .env.prod -- pnpm --filter @app/backend prisma db push --schema ./prisma/schema.prisma

# 5. 3 profile 부팅 smoke (본 PR 핵심 검증)
pnpm smoke:3profiles

# 기대 출력 (대표):
#   [smoke] profile=dev port=3000 — spawning backend...
#   [smoke] backend ready in 1240ms → GET /api/articles → 200 → PASS
#   [smoke] profile=stg port=3001 — spawning backend...
#   [smoke] backend ready in 1180ms → GET /api/articles → 200 → PASS
#   [smoke] profile=prod port=3002 — spawning backend...
#   [smoke] backend ready in 1320ms → GET /api/articles → 200 → PASS
#   [smoke] 3/3 profiles PASSED

# 6. AI 게이트 6축 자동 검증 시 단계 6b (ADR-0047 workflow 양축)
#    workflow YAML 미변경 PR이지만 매 PR 적용 — act 또는 manual reproduction 1줄 (별 follow-up 이슈 분리, .github/workflows/ 부재 = N/A 사유 명시)
echo "ADR-0047 N/A: .github/workflows/ 부재 (별 follow-up 이슈로 분리됨, 본 PR 비목표)"

# 7. AI 게이트 5축 (UI) — N/A
#    본 PR은 backend infra only, UI 변경 0건, ui_changed=false
```

> **부팅 자산 변경 동기 (ADR-0040)**: 본 PR이 `LOCAL.md` §3·§4 갱신 + `12-scaffolding/typescript.md` §7 갱신 → AI 게이트 6번째 축의 "부팅 자산 diff + LOCAL.md 동기" BLOCK PASS.
> **3 profile 분기 강제 (ADR-0037 v1.1)**: 본 PR이 dev·stg·prod 모두 실 PASS 결과 첨부 가능 — N/A 사유 위임 0건.

## 5. 점진 합의 / 결정 발생 항목

> ADR 신설 여부 = **no** — 본 PR은 ADR-0037 v1.1 + ADR-0040 + ADR-0041이 prefigure한 자산을 *실 동작*으로 보강하는 정합 구현. 신규 결정 0건.

### 결정 사항

1. **smoke.ts 위치 = root `scripts/`** (Open Question O-05-01 해소) — monorepo 전역 도구 시맨틱 정합. backend/scripts/ 위치 시 frontend 추가 시 재이동 부담.
2. **기존 `.env.dev.example`·`.env.stg.example`·`.env.prod.example` 3종 무변경** (O-05-02 해소) — #3 PR 산출 그대로. smoke 자체가 추가 변수 요구 안 함.
3. **smoke timeout = 5초 + polling 250ms × 20회** (O-05-03 해소) — Issue AC-1 그대로 채택. 250ms 간격이 너무 빠르면 backend 미준비 응답으로 false-negative 위험 → 첫 polling 전 500ms warmup sleep 적용.
4. **CI smoke job (.github/workflows/smoke.yml) 본 PR 비포함** (O-05-04 해소) — DoD "선택" + GitHub Actions 0 runs 미해결 이슈 미결 → 별 follow-up 이슈로 분리. P13 docs-update에서 등록.
5. **backend `start:stg`·`start:prod` neue scripts + 기존 `start` alias 유지** — backward compat 우선 (`pnpm --filter @app/backend start`를 호출하는 기존 사용자 회귀 없음). 단 LOCAL.md §3은 explicit `start:prod` 안내로 변경.
6. **smoke가 backend dev 사용 vs start:prod 사용 분기**: dev profile은 `pnpm --filter @app/backend dev`(tsx watch — hot reload), stg/prod profile은 `pnpm --filter @app/backend start:<p>`(node dist/server.js — 빌드 산출물). 따라서 pre-smoke 단계에서 `pnpm -r build` 자동 실행은 smoke.ts 내부에서 처리 (stg/prod profile 시).
7. **smoke가 빈 DB도 PASS** — GET /api/articles는 빈 배열 200도 정상 응답. stg.db / prod.db 미초기화 상태(빈 DB)에서도 ready 검증 통과. seed 의존성 없음.
8. **Node 20 내장 fetch 사용 (외부 의존 0)** — node-fetch / undici 추가 의존 0. 12-scaffolding §1.5 native 부팅 원칙 정합.
9. **dotenv-cli는 이미 backend devDeps에 존재** — root devDeps 추가 불필요. root scripts.smoke:3profiles는 tsx만 호출 (smoke.ts 내부에서 spawn 시 `pnpm --filter @app/backend run smoke` 위임 또는 직접 dotenv 로드 선택 — 후자 leaning, smoke.ts 내부 dotenv 사용).
10. **fail-fast (chain `&&`)**: dev 실패 시 stg/prod 미실행. CI/사용자 디버깅 시간 단축. `;` (모두 실행)도 검토했으나 첫 실패가 후속 cascading false-positive 유발할 수 있어 기각.

### 회귀 시나리오 (P7 risk-check 입력 자료)

- **R-1**: smoke 5초 timeout이 느린 머신(WSL2·CI runner)에서 false-negative — 완화: warmup 500ms + timeout configurable env (SMOKE_TIMEOUT_MS, default 5000)
- **R-2**: `&&` fail-fast가 stg-only 일시 결함 시 prod 검증 skip — 완화: 의도된 동작, 사용자가 개별 `tsx scripts/smoke.ts <p>` 직호출로 우회 가능 (README/LOCAL.md 명시)
- **R-3**: child process kill (SIGTERM) 못 받아 zombie backend 잔존 — 완화: SIGKILL fallback 1초 후. cleanup handler 명시
- **R-4**: stg/prod DB 파일(stg.db·prod.db) 미존재 → backend 부팅 시 prisma error → smoke FAIL → 사용자 혼란 — 완화: smoke.ts에서 부팅 실패 시 child stderr 첫 5줄 첨부 + LOCAL.md §2에 stg/prod prisma db push 안내 추가
- **R-5**: backend dev (tsx watch)와 start:prod (node) 부팅 시간 편차 — 완화: 모두 5초 내 ready 가정 합리적 (Express + Prisma client init은 < 2초). 통계 측정 결과 PR body 첨부 권고
- **R-6**: smoke 실행이 PORT 점유된 상태에서 EADDRINUSE — 완화: smoke.ts spawn 전 PORT 점유 검사(getNetTCPConnection 또는 net.createServer 시도) + 점유 시 명확한 에러 메시지

