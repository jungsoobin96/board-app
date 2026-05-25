---
doc_type: feature-plan
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

# feat-prisma-schema — Implementation Plan

> Issue #3 · mode=add · contract §0 selective read 기반 (ADR-0018).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P4 implementation-planner) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `chore(backend): add prisma + @prisma/client + scripts` | `backend/package.json`, `pnpm-lock.yaml`, `.gitignore` (db 파일 추가) | N/A (의존성·scripts·gitignore) | 낮음 — postinstall hook 추가로 첫 install 시 prisma generate 실행. `.gitignore` `*.db` root에 이미 있어도 sub-dir 명시 추가 안전 |
| 2 | `feat(backend): prisma schema (Article·Comment·Tag·ArticleTag + cascade)` | `backend/prisma/schema.prisma` | N/A (schema only) | 낮음 — datasource/generator/4 모델 + 인덱스 3종 |
| 3 | `feat(backend): init migration via prisma migrate dev` | `backend/prisma/migrations/<ts>_init/migration.sql`, `backend/prisma/migrations/migration_lock.toml` | N/A (CLI 산출) | 낮음 — `prisma migrate dev --name init` 결과 commit. SQLite는 `PRAGMA foreign_keys=ON` 필수, Prisma client가 자동 enable |
| 4 | `feat(backend): PrismaClient singleton (lib/prisma.ts)` | `backend/src/lib/prisma.ts` | N/A (구성요소만) | 낮음 — global module hoisting 패턴, dev hot-reload 시 중복 인스턴스 회피 |
| 5 | `feat(backend): seed.ts (글 5·댓글 10·태그 8, dev 한정 가드)` | `backend/prisma/seed.ts` | N/A (스크립트, 통합 테스트가 cascade 검증) | 낮음 — `if (env.NODE_ENV !== 'dev') throw` 가드 + idempotent deleteMany→createMany. 자체 검증은 §4 dev 부팅 절차에서 |
| 6 | `test(backend): cascade integration test + vitest.integration.config` | `backend/tests/integration/cascade.integration.test.ts`, `backend/vitest.integration.config.ts` | cascade 통합 1건 (R-F-07 핵심) | 낮음 — singleThread + forks pool로 SQLite 단일 writer 회피. 본 PR cascade 1건이 후속 #4 통합 테스트 baseline |
| 7 | `docs(local): update LOCAL.md §3 — prisma db init` | `LOCAL.md` | N/A (사용자 가이드) | 낮음 — ADR-0040 동기 lint (12-scaffolding/typescript.md §5는 #2에서 이미 정합) |

> commit 2·4·5는 #3 migration이 schema와 동일 동기. 1은 독립. 6은 1~5 모두 의존. 7은 1~6 모두 의존.

## 2. 의존성 그래프

```
[#1 deps + scripts + .gitignore] ──→ [#2 schema.prisma] ──→ [#3 init migration]
                                                                   ↓
                                       [#4 lib/prisma.ts] ──┬─→ [#5 seed.ts]
                                              ↑             │
                                       (#1 + #2 모두 필요)   └─→ [#6 cascade.integration.test]
                                                                   ↑
                                                            (#1·#2·#3·#4 모두 필요)
[#7 LOCAL.md §3 갱신]: #1~#6 모두 commit 후 1회만 (ADR-0040)
```

- **선수**: Issue #1 ✓·#2 ✓ — backend/package.json + env.DATABASE_URL + dotenv-cli scripts wrapping 패턴 마련
- **후수**:
  - Issue #4 (글 API 5종) — 본 PR `lib/prisma.ts` + 4 모델 사용
  - Sprint 2+ 댓글/태그 API — 동일 진입점
  - Issue #5 (3 profile 부팅 smoke) — 본 PR scripts 사용

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| #1 | N/A (의존성/scripts/gitignore) | `pnpm install --frozen-lockfile` 자동 매칭 + postinstall이 `prisma generate` 실행 → @prisma/client 타입 정상 export 검증 (`pnpm typecheck`) |
| #2 | N/A (schema only) | `pnpm --filter @app/backend prisma:generate` → exit 0 + `node_modules/.prisma/client/` 생성 확인 (수동) |
| #3 | N/A (CLI 산출) | `pnpm --filter @app/backend prisma:push` → SQLite dev.db 4 테이블 + FK CASCADE 적용 검증 — `sqlite3 backend/prisma/dev.db ".schema"` (Manual) |
| #4 | N/A (singleton만) | `pnpm typecheck` → PrismaClient import 정상 + 타입 추론 OK |
| #5 | N/A (script) | `pnpm --filter @app/backend seed:dev` → 글 5·댓글 10·태그 8 삽입 확인 — `sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM Article;"` (Manual). 1회 더 실행해도 idempotent (deleteMany 선행) |
| #6 | `backend/tests/integration/cascade.integration.test.ts` | (a) **R-F-07 핵심**: `beforeEach`로 deleteMany 4종 → 글 1 + 댓글 3 + 태그 2 + ArticleTag 2 삽입 → `prisma.article.delete({where:{id}})` → `prisma.comment.count({where:{articleId:1}})===0` + `prisma.articleTag.count({where:{articleId:1}})===0` 검증. Tag는 잔존 (M-N 조인만 cascade) (b) afterAll에서 `$disconnect` |
| #7 | N/A (문서) | LOCAL.md §3 dev profile에 `prisma:push && seed:dev` 1줄 추가 — 시각 grep 검증 |

> **R-N-05 한국어 주석 ≥80%**: 본 PR은 controllers/services/components/repositories 4 디렉토리에 코드 0건. `lib/prisma.ts` + `seed.ts` + `cascade.integration.test.ts`는 *공용 module + infra + 테스트* 카테고리라 측정 범위 외. 단, 함수 헤더에 한국어 의도 주석 작성 (관행). 본격 측정은 #4 글 API 도입 후부터 의미.

> **테스트 격리 (08 §7 SQLite 단일 writer)**: `vitest.integration.config.ts`에 `singleThread: true` + `fileParallelism: false`. 본 PR cascade 1건이라 분기 차단 효과 충분, #4 통합 추가 시 동일 config 재사용.

## 4. 빌드·실행 검증 단계

```bash
# 1) 의존성 갱신 (commit 1 후) + postinstall로 prisma generate 자동 실행
pnpm install
# (자동) pnpm --filter @app/backend prisma generate → node_modules/.prisma/client/ 생성

# 2) 타입 체크 (commit 2 → schema → generate 후 client 타입 인식)
pnpm typecheck

# 3) lint
pnpm lint

# 4) DB 스키마 적용 — dev iteration (commit 3 후)
cp .env.dev.example .env.dev   # ADR-0040 사용자 절차, 이미 #2에서 한 번 했어도 명시
pnpm --filter @app/backend prisma:push
# 기대: dev.db 생성, 4 테이블 + FK CASCADE 적용

# 5) seed (commit 5 후)
pnpm --filter @app/backend seed:dev
# 기대: 글 5·댓글 10·태그 8 삽입. 1회 더 실행해도 동일 (idempotent)

# 6) 단위 테스트 (기존 #2 산출 PASS 유지)
pnpm --filter @app/backend test
# 기대: error-handler·app·env 단위 PASS (회귀 없음)

# 7) 통합 테스트 (commit 6 후, 가장 중요)
pnpm --filter @app/backend test:integration
# 기대: cascade 1건 PASS — 글 1 + 댓글 3 + ArticleTag 2 → 글 삭제 → Comment·ArticleTag 0건

# 8) 빌드 — 4 워크스페이스 (commit 6 후)
pnpm -r build
# 기대: typecheck + tsc -b 모두 exit 0. lib/prisma.ts·seed.ts 컴파일 OK

# 9) dev profile 부팅 smoke (Manual verification — ADR-0037 v1.1)
pnpm --filter @app/backend dev
# 기대: 5초 이내 'Listening on http://localhost:3000' 출력
# 별 터미널: curl http://localhost:3000/healthz → {"ok":true}
# stg/prod profile은 Issue #5에서 LOCAL.md §3 정식 검증
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — 본 이슈는 12-scaffolding §1 backend/prisma 트리 + 08 §M11 baseline 실현. 신규 결정 없음. Prisma 분류(a)(b)는 12-scaffolding §"Prisma 분류 (ADR-0037 v1.3)"에서 이미 (a) 분리형 채택.
- **결정**:
  - (결정) Prisma 5.22.x — Node 20+ 호환 최신 안정 + 5.x major 일관성
  - (결정) ID 전략 = `Int @id @default(autoincrement())` — UUID 대비 학습 단순 + URL 가독성. cuid/ulid는 학습 부담
  - (결정) SQLite — 12-scaffolding §6 DATABASE_URL 정합 + 학습 부담 최소
  - (결정) `postinstall` hook = `prisma generate` — 사용자 `pnpm install` 1회로 type 자동 inject. CI는 frozen lockfile로 결정적
  - (결정) seed는 `dev` 한정 가드 — `env.NODE_ENV !== 'dev'` 시 throw. stg/prod seed 정책은 #5
  - (결정) cascade 통합 테스트는 별도 config (`vitest.integration.config.ts`) + singleThread — SQLite 단일 writer 회피. 단위 테스트(빠른 PASS)와 통합 테스트(DB 접근) 명확 분리
  - (결정) Article·Comment·Tag에 `Int autoincrement` PK, ArticleTag는 `@@id([articleId, tagId])` 복합 PK — 07 HLD §3 정합
  - (결정) 인덱스 3종: `Article.createdAt DESC` (목록 R-N-01), `Tag.name UNIQUE` (정규화), `Comment.articleId + createdAt DESC` (댓글 목록)
- **회귀 시나리오** (P10 회수 후보):
  - `pnpm install` 후 `prisma generate` 실패 → `@prisma/client`이 stub만 export → typecheck FAIL. postinstall hook 동작 검증을 빌드 검증 §1에서 명시.
  - SQLite FK CASCADE 미동작 (Prisma client가 `PRAGMA foreign_keys=ON` 자동 인가) → cascade.integration.test.ts가 즉시 잡음. 통합 테스트 commit 6이 핵심 안전망.
  - seed 비-idempotent → 2회 실행 시 unique constraint FAIL. deleteMany 4종 선행으로 회피.
  - dev hot-reload (tsx watch) 시 PrismaClient 중복 인스턴스 → SQLite lock. global module hoisting 패턴(`globalThis.__prisma`)으로 회피.
  - `.gitignore` `*.db` 매칭 — root `*.db`가 sub-dir까지 cover하는지 확인. 안 되면 명시적 `backend/prisma/*.db` 추가 (commit 1에서 처리).
  - `prisma migrate dev` 실행 시 interactive prompt — `--name init` 명시로 회피.
