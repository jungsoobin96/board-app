---
doc_type: feature-brief
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

# feat-prisma-schema — Feature Brief

> Issue #3 · mode=add · M11 BE-prisma 모듈 baseline. Sprint 1 — P0.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P1 intention-brief) |

## 1. 한 줄 의도

backend의 Prisma schema·migration·seed를 도입해 *Article·Comment·Tag·ArticleTag 4 모델 + ON DELETE CASCADE*를 schema-level로 강제하고, 후속 글 API(#4)·cascade 통합 테스트(#5)가 본 인프라 위에서 즉시 시작 가능하도록 한다.

## 2. 사용자 가치

학습자(01 Brief 페르소나)가 본 PR 머지 직후 한 줄(`pnpm --filter @app/backend prisma db push` + `pnpm --filter @app/backend exec tsx prisma/seed.ts`)로 dev DB를 부팅·시드하고, 글 5건·댓글 10건·태그 8종을 실시간 확인 가능. 이는 KPI #2(1주 내 글·댓글·태그 동작) 달성의 인프라 baseline이다. 동시에 R-F-07(cascade 무결성)을 *DB 자체가 보장*하도록 강제해 후속 #4 글 API의 service 레이어가 cascade 로직을 *직 구현할 필요 없음* — 즉 코드 복잡도가 낮아진다 (01 Brief KPI #4 — 수정 면적 최소화).

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| backend/prisma/ 디렉토리 | 미존재 | 신설 — `schema.prisma`, `migrations/<timestamp>_init/`, `seed.ts` |
| 데이터 모델 | 없음 | Article·Comment·Tag·ArticleTag 4 모델 |
| cascade 강제 | 없음 | `Comment.article` + `ArticleTag.article` + `ArticleTag.tag` 3 FK에 `onDelete: Cascade` |
| dev DB 파일 | 없음 | `backend/prisma/dev.db` 자동 생성 (`.gitignore` 적용) |
| seed 데이터 | 없음 | 글 5건·댓글 10건·태그 8종 (`seed.ts` idempotent) |
| Prisma client | 없음 (#2의 env만 있음) | `backend/src/lib/prisma.ts` singleton — env.DATABASE_URL 사용 |
| 통합 테스트 | error-handler/app/env 단위만 | cascade 통합 1건 (글 1 + 댓글 3 → 글 삭제 → 댓글 0건 확인) |
| backend scripts | `dev`/`build`/`start`/`test` | + `prisma:push`, `prisma:migrate`, `prisma:generate`, `seed:dev` |

## 4. 모드 자동 감지 결과

- **결정 모드**: `add`
- **시그널 (ADR-0032 §2.1)**:
  - 라벨: `type:feature` (긍정 시그널)
  - 자연어: "Prisma schema + migrations + seed" — 신규 인프라 도입 (긍정 시그널)
  - 부정 시그널: 0건 (bug/design/modify 키워드 부재)
- **결정 근거**: type:feature + 신규 동작 + 부정 시그널 0건 → 규칙 4 자동 결정. 질문 없이 add로 조용히 진행.

## 5. 영향 범위

- **R-ID 매핑**: R-F-07 (cascade 무결성)
- **F-ID 매핑**: F-07 (글 삭제 cascade UX — backend 인프라 직 기여)
- **영향 모듈 (08 LLD)**: M11 BE-prisma (본격 도입), M8 BE-repositories (후속 #4가 PrismaClient를 사용할 진입점 마련)
- **영향 엔드포인트 (09 LLD)**: 0건 (본 PR은 인프라만, 실 라우트는 #4)
- **영향 파일**:
  - 신설: `backend/prisma/schema.prisma`, `backend/prisma/migrations/<timestamp>_init/migration.sql`, `backend/prisma/seed.ts`, `backend/src/lib/prisma.ts`, `backend/tests/integration/cascade.integration.test.ts`, `backend/vitest.integration.config.ts` (또는 기존 config 확장)
  - 수정: `backend/package.json` (deps + scripts), `backend/tsconfig.json` (tests 제외 갱신 시 검토), `.gitignore` (`backend/prisma/*.db`, `backend/prisma/*.db-journal` 추가), `pnpm-lock.yaml`
- **선수 (Blocked-by)**: Issue #2 — feat-backend-skeleton ✓ 머지 완료 (env.DATABASE_URL 사용 가능)
- **후수 (Blocks)**:
  - Issue #4 `feat-articles-api` — 본 PR의 PrismaClient + Article·Tag·ArticleTag 모델 사용
  - Issue (Sprint 2 +) `feat-comments-api` — 본 PR의 Comment 모델 + cascade 사용
  - Issue #5 `test-3profile-bootstrap` — 본 PR의 `seed.ts` + `prisma migrate deploy` (stg/prod) 검증

## 6. 비목표

- 실 글·댓글·태그 REST 엔드포인트 — #4 `feat-articles-api` 책임
- ArticleService `withTransaction()` wrapper — #4에서 service 레이어와 함께 도입
- Repository wrapper 클래스 (`ArticleRepo`/`CommentRepo`/`TagRepo`/`ArticleTagRepo`) — #4
- E2E 시나리오 (글 삭제 후 댓글 영역 빈 상태) — Sprint 3+ FE 후 Playwright
- Prisma migration **production** 실 적용 (`prisma migrate deploy`) — #5에서 stg/prod profile 부팅 smoke 시 검증
- 스키마 진화 가이드라인 (ADR) — 본 PR은 init migration만, 후속 migration 정책은 별 이슈

## 7. Open Questions

- (해소) Prisma version: `@prisma/client` + `prisma` CLI 동일 major. 최신 안정 5.x 채택 (Node 20+ 호환). → `^5.22.0` 핀 권고.
- (해소) Decimal/BigInt 사용 여부: 본 MVP는 `Int` autoincrement + `String` + `DateTime`만. Decimal/BigInt N/A.
- (해소) seed `idempotent` 전략: `prisma.<model>.deleteMany()` 후 `createMany()` — dev 한정. stg/prod seed 별도 정책은 #5.
- (남음) postinstall hook으로 `prisma generate` 자동 실행할지 vs `dev` 스크립트에 prerun으로 둘지: 본 PR에서 결정 — postinstall 채택 권고 (workspace 사용자 경험 일관). → contract에서 확정.
