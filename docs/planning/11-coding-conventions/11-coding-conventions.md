---
doc_type: coding-conventions
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-N-02, R-N-05, R-N-07]
  F-ID: [F-09, F-10, F-12]
  supersedes: null
---

# Conduit Lite — Coding Conventions

> NEW_PROJECT Gate C. TypeScript/Node.js/React 스택의 학습 친화적 코딩 규약. R-N-05(한국어 주석 ≥80%)·R-N-02(에러 응답 schema)·R-N-07(보안)을 코드 수준에서 강제.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 명명 규칙

| 항목 | 규칙 | 예 |
|---|---|---|
| 파일명 (FE 컴포넌트) | PascalCase + `.tsx` | `ArticleCard.tsx`, `Pagination.tsx` |
| 파일명 (FE 훅·유틸) | camelCase + `.ts` | `useArticles.ts`, `formatDate.ts` |
| 파일명 (BE) | kebab-case + `.ts` | `article-controller.ts`, `error-handler.ts` |
| 디렉토리 | kebab-case | `frontend/src/components/`, `backend/src/controllers/` |
| 변수·함수 | camelCase | `listArticles`, `articleId`, `normalizedTags` |
| React 컴포넌트 | PascalCase | `<ArticleCard />`, `<Pagination />` |
| Type / Interface | PascalCase | `Article`, `Comment`, `ApiError`, `ListResult<T>` |
| Enum / 상수 (모듈 레벨 상수) | SCREAMING_SNAKE_CASE | `MAX_TITLE_LENGTH = 200`, `DEFAULT_LIMIT = 10` |
| Test 파일 | `<sut>.test.ts(x)` (단위) / `<sut>.integration.test.ts` (통합) | `validators.test.ts`, `articles.integration.test.ts` |
| Prisma model | PascalCase 단수 | `Article`, `Comment`, `Tag`, `ArticleTag` |
| DB 컬럼 | camelCase (Prisma 기본) | `createdAt`, `updatedAt`, `articleId` |
| API 경로 | kebab-case (단, 본 MVP는 RFP §5 따라 lowercase 단수형 유지) | `/api/articles`, `/api/tags` |
| Tailwind 사용자 정의 클래스 | kebab-case | `article-card`, `tag-chip-active` |
| Branch | `<mode>/<slug>-issue-<N>` (ADR-0044) | `feat/article-list-issue-12` |

## 2. 에러 코드 PREFIX/SUFFIX

| 도메인 | PREFIX | 예 |
|---|---|---|
| Validation (M9) | `VAL_` | `VAL_TITLE_REQUIRED`, `VAL_BODY_REQUIRED`, `VAL_TITLE_TOO_LONG`, `VAL_AUTHOR_TOO_LONG`, `VAL_TAG_INVALID`, `VAL_ID_INVALID`, `VAL_PAGE_INVALID` |
| Not Found (M7/M10) | `NOT_FOUND_` | `NOT_FOUND_ARTICLE`, `NOT_FOUND_COMMENT` |
| Repository (M8) | `REPO_` | `REPO_INSERT_FAILED`, `REPO_DELETE_FAILED`, `REPO_TRANSACTION_FAILED` |
| Server (M10) | `SRV_` | `SRV_INTERNAL`, `SRV_UNCAUGHT` |
| Database (Prisma) | `DB_` | `DB_UNIQUE_CONSTRAINT`, `DB_CONNECTION_FAILED` |
| Frontend Network | `NET_` | `NET_TIMEOUT`, `NET_OFFLINE` |

**적용 규칙**: 도메인 에러 클래스(`ValidationError`·`NotFoundError`·`RepositoryError`)는 내부 `code` 필드에 위 PREFIX 코드를 저장한다. M10 핸들러가 `code`를 로깅하지만 응답 body에는 *사용자 친화 메시지*만 노출한다 (R-N-02 — 스택·내부 코드 미노출). 사용자 응답은 `{ "error": "<한국어 메시지>" }`만 직렬화.

## 3. 언어 관용구

### TypeScript
- `strict: true` 강제. 단, `strictNullChecks`·`noImplicitAny`는 무조건 ON. `strictPropertyInitialization`은 클래스 사용 최소화로 영향 적음.
- `any` 금지. 외부 라이브러리 타입 부재 시 `unknown` + type guard.
- 비동기는 `async/await` 일관. promise chain 금지.
- `import type` 분리 — type-only import는 `import type {...}`로 명시 (verbatimModuleSyntax 권장).
- enum 대신 union literal 권장 (`type Status = "draft" | "published"`). enum은 외부 호환 필요 시만.
- 함수 시그니처에 반환 타입 명시 (특히 public 함수). 내부 헬퍼는 추론 허용.

