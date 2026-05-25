---
doc_type: feature-brief
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

# feat-backend-skeleton — Feature Brief

> Issue #2, Sprint 1, mode=add. Blocked-by #1(머지됨). Blocks #3·#4.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P1 intention-brief) |

## 1. 한 줄 의도

Express 부팅 골격 + env validateEnv + 통합 에러 핸들러(R-N-02 `{ error }` schema)를 도입해 후속 API 이슈(#3·#4)가 동일한 요청 사이클·에러 schema·환경 변수 게이트 위에서 동작하도록 한다.

## 2. 사용자 가치

- **학습자**: `pnpm --filter @app/backend dev` 한 줄로 backend 5초 이내 부팅. dotenv-cli 래핑으로 monorepo cwd 미스매치 회피 (LOCAL.md §1.5.1 정합).
- **후속 이슈 개발자**: 모든 controller·service가 동일 에러 schema와 env 게이트 위에서 동작 → 코드 중복 0, 일관성 보장.
- **운영**: `validateEnv()`가 부팅 즉시 필수 env 누락 fail-fast → 잘못된 설정으로 zombie 부팅 방지. 에러 응답에 stack/internal code 미노출(R-N-02 + 11-coding-conventions §2).

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| backend src/ | placeholder `index.ts` (no-op `SCAFFOLD_OK`) | `server.ts`·`app.ts`·`env.ts` + `middleware/{error-handler,cors,request-logger}.ts` + `errors/{validation,not-found,repository}-error.ts` |
| dev 부팅 | 명령 없음 (placeholder) | `pnpm --filter @app/backend dev` → tsx watch + dotenv-cli 래핑, 5초 이내 ready |
| 에러 응답 | 없음 | 모든 4xx/5xx `{ "error": "<한국어 메시지>" }` (R-N-02). stack은 stderr만 |
| env 검증 | 없음 | `validateEnv()` — DATABASE_URL · PORT · NODE_ENV · LOG_LEVEL 4종 필수 검증, 누락 시 부팅 차단 |
| CORS | 없음 | dev profile만 `*` 허용. stg/prod는 비활성 (단일 환경 운영 가정) |
| 요청 로깅 | 없음 | request-logger 미들웨어 — method·path·status·duration 1줄 |
| 단위 테스트 | 0건 | Vitest + supertest 도입. error-handler 미들웨어 단위 테스트 ≥ 3건 |
| `.env.{profile}.example` | 없음 (이슈 #1 비목표) | dev/stg/prod 3종 신설 (PORT·DATABASE_URL·NODE_ENV·LOG_LEVEL 4 키) |

## 4. 모드 자동 감지 결과

- **mode**: add
- **근거** (ADR-0032 부정 시그널 0건):
  - 라벨: `type:feature` ✓ (규칙 4 우선 매칭)
  - 자연어: "backend 골격 + 에러 핸들러 + env validateEnv" — 신규 추가
  - 기존 동작 변경 ❌ (placeholder src/index.ts는 #1에서 신설된 no-op, 깰 호출자 0)
  - UI/디자인 키워드 ❌
  - 결정: mode=add 자동 진행, 질문 없음

## 5. 영향 범위

- **신규 파일** (12-scaffolding §1 backend/src 정본 정합):
  - `backend/src/server.ts` (부팅 entrypoint — `app.listen()`)
  - `backend/src/app.ts` (Express app 조립 — middleware 등록 순서: cors → request-logger → routes → errorHandler)
  - `backend/src/env.ts` (validateEnv — zod schema)
  - `backend/src/middleware/error-handler.ts` (M10 BE-error)
  - `backend/src/middleware/cors.ts` (dev only)
  - `backend/src/middleware/request-logger.ts`
  - `backend/src/errors/validation-error.ts` (VAL_* code)
  - `backend/src/errors/not-found-error.ts` (NOT_FOUND_*)
  - `backend/src/errors/repository-error.ts` (REPO_*)
  - `backend/tests/unit/error-handler.test.ts` + `vitest.config.ts`
  - `.env.dev.example` · `.env.stg.example` · `.env.prod.example` (root, ADR-0040 부팅 자산)
- **갱신 파일**:
  - `backend/package.json` — express·dotenv-cli·vitest·supertest·zod·tsx 의존성 + dev/build/start/test scripts
  - `backend/src/index.ts` — placeholder 삭제 (server.ts가 대체)
- **삭제**: `backend/src/index.ts` (placeholder)
- **외부 영향**: 후속 이슈 #3 (Prisma)·#4 (글 API)·#10 (frontend)는 본 PR의 errorHandler + env + dotenv-cli wrapping 위에서 동작

## 6. 비목표

- **routes/·controllers/·services/·repositories/·validators/**: 본 이슈 비목표. 후속 이슈 #3 (Prisma + 기본 CRUD)와 #4 (글 API)에서 도입.
- **Prisma client + DB 연결**: 본 이슈 비목표. validateEnv에서 DATABASE_URL 형식만 검증 (실 연결 시도 X). 실제 Prisma client 초기화는 #3.
- **세션·인증**: RFP 비대상 (Phase 2 별). 본 PR에서 미들웨어 layer만 마련.
- **통합 테스트**: 본 이슈 단위 테스트만. 통합 테스트는 #3·#4에서 supertest로 추가.
- **CI workflow에 pnpm test 등록**: 별 이슈 (현 등록 workflow 2개 외 신설 안 함).

## 7. Open Questions

- (해소) tsx watch vs nodemon vs ts-node-dev → **tsx watch** 채택 (ESM + TypeScript 5.6 + ESM-first 미래성)
- (해소) env 검증 라이브러리 zod vs envalid vs joi → **zod** (shared 타입과 일관, 추가 학습 곡선 0)
- (해소) test framework Jest vs Vitest → **Vitest** (Vite 생태계 통합, ESM-first, vite.config.ts 공유 가능)
- (보류) request-logger 라이브러리 morgan vs winston vs 자작 → 자작 (학습 친화 + 외부 의존 최소화). 후속 이슈에서 구조화 로깅 필요 시 pino로 교체 검토.
