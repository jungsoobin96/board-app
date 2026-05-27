---
doc_type: feature-brief
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# feat-frontend-api-client — Feature Brief

> Sprint 3 두 번째 이슈 — Issue #11. backend 9 endpoint와 통신하는 frontend api-client + shared DTO 4종 + 에러 정규화 도입. #12·#13·Sprint 4 모든 페이지의 Blocker 해소.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (Sprint 3 두 번째) |

## 1. 한 줄 의도

backend 9 endpoint 통신용 fetch wrapper + shared DTO 4종 (Article·Comment·Tag·ApiError) + NormalizedError 변환 — frontend가 한국어 에러 schema를 일관 처리하도록 baseline 구축.

## 2. 사용자 가치

- **FE 개발자**: 페이지마다 fetch + 에러 처리 코드 중복 X — 단일 client 호출. 4xx/5xx도 동일 schema(`NormalizedError`)로 catch
- **사용자**: 네트워크 오류(offline) 시도 일관 메시지. 한국어 에러 메시지 그대로 노출
- **품질**: shared 패키지로 BE↔FE 타입 일치 — Article schema 변경 시 양쪽 동시 typecheck

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `shared/src/index.ts` | `export const SCAFFOLD_OK = true` placeholder | 4종 type re-export (article·comment·tag·api-error) |
| `shared/src/article.ts` | 부재 | 신설 — `Article`·`ListResult<T>`·`ArticleInput` DTO type |
| `shared/src/comment.ts` | 부재 | 신설 — `Comment`·`CommentInput` DTO type |
| `shared/src/tag.ts` | 부재 | 신설 — `Tag` (`{name, count}`) DTO type |
| `shared/src/api-error.ts` | 부재 | 신설 — `NormalizedError` class + `ApiErrorBody` type |
| `frontend/src/api/client.ts` | 부재 | 신설 — fetch wrapper + 9 method (`listArticles`·`getArticle`·`createArticle`·`updateArticle`·`deleteArticle`·`listComments`·`createComment`·`deleteComment`·`listTags`) |
| `frontend/src/api/normalizeError.ts` | 부재 | 신설 — Response → NormalizedError 변환 + offline `{status: 0}` |
| `frontend/tests/unit/api/client.test.ts` | 부재 | 신설 — 9 method × happy/4xx/offline = 12+ 케이스 (fetch mock) |
| `frontend/tests/unit/api/normalize-error.test.ts` | 부재 | 신설 — 4xx body parse + 5xx + offline 4+ 케이스 |
| 단위 테스트 합계 | 6 (matchRoute) | + 16+ = 22+ passed |
| 통합 테스트 | N/A (frontend 통합 미도입) | N/A |
| 09 API spec 정합 | backend 9/9 | frontend api-client 9/9 wrap |
| ui_changed | true (#10) | **false** — `.ts`만, UI 표면 변경 0 |
| 부팅 자산 | 변경 없음 | 변경 없음 |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0) / modify(0) — 0건
- **라벨**: `type:feature` + `area:frontend` + `priority:P0`
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `shared/src/{article,comment,tag,api-error}.ts` + `frontend/src/api/{client,normalizeError}.ts` | 6 신설 파일 |
| 변경 코드 | `shared/src/index.ts` (placeholder → re-export) | 1 파일 |
| 신규 테스트 | `frontend/tests/unit/api/{client,normalize-error}.test.ts` | 16+ 케이스 |
| 부팅 자산 | 변경 없음 | 0 |
| 의존성 | 없음 — shared·frontend 둘 다 기존 deps만 사용 (vitest + jsdom + native fetch) | 0 |
| ui_changed | **false** — `.ts` 만 (UI 확장자 0) | 5번째 axis N/A |
| 13/02-catalog | R-N-02 §1 보강 fan-in (frontend api-client 단위 layer) | docs-update에서 |

## 6. 비목표

- **실 페이지 호출** — Home·Article·Editor 페이지에서 client 사용은 #12·#13·Sprint 4
- **React Query 등 데이터 캐싱** — MVP는 단순 fetch + useState (10 §5 O Phase 2)
- **AbortController** — 페이지 빠른 클릭 시 이전 요청 취소는 #12·Sprint 4 (10 §5)
- **retry / backoff** — 1회 fetch만 (Phase 2)
- **JWT / 인증 헤더** — R-N-07 MVP 인증 부재
- **mock service worker** — vitest fetch mock 충분
- **e2e** — Sprint 5
- **Schema validation runtime** (zod 등) — TS type만 (MVP)

## 7. Open Questions

- **O-A1**: shared DTO 위치 — `shared/src/*.ts` 또는 단일 `shared/src/dto.ts`. → 답: 도메인별 분리 (article/comment/tag/api-error 4 파일). 11 §3 명명 정합.
- **O-A2**: NormalizedError를 class vs interface. → 답: class (`new NormalizedError(status, message, code?)`). `instanceof` 검사 가능 + Error 상속.
- **O-A3**: offline 응답 형식 — `{status: 0}` (R-N-02 명시) vs 별 NetworkError class. → 답: `NormalizedError` 단일 + `status=0`이면 offline.
- **O-A4**: VITE_API_URL 활용 — `import.meta.env.VITE_API_URL` (Vite 표준).
- **O-A5**: fetch mock 라이브러리 — vitest 내장 `vi.fn().mockResolvedValue(new Response(...))` 충분. msw 미도입.
