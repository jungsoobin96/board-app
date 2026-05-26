---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Acceptance Criteria

> Issue #6 · mode=add · P6 산출. 이슈 본문 AC 4건을 schema 정합 Given/When/Then으로 풀고, DoD 6 axis + Test Plan 4블록 시드.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: POST /api/articles/:id/comments happy

- **Given**: article id=1이 DB에 존재 (seed로 시드된 글 또는 통합 테스트 prisma.article.create).
- **When**: `POST /api/articles/1/comments`에 `{"body":"재밌네요","author":"min"}` 전송.
- **Then**: HTTP 201 + response body `{ id, articleId:1, body:"재밌네요", author:"min", createdAt }` 반환. DB Comment 테이블에 row 1건 증가.
- **측정 방법**: 자동 테스트 (`backend/tests/integration/comments.integration.test.ts` AC-01 케이스).
- **R-ID**: R-F-05 (작성), R-F-06 (댓글 인터페이스), F-05.

### AC-02: DELETE /api/articles/:id/comments/:commentId happy

- **Given**: article id=1, comment id=5가 DB에 존재 (commentId=5는 articleId=1의 댓글).
- **When**: `DELETE /api/articles/1/comments/5` 전송.
- **Then**: HTTP 204 + body 빈 응답. DB Comment 테이블에서 id=5 row 0건 (삭제 확인).
- **측정 방법**: 자동 테스트 (integration AC-02 케이스).
- **R-ID**: R-F-06.

### AC-03a: GET /api/articles/:id/comments — article 미존재 → 404

- **Given**: article id=999가 DB에 존재하지 않음.
- **When**: `GET /api/articles/999/comments` 전송.
- **Then**: HTTP 404 + body `{ "error": "글을 찾을 수 없습니다" }`.
- **측정 방법**: 자동 테스트 (integration AC-03a 케이스).
- **R-ID**: R-F-06 (인터페이스), R-N-02 (한국어 에러 schema).

### AC-03b: POST /api/articles/:id/comments — article 미존재 → 404

- **Given**: article id=999가 DB에 존재하지 않음.
- **When**: `POST /api/articles/999/comments`에 정상 body 전송.
- **Then**: HTTP 404 + body `{ "error": "글을 찾을 수 없습니다" }`.
- **측정 방법**: 자동 테스트 (integration AC-03b 케이스).
- **R-ID**: R-F-06.

### AC-03c: DELETE /api/articles/:id/comments/:commentId — article 미존재 또는 mismatch → 404

- **Given**: article id=1 존재, comment id=5는 articleId=2의 댓글 (다른 article 소속).
- **When**: `DELETE /api/articles/1/comments/5` 전송 (path articleId=1 vs comment.articleId=2 mismatch).
- **Then**: HTTP 404 + body `{ "error": "댓글을 찾을 수 없습니다" }`.
- **측정 방법**: 자동 테스트 (integration AC-03c 케이스).
- **R-ID**: R-F-06.

### AC-04: POST 빈 body → 400

- **Given**: article id=1 존재.
- **When**: `POST /api/articles/1/comments`에 `{"body":"","author":"min"}` 전송 (또는 body 공백만).
- **Then**: HTTP 400 + body `{ "error": "본문은 필수입니다" }`.
- **측정 방법**: 자동 테스트 (unit `comment.validator.test.ts` + integration AC-04 케이스).
- **R-ID**: R-F-05 (작성 검증), R-N-02 (한국어 에러).

### AC-05: GET 댓글 목록 happy

- **Given**: article id=1 존재, 댓글 2건이 articleId=1에 시드됨.
- **When**: `GET /api/articles/1/comments` 전송.
- **Then**: HTTP 200 + body `{ comments: [{id, articleId, body, author, createdAt}, ...] }` (length=2, createdAt DESC 정렬).
- **측정 방법**: 자동 테스트 (integration AC-05 케이스).
- **R-ID**: R-F-06.

### AC-06: cascade fan-in 회귀 (댓글 시점)

