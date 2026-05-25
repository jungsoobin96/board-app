---
doc_type: feature-contract
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

# feat-backend-skeleton — Change Contract

> Issue #2 · mode=add · selective read 원본 (ADR-0018 §0 BLOCK).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-N-02 (에러 응답 schema `{ error }` 한국어 메시지, stack 미노출), R-N-04 (부팅 — backend dev profile 5초 이내 ready) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | F-12 (간접 — 학습 친화 부팅 경험) |
| 영향 모듈 | `docs/planning/08-lld-module-spec/08-lld-module-spec.md` | M5 BE-router (app.ts 등록 자리만), M10 BE-error (errorHandler + 도메인 에러 3종 본격 도입) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none — 실 엔드포인트는 #4. 본 PR은 `GET /healthz` 한 개만 부팅 검증용으로 추가, 09 LLD에 미정의이므로 후속 이슈에서 정식 등록) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md`, `docs/planning/12-scaffolding/typescript.md` | 11 §1 명명 (kebab-case 파일, camelCase 함수), §2 에러 코드 PREFIX (VAL_·NOT_FOUND_·REPO_·SRV_), §4 한국어 주석 ≥80%, §6 import 정책 / 12 §1 디렉토리 트리 backend/src, §3 Layered 패턴 (M5~M10), §6 환경 변수 분리 |

## 1. 변경 의도

