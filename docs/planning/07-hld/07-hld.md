---
doc_type: hld
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

# Conduit Lite — High-Level Design (HLD)

> NEW_PROJECT Gate C. ADR-0031로 신설 — 06 Architecture의 모듈 분해·데이터 흐름·비기능 대응을 본 HLD가 담는다. 본 §1 표는 08 Module Spec의 fan-out 원본이며, schema-level로 trace 강제.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 핵심 모듈 / 컴포넌트

| 모듈 | 책임 | 의존 | 08에서 상세 |
|---|---|---|---|
| FE-router | React Router 기반 path 라우팅 (`/`, `/article/:id`, `/editor`, `/editor/:id`, `/?tag=:name`) | FE-pages | 08 §M1 FE-router |
| FE-pages | 5개 페이지 컴포넌트 (Home / Article / Editor / NotFound) + 사이드바 노출 | FE-router · FE-api-client · FE-components | 08 §M2 FE-pages |
| FE-components | 재사용 UI primitives (ArticleCard / TagList / Pagination / CommentList / EditorForm) + Tailwind 토큰 매핑 | FE-api-client (간접) | 08 §M3 FE-components |
| FE-api-client | `/api/*` REST 호출 + 에러 정규화 + 응답 타입 (Prisma generated 또는 명시 type) | fetch (브라우저 native) | 08 §M4 FE-api-client |
| BE-router | Express 라우터 — `/api/articles`, `/api/articles/:id/comments`, `/api/tags` 마운트 | BE-controllers | 08 §M5 BE-router |
| BE-controllers | HTTP 입출력 책임 — req 파싱·검증 호출·service 호출·status code 매핑 | BE-services · BE-validators · BE-error | 08 §M6 BE-controllers |
| BE-services | 비즈니스 규칙 — 태그 정규화·페이지네이션·cascade·검증·트랜잭션 wrapper | BE-repositories · BE-validators | 08 §M7 BE-services |
| BE-repositories | Prisma client wrapper — DB 접근 일원화 + ON DELETE CASCADE 정합 | BE-prisma | 08 §M8 BE-repositories |
| BE-validators | 입력 검증 함수 — title/body/author/tagList trim·길이 제한·빈 값 (R-F-05) | (none) | 08 §M9 BE-validators |
| BE-error | 글로벌 에러 핸들러 — `{ error: string }` 응답 schema 통일, 스택 stderr only (R-N-02) | (none) | 08 §M10 BE-error |
| BE-prisma | Prisma client 인스턴스 + schema.prisma + migrations · seed | SQLite file | 08 §M11 BE-prisma |
| Shared-types | FE/BE 공유 TypeScript 타입 (DTO) — `Article` / `Comment` / `Tag` / 에러 응답 | (none) | 08 §M12 Shared-types |

## 2. 모듈 간 데이터 흐름

```
[사용자 브라우저]
   ↓ HTTP GET /
[FE-router] ─→ [FE-pages: Home]
                  ↓ useEffect
                [FE-api-client.listArticles(page, tag)]
                  ↓ fetch GET /api/articles
                [BE-router /api/articles]
                  ↓
                [BE-controllers.listArticles]
                  ↓ 검증
                [BE-validators.parseQuery]   (page, limit, tag 정규화)
                  ↓
                [BE-services.listArticles]   (페이지네이션 로직 + 태그 필터)
                  ↓
                [BE-repositories.findArticles]
                  ↓ Prisma client
                [SQLite: SELECT * FROM Article WHERE ...]
                  ↓ 결과
                [Shared-types: Article[] DTO 직렬화]
                  ↓ JSON 응답
                [FE-api-client] ─→ [FE-pages: Home] ─→ [FE-components: ArticleCard × N + Pagination]

쓰기 흐름 (글 작성):
[FE-pages: Editor] ─→ [FE-api-client.createArticle]
                          ↓ POST /api/articles
                       [BE-controllers.createArticle]
                          ↓ validators.validateArticleInput
                          ↓ services.createArticle (태그 정규화 + 트랜잭션)
                          ↓ repositories.insertArticle + repositories.upsertTags
                          ↓ Prisma transaction
                       [SQLite]
                          ↑ 응답 201 + article DTO
                       [FE-pages: Editor] ─→ navigate(/article/:id)

cascade 삭제:
[FE-pages: Article] ─→ [FE-api-client.deleteArticle(id)]
                          ↓ DELETE /api/articles/:id
                       [BE-controllers.deleteArticle]
                          ↓ services.deleteArticle (트랜잭션)
                          ↓ repositories.deleteArticle (ON DELETE CASCADE)
                       [SQLite — Article + Comment 동시 삭제]
                          ↑ 204
                       [FE-pages: Article] ─→ navigate(/)

에러 흐름 (모든 4xx/5xx):
[BE-controllers] throw or next(err)
   ↓
[BE-error 글로벌 핸들러]
   ↓ status + { error: string } 형식 (R-N-02)
[FE-api-client.normalizeError]
   ↓
[FE-pages — toast 또는 inline 에러 표시]
```

