---
doc_type: scaffolding
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-09, F-10, F-11, F-12]
  supersedes: null
---

# Conduit Lite — Scaffolding (TypeScript)

> NEW_PROJECT Gate C. pnpm workspaces monorepo (frontend + backend + shared) 골격. ADR-0037 v1.1 부팅 자산 3 profile + ADR-0038 styling 솔루션 BLOCK 충족. LOCAL.md §3·§4와 매 PR 동기 갱신.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4, ADR-0037 v1.1 + ADR-0038 + ADR-0040 정합) |

## 1. 디렉토리 트리

```
board-app/
├── CLAUDE.md
├── LOCAL.md                          # 부팅 사용자 가이드 (ADR-0040)
├── README.md                         # 학습 친화 설명 (F-09)
├── package.json                      # workspace root
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json                # 공유 TS 설정
├── .editorconfig
├── .gitignore
├── .env.dev.example
├── .env.stg.example
├── .env.prod.example
├── .eslintrc.cjs                     # 또는 eslint.config.js (flat)
├── .prettierrc
├── .github/
│   └── workflows/
│       └── ci.yml                    # 빌드·테스트 + AI 게이트 (ADR-0047)
├── docs/
│   └── planning/                     # 01~15 산출
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts            # 10 LLD §3 토큰 인용
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx                  # entrypoint + styles.css import
│       ├── App.tsx                   # <BrowserRouter> + Routes
│       ├── styles.css                # Tailwind directives + 디자인 토큰 CSS Variables
│       ├── router/
│       │   └── routes.tsx            # M1 FE-router
│       ├── pages/                    # M2 FE-pages
│       │   ├── Home.tsx
│       │   ├── Article.tsx
│       │   ├── Editor.tsx
│       │   └── NotFound.tsx
│       ├── components/               # M3 FE-components
│       │   ├── ArticleCard.tsx
│       │   ├── Pagination.tsx
│       │   ├── TagList.tsx
│       │   ├── CommentList.tsx
│       │   ├── EditorForm.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── Layout.tsx
│       ├── api/                      # M4 FE-api-client
│       │   ├── client.ts
│       │   └── normalizeError.ts
│       └── hooks/
│           └── useArticles.ts
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts                 # 부팅 entrypoint
│   │   ├── app.ts                    # express app 생성 (M5 BE-router)
│   │   ├── routes/                   # M5
│   │   │   ├── articles.ts
│   │   │   ├── comments.ts
│   │   │   └── tags.ts
│   │   ├── controllers/              # M6 BE-controllers
│   │   │   ├── articles.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   └── tags.controller.ts
│   │   ├── services/                 # M7 BE-services
│   │   │   ├── article.service.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── tag.service.ts
│   │   │   └── transaction.ts
│   │   ├── repositories/             # M8 BE-repositories
│   │   │   ├── article.repo.ts
│   │   │   ├── comment.repo.ts
│   │   │   ├── tag.repo.ts
│   │   │   └── article-tag.repo.ts
│   │   ├── validators/               # M9 BE-validators
│   │   │   ├── article.validator.ts
│   │   │   ├── comment.validator.ts
│   │   │   └── query.validator.ts
│   │   ├── middleware/
│   │   │   ├── error-handler.ts      # M10 BE-error
│   │   │   ├── cors.ts
│   │   │   └── request-logger.ts
│   │   ├── errors/                   # M10 도메인 에러 클래스
│   │   │   ├── validation-error.ts
│   │   │   ├── not-found-error.ts
│   │   │   └── repository-error.ts
│   │   └── env.ts                    # validateEnv() 한 곳에서
│   ├── prisma/                       # M11 BE-prisma
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   ├── dev.db                    # gitignore
│   │   ├── stg.db                    # gitignore (단일 환경 운영 시 N/A)
│   │   └── prod.db                   # gitignore (운영 시 별 인스턴스)
│   └── tests/
│       ├── unit/
│       └── integration/
├── shared/                           # M12 Shared-types
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── article.ts
│       ├── comment.ts
│       ├── tag.ts
│       ├── api-error.ts
│       └── index.ts
└── e2e/                              # Playwright (선택)
    ├── playwright.config.ts
    └── specs/
        ├── article-list.spec.ts
        ├── article-create.spec.ts
        ├── article-delete-cascade.spec.ts
        └── tag-filter.spec.ts
```

