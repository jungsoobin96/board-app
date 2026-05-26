---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-05]
  F-ID: [F-01, F-03, F-04, F-06, F-07]
  supersedes: null
---

# feat-articles-api — Acceptance Criteria

> Issue #4 · mode=add · P6 산출. Given/When/Then 형식 AC + DoD 체크리스트.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

- **AC-01 (R-F-01, 09 GET list happy)** — Given 시드 글 5건이 dev.db에 존재, When `GET /api/articles?page=1&limit=10`, Then 200 응답 + `articles.length === 5` + `total === 5` + 각 article에 `id·title·body·author·createdAt·updatedAt·tags` 7 필드 존재 + tags는 배열.
- **AC-02 (R-F-01·R-F-05, 09 GET list failure)** — Given 동일 시드, When `GET /api/articles?page=0`, Then 400 응답 + body `{ "error": "잘못된 페이지/리미트 값입니다" }`.
- **AC-03 (R-F-03, 09 GET detail happy)** — Given 글 id=1 존재, When `GET /api/articles/1`, Then 200 + `id=1` + 위 7 필드.
- **AC-04 (R-F-03, 09 GET detail failure)** — Given id=999 미존재, When `GET /api/articles/999`, Then 404 + `{ "error": "글을 찾을 수 없습니다" }`.
- **AC-05 (R-F-02·R-F-05, 09 POST happy + tag 정규화)** — Given 빈 DB (beforeEach 정리 후), When `POST /api/articles` body `{"title":"hi","body":"world","author":"hana","tagList":["JS","ts","js"," "]}`, Then 201 + 응답 `tags === ["js","ts"]` (정규화: trim·lower·중복 제거·빈 토큰 무시).
- **AC-06 (R-F-05, 09 POST failure)** — Given 빈 DB, When `POST /api/articles` body `{"title":"","body":"x","author":"y","tagList":[]}`, Then 400 + `{ "error": "제목은 필수입니다" }`.
- **AC-07 (R-F-02·R-F-05, 09 PUT failure)** — Given id=999 미존재, When `PUT /api/articles/999` body 정상, Then 404 + `{ "error": "글을 찾을 수 없습니다" }`.
- **AC-08 (R-F-03·R-F-07, 09 DELETE happy + cascade HTTP 경로)** — Given 글 id=X 존재 + 댓글 3건 + ArticleTag 2건 연결, When `DELETE /api/articles/X`, Then 204 + body 빈 응답 + 직후 `prisma.comment.count({where:{articleId:X}}) === 0` + `prisma.articleTag.count({where:{articleId:X}}) === 0` + `prisma.tag.count() === 기존값 그대로`.
- **AC-09 (단위 — 정규화 함수)** — Given `normalizeTags(["JS","ts","js"," ","TS"])`, When 호출, Then `["js","ts"]` 반환 (순서 보존 + lower + trim + 중복 제거).

## 2. Definition of Done (D-06)

### 코드 + 테스트

- [ ] 5 엔드포인트 (list·get·create·update·delete) 09 API spec와 1:1 정합
- [ ] M9 validators 2 파일 + 단위 테스트 12+ 케이스 PASS
- [ ] M7 services 1 파일 + 단위 테스트 5+ 케이스 PASS (vi.mock으로 repo 격리)
- [ ] M8 repository 1 파일 (PrismaClientKnownRequestError → 도메인 에러 변환 포함)
- [ ] M6 controller 1 파일 (5 handler — thin HTTP layer)
- [ ] M5 router 1 파일 + app.ts에 마운트 (notFoundHandler 직전)
- [ ] Supertest 통합 테스트 9 케이스 PASS (`articles.integration.test.ts`)
- [ ] tag 정규화 (trim·lower·중복 제거·빈 토큰 무시) 통합 + 단위 양측 검증
- [ ] DELETE → Comment·ArticleTag cascade HTTP 경로 통합 1건 PASS (R-F-07)

### 빌드·검증

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] `pnpm --filter @app/backend test` 30+ passed (#3 baseline 13 + 본 PR 17 추가)
- [ ] `pnpm --filter @app/backend test:integration` 11 passed (#3 baseline 2 + 본 PR 9 추가)
- [ ] `pnpm --filter @app/backend build` PASS

### 산출 문서 (6종)

- [ ] `docs/features/feat-articles-api/feat-articles-api.brief.md` validate-doc OK
- [ ] `docs/features/feat-articles-api/feat-articles-api.contract.md` validate-doc OK (§0 Referenced-IDs 5행 BLOCK)
- [ ] `docs/features/feat-articles-api/feat-articles-api.plan.md` validate-doc OK
- [ ] `docs/features/feat-articles-api/feat-articles-api.eng-review.md` validate-doc OK (verdict=PASS)
- [ ] `docs/features/feat-articles-api/feat-articles-api.acceptance.md` validate-doc OK (본 파일)
- [ ] `docs/features/feat-articles-api/feat-articles-api.risk.md` validate-doc OK

### Manual verification (사용자 실증, ADR-0046 §2.3 — PR 본문 미체크 유지)

- [ ] dev 부팅 `pnpm --filter @app/backend dev` → `Listening on http://localhost:3000` + 5초 이내 ready
- [ ] `curl /api/articles?page=1&limit=10` → 200 + articles.length=5 (seed 기준)
- [ ] `curl -X POST` happy 시나리오 → 201 + tag 정규화 확인
- [ ] `curl -X DELETE /api/articles/1` → 204 + 직후 댓글 0건 확인
- [ ] GitHub Actions 워크플로 로컬 검증 (act 또는 manual): `<명령>` → `<결과/사유>`

## 3. 비기능 인수

- **응답 시간 (R-N-01)**: 단일 GET list (5건) → 200ms 이하 로컬. SQLite 단일 인스턴스 + offset pagination 가정. 측정은 P14 휴먼 게이트에서 curl `--write-out`으로.
- **에러 schema 통일 (R-N-02)**: 모든 4xx/5xx 응답이 `{ "error": "<한국어 메시지>" }` 형식. stack 미노출 — M10 errorHandler가 보장 (#2 산출 그대로). 단, *throw 측*은 본 PR이 신규. 통합 테스트 (2)(4)(6)(7)에서 schema 검증.
- **메모리 누수 없음 (R-N-04)**: dev 부팅 후 통합 테스트 11건 → `process.memoryUsage()` 안정 가정 (단일 instance test). 정량 측정은 #5 smoke 스크립트에서.

## 4. 회귀 인수

- **#3 baseline 회귀 0**: `cascade.integration.test.ts` 2 케이스 + 단위 13 케이스 모두 PASS 유지.
- **#2 baseline 회귀 0**: `/healthz` 200 + errorHandler 단위 테스트 PASS 유지.
- **#1 baseline 회귀 0**: monorepo `pnpm install --frozen-lockfile` + `pnpm typecheck` + `pnpm lint` 전역 PASS 유지.
- **13/02-catalog (회귀 카탈로그) 갱신**: P13 docs-update에서 §1 단위 (validators·service) + §2 통합 (5 endpoint × happy/failure + cascade HTTP) fan-in 등록.
- **회귀 자동화 — CI**: `pnpm --filter @app/backend test && pnpm --filter @app/backend test:integration`를 모든 PR에서 실행 (GitHub Actions workflow는 별 이슈에서 도입, 현재는 로컬 manual).