## 3. 비기능 대응

| 비기능 R-ID | 대응 전략 | 상세 |
|---|---|---|
| R-N-01 (응답 시간 < 200ms p95) | DB 인덱싱 + 페이지 limit 강제 | Article.createdAt DESC 인덱스, Tag.name 유니크 인덱스, ArticleTag(articleId,tagId) PK 인덱스. limit 기본 10·최대 50. 측정 — Supertest 통합 테스트에서 응답 시간 assert. |
| R-N-02 (에러 응답 schema) | BE-error 글로벌 핸들러 모듈 신설 | 모든 controller가 throw 또는 next(err)로 위임. 핸들러가 status + `{ error }` 직렬화. 5xx는 일반 메시지만 — 스택은 console.error로 stderr only. |
| R-N-03 (README 재현성) | LOCAL.md + 12-scaffolding §5 양축 정본 + AI 게이트 6번째 축 | 새 환경에서 `pnpm install` → `pnpm prisma:push:dev` → `pnpm seed:dev` → `pnpm dev`로 부팅. 10명 시도 KPI. |
| R-N-04 (3 profile 부팅) | `.env.{dev,stg,prod}.example` + profile별 SQLite 파일 + LOCAL.md §3 | dev=hot reload (`tsx watch`+Vite HMR), stg/prod=빌드 산출 (`vite preview` + `node dist/server.js`). 본 MVP는 stg=prod 공유 N/A 가능. 12-scaffolding §6·§7에서 확정. |
| R-N-05 (한국어 주석 ≥80%) | 핵심 모듈에 의도 주석 강제 + 11-coding-conventions §4 정책 | controllers/services/components/repositories 4개 디렉토리의 함수 헤더에 한국어 의도 주석. grep 측정 룰 — 12-scaffolding §3에서 명시. |
| R-N-06 (반응형 360~1440px) | Tailwind responsive breakpoint + 10-lld-screen-design §3 토큰 | `sm:`(640), `md:`(768), `lg:`(1024), `xl:`(1280). 360px는 sm 이하 처리. gstack `/qa` 4개 viewport 검증. |
| R-N-07 (시크릿·인증 안내) | README §보안 경고 + .gitignore + PreToolUse 훅 | `.env*` 모두 .gitignore. 본 MVP는 시크릿 미사용. settings.json PreToolUse 훅이 .env*·*.key·*.pem Write/Edit 차단 (CLAUDE.md 보안 #5). |

## 4. 외부 인터페이스 윤곽

본 MVP는 외부 시스템 의존 없음 (06 §3). 외부 인터페이스 = 사용자 브라우저 ↔ backend REST API.

- **HTTP API**: Base URL `/api`. JSON 응답. 09 API Spec에서 엔드포인트별 상세.
- **CORS**: dev only — `http://localhost:5173` (Vite) → `http://localhost:3000` (Express) 허용. stg/prod는 same-origin 가정으로 비활성.
- **Content-Type**: `application/json` 일관. multipart/form-data 미사용 (이미지 업로드 out-of-scope).
- **HTTP 상태**: 200 (조회·수정 성공) / 201 (생성) / 204 (삭제) / 400 (검증 실패) / 404 (없음) / 500 (서버 오류).
- **에러 응답 schema**: `{ error: string }` 통일 (R-N-02).
- **future-proofing**: Phase 2 세션 인증 추가 시 `/api/login`·`/api/logout` 라우트만 BE-router에 추가. 기존 라우트는 인증 미들웨어 도입으로 비파괴적 확장 가능 (Brief KPI #4 — Phase 2 코드 수정 면적 ≤ 20%).
