---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Feature Brief

> Sprint 2 첫 이슈 — issue #6. Articles API(#4 PR #32)에서 fan-out된 댓글 CRD(Create·Read·Delete, 수정 없음) 3 엔드포인트 신설 + cascade 회귀(이미 schema-level CASCADE 적용·#4에서 HTTP 발현 확인) 통합.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (Sprint 2 진입) |

## 1. 한 줄 의도

글 단위 댓글 목록·작성·삭제 3 엔드포인트 신설(09 §3 정합) — 09 §2 9개 엔드포인트 중 댓글 3건 완결, F-05 발현.

## 2. 사용자 가치

- **독자**: 글 상세 페이지에서 댓글 목록·작성·삭제로 의견 교환 가능 (FE는 Sprint 4 `feat-comment-create-delete-ui`에서 결합)
- **작성자**: 자신의 글에 달린 댓글을 삭제로 정리 가능 (인증 없음 — MVP)
- **운영**: 글 삭제 시 댓글 자동 cascade(#4에서 schema-level 검증 완료) — 별 정리 절차 불필요

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| 댓글 API 엔드포인트 | 0 (미작성) | 3 (GET list / POST 201 / DELETE 204) |
| `backend/src/routes/comments.ts` | 부재 | 신설 (mergeParams=true Router) |
| `backend/src/controllers/comments.controller.ts` | 부재 | 신설 (3 handler, articles 패턴 답습) |
| `backend/src/services/comment.service.ts` | 부재 | 신설 (list/create/remove — article 존재 검사 포함) |
| `backend/src/repositories/comment.repo.ts` | 부재 | 신설 (findManyByArticle / insertComment / findById / deleteComment) |
| `backend/src/validators/comment.validator.ts` | 부재 | 신설 (body·author 형식·길이) |
| `backend/src/app.ts` | articles 1 라우터 마운트 | comments 라우터 추가 마운트 (`/api/articles/:articleId/comments`) |
| 통합 테스트 | articles + cascade 2 file | comments.integration.test.ts +1 file (3 endpoint × happy/failure) |
| 단위 테스트 | validators + service 5 file | comment.validator + comment.service +2 file |
| 09 API spec 정합 | 글 5건 PASS | 글 5 + 댓글 3 = 8/9 (태그 1건만 남음 — Sprint 2 #7에서) |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0) / modify(0) — 0건
- **라벨**: `type:feature` + `area:backend` + `priority:P0`
- **자연어**: "댓글 API (CRD, 수정 없음) + 통합" — 신규 동작
- **자동 판정**: ADR-0032 규칙 4 기본값 발동 → **mode=add** (질문 없이 진행)
- **trace**: type:feature 라벨 + 신규 모듈 도입 + 기존 동작 변경 없음 → add 확정

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `backend/src/{routes,controllers,services,repositories,validators}/` | 5 신규 파일 (모두 comment 도메인) |
| 변경 코드 | `backend/src/app.ts` | 1줄 추가 (라우터 마운트) |
| 신규 테스트 | `backend/tests/integration/comments.integration.test.ts` | AC 4건 × happy/failure 케이스 |
| 신규 테스트 | `backend/tests/unit/validators/comment.validator.test.ts` | body·author 검증 |
| 신규 테스트 | `backend/tests/unit/services/comment.service.test.ts` | article 존재 검사 NotFoundError throw |
| 부팅 자산 | 변경 없음 (`.env.{dev,stg,prod}.example`·prisma migrations·lockfile·LOCAL.md 동기 N/A) | 6번째 axis: 부팅 코드 변경만 (라우터 +1 라인) |
| 09 API spec | 영향 없음 (이미 §3 명시) | docs sync 불필요 |
| 13/02-catalog | F-05 / R-F-06 fan-in 후속 갱신 | docs-update에서 ADR-0035 check |

## 6. 비목표

- 댓글 **수정 API** (PATCH/PUT) — F-05 정의에 따라 본 슬라이스에서 제외 (CRD만)
- 댓글 페이지네이션 — 09 §3 "MVP는 페이지네이션 없음"
- 댓글 작성자 인증 — R-N-07 (MVP 인증 없음)
- 댓글 cascade 신규 구현 — #4에서 schema-level + HTTP 경로 통합 검증 완료(`cascade.integration.test.ts`). 본 슬라이스는 fan-in 회귀만 (글 삭제 → 댓글 자동 삭제, comments.integration도 직접 검증 추가)

## 7. Open Questions

- **O-C1**: DELETE 404 응답 메시지 — 09 §3은 "댓글을 찾을 수 없습니다"로 명시. → 답: 09 spec 그대로 따름. 신규 에러 코드 `NOT_FOUND_COMMENT` 도입 (글의 `NOT_FOUND_ARTICLE`과 분리).
- **O-C2**: GET list에서 article 미존재 시 200 + 빈 배열 vs 404. → 답: 09 §3 명시 "404 articleId 미존재". 일관성 (POST/DELETE도 동일) + 이슈 본문 AC-3 "articleId 미존재, When 모든 댓글 API, Then 404" 정합. 200+빈 배열 안 함.
- **O-C3**: DELETE articleId mismatch (commentId 존재하지만 다른 article의 댓글) — 09 §3 "404 commentId 미존재 또는 articleId mismatch". → 답: service에서 `findById(commentId)` 후 `comment.articleId !== articleId`면 NotFoundError throw.
