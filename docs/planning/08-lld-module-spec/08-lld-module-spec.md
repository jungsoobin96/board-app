---
doc_type: module-spec
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12]
  supersedes: null
---

# Conduit Lite — Module Spec (LLD — 모듈/통신)

> NEW_PROJECT Gate C. 07 HLD §1의 12개 모듈을 fan-out — 모듈별 내부 구조·외부 IF·데이터 흐름·에러·테스트 진입점을 LLD 수준으로 확정. ADR-0031 §1 정합.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 모듈 개요

본 LLD는 07 HLD §1 핵심 모듈/컴포넌트 표의 12행을 직접 fan-out한다. 각 모듈은 **모듈 ID**·**책임**·**07 HLD §1 참조**·**R-ID 매핑**·**F-ID 매핑**을 다음 표로 동시 명시한다.

| 모듈 ID | 책임 | 07 HLD §1 참조 | R-ID 매핑 | F-ID 매핑 |
|---|---|---|---|---|
| M1 FE-router | path 라우팅 (5종 경로) 및 NotFound 매핑 | 07 HLD §1 row "FE-router" | R-F-08 | F-01·F-02·F-03·F-04·F-06 |
| M2 FE-pages | 5 페이지(Home/Article/Editor/NotFound) UI 합성 + 사이드바 노출 + API 호출 트리거 | 07 HLD §1 row "FE-pages" | R-F-01·R-F-03·R-F-08·R-N-06 | F-01·F-02·F-03·F-04·F-05·F-06·F-08·F-11 |
| M3 FE-components | 재사용 UI primitives — ArticleCard·TagList·Pagination·CommentList·EditorForm·ErrorBoundary | 07 HLD §1 row "FE-components" | R-N-06 | F-01·F-02·F-04·F-05·F-08·F-11 |
| M4 FE-api-client | `/api/*` REST 호출 wrapper + 응답 정규화 + 에러 통일 | 07 HLD §1 row "FE-api-client" | R-N-02 | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 |
| M5 BE-router | Express 라우터 마운트 + 미들웨어 체인 | 07 HLD §1 row "BE-router" | R-F-08·R-N-02 | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 |
| M6 BE-controllers | HTTP 입출력 (req 파싱·status 매핑·response 직렬화) | 07 HLD §1 row "BE-controllers" | R-F-01·R-F-02·R-F-03·R-F-06·R-N-02 | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 |
| M7 BE-services | 비즈니스 규칙 (태그 정규화·페이지네이션·cascade·트랜잭션) | 07 HLD §1 row "BE-services" | R-F-01·R-F-02·R-F-04·R-F-06·R-F-07·R-N-01 | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 |
| M8 BE-repositories | Prisma client wrapper + ON DELETE CASCADE 정합 | 07 HLD §1 row "BE-repositories" | R-F-01·R-F-02·R-F-03·R-F-04·R-F-06·R-F-07·R-N-01 | F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 |
| M9 BE-validators | 입력 검증 함수 (title/body/author/tagList trim·길이·빈 값) | 07 HLD §1 row "BE-validators" | R-F-05 | F-03·F-05·F-06 |
| M10 BE-error | 글로벌 에러 핸들러 — `{ error: string }` 통일 + 스택 stderr only | 07 HLD §1 row "BE-error" | R-N-02·R-N-07 | F-09·F-12 |
| M11 BE-prisma | Prisma client 인스턴스 + schema.prisma + migrations + seed | 07 HLD §1 row "BE-prisma" | R-F-07·R-N-04 | F-07·F-09 |
| M12 Shared-types | FE/BE 공유 TypeScript DTO (Article/Comment/Tag/Error) | 07 HLD §1 row "Shared-types" | R-F-01·R-F-02·R-F-03·R-F-06 | F-01·F-04·F-05·F-06 |

## 2. 외부 인터페이스