backend 워크스페이스를 placeholder 상태에서 *부팅 가능 Express 서버*로 전환. R-N-02 에러 schema 강제 + R-N-04 부팅 5초 이내 + 11 §2 PREFIX 정합 코드 baseline 확보. 본 PR 머지 후 모든 후속 backend 이슈(#3·#4·#5)는 본 골격의 errorHandler + env + middleware chain 위에서 동작 — 동일 패턴 강제.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/src/index.ts` | `export const SCAFFOLD_OK = true` (placeholder) | 삭제. server.ts가 대체 entrypoint |
| `backend/src/server.ts` | 없음 | `validateEnv()` 호출 → `app.listen(env.PORT, () => console.log('Listening on http://localhost:${PORT}'))` |
| `backend/src/app.ts` | 없음 | Express app + middleware 등록: cors → request-logger → `GET /healthz` → errorHandler (404 catch-all 포함) |
| `backend/src/env.ts` | 없음 | `validateEnv()` — zod schema (PORT·DATABASE_URL·NODE_ENV·LOG_LEVEL). 실패 시 process.exit(1) + stderr 한국어 메시지 |
| `backend/src/middleware/error-handler.ts` | 없음 | Express ErrorRequestHandler — 도메인 에러 4종 분기 (`ValidationError`→400, `NotFoundError`→404, `RepositoryError`→500, 기본→500 `SRV_INTERNAL`). 응답: `{ error: '<한국어>' }`. stack은 stderr만 |
| `backend/src/middleware/cors.ts` | 없음 | NODE_ENV==='dev'면 `Access-Control-Allow-Origin: *` 헤더, 그 외 no-op |
| `backend/src/middleware/request-logger.ts` | 없음 | next() 전후 시간 측정 → 1줄 `[METHOD] /path STATUS DURATIONms` stdout |
| `backend/src/errors/validation-error.ts` | 없음 | `class ValidationError extends Error { code: string; constructor(code: string, message: string) }` — `code`는 `VAL_*` |
| `backend/src/errors/not-found-error.ts` | 없음 | 동일 패턴, `code`는 `NOT_FOUND_*` |
| `backend/src/errors/repository-error.ts` | 없음 | 동일 패턴, `code`는 `REPO_*` |
| `backend/tests/unit/error-handler.test.ts` | 없음 | Vitest + supertest. 3+ 시나리오 — ValidationError→400, NotFoundError→404, RepositoryError→500, 기본 Error→500 |
| `backend/vitest.config.ts` | 없음 | env DATABASE_URL=mock 설정 + globals: true |
| `backend/package.json` scripts | placeholder | `dev`: `dotenv -e ../.env.dev -- tsx watch src/server.ts` / `build`: `tsc -b` / `start`: `node dist/server.js` / `test`: `vitest run` / `test:watch`: `vitest` |
| `backend/package.json` deps | `@app/shared`만 | + express, zod, dotenv-cli (dev), tsx (dev), vitest (dev), supertest (dev), @types/express (dev), @types/supertest (dev) |
| `.env.dev.example` (root) | 없음 | `PORT=3000`·`DATABASE_URL="file:./backend/prisma/dev.db"`·`NODE_ENV=dev`·`LOG_LEVEL=debug` |
| `.env.stg.example` (root) | 없음 | 동일 키, `NODE_ENV=stg`·`LOG_LEVEL=info`·DATABASE_URL `stg.db` |
| `.env.prod.example` (root) | 없음 | 동일 키, `NODE_ENV=prod`·`LOG_LEVEL=warn`·DATABASE_URL `prod.db` |
| `pnpm test` (root) | 없음 | backend test → vitest 통과 |
| `pnpm --filter @app/backend dev` | placeholder echo | `Listening on http://localhost:3000` 5초 이내 출력 |
| `GET /healthz` | 없음 | 200 `{ ok: true }` |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| WBS Issue #3 (Prisma) | Blocked-by #2 — Prisma client는 본 PR의 `env.DATABASE_URL`을 사용 | 본 PR 머지 후 #3 시작. #3에서 PrismaClient 초기화 시 본 PR의 `env.ts` 재사용 |
| WBS Issue #4 (글 API 5종) | Blocked-by #3 (간접 #2) — 모든 글 controller가 본 PR의 errorHandler 위에서 동작 | #3 머지 후 #4. controllers는 throw 패턴만 사용, 응답 직렬화는 errorHandler 책임 |
| WBS Issue #5 (3 profile smoke) | Blocked-by #2 — 3 profile 부팅 검증은 본 PR의 `.env.{profile}.example` + dotenv-cli 사용 | #5에서 LOCAL.md §3 검증 시 본 PR 명령 직 사용 |
| `LOCAL.md` §3 dev profile | 본 PR 이전 backend 부팅 명령 N/A → 본 PR 후 정상 동작 | 본 PR Manual verification에서 사용자가 1회 dev 부팅 검증 |
| `frontend/` (#10 후속) | 영향 없음 — frontend는 본 PR의 backend HTTP API만 호출 (직 의존 X, 11 §6 import 정책) | 변경 없음 |

## 4. Backward Compatibility

- **Breaking**: no — placeholder `src/index.ts` 삭제는 외부 호출자 0건 (이슈 #1에서 신설된 `SCAFFOLD_OK` no-op export, import한 다른 워크스페이스 없음. `pnpm install --frozen-lockfile` 후 typecheck로 자동 검증).
- **마이그레이션 필요**: no — DB 없음, 사용자 기존 state 없음.
- **호환 보장**: `@app/shared` 의존은 그대로 유지. tsconfig references 변경 없음. `pnpm -r build`/`typecheck`/`lint` 4 워크스페이스 모두 PASS 보장.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**: `git revert <merge-commit>` → main에 revert PR open. 본 PR은 backend src/ 신설 위주이므로 revert가 안전 (다른 워크스페이스 영향 0).
- **데이터 손상 위험**: 없음 — 본 PR은 *실 DB 접근 0건*. `.env.{profile}.example`은 예시 파일만, 실 `.env.*`는 .gitignore (R-N-07). revert 후 `node_modules/` cleanup 1줄 (`rm -rf node_modules && pnpm install`).

## 6. 비목표

- 실 routes/·controllers/·services/·repositories/·validators/ 코드 — #3·#4
- Prisma client 초기화 + DB 연결 시도 — #3
- 통합 테스트 (supertest로 실 HTTP 라운드 트립) — #4
- 구조화 로깅 (pino 등) — 후속 이슈
- 세션·인증 — RFP 비대상 (Phase 2)
- CI workflow에 `pnpm test` 자동 등록 — 별 이슈
