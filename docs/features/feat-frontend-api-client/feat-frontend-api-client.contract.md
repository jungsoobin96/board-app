---
doc_type: feature-contract
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

# feat-frontend-api-client — Change Contract

> Issue #11 · mode=add · P3. shared types + frontend api-client + 에러 정규화 도입.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-N-02 (에러 응답 schema 일관성) |
| F-ID | docs/planning/05-prd/05-prd.md | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 (8 화면 기능 — client wrap 대상) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M4 §M9(M10 throw 측) | M4 FE-api-client 신설 (client + normalizeError). shared types 4종은 cross-cutting type 패키지 |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §2 §3 | 9 endpoint 모두 wrap (GET /api/articles·GET /:id·POST·PUT·DELETE·GET /:id/comments·POST·DELETE·GET /api/tags) |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 PREFIX, §3 명명 | NormalizedError class + status:0 offline. error code (VAL_·NOT_FOUND_·SRV_) 그대로 (R-N-02 정합) |

## 1. 변경 의도

backend 9 endpoint와 통신할 frontend fetch wrapper + shared DTO 4종 + 에러 정규화. 본 PR은 *순수 모듈*만 — 페이지에서 호출은 #12·#13. R-N-02 `{error:string}` schema → `NormalizedError(status, message)` class 변환. offline → `status=0`. 단위 테스트로 9 method × happy + 4xx + offline 검증. ui_changed=false (`.ts` 만, UI 표면 변경 0).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `shared/src/index.ts` | `export const SCAFFOLD_OK = true` | re-export 4종 (article·comment·tag·api-error) + SCAFFOLD_OK 제거 |
| `shared/src/article.ts` | 부재 | 신설 — `interface Article {id, title, body, author, createdAt, updatedAt, tags}` + `interface ListResult<T>` + `interface ArticleInput` |
| `shared/src/comment.ts` | 부재 | 신설 — `interface Comment {id, articleId, body, author, createdAt}` + `interface CommentInput` |
| `shared/src/tag.ts` | 부재 | 신설 — `interface Tag {name, count}` |
| `shared/src/api-error.ts` | 부재 | 신설 — `class NormalizedError extends Error { status, code? }` + `interface ApiErrorBody {error: string}` |
| `frontend/src/api/client.ts` | 부재 | 신설 — 9 method export. base URL from `import.meta.env.VITE_API_URL`. 모든 method가 NormalizedError throw |
| `frontend/src/api/normalizeError.ts` | 부재 | 신설 — `normalizeResponse(res): Promise<never>` 4xx/5xx body parse → throw. + offline catch → `status=0` |
| `frontend/tests/unit/api/client.test.ts` | 부재 | 신설 — 9 method × happy/4xx/offline = 12+ 케이스 (`vi.fn().mockResolvedValue(new Response(JSON.stringify(...)))`) |
| `frontend/tests/unit/api/normalize-error.test.ts` | 부재 | 신설 — 4xx body parse + 5xx + 빈 body fallback + offline 4+ 케이스 |
| 단위 합계 | 6 (matchRoute) | + 16+ ≈ 22 passed |
| typecheck | PASS | PASS (shared·frontend 모두) |
| build | PASS | PASS (shared tsc -b 활성, frontend vite build) |
| smoke | Sprint 1 #5 baseline | 동일 (backend 변경 0) |
| 부팅 자산 | 무변경 | 무변경 |
| 09 API spec 정합 | backend 9/9 | frontend client 9/9 wrap |
| ui_changed | true (#10) | **false** — `.ts` 만 |
| 코드 라인 추가 | — | 약 +200 (shared 4 + frontend 2) + +250 (test) + +180 (docs) ≈ 630 |
| 의존성 변경 | 0 | 0 (vitest·@testing-library 등 #10 산출 재사용) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `shared/src/index.ts` | placeholder export 제거 + 4종 re-export | 본 PR 1 commit |
| `frontend/src/pages/*.tsx` (placeholder) | 본 PR client 호출 0 (#12·#13에서 활용) | 변경 없음 |
| `backend/src/**` | shared 패키지 의존 설정만 있고 실 사용 0 (현재) — 향후 shared types를 backend에서도 사용 가능 (DTO 통일) | 본 PR 변경 없음. 후속 PR에서 backend 응답 타입을 shared 타입으로 typed 가능 (선택) |
| Sprint 3 #12·#13 + Sprint 4 모든 FE PR | 본 PR 9 method API 의존 | Blocker 해소 |
| `frontend/src/components/ErrorBoundary.tsx` (#10) | client 호출 fail 시 catch — but ErrorBoundary는 render fail용. 본 client는 throw하므로 호출처에서 try/catch | 변경 없음 |
| backend api endpoints (9건) | 본 PR 응답 schema에 100% 의존 | 변경 없음 (이미 정합) |
| `frontend/package.json` deps | `@app/shared workspace:*` 이미 (#10) | 변경 없음 |

## 4. Backward Compatibility

- **Breaking**: no — 신규 모듈만. SCAFFOLD_OK 제거는 사용 0이라 Breaking 아님 (Sprint 1 #1 placeholder).
- **마이그레이션**: no — schema·DB·env 영향 0.
- **API contract 변경**: 0 — backend 응답 그대로 wrap.
- **버전 bump**: shared `0.0.0` → `0.1.0` 고려 — Sprint 3 종료 시 일괄.
- **에러 코드**: shared NormalizedError class 신설. 기존 backend error class와 *별 layer* (BE는 ValidationError·NotFoundError, FE는 NormalizedError. shared 패키지로 *데이터 schema*만 공유).

## 5. Rollback 전략

- **Revert 가능**: yes — git revert.
- **데이터 손상 위험**: 없음.
- **부분 롤백**: 단일 PR atomic. 부분 disable 시 client.ts 일부 method 주석 처리.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR
  2. CI green (frontend 단위 router 6 baseline 회귀 + shared 빌드 회귀 — placeholder)
  3. 머지 → 이슈 #11 재오픈
- **부팅 자산 회귀**: 0.

## 6. 비목표

- **실 페이지 호출** — Home·Article·Editor에서 client 사용은 #12·#13·Sprint 4
- **React Query 등 캐싱** — MVP는 단순 fetch + useState
- **AbortController** — 페이지 빠른 클릭 시 이전 요청 취소는 #12·Sprint 4
- **retry / backoff** — 1회 fetch (Phase 2)
- **JWT** — R-N-07 MVP 인증 부재
- **mock service worker** — vitest fetch mock 충분
- **e2e** — Sprint 5
- **runtime schema validation** (zod 등) — TS type만
- **backend response shared types 적용** — 본 PR scope 외 (DTO contract baseline만 수립)