| 인터페이스 | 입력 | 출력 | 에러 |
|---|---|---|---|
| M1 FE-router → M2 FE-pages | URL 경로 + URLSearchParams | 활성 라우트 컴포넌트 mount | 미일치 경로 → NotFound 컴포넌트 |
| M2 FE-pages → M4 FE-api-client | DTO 입력 (Article/Comment/page/limit/tag) | Promise<DTO> | NormalizedError (status + message) |
| M4 FE-api-client → BE `/api/*` | HTTP method·path·body·query | HTTP response + JSON | network/4xx/5xx → NormalizedError |
| M5 BE-router → M6 BE-controllers | Express Request | Express Response | next(err) |
| M6 BE-controllers → M9 BE-validators | req body/query | parsed input | ValidationError(400) |
| M6 BE-controllers → M7 BE-services | parsed input | service result | ServiceError / NotFoundError |
| M7 BE-services → M8 BE-repositories | service-layer model | DB row(s) | RepositoryError(500) |
| M8 BE-repositories → M11 BE-prisma | Prisma 쿼리 객체 | Prisma result | PrismaClientKnownRequestError |
| 모든 BE 에러 → M10 BE-error | Error 인스턴스 | HTTP status + `{ error }` | (terminal) |
| M3 FE-components ↔ M12 Shared-types | DTO prop | rendered DOM | (none — type safety) |
| M12 Shared-types ↔ FE/BE | TypeScript import | type narrowing | compile-time error |

## 3. 내부 컴포넌트

| 모듈 | 내부 컴포넌트 | 역할 |
|---|---|---|
| M1 FE-router | `<BrowserRouter>` · `<Routes>` · `<Route>` × 5 · `<NotFound>` fallback | path 매칭과 404 처리 |
| M2 FE-pages | `<Home>` · `<Article>` · `<Editor>` · `<NotFound>` (페이지 컴포넌트 4종) | URL → API 호출 → state → 컴포넌트 렌더 합성 |
| M3 FE-components | `<ArticleCard>` · `<TagList>` · `<Pagination>` · `<CommentList>` · `<EditorForm>` · `<ErrorBoundary>` · `<Layout>` | 재사용 UI primitives + Tailwind 클래스 + 토큰 매핑 |
| M4 FE-api-client | `apiClient.listArticles()` · `getArticle()` · `createArticle()` · `updateArticle()` · `deleteArticle()` · `listComments()` · `createComment()` · `deleteComment()` · `listTags()` + `normalizeError()` | REST 호출 + 응답 타입 안전화 + 에러 정규화 |
| M5 BE-router | `app.use(express.json())` · `corsDev()` · `articlesRouter` · `commentsRouter` · `tagsRouter` · `errorHandler` | Express 앱 부팅 시 미들웨어 체인 구성 |
| M6 BE-controllers | `listArticlesCtrl` · `getArticleCtrl` · `createArticleCtrl` · `updateArticleCtrl` · `deleteArticleCtrl` · `listCommentsCtrl` · `createCommentCtrl` · `deleteCommentCtrl` · `listTagsCtrl` | HTTP layer thin handler. 검증·service 호출 위임. |
| M7 BE-services | `ArticleService.{list,get,create,update,delete}` · `CommentService.{list,create,delete}` · `TagService.list` · `normalizeTags()` · `paginate()` · `withTransaction()` | 비즈니스 규칙 모음 |
| M8 BE-repositories | `ArticleRepo.{findMany,findById,insert,update,delete}` · `CommentRepo.{findByArticleId,insert,delete}` · `TagRepo.{findAll,upsertMany}` · `ArticleTagRepo.{linkMany,unlinkByArticleId}` | Prisma client 호출 일원화 |
| M9 BE-validators | `validateArticleInput()` · `validateCommentInput()` · `parseListQuery()` · `parsePathId()` | 단일 책임 검증 함수 |
| M10 BE-error | `errorHandler(err, req, res, next)` · `class NotFoundError` · `class ValidationError` · `class RepositoryError` | 글로벌 핸들러 + 도메인 에러 클래스 |
| M11 BE-prisma | `prisma` singleton client · `schema.prisma` · `migrations/*` · `seed.ts` | Prisma 인프라 |
| M12 Shared-types | `type Article` · `type Comment` · `type Tag` · `type ApiError` · `type ListResult<T>` | FE/BE 공유 DTO. 빌드 시 두 패키지가 import. |

## 4. 데이터 흐름

본 §은 07 HLD §2 흐름의 *모듈 내부* 단계를 보강한다.