### React
- 함수 컴포넌트만 사용. 클래스 컴포넌트 금지 (Error Boundary 제외).
- Props는 inline interface 또는 type alias. `ArticleCardProps`처럼 `<Component>Props` 명명.
- `key`는 안정 ID(article.id) 사용. index key 금지.
- 사이드 이펙트는 `useEffect` 안에서만. 컴포넌트 본문 fetch 금지.
- 커스텀 훅은 `use` prefix.
- 라우터: `<Link>` 컴포넌트 사용. `window.location` 직접 조작 금지.

### Node.js / Express
- `import` (ESM) 사용. CommonJS `require` 금지 (라이브러리 호환 제외).
- 미들웨어는 `async` 시그니처 + `next(err)` 위임 패턴. unhandled rejection 금지.
- `process.env`는 `validateEnv()` 함수에서 한 곳에서만 읽음. 산재 금지.
- file system은 항상 `node:fs/promises`. 동기 API 금지(스크립트 제외).

## 4. 주석 정책

- **R-N-05 한국어 주석 ≥80% (핵심 모듈)** — controllers·services·components·repositories 4개 디렉토리의 *exported 함수·컴포넌트* 헤더에 한국어 의도 주석.
- **주석은 의도(Why) 우선**. What/How는 코드 자체가 표현하므로 반복하지 않음.
- 형식 — JSDoc 단순화. 첫 줄에 한국어 의도, 필요 시 `@param`·`@returns`로 보강.
  ```ts
  /**
   * 글 목록을 페이지·태그로 필터링해 반환한다.
   * 페이지네이션 검증과 태그 정규화는 controller가 위임.
   */
  export async function listArticles(input: ListInput): Promise<ListResult<Article>> { ... }
  ```
- TODO·FIXME는 `// TODO(@username): ...` 형식. 이슈 ID 함께 적기 권장.
- 자동 측정 — `grep -E "^/\*\*|^\s*//" frontend/src/components/**/*.tsx | wc -l` 등 ad-hoc 룰로 PR 시 확인. 12-scaffolding §3에서 정밀화.

## 5. Lint·포맷

| 도구 | 룰셋 | 자동 강제 |
|---|---|---|
| TypeScript | `tsconfig.json` `strict: true` + `noUnusedLocals` + `noUnusedParameters` | `tsc --noEmit` PR 시 CI 강제 |
| ESLint 9 (flat config) | `@typescript-eslint/recommended` + `react/recommended` + `react-hooks/recommended` | `pnpm lint` (pre-commit + CI) |
| Prettier 3 | 기본값 + `printWidth: 100` + `singleQuote: true` + `trailingComma: "all"` | `pnpm format` (pre-commit) |
| Husky + lint-staged | pre-commit hook | `lint-staged` 가 staged 파일에 ESLint + Prettier 자동 적용 |
| Stylelint (Tailwind 사용) | `stylelint-config-recommended` + Tailwind 호환 룰 | `pnpm stylelint` (선택) |
| EditorConfig | UTF-8, LF, indent_size=2 (yaml/json은 2, ts/tsx는 2) | `.editorconfig` 파일 |

**ESLint 핵심 룰 (학습 친화)**
- `no-console`: warn (script·debug 외 console.log 자제). 단 console.error는 허용 (M10 stderr 로깅).
- `no-unused-vars`: error (`_` prefix 변수는 허용).
- `@typescript-eslint/no-explicit-any`: error.
- `react/jsx-key`: error.
- `react-hooks/rules-of-hooks` + `react-hooks/exhaustive-deps`: error.

## 6. Import 정책

- **순서**: (1) Node built-ins → (2) 외부 패키지 → (3) `@/` alias 내부 → (4) 상대 경로 (`./`, `../`). 각 그룹 사이 빈 줄 1줄.
- **alias**: `@/` = `src/` (frontend·backend 각각). tsconfig.json `paths`로 정의.
- **circular import 금지** — `madge` 또는 ESLint `import/no-cycle` (선택) 활용.
- **`import type` 분리** — 타입만 import 시 `import type {...}`. (verbatimModuleSyntax: true 권장)
- **barrel(index.ts) 사용 자제** — 학습 단순성 우선. 명시적 경로 import 선호.
- **side-effect import 명시** — `import "./styles.css"` 같은 경우만 side-effect import 허용. 가장 위에 배치.
