---
doc_type: feature-contract
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-prisma-schema — Change Contract

> Issue #3 · mode=add · selective read 원본 (ADR-0018 §0 BLOCK).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-F-07 (cascade 무결성 — DB-level ON DELETE CASCADE 강제, 서비스 레이어 의존 X) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | F-07 (글 삭제 cascade UX — backend 인프라가 schema-level 보장) |
| 영향 모듈 | `docs/planning/08-lld-module-spec/08-lld-module-spec.md` | M11 BE-prisma (본격 도입 — singleton client + schema.prisma + migrations + seed), M8 BE-repositories (간접 — 본 PR이 PrismaClient 진입점 마련, 실 repo wrapper는 #4) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none — 실 라우트는 #4. 본 PR은 인프라 only) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md`, `docs/planning/12-scaffolding/typescript.md` | 11 §1 명명 (kebab-case 파일, PascalCase 모델), §4 한국어 주석 ≥80% (seed.ts 의도 주석 + cascade.integration.test.ts 시나리오 주석) / 12 §1 디렉토리 트리 `backend/prisma/`, §3 Layered (M11 infra 레이어), §5 빌드·실행 `pnpm --filter @app/backend prisma db push|migrate dev|generate` + `exec tsx prisma/seed.ts`, §6 환경 변수 (`DATABASE_URL` 본 PR 직 사용) |

## 1. 변경 의도

backend의 데이터 레이어를 schema 정의 + migration 파일 + seed 함수로 baseline. R-F-07(cascade 무결성)을 schema-level로 강제하여 후속 #4 글 API가 cascade 로직을 *직 구현하지 않도록* 한다. 본 PR 머지 후 모든 후속 backend 이슈(#4·Sprint 2+)는 `lib/prisma.ts` singleton client를 import하여 사용 — 동일 패턴 강제.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/prisma/` | 없음 | 디렉토리 신설 |
| `backend/prisma/schema.prisma` | 없음 | `datasource db { provider="sqlite"; url=env("DATABASE_URL") }` + `generator client { provider="prisma-client-js" }` + 4 모델 |
| 모델 `Article` | 없음 | `id Int @id @default(autoincrement())` · `title String` · `body String` · `author String` · `createdAt DateTime @default(now())` · `updatedAt DateTime @updatedAt` · `@@index([createdAt(sort: Desc)])` (07 HLD §3 R-N-01) · relations: comments·articleTags |
| 모델 `Comment` | 없음 | `id Int @id @default(autoincrement())` · `body String` · `author String` · `createdAt DateTime @default(now())` · `articleId Int` · `article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)` · `@@index([articleId, createdAt(sort: Desc)])` |
| 모델 `Tag` | 없음 | `id Int @id @default(autoincrement())` · `name String @unique` · relations: articleTags |
| 모델 `ArticleTag` (M-N 조인) | 없음 | `articleId Int` · `tagId Int` · `article Article @relation(..., onDelete: Cascade)` · `tag Tag @relation(..., onDelete: Cascade)` · `@@id([articleId, tagId])` (07 HLD §3 PK 인덱스) |
| `backend/prisma/migrations/<ts>_init/migration.sql` | 없음 | `prisma migrate dev --name init` 결과. 4 테이블 DDL + FK CASCADE + 인덱스 3종 |
| `backend/prisma/migrations/migration_lock.toml` | 없음 | provider = "sqlite" |
| `backend/prisma/seed.ts` | 없음 | `idempotent` — `tx.articleTag.deleteMany() → tx.comment.deleteMany() → tx.article.deleteMany() → tx.tag.deleteMany()` 후 글 5·댓글 10·태그 8 createMany. NODE_ENV=dev 한정 가드. 한국어 console.log 진행 메시지 |
| `backend/src/lib/prisma.ts` | 없음 | `PrismaClient` singleton 모듈 (`new PrismaClient({ log: env.LOG_LEVEL==='debug' ? ['query','error','warn'] : ['error','warn'] })`). global module hoisting으로 dev hot-reload 시 중복 인스턴스 회피 |
| `backend/tests/integration/cascade.integration.test.ts` | 없음 | Vitest — `beforeEach`로 deleteMany 4종 → 글 1 + 댓글 3 + 태그 2 + ArticleTag 2 삽입 → `prisma.article.delete({where:{id}})` → Comment + ArticleTag 0건 검증 (R-F-07 핵심 assertion) |
| `backend/vitest.integration.config.ts` | 없음 | `include: ['tests/integration/**/*.integration.test.ts']` + `pool: 'forks'` + `singleThread: true` (SQLite 단일 writer 회피, 08 §7) + `fileParallelism: false` |
| `backend/package.json` deps | `@app/shared`, express, zod | + `@prisma/client ^5.22.0` |
| `backend/package.json` devDeps | tsx·vitest·supertest·dotenv-cli·@types/* | + `prisma ^5.22.0` |
| `backend/package.json` scripts | dev·dev:stg·build·start·test | + `prisma:push`: `dotenv -e ../.env.dev -- prisma db push --schema ./prisma/schema.prisma`, `prisma:migrate`: `dotenv -e ../.env.dev -- prisma migrate dev --schema ./prisma/schema.prisma`, `prisma:generate`: `prisma generate --schema ./prisma/schema.prisma`, `prisma:deploy`: `prisma migrate deploy --schema ./prisma/schema.prisma`, `seed:dev`: `dotenv -e ../.env.dev -- tsx prisma/seed.ts`, `test:integration`: `dotenv -e ../.env.dev -- vitest run -c vitest.integration.config.ts`, `postinstall`: `prisma generate --schema ./prisma/schema.prisma` |
| `.gitignore` | `.env*` + `!.env.*.example` + node patterns | + `backend/prisma/*.db`, `backend/prisma/*.db-journal` (root `*.db` 이미 #1에서 추가됐어도 명시적 path 안전 — sub-dir 매칭 보강) |
| `pnpm-lock.yaml` | #2 기준 | 갱신 (prisma·@prisma/client 추가 후 frozen-lockfile PASS) |
| `pnpm --filter @app/backend prisma:push` | N/A | dev.db 생성 + 4 테이블 + cascade |
| `pnpm --filter @app/backend seed:dev` | N/A | 글 5 · 댓글 10 · 태그 8 삽입 (idempotent) |
| `pnpm --filter @app/backend test:integration` | N/A | cascade 통합 1건 PASS |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| Issue #4 (글 API 5종) | Blocked-by #3 — controllers/services/repositories가 본 PR의 `lib/prisma.ts` singleton + 4 모델 사용 | 본 PR 머지 후 #4 시작. `import { prisma } from '../lib/prisma'` 패턴 |
| Issue (Sprint 2+) 댓글 API | Blocked-by #3 — Comment 모델 + cascade 사용 | 본 PR 머지 후 Sprint 2 시작 |
| Issue (Sprint 2+) 태그 API | Blocked-by #3 — Tag + ArticleTag 모델 + 인기 태그 집계 사용 | 동일 |
| Issue #5 (3 profile boot smoke) | Blocked-by #3 — stg/prod migration 적용은 `prisma:deploy` + seed는 dev 한정 가드라 stg/prod는 빈 DB 부팅 검증만 | #5에서 LOCAL.md §3에 본 PR의 `prisma:push`/`prisma:deploy` 명령 추가 |
| `backend/src/server.ts` (#2 산출) | 영향 없음 — 본 PR은 server.ts를 import 안 함. PrismaClient는 #4에서 controllers가 사용 시점에 connect | 변경 없음. 단, server.ts에 `process.on('SIGTERM', async () => { await prisma.$disconnect(); })` 추가는 #4 권고 (08 §M11 라이프사이클) |
| `backend/src/env.ts` (#2 산출) | DATABASE_URL은 #2에서 zod schema 검증 완료 — 본 PR이 `lib/prisma.ts`에서 직 사용 | 변경 없음 |
| `.env.{dev,stg,prod}.example` (#2 산출) | DATABASE_URL이 `file:./backend/prisma/dev.db` 등으로 정합 확인 | (검증) 본 PR Manual verification에서 dev profile 부팅 시 path 정상 동작 재확인 |
| `frontend/`·`shared/`·`e2e/` | 영향 0 — 본 PR은 backend infrastructure만 | 변경 없음 |
| `LOCAL.md` §3 dev profile | 본 PR 이전 backend 부팅은 가능하나 DB 부재. 본 PR 후 dev DB 초기화 절차 추가 | LOCAL.md §3에 `pnpm --filter @app/backend prisma:push && pnpm --filter @app/backend seed:dev` 1줄 추가. ADR-0040 동기 lint 준수 (본 PR 같은 squash에 포함) |

## 4. Backward Compatibility

- **Breaking**: no — 본 PR은 *신설* only. 기존 호출자 0건 (`@prisma/client`·`prisma`·`backend/prisma/`·`lib/prisma.ts`·integration test 모두 신설). #2의 env.ts·app.ts·server.ts 시그니처 변경 없음.
- **마이그레이션 필요**: no — 사용자 기존 DB 없음. dev.db는 본 PR 적용 시 자동 생성. 후속 migration은 별 이슈에서 `prisma migrate dev --name <feature>` 패턴 일관.
- **호환 보장**: `pnpm -r build`·`typecheck`·`lint`·`test`·`test:integration` 4 워크스페이스 모두 PASS. `pnpm install --frozen-lockfile`로 lockfile 정합 자동 검증.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**: `git revert <merge-commit>` → main에 revert PR open. 본 PR은 backend/prisma/ 신설 + lib/prisma.ts 신설 + scripts/deps 추가 위주이므로 revert가 안전 (다른 워크스페이스 영향 0).
- **데이터 손상 위험**: 없음 — dev.db는 `.gitignore` (R-N-07 보안 룰 정합). revert 후 사용자 로컬의 `backend/prisma/dev.db`가 남아도 별도 처리 불필요 (그냥 삭제). revert 후 `pnpm install` 1회로 lockfile 동기.
- **DB 데이터 보존**: 본 PR은 init migration만이라 revert 시 schema가 사라짐 → 이후 다시 도입 시 init부터 재실행 가능 (사용자 데이터 0 가정).

## 6. 비목표

- 실 routes/·controllers/·services/·repositories/·validators/ 코드 — #4 `feat-articles-api`
- ArticleService `withTransaction()` wrapper (Prisma `$transaction()` wrap) — #4
- Repository wrapper 클래스 — #4
- 단위 테스트 (Prisma 직 호출 단위는 추상 layer라 N/A. 통합 1건으로 충분 — 08 §8 M11 진입점)
- E2E (글 삭제 후 댓글 영역 빈 상태 — UC-05) — Sprint 3+ FE 후 Playwright
- Prisma migration **production 실 적용** (`prisma migrate deploy` 실행) — #5에서 stg/prod profile 부팅 smoke 시 검증
- 스키마 진화 가이드라인 ADR — 본 PR은 init만, 후속 정책은 별 이슈
- `pino` 등 구조화 로깅 — 후속 이슈
- DB 연결 풀 튜닝 — SQLite 단일 인스턴스 가정 (08 §7 RISK-02)