1. **읽기 흐름 — 글 목록 (UC-01)**
   - 브라우저 → M1 라우트 매칭 → M2 `<Home>` mount
   - `<Home>` useEffect → M4 `apiClient.listArticles({ page, tag })` → fetch GET `/api/articles?page=&tag=`
   - M5 라우터 → M6 `listArticlesCtrl(req, res)` → M9 `parseListQuery(req.query)` → ValidationError 시 400 throw, OK 시 다음
   - M7 `ArticleService.list({ page, limit, tag })` → M8 `ArticleRepo.findMany()` + `CommentRepo.countByArticleIds()` (선택)
   - M11 Prisma client → SQLite SELECT (createdAt DESC, LIMIT, OFFSET, WHERE tag IN ...)
   - 응답 build → M12 `ListResult<Article>` 직렬화 → 200
   - M4 정규화 → M2 상태 갱신 → M3 `<ArticleCard>` × N + `<Pagination>` 렌더
2. **쓰기 흐름 — 글 작성 (UC-03)**
   - M2 `<Editor>` → submit → M4 `apiClient.createArticle(input)`
   - M6 `createArticleCtrl` → M9 `validateArticleInput(req.body)` → 실패 시 ValidationError(400)
   - M7 `ArticleService.create({ ...input })` → trim·태그 정규화(`normalizeTags()`) → M7 `withTransaction()` 안에서
     - M8 `ArticleRepo.insert(article)` → return id
     - M8 `TagRepo.upsertMany(tags)` → return tag rows
     - M8 `ArticleTagRepo.linkMany(articleId, tagIds)`
   - 트랜잭션 commit → article DTO 응답 → 201
   - M4 → M2 navigate(`/article/:id`)
3. **삭제 흐름 — cascade (UC-05, R-F-07)**
   - M2 `<Article>` → confirm → M4 `apiClient.deleteArticle(id)` → DELETE `/api/articles/:id`
   - M6 `deleteArticleCtrl` → M7 `ArticleService.delete(id)` → M8 `ArticleRepo.delete(id)`
   - Prisma `delete` → SQLite `DELETE FROM Article WHERE id=?` → ON DELETE CASCADE로 Comment·ArticleTag 동시 삭제 (M11 schema.prisma 보장)
   - 응답 204 → M2 navigate(`/`)
4. **에러 흐름 (R-N-02)**
   - 모든 BE 모듈에서 throw 또는 `next(err)`
   - M10 `errorHandler` → err.kind 매핑 → status code 결정 → `{ error: string }` 직렬화
   - 5xx는 일반 메시지("서버 오류가 발생했습니다") + `console.error(err)` (stderr only)
   - M4 `normalizeError(response)` → `NormalizedError { status, message }` → M2 toast/inline

## 5. 상태·라이프사이클

- **M2 FE-pages**: React component state. `<Home>` — `articles: Article[]`, `tags: Tag[]`, `page: number`, `total: number`, `loading: boolean`, `error: string|null`. URL searchParams가 source-of-truth (페이지·태그 변경 시 navigate).
- **M3 FE-components**: 모두 stateless 또는 controlled (props만). 에러 토스트는 부모(M2)가 관리.
- **M4 FE-api-client**: stateless. `AbortController`로 이전 요청 취소 가능 (페이지네이션 빠른 클릭).
- **M5 BE-router**: 라우터는 stateless. 부팅 시 1회 마운트.
- **M6~M9 BE-***: 모두 stateless 함수.
- **M10 BE-error**: stateless 미들웨어.
- **M11 BE-prisma**: client는 모듈 레벨 singleton. 부팅 시 connect, 종료 시 `prisma.$disconnect()` (SIGTERM 핸들러).
- **트랜잭션 라이프사이클**: M7 `withTransaction(callback)`이 Prisma `$transaction()`을 wrap. 실패 시 자동 rollback.

## 6. 에러 처리

