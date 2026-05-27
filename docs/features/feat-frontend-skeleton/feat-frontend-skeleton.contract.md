---
doc_type: feature-contract
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-08, R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# feat-frontend-skeleton — Change Contract

> Issue #10 · mode=add · P3. Sprint 3 첫 PR — frontend 빈 워크스페이스에 Vite + React + Tailwind + Router + design token 골격 도입.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | jungsoobin96@users.noreply.github.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-08 (라우팅), R-N-06 (반응형) |
| F-ID | docs/planning/05-prd/05-prd.md | F-11 (반응형 UI) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M1 §M2 §M3 | M1 FE-router (5 path 매칭), M2 FE-pages (4 placeholder), M3 FE-components (Layout·ErrorBoundary placeholder). M4 api-client는 #11에서 |
| 엔드포인트 | (none) — frontend skeleton only, API 호출 0 | (none) |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §3 명명, docs/planning/12-scaffolding/typescript.md §1·§5·§6·§7·§8, docs/planning/10-lld-screen-design/10-lld-screen-design.md §3 design token 4종 | 12 §8 Tailwind + §6 VITE_API_URL + §5 vite dev 명령 + 10 §3 토큰 직 매핑 (ADR-0038 BLOCK) |

## 1. 변경 의도

frontend 빈 워크스페이스(Sprint 1 #1 monorepo 산출, placeholder)를 실 동작 가능한 골격으로 도입. Vite dev → `:5173` ready + 5 routes + Tailwind utility로 10 §3 design token 4종 적용 + Pretendard CDN + ErrorBoundary placeholder. 본 PR은 *컨텐츠 0* — Home·Article·Editor 페이지는 placeholder만 (실 내용은 #12·#13 + Sprint 4). 12 §5 frontend dev 명령(`pnpm --filter @app/frontend dev`) 실 발현. AI 게이트 5번째 축(브라우저 골든패스 + stylesheet) **첫 발동**.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/package.json` scripts | `dev: echo 'placeholder...'`, build/clean | `dev: vite` + `build: tsc -b && vite build` + `preview: vite preview --port 4173` + `preview:stg`/`preview:prod` + `test:unit: vitest run` + `typecheck: tsc --noEmit` |
| `frontend/package.json` dependencies | `@app/shared` 1건 | + `react@^18` + `react-dom@^18` + `react-router-dom@^6` |
| `frontend/package.json` devDependencies | 0 | `vite@^5` + `@vitejs/plugin-react@^4` + `typescript@^5.6` + `@types/react@^18` + `@types/react-dom@^18` + `tailwindcss@^3.4` + `postcss@^8.4` + `autoprefixer@^10.4` + `@tailwindcss/forms@^0.5` + `vitest@^1.6` + `@testing-library/react@^14` + `@testing-library/jest-dom@^6` + `jsdom@^24` |
| `frontend/tsconfig.json` | 빈 placeholder (tsc -b 용) | tsx + DOM lib + jsx: react-jsx + composite |
| `frontend/index.html` | 부재 | 신설 — Pretendard CDN `<link>` + `<div id="root">` + `<script type="module" src="/src/main.tsx">` |
| `frontend/vite.config.ts` | 부재 | 신설 — `@vitejs/plugin-react` + server `{ port: 5173, proxy: { '/api': 'http://localhost:3000' } }` |
| `frontend/tailwind.config.ts` | 부재 | 신설 — `content: ['./index.html', './src/**/*.{ts,tsx}']` + `theme.extend.colors/fontFamily/fontSize/spacing`가 10 §3 CSS Variables 인용 |
| `frontend/postcss.config.js` | 부재 | 신설 — `tailwindcss` + `autoprefixer` |
| `frontend/src/main.tsx` | 부재 | 신설 — `ReactDOM.createRoot(...).render(<React.StrictMode><App /></React.StrictMode>)` + `import './styles.css'` |
| `frontend/src/App.tsx` | 부재 | 신설 — `<BrowserRouter><Layout><Routes>...` 5 path |
| `frontend/src/styles.css` | 부재 | 신설 — `@tailwind base/components/utilities` + `:root { --color-* }` 10 §3 토큰 4종 CSS Variables |
| `frontend/src/router/routes.tsx` | 부재 | 신설 — M1. 5 path 정의 (`/`, `/article/:id`, `/editor`, `/editor/:id`, 미일치 → NotFound) + `matchRoute(path)` 헬퍼 export (단위 test 대상) |
| `frontend/src/pages/Home.tsx` | 부재 | 신설 — placeholder. 헤딩 "Home — 글 목록" + bg-primary-500 utility 적용 예시 (AC-02 검증용) |
| `frontend/src/pages/Article.tsx` | 부재 | 신설 — placeholder. `useParams<{id:string}>` 사용. "Article :id" |
| `frontend/src/pages/Editor.tsx` | 부재 | 신설 — placeholder. 신규/수정 분기 — `useParams<{id?:string}>` |
| `frontend/src/pages/NotFound.tsx` | 부재 | 신설 — placeholder. "찾을 수 없는 페이지" |
| `frontend/src/components/Layout.tsx` | 부재 | 신설 — `<header>`(로고+새 글 nav 링크) + `<main>{children}</main>`. 시맨틱 마크업 |
| `frontend/src/components/ErrorBoundary.tsx` | 부재 | 신설 — `class ErrorBoundary extends React.Component`. fallback UI |
| `frontend/src/index.ts` | placeholder 1줄 | 그대로 (shared export 마커) |
| `frontend/tests/unit/router.test.ts` | 부재 | 신설 — `matchRoute('/article/123')` 등 3+ 케이스 (vitest + jsdom) |
| `frontend/vitest.config.ts` | 부재 | 신설 — `environment: 'jsdom'` |
| `.env.dev.example` | (Sprint 1 #2 산출) | + `VITE_API_URL=http://localhost:3000/api` 추가 |
| `.env.stg.example` | (동일) | + `VITE_API_URL=http://localhost:3000/api` |
| `.env.prod.example` | (동일) | + `VITE_API_URL=/api` |
| `LOCAL.md` §3 dev/stg/prod | backend만 안내 | + frontend dev `pnpm --filter @app/frontend dev` 안내 + preview stg/prod (간략) |
| pnpm-lock.yaml | (Sprint 1 산출) | **갱신 필수 (~50+ 패키지 추가)** — *사용자 PowerShell `pnpm install` 후 같은 브랜치 추가 commit* |
| typecheck | PASS 유지 | PASS (frontend tsx 추가 후) |
| build | PASS 유지 | PASS (vite build 추가) |
| smoke | dev backend ready | 변경 없음 (backend smoke만, frontend는 본 PR scope 외 — Sprint 5 follow-up) |
| 부팅 자산 (12-scaffolding §7 row) | backend only | + frontend dev row 추가 (양축 SoT) |
| 코드 라인 추가 | — | 약 +400 (src/config) + +150 (test/docs) + +50 (lock 사용자 부분 무시) ≈ 550 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/main.tsx` → `App.tsx` → `BrowserRouter` → `Routes` → `pages/*` | 본 PR 신설. 모든 진입 흐름 정의 | 본 PR 새 모듈만, 호출자 0 (FE entry) |
| Sprint 3 #11 `feat-frontend-api-client` | 본 PR 골격 위에 `src/api/client.ts` 추가 — vite proxy `/api` 활용 | 본 PR 마운트 baseline 제공 |
| Sprint 3 #12 `feat-home-page` | Home.tsx placeholder를 본 PR이 도입, 실 컨텐츠는 #12 | placeholder 그대로, #12에서 구현 |
| Sprint 3 #13 `feat-article-page-and-comments-list` | Article.tsx placeholder 유사 | 동일 |
| Sprint 4 모든 FE PR | 본 PR 골격에 의존 | Blocker 해소 |
| Sprint 5 #21 반응형 검증 | 본 PR Tailwind responsive utility baseline 제공 | 향후 |
| backend dev (`:3000`) | vite proxy `/api` → backend. 본 PR test에서는 proxy 미사용 (api-client 부재) | 향후 #11에서 활용 |
| `.env.{dev,stg,prod}.example` | + VITE_API_URL 추가. 기존 키 영향 0 | 본 PR 1 commit |
| `LOCAL.md` §3 | frontend dev row 추가 | 본 PR 1 commit |

## 4. Backward Compatibility

- **Breaking**: no — 신규 모듈만. 기존 backend·docs·LOCAL.md 인터페이스 불변. 단 frontend/package.json의 *placeholder dev script*가 *실 vite*로 변경 — 외부 호출자 0이라 Breaking 아님.
- **마이그레이션**: no — schema·DB 영향 0.
- **API contract 변경**: 0 (api 호출 0).
- **버전 bump**: frontend package.json `0.0.0` → `0.1.0` 고려 — Sprint 3 종료 시 일괄.
- **에러 코드**: 0.

## 5. Rollback 전략

- **Revert 가능**: yes — git revert.
- **데이터 손상 위험**: 없음 — DB·env 영향 0 (env는 키 *추가*만, 기존 키 무변경).
- **부분 롤백**: 단일 PR — 모든 신규 파일이 한 atomic 단위.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR
  2. 사용자 PowerShell `pnpm install` (lock 자동 회귀)
  3. CI green (backend baseline 유지 + frontend placeholder 회귀)
  4. 머지 → 이슈 #10 재오픈
- **부팅 자산 회귀**: env 키 *제거* 시 사용자의 .env.{dev,stg,prod} 로컬 파일에 잔존 — 무해 (vite는 사용 안 함).

## 6. 비목표

- **실 페이지 컨텐츠** — Home·Article·Editor 본문은 #11·#12·#13 + Sprint 4
- **api-client** — Sprint 3 #11
- **댓글·태그 UI** — Sprint 4
- **반응형 정밀 검증** — Sprint 5 #21
- **E2E** — Sprint 5
- **다크 모드** — Phase 2
- **Pretendard self-host** — CDN 사용 (10 §5 O-20)
- **frontend smoke 3 profile** — backend는 Sprint 1 #5. frontend는 Sprint 5 또는 follow-up
- **CI workflow** — Sprint 1 follow-up
- **Sentry·외부 에러 송신** — MVP 범위 외
- **i18n** — 한국어 fixed
