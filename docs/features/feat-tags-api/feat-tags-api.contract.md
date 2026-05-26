---
doc_type: feature-contract
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# feat-tags-api — Change Contract

> Issue #7 · mode=add · P3 산출. 09 API spec §3 GET /api/tags의 Before/After 명세 + Call Sites + Rollback. articles(#4)·comments(#6) 패턴 답습 — 4 레이어(router→controller→service→repository), validator 불필요(GET 단일·body 없음).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-04 |
| F-ID | docs/planning/05-prd/05-prd.md | F-02·F-08 |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §1 §3 §6 | M5(router 추가 마운트)·M6(tags controller 신설)·M7(tag service 신설)·M8(tag repository 신설). M9(validator) N/A — GET body 없음. M10·M11 재사용 |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | GET /api/tags |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 PREFIX, docs/planning/12-scaffolding/typescript.md §5 빌드·실행 | 신규 PREFIX 없음 — 본 endpoint는 ValidationError·NotFoundError throw 없음(쿼리 없음·DB 오류만). 파일 명명 articles·comments 패턴 답습 (tags 복수형 router·controller, tag 단수형 service·repo) |

## 1. 변경 의도

09 API spec §3의 태그 엔드포인트(GET /api/tags) 1건을 backend HTTP layer에 신설한다. articles·comments 패턴 답습 — 단 validator 불필요(쿼리 없음·body 없음). 빈도(_count) desc 정렬 + 상한 20개 서버 고정. Prisma `_count.articleTags`로 집계. F-02 태그 필터·F-08 인기 태그 사이드바 FE 차단 해소. 09 §2 9 endpoint 완결.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/src/routes/tags.ts` | 미존재 | 신설 — express.Router() + 1 method 등록 (GET /) |
| `backend/src/controllers/tags.controller.ts` | 미존재 | 신설 — 1 handler (`listTagsCtrl`), thin HTTP layer + asyncHandler 패턴 |
| `backend/src/services/tag.service.ts` | 미존재 | 신설 — `list()` (정렬·상한·response shape — { tags: [{name, count}] }) |
| `backend/src/repositories/tag.repo.ts` | 미존재 | 신설 — `findManyByFrequency(limit)` — Prisma `tag.findMany({ include: { _count: { articleTags: true } }, orderBy: { articleTags: { _count: 'desc' } }, take: limit })` |
| `backend/src/app.ts` | articles + comments 2 라우터 마운트 | + `app.use('/api/tags', tagsRouter)` 1줄 추가 (comments 직후, notFoundHandler 직전) |
| `backend/tests/unit/services/tag.service.test.ts` | 미존재 | 신설 — 3+ 케이스 (정렬·상한 적용·빈 케이스 vi.mock 격리) |
| `backend/tests/integration/tags.integration.test.ts` | 미존재 | 신설 — Supertest. AC 2건 + 추가 1 = 3+ (30종 시드 desc 상위 20 / 빈 태그 / 동일 빈도 동률 처리) |
| 단위 테스트 실행 | 46+ passed (#6 산출) | + 3+ tag.service = 49+ |
| 통합 테스트 실행 | 18 passed (#4·#6 산출) | + 3 tags = 21+ |
| typecheck | PASS 유지 | PASS (Prisma Tag·_count type 자동 추론) |
| build | `pnpm --filter @app/backend build` PASS | PASS 유지 |
| smoke | `pnpm smoke:3profiles` Sprint 1 #5 baseline | 동일 통과 (변경 0 — comments와 같은 backend) |
| 부팅 자산 | `.env.{dev,stg,prod}.example`·migrations·lockfile·LOCAL.md §3 | 변경 없음 — schema·env·dep 모두 불변 |
| 09 API spec 정합 | 8/9 (#6 후) | **9/9 완결** |
| 코드 라인 추가 | — | 약 +150 (src) + +180 (tests) = 330 |
| 의존성 변경 | 없음 | 변경 없음 (#4 산출 supertest 등 재사용) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/app.ts` | `app.use('/api/tags', tagsRouter)` 1줄 추가. 등록 순서 = comments 직후 / notFoundHandler 직전 (F-RISK-03 회귀 안전망 보전) | 본 PR 1 commit |
| Sprint 3 #11 FE 글 목록 + 태그 사이드바 | 본 PR 응답 schema에 100% 의존 (F-02·F-08 인기 태그 사이드바) | 본 PR 09 spec 정합 PASS = FE 차단 해소 |
| Sprint 5 `feat-tag-filter-ux-polish` | 본 PR + GET /api/articles?tag=... (#4 산출) 조합 사용 | 변경 없음 |
| `backend/src/services/article.service.ts` (M7) | `normalizeTags`로 글 작성 시 태그 upsert — 본 PR이 그 결과를 빈도 집계 | 변경 없음 (read-only) |
| `backend/src/repositories/article.repo.ts` (M8) | `upsertTags` + `linkArticleTags` — Tag 테이블에 row 추가 발생 | 변경 없음 (read-only) |
| `backend/prisma/schema.prisma` (M11) | Tag + ArticleTag 모델 그대로 사용 | 변경 없음 |
| `backend/src/middleware/error-handler.ts` (M10) | 본 endpoint는 throw 없음 (쿼리·body 모두 없음) → DB 오류만 errorHandler 위임 | 변경 없음 |

## 4. Backward Compatibility

- **Breaking**: no — 신규 endpoint 1건만 추가. 기존 8 endpoint·healthz 인터페이스 불변. 기존 호출자 0 (FE 미존재).
- **마이그레이션**: no — schema·migration 변경 0. #3 산출 그대로.
- **API contract 변경**: 09 spec과 1:1 신설 — Before 0 → After 1. 기존 endpoint 변경 없음.
- **버전 bump**: backend package.json `version: 0.1.0` 그대로 (Sprint 2 종료 시점 일괄).
- **에러 코드**: 신규 0 — 본 endpoint는 throw하는 ValidationError·NotFoundError 없음. DB 오류만 errorHandler가 500 처리(기존 패턴).

## 5. Rollback 전략

- **Revert 가능**: yes — 본 PR을 git revert하면 1 endpoint 사라지고 #6 PR #34 baseline 상태(8 endpoint)로 복귀.
- **데이터 손상 위험**: 없음 — read-only endpoint. schema·migration 영향 0. Tag·ArticleTag 데이터는 article 도메인이 관리.
- **부분 롤백**: 단일 endpoint라 부분 롤백 의미 없음. 정식 롤백 = PR revert.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR 생성
  2. CI green 확인 (#4·#6 baseline 회귀: integration 18 PASS 유지)
  3. 머지 → 이슈 #7 재오픈 + 재작업 plan
- **부팅 자산 회귀**: 본 PR 미수정 — 회귀 시 원복 자동.

## 6. 비목표

- **태그 작성·삭제 API** — 09 spec 외, 태그는 글 작성 시 자동 upsert
- **태그 검색·페이지네이션** — 09 §3 "상한 20 서버 고정"
- **태그 트렌드 분석** (시계열) — MVP 범위 외
- **다국어 태그** — normalizeTags(lower+trim) #4 산출 그대로
- **태그 자동완성·suggestion** — Sprint 5+ UX
- **고아 태그 정리** — #3 결정 (Tag 자체는 잔존)
- **태그 빈도 캐싱** (Redis 등) — MVP는 매번 집계 (수십~수백 태그 가정 충분)
- **태그 동률 정렬 안정성** — 빈도 동률 시 name asc 등 안정 정렬 가능 (Prisma 기본은 입력 순서 의존). 본 PR은 secondary sort 없음 — 후속 retro에서 평가
