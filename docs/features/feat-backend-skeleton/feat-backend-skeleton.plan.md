---
doc_type: feature-plan
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-N-02, R-N-04]
  F-ID: [F-12]
  supersedes: null
---

# feat-backend-skeleton — Implementation Plan

> Issue #2 · mode=add · contract §0 selective read 기반 (ADR-0018).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P4 implementation-planner) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(backend): deps + scripts + .env.{profile}.example` | `backend/package.json`, `pnpm-lock.yaml`, `.env.dev.example`, `.env.stg.example`, `.env.prod.example` | N/A (의존성 추가) | 낮음 (frozen-lockfile 재검증 필요) |
| 2 | `feat(backend): env.ts validateEnv (zod schema)` | `backend/src/env.ts` | 단위 테스트 (env.test.ts 1건 — 누락 시 throw) | 낮음 — 부팅 fail-fast 보장 |
| 3 | `feat(backend): 도메인 에러 클래스 3종 (VAL_·NOT_FOUND_·REPO_)` | `backend/src/errors/{validation,not-found,repository}-error.ts` | error-handler 단위 테스트가 분기 검증 | 낮음 (신설) |
| 4 | `feat(backend): middleware 3종 (cors·request-logger·error-handler)` | `backend/src/middleware/{cors,request-logger,error-handler}.ts` | `tests/unit/error-handler.test.ts` 4 시나리오 | 낮음 |
| 5 | `feat(backend): app.ts + server.ts + GET /healthz` | `backend/src/app.ts`, `backend/src/server.ts`, placeholder `src/index.ts` 삭제 | supertest로 `/healthz` 200 응답 검증 (error-handler.test.ts에 통합) | 낮음 |
| 6 | `chore(backend): vitest.config.ts + pnpm install + 통합 검증` | `backend/vitest.config.ts`, `pnpm-lock.yaml` (보강) | `pnpm test` 4+ 단위 테스트 PASS | 낮음 |

> commit 4~5는 dependency 있음 (middleware 부재 시 app.ts 부팅 불가). 1·2·3은 독립.

## 2. 의존성 그래프

```
[#1 deps + env example] ──→ [#2 env.ts] ──→ [#5 server.ts (env.PORT)]
                                                  ↑
[#3 errors 3종] ──→ [#4 error-handler] ──→ [#5 app.ts (errorHandler 등록)]
                              ↑
                  [#4 cors + request-logger] (독립)

[#6 vitest.config + 통합 검증]: #4·#5 완료 후
```

- **선수**: Issue #1 (monorepo 스캐폴딩) — 머지됨 ✓
- **후수**:
  - Issue #3 (Prisma schema + migrations + seed) — 본 PR의 `env.DATABASE_URL` 사용
  - Issue #4 (글 API 5종) — 본 PR의 errorHandler + 도메인 에러 위에서 throw 패턴
  - Issue #5 (3 profile 부팅 smoke) — 본 PR의 `.env.{profile}.example` + dotenv-cli scripts 검증

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| #1 | N/A (의존성·env example) | `pnpm install --frozen-lockfile` 매칭 자동 검증 |
| #2 | `backend/tests/unit/env.test.ts` (1 시나리오, 본 commit에 포함) | 필수 키(`PORT`) 누락 → `validateEnv()` throw + 한국어 메시지 |
| #3 | N/A (에러 클래스만, 동작은 #4에서 검증) | (생성자 호출 → `code` + `message` 보존) |
| #4 | `backend/tests/unit/error-handler.test.ts` (3+ 시나리오) | (a) ValidationError throw → 400 + `{ error: '<msg>' }` + stack 응답 누락, (b) NotFoundError → 404, (c) RepositoryError → 500, (d) 기본 Error → 500 + `SRV_INTERNAL` (stderr만), (e) request-logger 단위 — stdout에 method/path/status/duration 1줄 |
| #5 | `tests/unit/error-handler.test.ts`에 `GET /healthz` 200 응답 시나리오 추가 (app.ts 부팅 검증) | `pnpm --filter @app/backend dev` 별도 수동 검증 (Manual verification) |
| #6 | 위 #2·#4·#5 단위 테스트가 vitest로 모두 PASS | `pnpm test` 6+ assertion 통과 |

> **R-N-05 한국어 주석 ≥80%**: 본 PR은 controllers/services/components/repositories 4 디렉토리에 코드 0건. errors/·middleware/는 *공용 module* 카테고리라 측정 범위 외. 단, 함수 헤더에 한국어 의도 주석 작성 (관행). `pnpm grep` 측정은 #4 글 API 도입 후부터 의미.

## 4. 빌드·실행 검증 단계

```bash
# 1) 의존성 갱신 (commit 1 후)
pnpm install

# 2) 타입 체크
pnpm typecheck

# 3) lint
pnpm lint

# 4) 단위 테스트 (commit 6 후, 가장 중요)
pnpm --filter @app/backend test
# 또는 root에서: pnpm test

# 5) dev profile 부팅 smoke (Manual verification — AC-01)
cp .env.dev.example .env.dev
pnpm --filter @app/backend dev
# 기대: 5초 이내 'Listening on http://localhost:3000' 출력
# 별 터미널: curl http://localhost:3000/healthz → {"ok":true}

# 6) 빌드 — 4 워크스페이스 (commit 6 후)
pnpm -r build

# 7) 3 profile 부팅 smoke (ADR-0037 AI 게이트 6번째 축)
#    본 PR은 backend만 — dev 위 명령 통과 + stg/prod는 .env.{stg,prod}.example로 동일 절차 검증.
#    실 부팅까지는 Issue #5에서 LOCAL.md §3 정식 검증. 본 PR Manual verification은 dev profile 1회만.
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — 본 이슈는 12-scaffolding §1 backend/src 정본 트리 실현 + 11 §2 PREFIX baseline 도입. 새 결정 없음.
- **결정**:
  - (결정) Express 4.x — Node 20+ + ESM 호환, 5.x는 stable 미달 시점이라 회피
  - (결정) zod env validation — shared 타입과 일관성, joi/envalid 대비 학습 부담 동일
  - (결정) Vitest + supertest — Jest 대비 ESM-first, vite config 공유 가능
  - (결정) tsx watch — ts-node-dev 대비 ESM-first, dev profile 부팅 ≤ 3s
  - (결정) dotenv-cli wrapping — LOCAL.md §1.5.1 정합 (monorepo cwd 미스매치 회피)
- **회귀 시나리오** (P10 회수 후보):
  - `pnpm test` 단위 테스트 일부 실패 → error-handler 분기 누락. test.ts에 모든 도메인 에러 시나리오 명시.
  - `pnpm --filter @app/backend dev` 5초 초과 → tsx watch 초기화 지연. tsconfig sourceMap 활성으로 컴파일 부하 최소화.
  - validateEnv 누락 메시지가 영어 → R-N-02 한국어 메시지 위배. zod 에러 catch 후 한국어 변환 처리.
