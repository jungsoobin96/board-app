---
doc_type: wbs
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-28
gate: operations
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12]
  supersedes: null
---

# Conduit Lite — WBS

> NEW_PROJECT Phase 3/4 운영 산출. 6 Sprint × 25 Issue 분해. 04 SRS R-F/R-N + 05 PRD F-XX 100% 매핑. §7은 `sprint-bootstrap.sh` 입력 YAML (ADR-0045 v1.1 — `{{WBS_URL}}` placeholder).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §8 Open Q O-25~O-29 ADR-0049 마커 (#25) |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-wbs Phase 3/4) |

## 0. 개요

본 WBS는 RFP §9 일정(M1~M6, 약 2주)을 6 Sprint로 분해한 결과다.

- **총 Sprint**: 6 (M1~M6과 1:1)
- **총 Issue**: 25 (스프린트당 3~5)
- **총 추정 Effort**: 26.5 working days (1인 학습자 1주기 ≈ 5working days/주 × 2주 + 버퍼 30%)
- **이슈 단위**: 1~3 working days, 평균 약 1.06d
- **branch 전략 (ADR-0044)**: 단일 trunk = main. 이슈-1-브랜치-1-PR. base는 항상 main. rebase 금지. squash merge 권장.
- **검증 게이트**: 매 PR `validate-doc.sh`(yq 설치 후)·`pnpm test`·gstack `/qa`(UI 변경 시)·3 profile 부팅 smoke·AI 게이트 6축.

## 1. 스프린트 일람

| Sprint | 기간 | 목표(Outcome) | 주요 R-ID/F-ID | 이슈 수 |
|---|---|---|---|---|
| Sprint 1 | M1 (3~4d) | 환경 세팅 + DB 스키마 + 글 API + 3 profile 부팅 | R-F-01·02·03·05·08·R-N-02·04, F-09·12 (간접) | 5 |
| Sprint 2 | M2 (2d) | 댓글 API + 태그 API + cascade·에러 schema 통합 회귀 | R-F-04·06·07, R-N-02 | 4 |
| Sprint 3 | M3 (3d) | FE 골격 + Home·Article 화면 + api-client | R-F-08, F-01·02·04·05·08·11 | 4 |
| Sprint 4 | M4 (3d) | FE 작성·수정·삭제 + 댓글 UI + NotFound | R-F-02·03·07, F-03·05·06·07 | 4 |
| Sprint 5 | M5 (2d) | 페이지네이션·태그 필터 마무리 + 응답 시간 + E2E 골든 패스 | R-N-01·06, F-02·08·11 | 4 |
| Sprint 6 | M6 (1d+) | README + 한국어 주석 ≥80% + 평가 기준 7개 통과 | R-N-03·05·07, F-09·10·12 | 4 |

## 2. 스프린트 상세

### Sprint 1 — 환경 세팅 + DB 스키마 + 글 API

**목표**: monorepo 부팅·Prisma schema 적용·글 CRUD API 동작·3 profile 부팅 smoke. M1 종료 시 `pnpm dev` → 글 작성 API curl로 가능.

##### Issue: monorepo 스캐폴딩 및 빌드·lint 골격

- **slug**: `feat-monorepo-scaffold`
- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-04 (부팅), R-N-07 (.gitignore)
- **F-ID 매핑**: F-09 (간접)
- **Acceptance Criteria**:
  - Given fresh checkout, When `pnpm install --frozen-lockfile`, Then 모든 워크스페이스 의존성 설치 완료 + `pnpm typecheck` PASS.
  - Given 본 이슈 PR, When CI 실행, Then `pnpm lint` + `pnpm typecheck` 모두 PASS.
- **Contract Before**: pnpm-workspace.yaml 미존재. 단일 package.json만 있음.
- **Contract After**: root package.json (workspaces: frontend·backend·shared·e2e) + pnpm-workspace.yaml + tsconfig.base.json + .eslintrc.cjs(또는 flat) + .prettierrc + .editorconfig + .gitignore (.env*·*.db·dist·coverage 포함).
- **DoD Checklist**:
  - [ ] pnpm-workspace.yaml + root package.json + tsconfig.base.json 작성
  - [ ] frontend·backend·shared 빈 워크스페이스 골격 (`src/index.ts` placeholder)
  - [ ] ESLint·Prettier·EditorConfig 설정
  - [ ] .gitignore에 .env*·*.db·dist·coverage 명시
  - [ ] `pnpm lint`·`pnpm typecheck` PASS
  - [ ] LOCAL.md §1 사전 요구사항 절 검증

##### Issue: backend 골격 + 에러 핸들러 + env validateEnv

- **slug**: `feat-backend-skeleton`
- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-02 (에러 schema), R-N-04 (env 분리)
- **F-ID 매핑**: F-12 (보안 안내 — 시크릿 미사용)
- **Acceptance Criteria**:
  - Given `pnpm --filter @app/backend dev`, When 부팅, Then `Listening on http://localhost:3000` 노출 + 5초 이내 ready.
  - Given 의도 throw, When 미들웨어 통과, Then 응답 body는 `{ error: string }` 형식이고 stack 미포함.
- **Contract Before**: backend 워크스페이스 빈 골격.
- **Contract After**: backend/src/server.ts·app.ts·env.ts·middleware/{error-handler,cors,request-logger}.ts·errors/{validation,not-found,repository}-error.ts + dotenv-cli 래핑 npm scripts.
- **DoD Checklist**:
  - [ ] server.ts 부팅 + ready 신호
  - [ ] 글로벌 errorHandler 미들웨어 + `{ error }` 직렬화 + 스택 stderr only
  - [ ] env.ts `validateEnv()`로 DATABASE_URL·PORT·NODE_ENV·LOG_LEVEL 검증
  - [ ] CORS middleware dev only (origin=http://localhost:5173)
  - [ ] dotenv-cli wrapping — `dotenv -e ../.env.{profile} -- tsx watch src/server.ts`
  - [ ] M10 단위 테스트 (errorHandler 미들웨어)

##### Issue: Prisma schema + migrations + dev DB push + seed

- **slug**: `feat-prisma-schema-and-seed`
- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-07 (cascade 강제 schema-level)
- **F-ID 매핑**: F-07 (cascade UX 후속)
- **Acceptance Criteria**:
  - Given fresh DB, When `pnpm --filter @app/backend prisma db push`, Then Article·Comment·Tag·ArticleTag 테이블 생성 + ON DELETE CASCADE 적용.
  - Given `pnpm seed:dev`, When 실행, Then 예시 글 5건·댓글 10건·태그 8종이 dev.db에 삽입.
- **Contract Before**: prisma 디렉토리 미존재.
- **Contract After**: backend/prisma/schema.prisma + migrations/ + seed.ts. dev.db는 자동 생성·.gitignore.
- **DoD Checklist**:
  - [ ] schema.prisma 모델 4종 (Article·Comment·Tag·ArticleTag) + 관계 + `onDelete: Cascade`
  - [ ] `prisma migrate dev --name init`으로 최초 migration 생성
  - [ ] seed.ts — 예시 글 5건·댓글 10건·태그 8종
  - [ ] Prisma client generate 자동화 (postinstall hook 또는 dev 스크립트)
  - [ ] dev DB 통합 테스트 1건 (insert + cascade 확인 단순)

##### Issue: 글 API 5종 + 입력 검증 + 통합 테스트

- **slug**: `feat-articles-api`
- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **R-ID 매핑**: R-F-01·R-F-02·R-F-03·R-F-05
- **F-ID 매핑**: F-01·F-03·F-04·F-06·F-07
- **Acceptance Criteria**:
  - Given 시드 글 5건, When GET `/api/articles?page=1&limit=10`, Then 200 + articles.length=5 + total=5.
  - Given title="hi"·body="world"·author="hana"·tagList="js, ts, js", When POST `/api/articles`, Then 201 + tags=["js","ts"] 정규화.
  - Given 미존재 id, When GET/PUT/DELETE `/api/articles/999`, Then 404 + `{ error: "글을 찾을 수 없습니다" }`.
  - Given title 빈 값, When POST, Then 400 + `{ error: "제목은 필수입니다" }`.
- **Contract Before**: backend 라우터·controller·service·repository·validator 미작성.
- **Contract After**: routes/articles.ts + controllers/articles.controller.ts + services/article.service.ts + repositories/article.repo.ts + validators/article.validator.ts + validators/query.validator.ts. ArticleService에 `withTransaction()` wrapper 포함.
- **DoD Checklist**:
  - [ ] 5 엔드포인트 모두 09 API Spec와 정합
  - [ ] M9 validators 단위 테스트 (title·body·author·tagList·query)
  - [ ] M7 services 단위 테스트 (normalizeTags·paginate)
  - [ ] Supertest 통합 — 9개 Acceptance 케이스 PASS
  - [ ] tag 정규화: trim·lower·중복 제거 검증
  - [ ] DELETE → ArticleTag·Comment cascade 통합 1건

##### Issue: 3 profile 부팅 smoke + LOCAL.md §3 검증

- **slug**: `chore-3profile-smoke`
- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-04
- **F-ID 매핑**: F-09 (LOCAL.md 정합)
- **Acceptance Criteria**:
  - Given `.env.{dev,stg,prod}.example` 3종, When `pnpm smoke:3profiles`, Then 각 profile 부팅 후 GET `/api/articles` 200 + 5초 이내 ready 신호.
  - Given fresh checkout, When LOCAL.md §3 절차 그대로, Then 3 profile 모두 부팅 성공.
- **Contract Before**: .env.example 단수만 있고 profile 분기 없음. smoke 스크립트 미존재.
- **Contract After**: .env.dev.example·.env.stg.example·.env.prod.example + scripts/smoke.ts (NODE_ENV별 부팅 + curl 검증) + package.json scripts.smoke:3profiles + LOCAL.md §3 갱신.
- **DoD Checklist**:
  - [ ] 3종 .env.example 생성 + 값 placeholder
  - [ ] scripts/smoke.ts (Node tsx로 부팅 + 5초 polling + curl)
  - [ ] 3 profile 모두 PASS
  - [ ] LOCAL.md §3 명령이 본 스크립트와 정합
  - [ ] LOCAL.md §4 부팅 자산 표 갱신
  - [ ] `pnpm smoke:3profiles` CI 추가 (선택)

### Sprint 2 — 댓글 API + 태그 API + cascade·에러 schema 통합 회귀

**목표**: 댓글 CRD + 태그 빈도 API + 통합 회귀(cascade·에러 schema). M2 종료 시 backend 모든 엔드포인트 동작.

##### Issue: 댓글 API (CRD, 수정 없음) + 통합 테스트

- **slug**: `feat-comments-api`
- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-06·R-F-05
- **F-ID 매핑**: F-05
- **Acceptance Criteria**:
  - Given 글 id=1, When POST `/api/articles/1/comments` body·author, Then 201 + 댓글 ID + 다음 GET에서 노출.
  - Given 댓글 cid=5, When DELETE `/api/articles/1/comments/5`, Then 204 + 다음 GET에서 미노출.
  - Given articleId 미존재, When 모든 댓글 API, Then 404.
  - Given 빈 body, When POST 댓글, Then 400 + `{ error: "본문은 필수입니다" }`.
- **Contract Before**: 댓글 라우터·controller·service·repository·validator 미작성.
- **Contract After**: routes/comments.ts + controllers/comments.controller.ts + services/comment.service.ts + repositories/comment.repo.ts + validators/comment.validator.ts.
- **DoD Checklist**:
  - [ ] 3 엔드포인트 (GET 목록·POST·DELETE)
  - [ ] 단위 — validateCommentInput
  - [ ] 통합 — Acceptance 4 케이스
  - [ ] 09 API Spec과 정합 (응답 schema·status)

##### Issue: 태그 API + 정렬·상한 + 통합 테스트

- **slug**: `feat-tags-api`
- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-04
- **F-ID 매핑**: F-02·F-08
- **Acceptance Criteria**:
  - Given 30종 태그 사용 시드, When GET `/api/tags`, Then 200 + 빈도 desc 상위 20개 (`{ name, count }`).
  - Given 태그 0건, When GET `/api/tags`, Then 200 + tags=[].
- **Contract Before**: 태그 라우터·service·repo 미작성.
- **Contract After**: routes/tags.ts + controllers/tags.controller.ts + services/tag.service.ts + repositories/tag.repo.ts.
- **DoD Checklist**:
  - [ ] 1 엔드포인트 (GET /api/tags)
  - [ ] 단위 — TagService.list (정렬·상한 20 로직)
  - [ ] 통합 — Acceptance 2 케이스 + DB 빈도 정합
  - [ ] R-F-04 시드 데이터에 30종 태그 명시

##### Issue: cascade 무결성 통합 테스트 (R-F-07 정식 회귀)

- **slug**: `test-cascade-integration`
- **유형**: test
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 0.5d
- **R-ID 매핑**: R-F-07
- **F-ID 매핑**: F-07
- **Acceptance Criteria**:
  - Given 글 id=1 + 댓글 3건 + ArticleTag 2건, When DELETE `/api/articles/1`, Then Comment 테이블 articleId=1 행 0건 + ArticleTag articleId=1 행 0건. Tag 자체는 보존.
  - Given 트랜잭션 의도 throw 주입, When 삭제, Then 글·댓글·ArticleTag 모두 보존 (rollback).
- **Contract Before**: cascade 통합 테스트 미존재.
- **Contract After**: backend/tests/integration/cascade.integration.test.ts (2 케이스). CI 매 PR 회귀.
- **DoD Checklist**:
  - [ ] 시드 데이터 (글·댓글·태그·매핑) 셋업 helper
  - [ ] DELETE 후 Comment·ArticleTag 0건 assert
  - [ ] rollback 시나리오 (force throw)
  - [ ] CI에 통합 테스트 job 포함

##### Issue: 에러 응답 schema 통일 통합 회귀 (R-N-02)

- **slug**: `test-error-schema-integration`
- **유형**: test
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 0.5d
- **R-ID 매핑**: R-N-02
- **F-ID 매핑**: F-12 (간접)
- **Acceptance Criteria**:
  - Given 전 엔드포인트의 4xx/5xx 케이스, When 응답, Then body는 `{ error: string }` 형식이고 body에 "stack"·"at " 라인 미포함.
  - Given 의도 throw, When 미들웨어 통과, Then 응답 status 500 + 일반 메시지 ("서버 오류가 발생했습니다") + stderr에는 stack 출력.
- **Contract Before**: 에러 schema 통합 회귀 미존재.
- **Contract After**: backend/tests/integration/error-schema.integration.test.ts (전 9 엔드포인트 × 4xx/5xx 케이스).
- **DoD Checklist**:
  - [ ] 9 엔드포인트 × 평균 2 에러 케이스 = ~18 assert
  - [ ] body schema 검증 + stack 미포함 검증
  - [ ] stderr 출력은 spy로 확인
  - [ ] CI 회귀 포함

### Sprint 3 — FE 골격 + Home·Article 화면 + api-client

**목표**: frontend 부팅·Vite + Tailwind + React Router·디자인 토큰 styles.css·api-client·Home·Article 페이지 동작. M3 종료 시 브라우저에서 시드 글 목록·상세 노출.

##### Issue: frontend 골격 + Vite + Tailwind + Router + 디자인 토큰

- **slug**: `feat-frontend-skeleton-and-tokens`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-08 (라우팅), R-N-06 (반응형)
- **F-ID 매핑**: F-11 (반응형 UI 기반)
- **Acceptance Criteria**:
  - Given `pnpm --filter @app/frontend dev`, When 부팅, Then Vite `Local: http://localhost:5173/` 노출 + 5초 이내 HMR ready.
  - Given Tailwind 클래스 `bg-primary-500`, When `<div>` 적용, Then 10 §3 토큰 색상 적용 (`#3b82f6`).
- **Contract Before**: frontend 빈 워크스페이스.
- **Contract After**: frontend/index.html + src/main.tsx + App.tsx + styles.css (Tailwind directives + CSS Variables 토큰) + tailwind.config.ts (theme.extend 토큰 인용) + postcss.config.js + router/routes.tsx (5 경로) + pages 4종 placeholder.
- **DoD Checklist**:
  - [ ] Vite + React Router 6 + Tailwind 3 + Pretendard 폰트
  - [ ] CSS Variables 10 §3 토큰 4종 모두 정의 (Color·Typography·Spacing·Component primitives via @apply)
  - [ ] tailwind.config.ts theme.extend에 토큰 인용
  - [ ] 5 경로 (/, /article/:id, /editor, /editor/:id, /?tag=:name) + NotFound
  - [ ] `pnpm typecheck` + `pnpm lint` PASS

##### Issue: api-client + shared types 연동 + 에러 정규화

- **slug**: `feat-frontend-api-client`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-02 (에러 정규화)
- **F-ID 매핑**: F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08
- **Acceptance Criteria**:
  - Given M4 apiClient.listArticles({page:1}), When 호출, Then GET /api/articles?page=1 fetch + Article[] 반환.
  - Given 서버 4xx 응답, When apiClient 받음, Then `NormalizedError { status, message }` throw.
  - Given offline (network error), When fetch fail, Then `{ status: 0, message: "네트워크 오류" }` throw.
- **Contract Before**: api-client 미작성. shared types 미정의.
- **Contract After**: frontend/src/api/client.ts + normalizeError.ts + shared/src/{article,comment,tag,api-error}.ts + shared index.ts.
- **DoD Checklist**:
  - [ ] 9 엔드포인트 wrap (listArticles·getArticle·createArticle·updateArticle·deleteArticle·listComments·createComment·deleteComment·listTags)
  - [ ] shared DTO 4종 (Article·Comment·Tag·ApiError·ListResult)
  - [ ] frontend·backend 양쪽이 shared import (peer dependency)
  - [ ] api-client 단위 테스트 (fetch mock)
  - [ ] normalizeError 단위 테스트

##### Issue: Home 페이지 (글 목록 + 사이드바 + 페이지네이션)

- **slug**: `feat-home-page`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **R-ID 매핑**: R-F-01·R-F-04·R-N-06
- **F-ID 매핑**: F-01·F-02·F-08·F-11
- **Acceptance Criteria**:
  - Given `/` 진입, When 페이지 로드, Then 글 카드 10개 + 페이지네이션 + 사이드바 인기 태그 노출.
  - Given "다음" 버튼 클릭, When 클릭, Then URL `?page=2` + 11~20번째 글 노출.
  - Given 태그 클릭, When 사이드바 "javascript" 클릭, Then `/?tag=javascript` 이동 + 필터링 결과.
  - Given 빈 결과, When `?tag=ghost`, Then "결과 없음" 안내.
- **Contract Before**: Home 페이지 placeholder만 있음.
- **Contract After**: frontend/src/pages/Home.tsx + components/{ArticleCard,Pagination,TagList,Layout}.tsx + hooks/useArticles.ts.
- **DoD Checklist**:
  - [ ] Home에서 useEffect로 listArticles + listTags 병렬 호출
  - [ ] URLSearchParams가 source-of-truth (page·tag)
  - [ ] AbortController로 페이지 빠른 클릭 시 이전 요청 취소
  - [ ] 768px 미만 사이드바 stack (gstack `/qa` 확인)
  - [ ] React Testing Library 단위 — ArticleCard·Pagination·TagList snapshot
  - [ ] MSW로 통합 테스트 1건

##### Issue: Article 상세 페이지 + 댓글 목록 표시

- **slug**: `feat-article-page-and-comments-list`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **R-ID 매핑**: R-F-03·R-F-06·R-F-08
- **F-ID 매핑**: F-04·F-05 (목록만)
- **Acceptance Criteria**:
  - Given 글 id=1 존재, When `/article/1` 진입, Then 본문·작성자·작성일·태그·댓글 목록 + (수정/삭제 버튼) 노출.
  - Given 미존재 id, When `/article/999`, Then S-05 NotFound 페이지.
- **Contract Before**: Article 페이지 placeholder.
- **Contract After**: frontend/src/pages/Article.tsx + components/CommentList.tsx + pages/NotFound.tsx.
- **DoD Checklist**:
  - [ ] getArticle + listComments 병렬 호출
  - [ ] 404 → navigate('/not-found') 또는 NotFound 컴포넌트 inline
  - [ ] 댓글 목록 표시 (작성·삭제는 다음 이슈)
  - [ ] 수정/삭제 버튼 mount (핸들러는 다음 이슈)
  - [ ] React Testing Library 단위 — Article·CommentList·NotFound
  - [ ] gstack `/qa` 스크린샷 1장

### Sprint 4 — FE 작성·수정·삭제 + 댓글 UI + NotFound

**목표**: Editor 페이지·글 삭제 UX·댓글 작성·삭제·NotFound. M4 종료 시 글 작성→수정→삭제→cascade 시각 확인 가능.

##### Issue: Editor 페이지 (글 작성·수정 — F-03·F-06)

- **slug**: `feat-editor-page`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **R-ID 매핑**: R-F-02·R-F-05·R-F-08
- **F-ID 매핑**: F-03·F-06·F-11
- **Acceptance Criteria**:
  - Given `/editor` 진입, When 4 필드 입력 + "발행", Then POST `/api/articles` + 성공 시 `/article/:id` navigate.
  - Given `/editor/:id` 진입, When 페이지 로드, Then 기존 값 사전 로드 + "저장" 버튼 라벨.
  - Given title 빈 값, When "발행", Then 인라인 에러 + 입력값 보존.
- **Contract Before**: Editor 페이지 placeholder.
- **Contract After**: frontend/src/pages/Editor.tsx + components/EditorForm.tsx.
- **DoD Checklist**:
  - [ ] EditorForm controlled component (title·body·author·tagList state)
  - [ ] /editor/:id 사전 로드 (getArticle + setForm)
  - [ ] 인라인 검증 메시지 (M9 validator와 동일 룰)
  - [ ] submit 실패 시 입력값 보존
  - [ ] React Testing Library 단위 — EditorForm
  - [ ] gstack `/qa` — 작성·수정 골든 패스 스크린샷

##### Issue: 글 삭제 UX + cascade 시각 확인 (F-07)

- **slug**: `feat-article-delete-ux`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-03·R-F-07
- **F-ID 매핑**: F-07
- **Acceptance Criteria**:
  - Given Article 상세, When "삭제" → 확인 모달 → DELETE, Then 응답 204 + 홈 navigate + 목록 미노출.
  - Given 직접 URL `/article/<삭제된 id>`, When 재진입, Then 404 → NotFound.
- **Contract Before**: 삭제 핸들러 미연결.
- **Contract After**: Article.tsx의 deleteHandler + Modal 컴포넌트 (confirm).
- **DoD Checklist**:
  - [ ] confirm Modal 컴포넌트 (재사용 가능)
  - [ ] DELETE 호출 → 성공 시 navigate('/')
  - [ ] 실패 시 에러 토스트
  - [ ] gstack `/qa` — 삭제 후 댓글 영역 빈 상태 확인 (cascade 시각)

##### Issue: 댓글 작성·삭제 UI (F-05)

- **slug**: `feat-comment-create-delete-ui`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-06·R-F-05
- **F-ID 매핑**: F-05
- **Acceptance Criteria**:
  - Given Article 페이지, When 댓글 폼 입력 + "작성", Then POST `/api/articles/:id/comments` + 댓글 영역 즉시 추가.
  - Given 본인 댓글, When "삭제" 클릭, Then DELETE + 응답 204 + 영역 미노출.
  - Given 빈 body, When "작성", Then 400 + 인라인 에러.
- **Contract Before**: 댓글 작성·삭제 핸들러 미연결.
- **Contract After**: Article.tsx에 CommentForm 마운트 + commentCreateHandler/commentDeleteHandler.
- **DoD Checklist**:
  - [ ] CommentForm controlled component
  - [ ] optimistic update 또는 응답 후 갱신 (둘 중 1택, 명시)
  - [ ] 본인 댓글 "삭제" 버튼 노출 (MVP는 모든 댓글 — 인증 없음)
  - [ ] React Testing Library 단위 — CommentList·CommentForm
  - [ ] gstack `/qa` — 댓글 작성·삭제 시나리오 스크린샷

##### Issue: NotFound 화면 + ErrorBoundary (F-04 간접·R-N-02 인라인)

- **slug**: `feat-notfound-and-error-boundary`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-08·R-N-02
- **F-ID 매핑**: F-04 (간접)
- **Acceptance Criteria**:
  - Given 미일치 경로 또는 미존재 article id, When 진입, Then S-05 NotFound 페이지 + "홈으로" 버튼.
  - Given API 5xx 응답, When apiClient 받음, Then ErrorBoundary가 catch + 일반 에러 메시지 토스트 (스택 미노출).
- **Contract Before**: NotFound·ErrorBoundary 미작성.
- **Contract After**: frontend/src/pages/NotFound.tsx + components/ErrorBoundary.tsx + components/Toast.tsx (옵션).
- **DoD Checklist**:
  - [ ] NotFound 페이지 + Layout 재사용
  - [ ] ErrorBoundary class component (React 16+ 패턴)
  - [ ] Toast 컴포넌트 (success/error variant, 3초 자동 dismiss)
  - [ ] Unit — NotFound·ErrorBoundary
  - [ ] gstack `/qa` — `/article/999` 진입 시 NotFound 확인

### Sprint 5 — 페이지네이션·태그 필터 마무리 + 응답 시간 + E2E 골든 패스

**목표**: UX 마무리·반응형 회귀·응답 시간 측정·E2E 자동화. M5 종료 시 골든 패스 자동화 + 평가 기준 7개 진입 가능.

##### Issue: 태그 필터 UX 마무리 + URL state 동기

- **slug**: `feat-tag-filter-ux-polish`
- **유형**: feature
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-04·R-F-01
- **F-ID 매핑**: F-02·F-08
- **Acceptance Criteria**:
  - Given Home에서 `?tag=javascript`, When 사이드바 노출, Then "javascript" 칩이 active 상태로 시각 표시.
  - Given 태그 active 상태에서 동일 태그 다시 클릭, When 클릭, Then `?tag` 쿼리 제거 (필터 해제).
  - Given 페이지 + 태그 동시 적용, When URL `?tag=js&page=2`, Then 둘 다 적용된 결과.
- **Contract Before**: 태그 클릭 시 단방향 라우팅만 동작 (active 상태 시각 없음).
- **Contract After**: TagList active state + URL bidirectional sync.
- **DoD Checklist**:
  - [ ] active 태그 시각 표시 (10 §3 TagChip clickable variant active)
  - [ ] 같은 태그 재클릭 시 해제
  - [ ] page + tag 동시 적용 정상
  - [ ] React Testing Library 단위

##### Issue: 반응형 회귀 + 디자인 토큰 회귀 (R-N-06·F-11)

- **slug**: `test-responsive-and-token-regression`
- **유형**: test
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-06
- **F-ID 매핑**: F-11
- **Acceptance Criteria**:
  - Given 360/768/1024/1440px viewport, When 5 페이지 진입, Then 레이아웃 정상 + 가로 스크롤 없음.
  - Given Tailwind 빌드, When 토큰 변경 (예: --color-primary-500), Then 빌드 산출에 반영 + snapshot diff 감지.
- **Contract Before**: 반응형 검증·토큰 회귀 테스트 미존재.
- **Contract After**: e2e/specs/responsive.spec.ts (Playwright viewport) + frontend/src/components/__snapshots__/.
- **DoD Checklist**:
  - [ ] Playwright viewport 4종 × 5 페이지 진입 시나리오
  - [ ] gstack `/qa`로도 수동 1회
  - [ ] 컴포넌트 snapshot 5종 (ArticleCard·Pagination·TagList·EditorForm·Layout)
  - [ ] 스크린샷 `docs/features/responsive/screenshots/`

##### Issue: 응답 시간 측정 통합 (R-N-01 p95 < 200ms)

- **slug**: `test-response-time-p95`
- **유형**: test
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 0.5d
- **R-ID 매핑**: R-N-01
- **F-ID 매핑**: F-01 (간접)
- **Acceptance Criteria**:
  - Given 100건 글 시드, When GET `/api/articles?page=1&limit=10` 100회, Then p95 < 200ms.
  - Given 4 시나리오(목록·태그필터·상세·댓글 목록), When 각 100회 측정, Then 모두 p95 < 200ms (WARN if 초과).
- **Contract Before**: 응답 시간 측정 미존재.
- **Contract After**: backend/tests/integration/perf.integration.test.ts + scripts/measure.ts (선택).
- **DoD Checklist**:
  - [ ] performance.now() wrapper
  - [ ] 4 시나리오 × 100회 측정 + p95 계산
  - [ ] WARN(BLOCK 아님) — 초과 시 로그
  - [ ] 결과 출력 형식 통일 (JSON 또는 표)

##### Issue: E2E 골든 패스 (Playwright 핵심 5건 + gstack `/qa`)

- **slug**: `test-e2e-golden-path`
- **유형**: test
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-F-01·R-F-02·R-F-03·R-F-07·R-F-04
- **F-ID 매핑**: F-01·F-02·F-03·F-04·F-07
- **Acceptance Criteria**:
  - Given Playwright 설치, When `pnpm --filter @app/e2e test`, Then 5 시나리오 (글 작성·상세·댓글·삭제 cascade·태그 필터) PASS.
  - Given gstack `/qa`, When 골든 패스 1회, Then 콘솔 에러 0건 + 스크린샷 5장.
- **Contract Before**: e2e 워크스페이스 빈 골격.
- **Contract After**: e2e/playwright.config.ts + specs/{article-create,article-detail-comment,article-delete-cascade,tag-filter,golden-path}.spec.ts.
- **DoD Checklist**:
  - [ ] Playwright 설치 (한 번만 학습 비용)
  - [ ] 5 시나리오 spec
  - [ ] global-setup으로 시드 자동 적용
  - [ ] gstack `/qa` 수동 보완 — 1회 골든 패스 스크린샷
  - [ ] CI에 e2e job 포함 (선택, 학습 부담 크면 manual)

### Sprint 6 — README + 한국어 주석 ≥80% + 평가 기준 7개

**목표**: 학습 친화 마무리. README·주석 보강·평가 기준 7개 검증. M6 종료 시 본 MVP 완료 + Phase 2 진입 가능.

##### Issue: README 작성 (설치/실행/폴더/평가 기준 — F-09·F-12)

- **slug**: `docs-readme-write`
- **유형**: docs
- **영역**: docs
- **우선순위**: P0
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-03·R-N-04·R-N-07
- **F-ID 매핑**: F-09·F-12
- **Acceptance Criteria**:
  - Given 새 PC + Node.js 20 LTS, When README §설치·§실행 그대로 절차, Then dev 서버 부팅 + 시드 글 노출.
  - Given README §보안 절, When 사용자 읽음, Then "공개 데모용, 운영 사용 금지" 한국어/영문 병기 경고.
  - Given README §평가 기준, When RFP §10 7개 항목, Then 1:1 매핑 표 + 통과 방법 명시.
- **Contract Before**: README.md 미작성 또는 placeholder.
- **Contract After**: README.md (§개요·§기술 스택·§폴더 구조·§설치·§실행 3 profile·§평가 기준·§보안·§학습 가이드·§Phase 2 로드맵).
- **DoD Checklist**:
  - [ ] LOCAL.md와 정합 (cross-reference)
  - [ ] 평가 기준 7개 × 매핑 표
  - [ ] §보안 경고 한국어/영문 병기 (O-18 해소)
  - [ ] 학습 가이드 — 기본 흐름 → 고도화 단계
  - [ ] yq 설치 권고 명시 (RISK-06)
  - [ ] 최소 1명 시도 → 절차대로 부팅 성공 (KPI 1차)

##### Issue: 한국어 주석 보강 + 측정 스크립트 (F-10·R-N-05)

- **slug**: `docs-korean-comments-coverage`
- **유형**: docs
- **영역**: docs
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: R-N-05
- **F-ID 매핑**: F-10
- **Acceptance Criteria**:
  - Given 핵심 4 디렉토리(controllers·services·components·repositories), When `scripts/check-comment-coverage.sh` 실행, Then 한국어 주석 비율 ≥ 80%.
  - Given 누락 함수, When 스크립트 출력, Then 누락 목록 + 보강 후 재실행 PASS.
- **Contract Before**: 주석 측정 스크립트 미존재.
- **Contract After**: scripts/check-comment-coverage.sh + 핵심 모듈 함수 헤더 JSDoc + 한국어 첫 줄 보강.
- **DoD Checklist**:
  - [ ] check-comment-coverage.sh (grep 룰)
  - [ ] 4 디렉토리 함수 헤더 ≥ 80% 한국어 주석
  - [ ] CI에 lint job으로 포함 (선택)
  - [ ] 측정 결과 로그 PR body에 첨부

##### Issue: 최종 골든 패스 + 평가 기준 7개 검증 (R-N-03·UC-06)

- **slug**: `test-final-golden-path-and-eval-criteria`
- **유형**: test
- **영역**: docs
- **우선순위**: P0
- **Estimated Effort**: 0.5d
- **R-ID 매핑**: R-N-03·R-N-04
- **F-ID 매핑**: F-09
- **Acceptance Criteria**:
  - Given 새 PC + README, When UC-06 절차 그대로, Then dev 서버 부팅 + 시드 글 노출.
  - Given 평가 기준 RFP §10 7개 항목, When 수동 또는 자동 검증, Then 7/7 PASS.
  - Given 시도자 3명, When 절차 따름, Then 3/3 성공 (KPI 1차 완화 — RISK-07 ADR로).
- **Contract Before**: 평가 기준 검증 미수행.
- **Contract After**: docs/features/golden-path/screenshots/ + 시도 결과 기록 (간단 markdown).
- **DoD Checklist**:
  - [ ] UC-06 시도 1회 (저자 본인) + 1~2명 외부 시도
  - [ ] 평가 기준 7개 매핑 표 PR body
  - [ ] gstack `/qa` 최종 골든 패스
  - [ ] Phase 2 로드맵 README §향후 확장 절 명시

##### Issue: 잔여 버그 수정 + Open Questions 해소

- **slug**: `bug-residual-and-open-questions-resolve`
- **유형**: bug
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **R-ID 매핑**: (이슈 발견 시점에 결정 — 본 이슈는 잔여 buffer)
- **F-ID 매핑**: F-09 (간접 — docs Open Q 해소)
- **Acceptance Criteria**:
  - Given 01~13 산출의 Open Questions 24건, When 본 이슈 진행, Then 미결정 항목을 ADR 또는 산출 보강으로 해소.
  - Given 잔여 버그, When 발견, Then 수정 후 PR + 회귀 테스트.
- **Contract Before**: Open Q O-01~O-24 일부 미결정.
- **Contract After**: Open Q 모두 (a) 해소 + 산출 갱신 또는 (b) Phase 2+ 후보로 명시.
- **DoD Checklist**:
  - [ ] Open Q 24건 점검 (01~13 산출)
  - [ ] ADR 신설 또는 산출 v0.2로 갱신
  - [ ] 회귀 테스트 PASS (02-catalog 전수)
  - [ ] gstack `/qa` 최종 1회

## 3. 의존성 그래프

```
[Sprint 1]
  monorepo-scaffold ────▶ backend-skeleton ──▶ prisma-schema-and-seed ──▶ articles-api ──▶ 3profile-smoke
                                                                              │
[Sprint 2]                                                                    ▼
                              comments-api ──┬──▶ cascade-integration ◀──────┘
                              tags-api ──────┘            │
                              error-schema-integration ◀──┘

[Sprint 3]
  frontend-skeleton-and-tokens ──▶ frontend-api-client ─┬──▶ home-page
                                                        └──▶ article-page-and-comments-list

[Sprint 4]
  editor-page ◀── (article-page 의존)
  article-delete-ux ◀── (article-page 의존)
  comment-create-delete-ui ◀── (article-page 의존)
  notfound-and-error-boundary ◀── (frontend-skeleton 의존)

[Sprint 5]
  tag-filter-ux-polish ◀── (home-page 의존)
  responsive-and-token-regression ◀── (전 Sprint 4 완료 의존)
  response-time-p95 ◀── (Sprint 2 완료 의존)
  e2e-golden-path ◀── (Sprint 4 완료 의존)

[Sprint 6]
  readme-write ◀── (전 Sprint 5 완료 의존)
  korean-comments-coverage ◀── (Sprint 5 완료 의존)
  final-golden-path-and-eval-criteria ◀── (readme-write·korean-comments-coverage 의존)
  residual-and-open-questions-resolve ◀── (전 Sprint 5 완료 의존, Sprint 6 마지막)
```

DAG 순환 없음. 모든 의존성은 좌→우 흐름.

## 4. 추적성 매트릭스

본 표는 04 SRS R-ID + 05 PRD F-ID가 어느 Sprint·Issue에 매핑되는지 100% 커버 검증.

| R-ID | F-ID | Sprint | Issue Slug |
|---|---|---|---|
| R-F-01 | F-01 | Sprint 1 | feat-articles-api |
| R-F-01 | F-01 | Sprint 3 | feat-home-page |
| R-F-02 | F-03 | Sprint 1 | feat-articles-api |
| R-F-02 | F-06 | Sprint 4 | feat-editor-page |
| R-F-03 | F-04 | Sprint 1 | feat-articles-api |
| R-F-03 | F-04 | Sprint 3 | feat-article-page-and-comments-list |
| R-F-03 | F-07 | Sprint 4 | feat-article-delete-ux |
| R-F-04 | F-02 | Sprint 2 | feat-tags-api |
| R-F-04 | F-08 | Sprint 5 | feat-tag-filter-ux-polish |
| R-F-05 | F-03·F-05·F-06 | Sprint 1 | feat-articles-api |
| R-F-05 | F-03·F-05·F-06 | Sprint 4 | feat-editor-page |
| R-F-06 | F-05 | Sprint 2 | feat-comments-api |
| R-F-06 | F-05 | Sprint 4 | feat-comment-create-delete-ui |
| R-F-07 | F-07 | Sprint 1 | feat-prisma-schema-and-seed |
| R-F-07 | F-07 | Sprint 2 | test-cascade-integration |
| R-F-07 | F-07 | Sprint 4 | feat-article-delete-ux |
| R-F-08 | F-01·F-04 | Sprint 3 | feat-frontend-skeleton-and-tokens |
| R-N-01 | F-01 | Sprint 5 | test-response-time-p95 |
| R-N-02 | F-12 | Sprint 1 | feat-backend-skeleton |
| R-N-02 | F-12 | Sprint 2 | test-error-schema-integration |
| R-N-02 | F-12 | Sprint 4 | feat-notfound-and-error-boundary |
| R-N-03 | F-09 | Sprint 6 | docs-readme-write |
| R-N-03 | F-09 | Sprint 6 | test-final-golden-path-and-eval-criteria |
| R-N-04 | F-09 | Sprint 1 | chore-3profile-smoke |
| R-N-04 | F-09 | Sprint 6 | test-final-golden-path-and-eval-criteria |
| R-N-05 | F-10 | Sprint 6 | docs-korean-comments-coverage |
| R-N-06 | F-11 | Sprint 3 | feat-frontend-skeleton-and-tokens |
| R-N-06 | F-11 | Sprint 5 | test-responsive-and-token-regression |
| R-N-07 | F-12 | Sprint 1 | feat-backend-skeleton |
| R-N-07 | F-12 | Sprint 6 | docs-readme-write |

매핑 커버리지: R-F-01~08 (8/8) + R-N-01~07 (7/7) = 15/15 R-ID + F-01~12 (12/12) = **100%**.

## 5. 리스크 매핑

| 15-risk Risk-ID | 영향 받는 Sprint/Issue | 대응 이슈 |
|---|---|---|
| RISK-01 (인증 없음) | Sprint 6 / docs-readme-write | docs-readme-write (README §보안) |
| RISK-02 (SQLite 동시 락) | Sprint 1 / chore-3profile-smoke | chore-3profile-smoke (LOCAL.md §1.5 안내) |
| RISK-03 (tagList 검증) | Sprint 1·4 / feat-articles-api·feat-editor-page | feat-articles-api (M9 validator) |
| RISK-04 (cascade 누락) | Sprint 1·2·4 / 3 이슈 | test-cascade-integration (정식 회귀) |
| RISK-05 (스택 자유도) | (해소) | — |
| RISK-06 (yq 미설치) | Sprint 1~6 전 검증 | docs-readme-write (README yq 권고) |
| RISK-07 (README 재현 KPI) | Sprint 6 / test-final-golden-path | test-final-golden-path-and-eval-criteria |
| RISK-08 (Playwright vs gstack) | Sprint 5 / test-e2e-golden-path | test-e2e-golden-path (절충안) |
| RISK-09 (monorepo cwd 함정) | Sprint 1 / feat-backend-skeleton·chore-3profile-smoke | feat-backend-skeleton (dotenv-cli 래핑) |
| RISK-10 (학습 친화 vs 모범) | Sprint 1~5 / 전 코드 작성 | docs-korean-comments-coverage (의도 설명) |
| RISK-11 (응답 시간 환경 차이) | Sprint 5 / test-response-time-p95 | test-response-time-p95 (측정 룰 통일) |
| RISK-12 (한국어 주석 측정) | Sprint 6 / docs-korean-comments-coverage | docs-korean-comments-coverage (스크립트 작성) |

## 6. 일정

| Sprint | 시작 | 종료 | Working Days | 이슈 누계 |
|---|---|---|---|---|
| Sprint 1 | 2026-05-23 | 2026-05-28 | 6d (week 1 mon~fri + sat) | 5 |
| Sprint 2 | 2026-05-29 | 2026-05-30 | 2d | 9 |
| Sprint 3 | 2026-06-01 | 2026-06-03 | 3d | 13 |
| Sprint 4 | 2026-06-04 | 2026-06-08 | 3d (mid week) | 17 |
| Sprint 5 | 2026-06-09 | 2026-06-10 | 2d | 21 |
| Sprint 6 | 2026-06-11 | 2026-06-12 | 2d (실 1d + 1d 버퍼) | 25 |
| **총** | 2026-05-23 | 2026-06-12 | **약 18 working days (≒ 2주 + 30% 버퍼)** | 25 |

> 본 일정은 *학습자 1인 1주기* 기준. 부트캠프 강의 일정에 맞춰 압축 또는 분산 가능.

## 7. sprint-bootstrap 입력

본 §은 `scripts/sprint-bootstrap.sh`가 GitHub Milestones + Issues를 일괄 등록하기 위한 입력 YAML. `{{WBS_URL}}` placeholder는 등록 직전에 `gh repo view`로 절대 URL 추출·치환 (ADR-0045 v1.1).

```yaml
project:
  name: board-app
  repo: <org>/<repo>           # 실 repo로 치환
  default_branch: main
  branch_strategy: ADR-0044    # 단일 trunk + 이슈-1-브랜치-1-PR
  squash_merge: true

sprints:
  - milestone: "Sprint 1 — 환경 세팅 + 글 API"
    due: "2026-05-28"
    description: "monorepo·Prisma·글 CRUD API·3 profile 부팅. M1 종료 시 backend 글 API 동작."
    issues:
      - title: "chore(infra): monorepo 스캐폴딩 및 빌드·lint 골격"
        slug: "feat-monorepo-scaffold"
        labels: ["status:todo", "type:chore", "area:infra", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-04, R-N-07
          F-ID: F-09 (간접)

          ## 유형 / 영역 / 우선순위

          - 유형: chore
          - 영역: infra
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given fresh checkout, When `pnpm install --frozen-lockfile`, Then 모든 워크스페이스 의존성 설치 + `pnpm typecheck` PASS.
          - Given 본 이슈 PR, When CI 실행, Then `pnpm lint` + `pnpm typecheck` 모두 PASS.

          ## Contract

          변경 전: pnpm-workspace.yaml 미존재. 단일 package.json만 있음.
          변경 후: root package.json (workspaces: frontend·backend·shared·e2e) + pnpm-workspace.yaml + tsconfig.base.json + .eslintrc + .prettierrc + .editorconfig + .gitignore.

          ## DoD Checklist

          - [ ] pnpm-workspace.yaml + root package.json + tsconfig.base.json 작성
          - [ ] 4 워크스페이스 빈 골격 (`src/index.ts` placeholder)
          - [ ] ESLint·Prettier·EditorConfig 설정
          - [ ] .gitignore에 .env*·*.db·dist·coverage 명시
          - [ ] `pnpm lint`·`pnpm typecheck` PASS

          ## 테스트 시나리오

          - 단위: N/A (인프라 chore)
          - 통합: N/A
          - E2E: N/A

          ## 의존성

          Blocked-by: (없음 — 첫 이슈)
          Blocks: feat-backend-skeleton, feat-frontend-skeleton-and-tokens

          ---
          상세: {{WBS_URL}}#sprint-1
      - title: "feat(backend): backend 골격 + 에러 핸들러 + env validateEnv"
        slug: "feat-backend-skeleton"
        labels: ["status:todo", "type:feature", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-02, R-N-04
          F-ID: F-12

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given `pnpm --filter @app/backend dev`, When 부팅, Then `Listening on http://localhost:3000` 5초 이내 ready.
          - Given 의도 throw, When 미들웨어 통과, Then `{ error: string }` 형식 + stack 미포함.

          ## Contract

          변경 전: backend 워크스페이스 빈 골격.
          변경 후: backend/src/{server,app,env}.ts + middleware/{error-handler,cors,request-logger}.ts + errors/{validation,not-found,repository}-error.ts + dotenv-cli 래핑 npm scripts.

          ## DoD Checklist

          - [ ] server.ts 부팅 + ready 신호
          - [ ] errorHandler 미들웨어 + `{ error }` 직렬화 + stderr 스택
          - [ ] env.ts validateEnv() (DATABASE_URL·PORT·NODE_ENV·LOG_LEVEL)
          - [ ] CORS dev only
          - [ ] dotenv-cli wrapping
          - [ ] M10 단위 테스트

          ## 테스트 시나리오

          - 단위: errorHandler 미들웨어
          - 통합: N/A
          - E2E: N/A

          ## 의존성

          Blocked-by: feat-monorepo-scaffold
          Blocks: feat-prisma-schema-and-seed, feat-articles-api

          ---
          상세: {{WBS_URL}}#sprint-1
      - title: "feat(backend): Prisma schema + migrations + seed"
        slug: "feat-prisma-schema-and-seed"
        labels: ["status:todo", "type:feature", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-07
          F-ID: F-07

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given fresh DB, When `pnpm --filter @app/backend prisma db push`, Then Article·Comment·Tag·ArticleTag 테이블 + ON DELETE CASCADE 적용.
          - Given `pnpm seed:dev`, When 실행, Then 글 5·댓글 10·태그 8 삽입.

          ## Contract

          변경 전: prisma 디렉토리 미존재.
          변경 후: backend/prisma/{schema.prisma, migrations/, seed.ts}. dev.db는 자동 생성·.gitignore.

          ## DoD Checklist

          - [ ] schema.prisma 모델 4종 + onDelete: Cascade
          - [ ] migrate dev --name init
          - [ ] seed.ts (글 5·댓글 10·태그 8)
          - [ ] Prisma client generate 자동
          - [ ] cascade 단순 통합 1건

          ## 테스트 시나리오

          - 단위: N/A (Prisma 추상 layer)
          - 통합: cascade 1건
          - E2E: N/A

          ## 의존성

          Blocked-by: feat-backend-skeleton
          Blocks: feat-articles-api, test-cascade-integration

          ---
          상세: {{WBS_URL}}#sprint-1
      - title: "feat(backend): 글 API 5종 + 입력 검증 + 통합 테스트"
        slug: "feat-articles-api"
        labels: ["status:todo", "type:feature", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-01, R-F-02, R-F-03, R-F-05
          F-ID: F-01, F-03, F-04, F-06, F-07

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 2d

          ## Acceptance Criteria

          - Given 시드 글 5건, When GET `/api/articles?page=1&limit=10`, Then 200 + articles.length=5.
          - Given title·body·author·tagList="js, ts, js", When POST `/api/articles`, Then 201 + tags=["js","ts"].
          - Given 미존재 id, When GET/PUT/DELETE `/api/articles/999`, Then 404.
          - Given title 빈 값, When POST, Then 400 + `{ error: "제목은 필수입니다" }`.

          ## Contract

          변경 전: 글 라우터·controller·service·repo·validator 미작성.
          변경 후: routes/articles.ts + controllers/articles.controller.ts + services/article.service.ts (+ withTransaction) + repositories/article.repo.ts + validators/{article,query}.validator.ts.

          ## DoD Checklist

          - [ ] 5 엔드포인트 (list/get/create/update/delete) 09 API와 정합
          - [ ] M9 validator 단위
          - [ ] M7 service 단위 (normalizeTags·paginate)
          - [ ] Supertest 통합 9 Acceptance
          - [ ] tag 정규화 (trim·lower·중복 제거)
          - [ ] DELETE cascade 통합 1건

          ## 테스트 시나리오

          - 단위: validators·services
          - 통합: 5 엔드포인트 × happy/failure
          - E2E: Sprint 3·4의 FE 페이지에서 간접 검증

          ## 의존성

          Blocked-by: feat-prisma-schema-and-seed, feat-backend-skeleton
          Blocks: feat-comments-api, feat-tags-api, feat-home-page

          ---
          상세: {{WBS_URL}}#sprint-1
      - title: "chore(infra): 3 profile 부팅 smoke + LOCAL.md §3 검증"
        slug: "chore-3profile-smoke"
        labels: ["status:todo", "type:chore", "area:infra", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-04
          F-ID: F-09

          ## 유형 / 영역 / 우선순위

          - 유형: chore
          - 영역: infra
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given `.env.{dev,stg,prod}.example`, When `pnpm smoke:3profiles`, Then 각 profile 부팅 후 GET `/api/articles` 200 + 5초 이내 ready.
          - Given fresh checkout, When LOCAL.md §3 절차, Then 3 profile 모두 부팅 성공.

          ## Contract

          변경 전: .env.example 단수 + smoke 스크립트 미존재.
          변경 후: .env.dev.example·.env.stg.example·.env.prod.example + scripts/smoke.ts + package.json scripts.smoke:3profiles + LOCAL.md §3 갱신.

          ## DoD Checklist

          - [ ] 3종 .env.example
          - [ ] scripts/smoke.ts (부팅 + curl polling)
          - [ ] 3 profile PASS
          - [ ] LOCAL.md §3 동기
          - [ ] LOCAL.md §4 부팅 자산 갱신
          - [ ] CI smoke job 추가 (선택)

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: smoke 자체가 통합 검증
          - E2E: N/A

          ## 의존성

          Blocked-by: feat-articles-api
          Blocks: (Sprint 2 진입)

          ---
          상세: {{WBS_URL}}#sprint-1

  - milestone: "Sprint 2 — 댓글 + 태그 API + 통합 회귀"
    due: "2026-05-30"
    description: "댓글 CRD + 태그 빈도 + cascade·에러 schema 통합 회귀."
    issues:
      - title: "feat(backend): 댓글 API (CRD, 수정 없음) + 통합"
        slug: "feat-comments-api"
        labels: ["status:todo", "type:feature", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-06, R-F-05
          F-ID: F-05

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 글 id=1, When POST `/api/articles/1/comments`, Then 201.
          - Given 댓글 cid=5, When DELETE, Then 204.
          - Given articleId 미존재, When 모든 댓글 API, Then 404.
          - Given 빈 body, When POST, Then 400.

          ## Contract

          변경 전: 댓글 라우터·controller·service·repo·validator 미작성.
          변경 후: routes/comments.ts + controllers + services + repositories + validators/comment.validator.ts.

          ## DoD Checklist

          - [ ] 3 엔드포인트 (목록·POST·DELETE)
          - [ ] 단위 — validateCommentInput
          - [ ] 통합 — Acceptance 4 케이스
          - [ ] 09 API와 정합

          ## 테스트 시나리오

          - 단위: validators
          - 통합: 3 엔드포인트 × happy/failure
          - E2E: Sprint 4에서 간접

          ## 의존성

          Blocked-by: feat-articles-api
          Blocks: feat-comment-create-delete-ui

          ---
          상세: {{WBS_URL}}#sprint-2
      - title: "feat(backend): 태그 API + 정렬·상한 + 통합"
        slug: "feat-tags-api"
        labels: ["status:todo", "type:feature", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-04
          F-ID: F-02, F-08

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 30종 태그 사용 시드, When GET `/api/tags`, Then 200 + 빈도 desc 상위 20개.
          - Given 태그 0건, When GET, Then 200 + tags=[].

          ## Contract

          변경 전: 태그 라우터·service·repo 미작성.
          변경 후: routes/tags.ts + controllers + services + repositories.

          ## DoD Checklist

          - [ ] 1 엔드포인트
          - [ ] 단위 — TagService.list
          - [ ] 통합 — 2 Acceptance
          - [ ] 30종 시드 데이터

          ## 테스트 시나리오

          - 단위: TagService 정렬·상한
          - 통합: 1 엔드포인트 × happy/failure
          - E2E: Sprint 3·5 간접

          ## 의존성

          Blocked-by: feat-articles-api
          Blocks: feat-home-page, feat-tag-filter-ux-polish

          ---
          상세: {{WBS_URL}}#sprint-2
      - title: "test(backend): cascade 무결성 통합 회귀"
        slug: "test-cascade-integration"
        labels: ["status:todo", "type:test", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-07
          F-ID: F-07

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 0.5d

          ## Acceptance Criteria

          - Given 글 + 댓글 3 + ArticleTag 2, When DELETE 글, Then Comment·ArticleTag articleId 행 0건. Tag 자체 보존.
          - Given 트랜잭션 throw 주입, When 삭제, Then 모두 보존 (rollback).

          ## Contract

          변경 전: cascade 통합 테스트 미존재.
          변경 후: backend/tests/integration/cascade.integration.test.ts.

          ## DoD Checklist

          - [ ] 시드 helper
          - [ ] DELETE 후 0건 assert
          - [ ] rollback 시나리오
          - [ ] CI 회귀 매 PR

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: 2 케이스 (happy + rollback)
          - E2E: Sprint 4 feat-article-delete-ux에서 시각 확인

          ## 의존성

          Blocked-by: feat-prisma-schema-and-seed, feat-articles-api, feat-comments-api
          Blocks: feat-article-delete-ux

          ---
          상세: {{WBS_URL}}#sprint-2
      - title: "test(backend): 에러 schema 통일 통합 회귀"
        slug: "test-error-schema-integration"
        labels: ["status:todo", "type:test", "area:backend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-02
          F-ID: F-12 (간접)

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: backend
          - 우선순위: P0
          - Estimated Effort: 0.5d

          ## Acceptance Criteria

          - Given 전 엔드포인트 4xx/5xx, When 응답, Then `{ error: string }` + stack 미포함.
          - Given 의도 throw, When 미들웨어 통과, Then 500 + 일반 메시지 + stderr 스택.

          ## Contract

          변경 전: 에러 schema 통합 회귀 미존재.
          변경 후: backend/tests/integration/error-schema.integration.test.ts (~18 assert).

          ## DoD Checklist

          - [ ] 9 엔드포인트 × ~2 에러 = ~18 assert
          - [ ] body schema 검증
          - [ ] stack 미포함 검증
          - [ ] stderr spy

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: 9 엔드포인트 × 에러 케이스
          - E2E: Sprint 4 notfound-and-error-boundary 인라인

          ## 의존성

          Blocked-by: feat-articles-api, feat-comments-api, feat-tags-api
          Blocks: (Sprint 3 진입)

          ---
          상세: {{WBS_URL}}#sprint-2

  - milestone: "Sprint 3 — FE 골격 + Home·Article"
    due: "2026-06-03"
    description: "Vite + Tailwind + Router·api-client·Home·Article 페이지."
    issues:
      - title: "feat(frontend): frontend 골격 + Vite + Tailwind + Router + 토큰"
        slug: "feat-frontend-skeleton-and-tokens"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-08, R-N-06
          F-ID: F-11

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given `pnpm --filter @app/frontend dev`, When 부팅, Then `Local: http://localhost:5173/` 5초 이내 ready.
          - Given Tailwind 클래스 bg-primary-500, When 적용, Then 10 §3 토큰 색상.

          ## Contract

          변경 전: frontend 빈 워크스페이스.
          변경 후: index.html + src/{main,App}.tsx + styles.css + tailwind.config.ts + postcss.config.js + router/routes.tsx + pages 4 placeholder.

          ## DoD Checklist

          - [ ] Vite + RR6 + Tailwind 3 + Pretendard
          - [ ] CSS Variables 토큰 4종
          - [ ] tailwind.config theme.extend
          - [ ] 5 경로 + NotFound
          - [ ] typecheck + lint PASS

          ## 테스트 시나리오

          - 단위: router 매칭 함수
          - 통합: N/A
          - E2E: Sprint 5 responsive에서 검증

          ## 의존성

          Blocked-by: feat-monorepo-scaffold
          Blocks: feat-frontend-api-client, feat-home-page, feat-article-page-and-comments-list, feat-editor-page, feat-notfound-and-error-boundary

          ---
          상세: {{WBS_URL}}#sprint-3
      - title: "feat(frontend): api-client + shared types + 에러 정규화"
        slug: "feat-frontend-api-client"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-02
          F-ID: F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given apiClient.listArticles({page:1}), When 호출, Then GET /api/articles?page=1 + Article[] 반환.
          - Given 4xx 응답, When 받음, Then NormalizedError throw.
          - Given offline, When fetch fail, Then `{ status: 0 }` throw.

          ## Contract

          변경 전: api-client 미작성. shared types 미정의.
          변경 후: frontend/src/api/{client,normalizeError}.ts + shared/src/{article,comment,tag,api-error}.ts.

          ## DoD Checklist

          - [ ] 9 엔드포인트 wrap
          - [ ] shared DTO 4종 + ListResult
          - [ ] frontend·backend peer dependency on shared
          - [ ] 단위 — client fetch mock
          - [ ] 단위 — normalizeError

          ## 테스트 시나리오

          - 단위: client·normalizeError
          - 통합: N/A (apiClient는 mock으로 충분)
          - E2E: Sprint 5에서 간접

          ## 의존성

          Blocked-by: feat-frontend-skeleton-and-tokens, feat-articles-api, feat-comments-api, feat-tags-api
          Blocks: feat-home-page, feat-article-page-and-comments-list, feat-editor-page

          ---
          상세: {{WBS_URL}}#sprint-3
      - title: "feat(frontend): Home 페이지 (글 목록 + 사이드바 + 페이지네이션)"
        slug: "feat-home-page"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-01, R-F-04, R-N-06
          F-ID: F-01, F-02, F-08, F-11

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 2d

          ## Acceptance Criteria

          - Given `/`, When 로드, Then 카드 10 + 페이지네이션 + 사이드바.
          - Given "다음" 클릭, When, Then `?page=2` + 11~20.
          - Given 태그 클릭, When, Then `/?tag=name` + 필터링.
          - Given `?tag=ghost`, When, Then "결과 없음".

          ## Contract

          변경 전: Home placeholder.
          변경 후: pages/Home.tsx + components/{ArticleCard,Pagination,TagList,Layout}.tsx + hooks/useArticles.ts.

          ## DoD Checklist

          - [ ] listArticles + listTags 병렬
          - [ ] URLSearchParams source-of-truth
          - [ ] AbortController
          - [ ] 768px 미만 stack
          - [ ] RTL snapshot — 3 컴포넌트
          - [ ] MSW 통합 1건

          ## 테스트 시나리오

          - 단위: ArticleCard·Pagination·TagList snapshot
          - 통합: MSW로 API mock
          - E2E: Sprint 5 e2e-golden-path

          ## 의존성

          Blocked-by: feat-frontend-api-client
          Blocks: feat-tag-filter-ux-polish

          ---
          상세: {{WBS_URL}}#sprint-3
      - title: "feat(frontend): Article 상세 페이지 + 댓글 목록"
        slug: "feat-article-page-and-comments-list"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-03, R-F-06, R-F-08
          F-ID: F-04, F-05 (목록만)

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 2d

          ## Acceptance Criteria

          - Given 글 id=1, When `/article/1`, Then 본문 + 댓글 + 수정/삭제 버튼.
          - Given 미존재 id, When `/article/999`, Then NotFound.

          ## Contract

          변경 전: Article placeholder.
          변경 후: pages/Article.tsx + components/CommentList.tsx + pages/NotFound.tsx.

          ## DoD Checklist

          - [ ] getArticle + listComments 병렬
          - [ ] 404 → NotFound
          - [ ] 댓글 목록 (작성·삭제는 Sprint 4)
          - [ ] 수정/삭제 버튼 mount (핸들러는 Sprint 4)
          - [ ] RTL — Article·CommentList·NotFound
          - [ ] gstack `/qa` 스크린샷

          ## 테스트 시나리오

          - 단위: Article·CommentList·NotFound
          - 통합: MSW
          - E2E: Sprint 5

          ## 의존성

          Blocked-by: feat-frontend-api-client
          Blocks: feat-editor-page, feat-article-delete-ux, feat-comment-create-delete-ui

          ---
          상세: {{WBS_URL}}#sprint-3

  - milestone: "Sprint 4 — FE 작성·수정·삭제 + 댓글 UI"
    due: "2026-06-08"
    description: "Editor·삭제 UX·댓글 작성·삭제·NotFound."
    issues:
      - title: "feat(frontend): Editor 페이지 (글 작성·수정)"
        slug: "feat-editor-page"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-02, R-F-05, R-F-08
          F-ID: F-03, F-06, F-11

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 2d

          ## Acceptance Criteria

          - Given `/editor`, When 4 필드 + "발행", Then POST + `/article/:id` navigate.
          - Given `/editor/:id`, When 로드, Then 기존 값 사전 로드 + "저장".
          - Given title 빈 값, When "발행", Then 인라인 에러 + 입력값 보존.

          ## Contract

          변경 전: Editor placeholder.
          변경 후: pages/Editor.tsx + components/EditorForm.tsx.

          ## DoD Checklist

          - [ ] EditorForm controlled
          - [ ] /editor/:id 사전 로드
          - [ ] 인라인 검증 (M9 룰 매칭)
          - [ ] submit 실패 시 보존
          - [ ] RTL — EditorForm
          - [ ] gstack `/qa` 작성·수정 스크린샷

          ## 테스트 시나리오

          - 단위: EditorForm
          - 통합: MSW
          - E2E: Sprint 5

          ## 의존성

          Blocked-by: feat-article-page-and-comments-list, feat-frontend-api-client
          Blocks: e2e-golden-path

          ---
          상세: {{WBS_URL}}#sprint-4
      - title: "feat(frontend): 글 삭제 UX + cascade 시각 확인"
        slug: "feat-article-delete-ux"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-03, R-F-07
          F-ID: F-07

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 상세, When "삭제" + 확인, Then DELETE + holm navigate + 미노출.
          - Given 직접 URL 재진입, When, Then 404.

          ## Contract

          변경 전: 삭제 핸들러 미연결.
          변경 후: Article.tsx deleteHandler + Modal 컴포넌트.

          ## DoD Checklist

          - [ ] confirm Modal (재사용)
          - [ ] DELETE → navigate('/')
          - [ ] 실패 시 toast
          - [ ] gstack `/qa` — cascade 시각

          ## 테스트 시나리오

          - 단위: Modal·deleteHandler
          - 통합: N/A (E2E로 충분)
          - E2E: Sprint 5 e2e-golden-path 일부

          ## 의존성

          Blocked-by: feat-article-page-and-comments-list, test-cascade-integration
          Blocks: e2e-golden-path

          ---
          상세: {{WBS_URL}}#sprint-4
      - title: "feat(frontend): 댓글 작성·삭제 UI"
        slug: "feat-comment-create-delete-ui"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-F-06, R-F-05
          F-ID: F-05

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given Article, When 댓글 폼 + "작성", Then POST + 영역 즉시 추가.
          - Given 본인 댓글, When "삭제", Then DELETE + 204 + 미노출.
          - Given 빈 body, When "작성", Then 400 + 인라인 에러.

          ## Contract

          변경 전: 댓글 작성·삭제 핸들러 미연결.
          변경 후: Article.tsx에 CommentForm + commentCreate/Delete Handler.

          ## DoD Checklist

          - [ ] CommentForm controlled
          - [ ] 갱신 전략 명시 (optimistic vs 응답 후)
          - [ ] "삭제" 버튼 (MVP는 모든 댓글)
          - [ ] RTL — CommentForm·CommentList
          - [ ] gstack `/qa` 스크린샷

          ## 테스트 시나리오

          - 단위: CommentForm
          - 통합: MSW
          - E2E: Sprint 5

          ## 의존성

          Blocked-by: feat-article-page-and-comments-list, feat-comments-api
          Blocks: e2e-golden-path

          ---
          상세: {{WBS_URL}}#sprint-4
      - title: "feat(frontend): NotFound + ErrorBoundary"
        slug: "feat-notfound-and-error-boundary"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-F-08, R-N-02
          F-ID: F-04 (간접)

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 미일치 경로 또는 미존재 id, When 진입, Then NotFound + "홈으로".
          - Given 5xx 응답, When apiClient 받음, Then ErrorBoundary catch + 일반 메시지 토스트 (스택 미노출).

          ## Contract

          변경 전: NotFound·ErrorBoundary 미작성.
          변경 후: pages/NotFound.tsx + components/ErrorBoundary.tsx + Toast.tsx.

          ## DoD Checklist

          - [ ] NotFound + Layout 재사용
          - [ ] ErrorBoundary class
          - [ ] Toast (success/error variant)
          - [ ] 단위 테스트
          - [ ] gstack `/qa` — /article/999 NotFound

          ## 테스트 시나리오

          - 단위: NotFound·ErrorBoundary·Toast
          - 통합: N/A
          - E2E: Sprint 5

          ## 의존성

          Blocked-by: feat-frontend-skeleton-and-tokens
          Blocks: e2e-golden-path

          ---
          상세: {{WBS_URL}}#sprint-4

  - milestone: "Sprint 5 — 마무리·반응형·E2E"
    due: "2026-06-10"
    description: "UX 마무리·응답 시간·E2E 골든 패스."
    issues:
      - title: "feat(frontend): 태그 필터 UX 마무리 + URL state"
        slug: "feat-tag-filter-ux-polish"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-F-04, R-F-01
          F-ID: F-02, F-08

          ## 유형 / 영역 / 우선순위

          - 유형: feature
          - 영역: frontend
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given Home `?tag=javascript`, When 사이드바 노출, Then "javascript" 칩 active.
          - Given active 태그 재클릭, When, Then `?tag` 제거 (해제).
          - Given `?tag=js&page=2`, When 적용, Then 둘 다 적용.

          ## Contract

          변경 전: 단방향 라우팅만.
          변경 후: TagList active state + URL 양방향 sync.

          ## DoD Checklist

          - [ ] active variant 시각
          - [ ] 재클릭 해제
          - [ ] page + tag 동시
          - [ ] RTL

          ## 테스트 시나리오

          - 단위: TagList active
          - 통합: MSW
          - E2E: e2e-golden-path 태그 필터 케이스

          ## 의존성

          Blocked-by: feat-home-page, feat-tags-api
          Blocks: e2e-golden-path

          ---
          상세: {{WBS_URL}}#sprint-5
      - title: "test(frontend): 반응형 회귀 + 토큰 회귀"
        slug: "test-responsive-and-token-regression"
        labels: ["status:todo", "type:test", "area:frontend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-N-06
          F-ID: F-11

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: frontend
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 360/768/1024/1440 viewport, When 5 페이지, Then 정상 + 가로 스크롤 X.
          - Given 토큰 변경, When 빌드, Then snapshot diff 감지.

          ## Contract

          변경 전: 반응형·토큰 회귀 미존재.
          변경 후: e2e/specs/responsive.spec.ts + 컴포넌트 snapshot 5종.

          ## DoD Checklist

          - [ ] Playwright viewport 4 × 5 페이지
          - [ ] gstack `/qa` 수동
          - [ ] snapshot 5 컴포넌트
          - [ ] 스크린샷 보관

          ## 테스트 시나리오

          - 단위: snapshot 5종
          - 통합: N/A
          - E2E: viewport 4종 × 5 페이지

          ## 의존성

          Blocked-by: feat-home-page, feat-article-page-and-comments-list, feat-editor-page, feat-notfound-and-error-boundary
          Blocks: (없음 — Sprint 5 내부)

          ---
          상세: {{WBS_URL}}#sprint-5
      - title: "test(backend): 응답 시간 측정 통합 (p95 < 200ms)"
        slug: "test-response-time-p95"
        labels: ["status:todo", "type:test", "area:backend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-N-01
          F-ID: F-01 (간접)

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: backend
          - 우선순위: P1
          - Estimated Effort: 0.5d

          ## Acceptance Criteria

          - Given 100건 시드, When GET /api/articles 100회, Then p95 < 200ms.
          - Given 4 시나리오, When 각 100회, Then 모두 p95 < 200ms (WARN if 초과).

          ## Contract

          변경 전: 측정 미존재.
          변경 후: backend/tests/integration/perf.integration.test.ts.

          ## DoD Checklist

          - [ ] performance.now() wrapper
          - [ ] 4 시나리오 × 100회
          - [ ] WARN 출력 (BLOCK X)
          - [ ] 결과 JSON

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: 4 시나리오 측정
          - E2E: N/A

          ## 의존성

          Blocked-by: feat-articles-api, feat-comments-api, feat-tags-api
          Blocks: (Sprint 6 진입)

          ---
          상세: {{WBS_URL}}#sprint-5
      - title: "test(frontend): E2E 골든 패스 (Playwright 5건 + gstack)"
        slug: "test-e2e-golden-path"
        labels: ["status:todo", "type:test", "area:frontend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-F-01, R-F-02, R-F-03, R-F-04, R-F-07
          F-ID: F-01, F-02, F-03, F-04, F-07

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: frontend
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given Playwright 설치, When `pnpm --filter @app/e2e test`, Then 5 시나리오 PASS.
          - Given gstack `/qa`, When 1회, Then 콘솔 에러 0 + 스크린샷 5장.

          ## Contract

          변경 전: e2e 빈 골격.
          변경 후: e2e/playwright.config.ts + specs/{article-create,article-detail-comment,article-delete-cascade,tag-filter,golden-path}.spec.ts.

          ## DoD Checklist

          - [ ] Playwright 설치
          - [ ] 5 spec
          - [ ] global-setup 시드
          - [ ] gstack 수동 보완
          - [ ] CI job (선택)

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: N/A
          - E2E: 5 시나리오 (글 작성·상세·댓글·삭제 cascade·태그 필터)

          ## 의존성

          Blocked-by: feat-editor-page, feat-article-delete-ux, feat-comment-create-delete-ui, feat-notfound-and-error-boundary, feat-tag-filter-ux-polish
          Blocks: (Sprint 6 진입)

          ---
          상세: {{WBS_URL}}#sprint-5

  - milestone: "Sprint 6 — README·주석·평가 기준 마무리"
    due: "2026-06-12"
    description: "README + 한국어 주석 ≥80% + 평가 기준 7개 통과."
    issues:
      - title: "docs(docs): README 작성 (설치·실행·평가 기준·보안)"
        slug: "docs-readme-write"
        labels: ["status:todo", "type:docs", "area:docs", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-03, R-N-04, R-N-07
          F-ID: F-09, F-12

          ## 유형 / 영역 / 우선순위

          - 유형: docs
          - 영역: docs
          - 우선순위: P0
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 새 PC + Node 20, When README §설치·§실행, Then 부팅 + 시드 노출.
          - Given §보안, When 사용자 읽음, Then "공개 데모용, 운영 사용 금지" 한국어/영문 병기.
          - Given §평가 기준, When RFP §10 7개, Then 1:1 매핑 + 통과 방법.

          ## Contract

          변경 전: README placeholder.
          변경 후: README.md (§개요·§기술·§폴더·§설치·§실행 3 profile·§평가 기준·§보안·§학습 가이드·§Phase 2).

          ## DoD Checklist

          - [ ] LOCAL.md cross-reference
          - [ ] 평가 기준 7 매핑
          - [ ] §보안 한/영
          - [ ] 학습 트랙
          - [ ] yq 권고
          - [ ] 1명 시도 PASS

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: N/A
          - E2E: UC-06 수동 시도 (test-final-golden-path가 본 시도 결과 포함)

          ## 의존성

          Blocked-by: chore-3profile-smoke, test-e2e-golden-path
          Blocks: test-final-golden-path-and-eval-criteria

          ---
          상세: {{WBS_URL}}#sprint-6
      - title: "docs(docs): 한국어 주석 보강 + 측정 스크립트"
        slug: "docs-korean-comments-coverage"
        labels: ["status:todo", "type:docs", "area:docs", "priority:P1"]
        body: |
          ## 매핑

          R-ID: R-N-05
          F-ID: F-10

          ## 유형 / 영역 / 우선순위

          - 유형: docs
          - 영역: docs
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given 핵심 4 디렉토리, When 스크립트, Then 한국어 주석 ≥ 80%.
          - Given 누락 함수, When 출력, Then 보강 후 PASS.

          ## Contract

          변경 전: 측정 스크립트 미존재.
          변경 후: scripts/check-comment-coverage.sh + 함수 헤더 주석 보강.

          ## DoD Checklist

          - [ ] check-comment-coverage.sh
          - [ ] 4 디렉토리 ≥ 80%
          - [ ] CI lint job (선택)
          - [ ] 결과 PR body

          ## 테스트 시나리오

          - 단위: 스크립트 자체가 측정
          - 통합: N/A
          - E2E: N/A

          ## 의존성

          Blocked-by: test-e2e-golden-path
          Blocks: test-final-golden-path-and-eval-criteria

          ---
          상세: {{WBS_URL}}#sprint-6
      - title: "test(docs): 최종 골든 패스 + 평가 기준 7개"
        slug: "test-final-golden-path-and-eval-criteria"
        labels: ["status:todo", "type:test", "area:docs", "priority:P0"]
        body: |
          ## 매핑

          R-ID: R-N-03, R-N-04
          F-ID: F-09

          ## 유형 / 영역 / 우선순위

          - 유형: test
          - 영역: docs
          - 우선순위: P0
          - Estimated Effort: 0.5d

          ## Acceptance Criteria

          - Given 새 PC + README, When UC-06, Then 부팅 + 시드 노출.
          - Given 평가 기준 7개, When 검증, Then 7/7 PASS.
          - Given 시도자 3명, When 절차, Then 3/3 (KPI 1차 완화 ADR).

          ## Contract

          변경 전: 평가 검증 미수행.
          변경 후: docs/features/golden-path/screenshots/ + 시도 결과 마크다운.

          ## DoD Checklist

          - [ ] UC-06 시도 1회 (저자)
          - [ ] 외부 시도 1~2명
          - [ ] 평가 기준 7 매핑 표
          - [ ] gstack `/qa` 최종
          - [ ] Phase 2 로드맵 README

          ## 테스트 시나리오

          - 단위: N/A
          - 통합: N/A
          - E2E: UC-06 수동 + 평가 기준 7개

          ## 의존성

          Blocked-by: docs-readme-write, docs-korean-comments-coverage
          Blocks: bug-residual-and-open-questions-resolve

          ---
          상세: {{WBS_URL}}#sprint-6
      - title: "fix(backend): 잔여 버그 수정 + Open Questions 해소"
        slug: "bug-residual-and-open-questions-resolve"
        labels: ["status:todo", "type:bug", "area:backend", "priority:P1"]
        body: |
          ## 매핑

          R-ID: (잔여 — 발견 시점 결정)
          F-ID: F-09 (간접)

          ## 유형 / 영역 / 우선순위

          - 유형: bug
          - 영역: backend
          - 우선순위: P1
          - Estimated Effort: 1d

          ## Acceptance Criteria

          - Given Open Q 24, When 본 이슈, Then 미결정 항목 ADR 또는 보강으로 해소.
          - Given 잔여 버그, When 발견, Then 수정 + 회귀 테스트.

          ## Contract

          변경 전: Open Q O-01~O-24 일부 미결정.
          변경 후: Open Q 모두 해소 또는 Phase 2+ 후보 명시.

          ## DoD Checklist

          - [ ] Open Q 24 점검
          - [ ] ADR 신설 또는 v0.2 갱신
          - [ ] 회귀 PASS
          - [ ] gstack `/qa` 1회

          ## 테스트 시나리오

          - 단위: 잔여 버그 단위
          - 통합: 회귀 전수
          - E2E: gstack 최종

          ## 의존성

          Blocked-by: test-final-golden-path-and-eval-criteria
          Blocks: (없음 — Sprint 6 마지막)

          ---
          상세: {{WBS_URL}}#sprint-6
```

## 8. Open Questions

> [ADR-0049 Sprint 6 #25 일괄 해소] 본 §의 O-25~O-29 5건 결정 trace는 [`docs/planning/adr/0049-open-questions-resolution.md`](../adr/0049-open-questions-resolution.md) + [`bug-residual-and-open-questions-resolve.openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

- O-25: Sprint 5 / test-e2e-golden-path에서 Playwright 도입 비용 vs gstack `/qa` 단독 — 본 MVP에서 Playwright 학습 부담이 입문자에게 너무 크면 gstack 단독으로 완화 ADR 검토. **✅ 해소완료** (Playwright 채택, Sprint 5 #21)
- O-26: Sprint 6 / docs-readme-write의 §평가 기준 매핑 표 — RFP §10 7항목과 02-catalog E2E 시나리오를 1:1 vs 그룹화 (05 Open Q O-19). **✅ 해소완료** (1:1, Sprint 6 #24 eval-matrix.md)
- O-27: Sprint 1 / chore-3profile-smoke의 `pnpm smoke:3profiles`를 GitHub Actions에 포함할지 — CI 시간 부담 vs 회귀 가치 trade-off. **🔁 Phase 2 보류**
- O-28: KPI 완화 ADR (RISK-07) — "10명 시도 100%"를 "3명 시도 100% + 외부 비동기 시도 7명" 등으로 재정의할지. **🔁 Phase 2 보류** (별 이슈 후속, #24 attempts.md §8 N=2/10 baseline)
- O-29: bug-residual-and-open-questions-resolve(Sprint 6 마지막)에서 Open Q 해소 결과를 별 ADR로 묶을지 산출별로 분산할지. **✅ 해소완료** (묶음 ADR-0049, 본 PR)
