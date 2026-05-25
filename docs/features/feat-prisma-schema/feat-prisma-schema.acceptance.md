---
doc_type: feature-acceptance
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

# feat-prisma-schema — Acceptance Criteria

> Issue #3 · mode=add · P6 산출 (DoD 정본).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

| AC | Given | When | Then | 검증 위치 |
| --- | --- | --- | --- | --- |
| AC-01 | fresh checkout + `.env.dev` 작성 완료 | `pnpm install` 실행 | `pnpm-lock.yaml` frozen 일치 + postinstall hook이 `prisma generate` 자동 실행 + `node_modules/.prisma/client/` 생성 + `pnpm typecheck` exit 0 | Manual + CI typecheck |
| AC-02 | `backend/prisma/schema.prisma`에 Article·Comment·Tag·ArticleTag 4 모델 정의 | `pnpm --filter @app/backend prisma:push` 실행 | `backend/prisma/dev.db` 자동 생성 + 4 테이블 (Article·Comment·Tag·ArticleTag) 모두 존재 + Comment.articleId FK ON DELETE CASCADE + ArticleTag.articleId/tagId FK ON DELETE CASCADE 적용 | Manual (`sqlite3 backend/prisma/dev.db ".schema"`) |
| AC-03 | dev.db 초기화 완료 | `pnpm --filter @app/backend seed:dev` 실행 | 글 5건 + 댓글 10건 + 태그 8건 + ArticleTag 다수 삽입. 2회 실행해도 idempotent (deleteMany 선행, count 동일) | Manual (`sqlite3 dev.db "SELECT COUNT(*) FROM Article;"` 등) |
| AC-04 | seed 데이터 적재 완료 | `pnpm --filter @app/backend test:integration` 실행 (cascade.integration.test.ts) | Vitest 통합 1건 PASS — beforeEach가 deleteMany 4종 → 글 1 + 댓글 3 + ArticleTag 2 삽입 → `prisma.article.delete()` → `prisma.comment.count({where:{articleId}})===0` + `prisma.articleTag.count({where:{articleId}})===0` + `prisma.tag.count()===2` (Tag 잔존) | 자동 (vitest) |
| AC-05 | NODE_ENV=stg 또는 prod (예: `dotenv -e ../.env.stg -- tsx prisma/seed.ts`) | seed.ts 실행 | 가드 throw — `[SEED] dev profile에서만 실행 가능합니다 (NODE_ENV=stg)` 메시지 + exit code !=0 | Manual |
| AC-06 | 본 PR commit 5 후 | `backend/src/lib/prisma.ts` import (`import { prisma } from './lib/prisma'`) | PrismaClient singleton 인스턴스 export + `globalThis.__prisma` 패턴으로 dev hot-reload(tsx watch) 시 중복 인스턴스 생성 회피 + LOG_LEVEL=debug면 query/error/warn 로그 활성 | Manual (`pnpm --filter @app/backend dev` + 후속 #4 PR에서 본격 사용) |
| AC-07 | 본 PR 머지 후 LOCAL.md §3 (dev profile) | 새 사용자가 LOCAL.md §3 절차 따라 부팅 | `pnpm install` → `pnpm --filter @app/backend prisma:push` → `pnpm --filter @app/backend seed:dev` → `pnpm --filter @app/backend dev` 4단계가 *순차 명시* + 5초 이내 'Listening on http://localhost:3000' 출력 | Manual (사용자 부팅) |
| AC-08 | `pnpm -r build` 실행 | 4 워크스페이스 모두 typecheck + tsc -b | exit 0 + frontend·backend·shared·e2e 컴파일 정상 | 자동 (CI 또는 로컬) |

## 2. Definition of Done (D-06)

- [ ] `backend/prisma/schema.prisma` 4 모델 (Article·Comment·Tag·ArticleTag) + onDelete: Cascade 3개소 (Comment.article, ArticleTag.article, ArticleTag.tag) + 인덱스 3종 (Article.createdAt DESC, Tag.name UNIQUE, Comment.articleId+createdAt DESC) (AC-02)
- [ ] `backend/prisma/migrations/<ts>_init/migration.sql` 생성 (`prisma migrate dev --name init`) + `migrations/migration_lock.toml` (provider="sqlite") (AC-02)
- [ ] `backend/prisma/seed.ts` — 글 5·댓글 10·태그 8 + 한국어 console.log + NODE_ENV=dev 가드 + idempotent (AC-03·AC-05)
- [ ] `backend/src/lib/prisma.ts` — PrismaClient singleton + global hoisting + LOG_LEVEL 분기 (AC-06)
- [ ] `backend/tests/integration/cascade.integration.test.ts` — R-F-07 핵심 1건 PASS (AC-04)
- [ ] `backend/vitest.integration.config.ts` — singleThread + forks pool + integration 디렉토리만 include (AC-04)
- [ ] `backend/package.json` scripts 7종 추가 (prisma:push·prisma:migrate·prisma:generate·prisma:deploy·seed:dev·test:integration·postinstall) (AC-01·AC-02·AC-03·AC-04)
- [ ] `backend/package.json` deps + devDeps — `@prisma/client ^5.22.0` + `prisma ^5.22.0` (AC-01)
- [ ] `.gitignore` `backend/prisma/*.db`·`backend/prisma/*.db-journal` 추가 (R-N-07 보안 정합)
- [ ] `pnpm-lock.yaml` 갱신 + frozen-lockfile PASS (AC-01)
- [ ] `LOCAL.md` §3 dev profile에 prisma:push + seed:dev 추가 (ADR-0040 동기) (AC-07)
- [ ] AI 게이트 6축 PASS (`/qa-test --ai`)
- [ ] PR open + `Closes #3` 본문 포함

## 3. 비기능 인수

- **R-N-01 응답 시간**: 본 PR은 인프라 only — 측정은 #4 글 API에서. 단, 인덱스 3종(Article.createdAt DESC, Comment.articleId+createdAt DESC)이 page=1·limit=10 시나리오에서 O(log n) 보장. baseline 확보.
- **R-N-02 에러 응답 schema**: 본 PR 직 영향 0 (#2 errorHandler가 PrismaClientKnownRequestError 매핑은 #4 controllers에서 throw 시 적용)
- **R-N-04 부팅 5초 이내 (dev profile)**: AC-07 사용자 부팅 5초 이내 'Listening on' 출력. `prisma generate`는 postinstall 1회만, dev 부팅 시 client 재생성 없음
- **R-N-05 한국어 주석 ≥80%**: 본 PR은 controllers/services/components/repositories 0건 — 측정 범위 외. seed.ts·lib/prisma.ts·cascade.integration.test.ts는 함수 헤더 한국어 의도 주석 (관행)
- **R-N-06 데모 부트스트랩 1줄**: AC-07이 LOCAL.md §3 1줄 명령(`pnpm install && pnpm --filter @app/backend prisma:push && pnpm --filter @app/backend seed:dev`) 검증
- **R-N-07 보안**: dev.db .gitignore 적용 — 시드 데이터는 더미라 보안 영향 0. `.env.dev` 자체는 #2에서 이미 .gitignore (R-N-07 정합)

## 4. 회귀 인수

- 13/03-regression.md `prisma/schema.prisma 변경` 트리거 매칭 — 본 PR이 신설이므로 baseline 등록. 후속 schema 변경 PR은 본 PR cascade.integration.test.ts 재실행 필수
- 기존 #2 단위 테스트 (error-handler·app·env) 회귀 0건 — `pnpm --filter @app/backend test` exit 0 유지
- `pnpm -r build`·`pnpm typecheck`·`pnpm lint` 4 워크스페이스 모두 회귀 0 (AC-08)
- 후속 #4 진입 시: 본 PR `lib/prisma.ts` + 4 모델 + cascade는 변경 없이 그대로 사용 — interface 안정성 확보