| 에러 | 발생 조건 | 처리 |
|---|---|---|
| ValidationError | M9 검증 실패 (title 빈 값·길이 초과·빈 body·잘못된 page=-1 등) | M10 핸들러 → 400 + `{ error: "<필드명>은 필수입니다" }` 또는 검증 실패 메시지 |
| NotFoundError | M7/M8에서 id 미존재 (글·댓글) | M10 → 404 + `{ error: "글을 찾을 수 없습니다" }` 등 |
| RepositoryError | M8 Prisma 호출 실패 (DB connection·constraint 등) | M10 → 500 + `{ error: "서버 오류가 발생했습니다" }`, 원본 스택은 console.error |
| PrismaClientKnownRequestError | Prisma 알려진 에러 (P2002 unique constraint 등) | M8에서 도메인 에러로 변환 후 throw |
| CORS 에러 | dev에서 origin 불일치 | Express CORS 미들웨어가 403 응답 |
| 네트워크 에러 (FE) | fetch 실패 (offline·timeout) | M4 `normalizeError` → `{ status: 0, message: "네트워크 오류" }` → M2 toast |
| 라우팅 불일치 (FE) | 존재 X 경로 | M1 NotFound 컴포넌트 |
| AbortError (FE) | 사용자가 페이지 빠르게 전환 | M4가 무시 (이전 요청 의도적 취소) |

## 7. 동시성·트랜잭션

- **SQLite 단일 writer 한계**: SQLite는 쓰기 직렬화. 본 MVP는 단일 인스턴스 데모(RISK-02) 가정. 다중 동시 쓰기 부하 시나리오는 N/A.
- **트랜잭션 wrapper (M7 `withTransaction`)**: 글 작성·수정·삭제는 항상 트랜잭션. 태그 정규화 + 글 insert + ArticleTag link 3단계가 atomically 적용. 실패 시 rollback.
- **cascade는 DB-level (M8·M11)**: ON DELETE CASCADE를 Prisma schema에 명시 → SQLite가 보장. 서비스 레이어 의존 X (R-F-07).
- **읽기 일관성**: SQLite WAL 모드 권고 (선택). MVP는 기본 모드 + 단일 인스턴스 가정.
- **FE 동시 요청**: 페이지네이션 빠른 클릭 시 M4 `AbortController` 사용. 같은 article에 동시 PUT은 *last-write-wins* (인증 없으므로 충돌 검출 안 함).

## 8. 테스트 진입점

| 모듈 | 단위 테스트 진입점 | 통합 테스트 진입점 | E2E 진입점 |
|---|---|---|---|
| M1 FE-router | `router-config.test.ts` — 경로 매칭 함수 | (해당 없음) | Playwright — `/article/123` 직접 진입 → 정상 렌더 |
| M2 FE-pages | `Home.test.tsx` · `Editor.test.tsx` 등 (Vitest + React Testing Library) | `pages-with-api.test.tsx` — MSW로 API mock | Playwright — 글 작성 시나리오 (F-03) |
| M3 FE-components | `ArticleCard.test.tsx` · `Pagination.test.tsx` 등 (snapshot/interaction) | N/A | (E2E에서 간접 검증) |
| M4 FE-api-client | `apiClient.test.ts` — fetch mock | (해당 없음) | (E2E에서 간접) |
| M5 BE-router | `router.test.ts` — 마운트 검증 | Supertest — 라우트 존재 확인 (404 케이스) | N/A |
| M6 BE-controllers | `listArticlesCtrl.test.ts` 등 (req/res mock) | Supertest — controller end-to-end (HTTP→DB) | (E2E에서 간접) |
| M7 BE-services | `ArticleService.test.ts` 등 (repo mock) | Supertest — service through HTTP | (간접) |
| M8 BE-repositories | (Prisma client는 통합 테스트로 충분) | Supertest — repo through HTTP + 실제 SQLite | (간접) |
| M9 BE-validators | `validators.test.ts` — 함수 단위 | (해당 없음) | (간접) |
| M10 BE-error | `errorHandler.test.ts` — 미들웨어 단위 | Supertest — 의도적 throw 케이스 | (간접) |
| M11 BE-prisma | (schema 자체는 migrate 검증) | Supertest — cascade 통합 (R-F-07) | Playwright — 글 삭제 후 댓글 영역 빈 상태 |
| M12 Shared-types | `tsc --noEmit` (compile-time) | (해당 없음) | (간접) |

테스트 진입점 전체 카탈로그는 13 Test Design `02-catalog/` (단위·통합·E2E 별 묶음 + R-/F- fan-in)에서 확정.