## 2. 패키지 명명 규칙

- **monorepo root**: `package.json` `name: "board-app"` (private), workspaces: `["frontend", "backend", "shared", "e2e"]`.
- **워크스페이스 패키지명**: `@app/frontend`, `@app/backend`, `@app/shared`, `@app/e2e` (scope `@app`은 본 monorepo 임의 scope).
- **간 의존**: `@app/backend` ↔ `@app/shared`, `@app/frontend` ↔ `@app/shared` (DTO 공유). `frontend ↔ backend` 직 의존 금지 — shared가 contract layer.
- **scripts 명명**: `dev`, `dev:dev`, `dev:stg`, `dev:prod`, `build`, `test`, `test:unit`, `test:integration`, `lint`, `format` 일관.
- **seed**: `backend/seed.ts` (Prisma seed). `pnpm seed:dev`로 호출. profile별 분기는 NODE_ENV로.

## 3. 디자인 패턴 결정

본 프로젝트는 **Layered** 아키텍처 패턴을 채택한다.

- **선택 패턴**: **Layered** (Controller → Service → Repository 3계층).
- **이유**:
  - 입문자에게 가장 직관적이고 자료 풍부. 풀스택 학습 1주기 목표(01 Brief KPI)에 부합.
  - 책임 분리가 명확 — controllers는 HTTP, services는 비즈니스, repositories는 DB. 11 Coding Conventions 명명 규칙과 디렉토리 트리(§1)가 본 분리를 강제.
  - Phase 2 세션 인증 추가 시 미들웨어 레이어만 확장하면 됨 (01 Brief KPI #4 — 수정 면적 ≤20%). Hexagonal/Clean Arch는 추상화 비용 대비 학습 부담 큼.
  - FE는 페이지/컴포넌트 분리(M2/M3 LLD)로 *Atomic* 변형 — 컴포넌트가 작아 atom/molecule 구분은 강제하지 않고 자연 분류.

대안 검토 (요약):
- **DDD**: 도메인 모델이 단순(Article·Comment·Tag 3종)해 도메인 layer 분리 과잉.
- **Hexagonal**: ports/adapters 추상화 비용이 학습 목표에 비해 큼.
- **MVC**: Express에서 view layer는 React SPA가 담당하므로 server-side MVC는 불필요.
- **FSD (Feature-Sliced Design)**: FE에서 매력적이나 본 MVP 화면 5개 규모에 과함.

## 4. 모듈 경계 (08-lld-module-spec와 fan-out)

| 12 디렉토리 | 08 LLD 모듈 ID | 책임 | 의존 (in/out) |
|---|---|---|---|
| `frontend/src/router/` | M1 FE-router | path 매칭·NotFound | → M2 pages |
| `frontend/src/pages/` | M2 FE-pages | 페이지 합성 | → M3·M4 |
| `frontend/src/components/` | M3 FE-components | UI primitives | → M12 types (간접) |
| `frontend/src/api/` | M4 FE-api-client | REST 호출·에러 정규화 | → BE `/api/*` |
| `frontend/src/hooks/` | (M2의 보조) | useArticles 등 커스텀 훅 | → M4 |
| `backend/src/routes/` | M5 BE-router | Express 라우터 마운트 | → M6 |
| `backend/src/controllers/` | M6 BE-controllers | HTTP 입출력 | → M7·M9·M10 |
| `backend/src/services/` | M7 BE-services | 비즈니스 규칙·트랜잭션 | → M8 |
| `backend/src/repositories/` | M8 BE-repositories | Prisma 호출 wrapper | → M11 |
| `backend/src/validators/` | M9 BE-validators | 입력 검증 함수 | (없음) |
| `backend/src/middleware/`·`backend/src/errors/` | M10 BE-error | 글로벌 핸들러·도메인 에러 | (없음) |
| `backend/prisma/` | M11 BE-prisma | Prisma schema·migrations·seed | (없음, infra) |
| `shared/src/` | M12 Shared-types | DTO | (없음, frontend·backend 양쪽이 import) |
| `e2e/specs/` | (테스트 진입점) | Playwright E2E 시나리오 | → frontend·backend live |

## 5. 빌드·실행

> 본 §은 LOCAL.md §3 profile별 부팅 명령의 SoT (ADR-0040). 변경 시 양축 동기.

```bash
# 의존성 설치 (단일 명령 — pnpm workspaces가 모든 워크스페이스 한 번에)
pnpm install --frozen-lockfile

# Prisma client 생성 (workspace post-install hook 또는 직접 호출)
pnpm --filter @app/backend prisma generate

# DB 스키마 적용 — dev iteration (Prisma db push, 최초 부팅 시 1회)
pnpm --filter @app/backend prisma db push    # = prisma db push --schema ./prisma/schema.prisma

# 정식 migration 흐름 시작 (최초 1회만, 이후 stg/prod에서 migrate deploy 사용)
pnpm --filter @app/backend prisma migrate dev --name init

# seed (dev)
pnpm --filter @app/backend exec tsx prisma/seed.ts

# ─── 부팅 명령 (3 profile) ────────────────────────────────

# dev profile — frontend + backend 동시 (2 터미널 또는 pnpm -r run)
NODE_ENV=development pnpm --filter @app/backend dev       # tsx watch src/server.ts → :3000
NODE_ENV=development pnpm --filter @app/frontend dev      # vite → :5173

# 또는 monorepo 통합 실행 (concurrently 또는 turbo)
pnpm -r --parallel run dev

# stg profile — 빌드 후 실행
pnpm -r build                                              # tsc + vite build
NODE_ENV=staging  pnpm --filter @app/backend  start:stg    # node dist/server.js, DB stg.db
NODE_ENV=staging  pnpm --filter @app/frontend preview:stg  # vite preview --port 4173

# prod profile — 빌드 산출물 (stg=prod 공유 가능, ADR-0037 N/A 명시)
pnpm -r build
NODE_ENV=production pnpm --filter @app/backend  start:prod
NODE_ENV=production pnpm --filter @app/frontend preview:prod

# ─── 테스트 ─────────────────────────────────────────────

pnpm --filter @app/backend test:unit
pnpm --filter @app/backend test:integration
pnpm --filter @app/frontend test:unit
pnpm --filter @app/e2e test                                # Playwright (선택, gstack /qa 보완)

# ─── Lint·Format ────────────────────────────────────────

pnpm lint
pnpm format
pnpm typecheck                                              # tsc --noEmit on all workspaces

# ─── AI 게이트 (PR 직전) ─────────────────────────────────

# 1. 3 profile 부팅 smoke (R-N-04)
NODE_ENV=development pnpm --filter @app/backend smoke      # 부팅 5초 후 GET /api/articles → 200
NODE_ENV=staging     pnpm --filter @app/backend smoke
NODE_ENV=production  pnpm --filter @app/backend smoke
# 2. gstack /qa 골든 패스 (UI 변경 시, R-N-06)
# 3. validate-doc.sh 산출 검증 (yq 설치 후)
```

## 6. 환경 변수 / 설정 분리

| 키 | dev | stg | prod | 노출 위치 |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `staging` | `production` | backend `env.ts` (서버 전용) |
| `DATABASE_URL` | `file:./prisma/dev.db` | `file:./prisma/stg.db` | `file:./prisma/prod.db` (또는 secret manager) | backend `env.ts`. **단일 환경 운영 시 stg=prod 공유 명시 가능 (ADR-0037 v1.1 N/A 허용)**. |
| `PORT` | `3000` | `3000` | `3000` | backend `server.ts` |
| `CORS_ORIGIN` | `http://localhost:5173` | `(unset — same-origin)` | `(unset — same-origin)` | backend `middleware/cors.ts` |
| `LOG_LEVEL` | `debug` | `info` | `warn` | backend `request-logger.ts` |
| `VITE_API_URL` | `http://localhost:3000/api` | `http://localhost:3000/api` | `/api` (same-origin) | frontend `import.meta.env.VITE_API_URL` |
| `VITE_APP_TITLE` | `Conduit Lite (dev)` | `Conduit Lite (stg)` | `Conduit Lite` | frontend `index.html` 동적 치환 또는 `<title>` 컴포넌트 |

- **profile 컬럼 강제 (ADR-0037 v1.1)**: 본 표는 dev/stg/prod 3 profile 분기 컬럼 BLOCK 충족.
- **시크릿 없음 (MVP)**: 본 MVP는 인증 미적용으로 JWT_SECRET 등 시크릿 미사용 (R-N-07). Phase 2에서 도입 시 secret manager (예: Doppler·1Password) 권장. `.env.prod`에는 placeholder만 commit.
- **단일 환경 운영 옵션**: dev만 운영하고 stg/prod는 학습 데모에서 사용 안 할 수도 있음. 이 경우 `.env.stg.example`·`.env.prod.example`은 dev와 동일 골격 + 비고에 "stg=prod 공유 또는 N/A" 명시.

## 7. 부팅 자산 (Runnability Assets)

| 자산 | 경로 (profile별) | 변경 trigger 이슈 유형 | 갱신 책임 |
|---|---|---|---|
| 환경 변수 템플릿 | `.env.dev.example`·`.env.stg.example`·`.env.prod.example` | 새 환경 변수 추가 | 변수를 도입한 이슈 |
| 스키마 적용 (dev iteration) | `backend/package.json scripts.prisma:push` → `prisma db push` (dev에서 빠른 schema → DB 동기) | dev 환경 schema 변경 | 모델 변경 이슈 |
| DB migrations (stg/prod release) | `backend/prisma/migrations/` 디렉토리 + `prisma migrate deploy` (stg/prod 시 적용) | 운영 release용 migration 작성·적용 | 운영 release 이슈 |
| lockfile | `pnpm-lock.yaml` (단일 — workspaces가 root에서 1개 lockfile 공유) | 의존성 추가/변경 | 의존성 도입 이슈 |
| 설치/seed scripts | `package.json` scripts: `prepare`, `prisma:push`, `seed:dev`, `seed:stg`, `seed:prod` | seed 데이터 변경 | seed 변경 이슈 |
| 부팅 명령 | 본 §5 코드블록 + LOCAL.md §3 | 명령 변경 | 명령 변경 이슈 |
| LOCAL.md | 루트 `LOCAL.md` (ADR-0040 — 본 §7과 매 PR 동기) | 부팅 자산 변경 시 동시 | LOCAL.md를 변경한 같은 이슈 |
| 컨테이너 정의 (선택, Phase 2+) | `Dockerfile`·`docker-compose.{dev,stg,prod}.yml` | infra 변경 | infra 이슈 |

> **Prisma 분류 (ADR-0037 v1.3)**: 본 프로젝트는 **(a) 분리형** 채택. dev iteration은 `prisma db push` (빠른 동기), stg/prod release는 `prisma migrate deploy` (정식 migration 파일 디렉토리 적용). Spring Boot + Flyway integration 류 단일 메커니즘 아님.

## 8. 스타일링 솔루션

| 항목 | 값 |
|---|---|
| 솔루션 | **Tailwind** CSS 3 (utility-first) |
| 이유 | 입문자 자료 풍부·JIT 빌드·디자인 토큰을 `tailwind.config.ts` `theme.extend`에서 직접 정의 가능. CSS Modules는 학습 단계 증가, styled-components는 SSR 미사용 환경에서 이점 적음. 10 LLD §3 토큰 4종을 schema-level로 매핑 (ADR-0038). |
| 의존성 | `tailwindcss@^3.4` + `postcss@^8.4` + `autoprefixer@^10.4` + `@tailwindcss/forms@^0.5` (선택) — `frontend/package.json devDependencies` |
| entrypoint 적용 | `frontend/src/main.tsx`에서 `import "./styles.css"`. `styles.css`는 `@tailwind base;` `@tailwind components;` `@tailwind utilities;` directives + 10 §3 토큰 CSS Variables 정의. |
| 디자인 토큰 매핑 | 10-lld-screen-design §3 토큰을 `tailwind.config.ts` `theme.extend.colors`·`fontFamily`·`fontSize`·`spacing`에 인용. 예: `colors: { primary: { 500: 'var(--color-primary-500)' } }`. 컴포넌트는 `bg-primary-500` 등 utility로 적용. CSS Variables가 source-of-truth라 다크 모드 확장(Phase 2) 시 변수만 갱신. |