- **Given**: article id=1 존재, 댓글 3건이 articleId=1에 시드됨.
- **When**: `DELETE /api/articles/1` 전송 후 `GET /api/articles/1/comments` 전송.
- **Then**: DELETE 응답 HTTP 204. 후속 GET 응답 HTTP 404 ("글을 찾을 수 없습니다"). DB Comment 테이블 articleId=1 row 0건 (schema-level CASCADE 발현).
- **측정 방법**: 자동 테스트 (integration AC-06 케이스).
- **R-ID**: R-F-06, R-F-07 (cascade 무결성 — #4 cascade.integration.test.ts와 별도로 comments 시점 회귀).

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** 작성·통과 — `pnpm --filter @app/backend test`로 comment.validator(7+ 케이스) + comment.service(5+ 케이스) PASS. 기존 30+ 케이스 회귀 0.
- [ ] **통합 테스트** 작성·통과 — `pnpm --filter @app/backend test:integration`로 comments.integration.test.ts (AC-01~06, 7+ 케이스) PASS. 기존 11 케이스(#4 articles 9 + cascade 2) 회귀 0.
- [ ] **AI 게이트** 6축 PASS (ADR-0011 + ADR-0037 + ADR-0038):
  - 1축 자동 테스트 — Build + Automated tests PASS (pnpm build + typecheck + test + test:integration)
  - 2축 코드 리뷰 — P9 reviewer agent verdict=PASS
  - 3축 Test Plan 4블록 — P10 ai-qa-report.md 작성
  - 4축 시크릿 스캔 — 본 PR은 env·schema 미수정으로 자동 통과
  - 5축 브라우저 골든패스 — `ui_changed=false` (BE-only) N/A
  - 6축 로컬 부팅 가능성 — `pnpm smoke:3profiles` PASS (Sprint 1 #5 도입, 부팅 자산 미변경)
- [ ] **Test Plan 4블록** — PR body에 Build / Automated tests / Manual verification / DoD coverage 4 subsection 포함 (`Manual verification`·`DoD coverage`는 항상 미체크 — ADR-0046 §2.3).
- [ ] **tested 라벨** — ADR-0046 v1.2로 자체 폐지. 머지 게이트는 `pr-body-checkboxes` status check가 자동 발행 (PR body 미체크 갯수 == 0 시). 본 항목은 schema BLOCK 통과용 자리 라벨 유지.
- [ ] **Approve** ≥ 1 (사람 검토자, ADR-0044 branch protection).
- [ ] **CI green** — GitHub Actions workflow (pnpm lint + typecheck + test + test:integration + build) 모두 PASS. 본 프로젝트 CI 워크플로 미구축 단계라 N/A 사유 명시 후 통과 (follow-up #4: `bug(ci):` GH Actions 0 runs).

## 3. 비기능 인수

- **성능**: GET list 응답 시간 < 100ms (5건 댓글 가정, 09 §3 명시 없음 — articles list와 동등 가정). 측정: integration 테스트 응답 < 500ms (CI noise 고려 5x margin).
- **로깅**: 요청 1건당 method + path + status code 로그 1줄 (#2 requestLogger 그대로 — 본 PR 변경 0).
- **보안**: 입력 검증 (body·author trim·길이) — validator. SQL injection 방지 — Prisma parameterized query. 시크릿 노출 0 — DATABASE_URL은 logger·response에 출력 안 함.

## 4. 회귀 인수

- **R-1**: articles 5 endpoint 동작 회귀 0 — `pnpm --filter @app/backend test:integration`로 articles.integration.test.ts 9건 PASS 유지.
- **R-2**: cascade schema-level 동작 회귀 0 — cascade.integration.test.ts 2건 PASS 유지. + AC-06로 comments 시점 cascade fan-in 추가 검증.
- **R-3**: app.ts 라우터 등록 순서 회귀 — articles 직후 / notFoundHandler 직전. F-RISK-03 안전망 보전. typecheck + integration 18 PASS로 검증.
- **R-4**: smoke 3 profile 부팅 — `pnpm smoke:3profiles` Sprint 1 #5 baseline 유지 (dev:3000·stg:3001·prod:3002 모두 ready < 5초 + /api/articles 200). 본 PR이 backend 코드 추가만 했으므로 부팅 자산 영향 0 — 회귀 0 기대.
- **R-5**: 09 API spec 정합 — 글 5 / 댓글 3 / 태그 0 = 8/9 endpoint 충족. 응답 schema flat 구조 유지 (RealWorld wrapping 없음).
- **R-6**: 한국어 에러 schema — `{ "error": string }` (R-N-02). 모든 신규 4xx 응답 schema 정합.
