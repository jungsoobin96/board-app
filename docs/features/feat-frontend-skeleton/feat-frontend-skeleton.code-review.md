---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer@agent.local
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-08, R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# feat-frontend-skeleton — Code Review

> Issue #10 · mode=add · Sprint 3 first PR. 5 commits, +515 / -4 lines, 22 files. reviewer: claude-reviewer-agent (Generator != Evaluator).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | claude-reviewer@agent.local | 독립 코드 리뷰 (8단계) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: claude-reviewer@agent.local
- **review_at**: 2026-05-27
- **summary**: 17 신규 + 5 변경 파일. Contract Before/After 25 항목 전수 반영. AC-01~05 매핑 정합. 보안 위반 0. 코딩 컨벤션 11 준수. MAJOR 0, MINOR 3, INFO 5. 사용자 위임 항목(pnpm-lock, 브라우저 골든패스) 명확 분리. PASS 판정.

## 1. 컨트랙트 충실도

### 1.1 Before/After 검증

Contract §2의 25 항목을 실 diff 대비 전수 검증.

| # | 항목 | Contract 기대 | 실 diff | 판정 |
|---|---|---|---|---|
| 1 | package.json scripts.dev | `vite` | `"dev": "vite"` | OK |
| 2 | package.json scripts.build | `tsc -b && vite build` | `"build": "tsc -b && vite build"` | OK |
| 3 | package.json scripts.preview | `vite preview --port 4173` | 3종(preview/preview:stg/preview:prod) | OK |
| 4 | package.json scripts.test:unit | `vitest run` | `"test:unit": "vitest run"` | OK |
| 5 | package.json scripts.typecheck | `tsc --noEmit` | `"typecheck": "tsc --noEmit"` | OK |
| 6 | package.json deps react | `^18` | `"react": "^18.3.1"` | OK |
| 7 | package.json deps react-dom | `^18` | `"react-dom": "^18.3.1"` | OK |
| 8 | package.json deps react-router-dom | `^6` | `"react-router-dom": "^6.27.0"` | OK |
| 9 | devDeps vite | `^5` | `"vite": "^5.4.10"` | OK |
| 10 | devDeps tailwindcss | `^3.4` | `"tailwindcss": "^3.4.14"` | OK |
| 11 | devDeps vitest | `^1.6` (contract) | `"vitest": "^2.1.4"` (code) | INFO-CR-01 (코드가 상위, 정합) |
| 12 | devDeps @testing-library/react | `^14` (contract) | `"@testing-library/react": "^16.0.1"` | INFO-CR-01 |
| 13 | devDeps jsdom | `^24` (contract) | `"jsdom": "^25.0.1"` | INFO-CR-01 |
| 14 | devDeps typescript | `^5.6` (contract) | workspace root 제공, frontend devDeps 미포함 | INFO-CR-02 |
| 15 | index.html | Pretendard CDN + root div + module script | 정합 | OK |
| 16 | vite.config.ts | plugin-react + :5173 + proxy /api | 정합 + strictPort: true | OK |
| 17 | tailwind.config.ts | content + theme.extend + 10 §3 토큰 인용 | 정합 | OK |
| 18 | postcss.config.js | tailwindcss + autoprefixer | 정합 | OK |
| 19 | main.tsx | StrictMode + App + styles.css import | 정합 | OK |
| 20 | App.tsx | BrowserRouter + Routes 5 path | Routes는 routes.tsx 분리, App은 Layout+ErrorBoundary 조립 | OK (구조 개선) |
| 21 | styles.css | @tailwind 3 directives + :root 4종 토큰 | 정합 (12 Color + 12 Typography + 7 Spacing = 31 variables) | OK |
| 22 | routes.tsx + pages/* | M1 5 path + matchRoute | 정합 | OK |
| 23 | components | Layout + ErrorBoundary | 정합 (시맨틱 + class component) | OK |
| 24 | .env.*.example | +VITE_API_URL + VITE_APP_TITLE | 3 profile 모두 추가 | OK |
| 25 | LOCAL.md | frontend dev row | v0.4 변경 이력 추가 | OK |

**충실도 점수**: 25/25 반영. Contract 기대 대비 코드가 더 최신 버전 채택한 항목 3건(INFO).

### 1.2 Plan §1 커밋 시퀀스 검증

| Plan # | Plan 메시지 | 실 commit | 판정 |
|---|---|---|---|
| 1 | `feat(frontend): vite + react + tsconfig + package.json deps` | 7bb7f34 | OK |
| 2 | `feat(frontend): tailwind + postcss + 10 §3 design token` | 1c2c24e (4종 명시) | OK |
| 3 | `feat(frontend): router 5 path + pages placeholder` | e562f65 (+ App.tsx) | OK |
| 4 | `feat(frontend): Layout + ErrorBoundary + matchRoute 단위` | 5310b45 (+ vitest config) | OK |
| 5 | `feat(infra): .env + LOCAL.md + 12-scaffolding 동기` | 1302a00 | OK |
| 6 | `docs(plan): ...` | 미실행 (P10 사용자 위임) | OK (plan §1 명시) |

5/6 LLM commits 실행. Commit 6 (docs)는 plan에서 P10 위임 명시. 정합.

### 1.3 AC 매핑 검증

| AC | 코드 근거 | 판정 |
|---|---|---|
| AC-01 | vite.config.ts `port: 5173, strictPort: true` + index.html entry + main.tsx ReactDOM.createRoot | OK (사용자 실행 위임) |
| AC-02 | Home.tsx `bg-primary-500` class + styles.css `--color-primary-500: #3b82f6` + tailwind.config.ts `primary.500: var(--color-primary-500)` | OK (chain 정합) |
| AC-03 | routes.tsx: 5 Route 정의 (`/`, `/article/:id`, `/editor`, `/editor/:id`, `*`) | OK |
| AC-04 | router.test.ts: 6 케이스 (5 required + 1 slug 형식 bonus) | OK (AC 요구 5, 실제 6) |
| AC-05 | Layout.tsx: `<header>`, `<nav aria-label="주요 메뉴">`, `<main>` + styles.css `*:focus-visible` primary-500 outline | OK |

### 1.4 Module 매핑

| Module | Contract 기대 | 실 구현 | 판정 |
|---|---|---|---|
| M1 FE-router | 5 path + matchRoute | routes.tsx 5 Route + matchRoute function | OK |
| M2 FE-pages | 4 placeholder | Home, Article, Editor, NotFound (4 files) | OK |
| M3 FE-components | Layout + ErrorBoundary | 2 components in components/ | OK |

## 2. 테스트 커버리지

### 2.1 단위 테스트 (router.test.ts)

| # | 테스트 케이스 | 검증 대상 | AC 매핑 |
|---|---|---|---|
| 1 | `/ -> home` | matchRoute('/') | AC-04 |
| 2 | `/article/123 -> article + id=123` | matchRoute('/article/123') | AC-04 |
| 3 | `/editor -> editor (params 없음)` | matchRoute('/editor') | AC-04 |
| 4 | `/editor/42 -> editor + id=42` | matchRoute('/editor/42') | AC-04 |
| 5 | `/nonexistent -> notfound` | matchRoute('/nonexistent') | AC-04 |
| 6 | `/article/abc-with-dashes -> article + slug 허용` | matchRoute('/article/abc-with-dashes') | AC-04 (bonus) |

6 케이스. AC-04 요구 5+ 충족. vitest + jsdom 환경. BrowserRouter mount 없이 순수 함수 테스트.

### 2.2 미비 사항

- **MINOR-CR-01**: trailing slash 케이스 미포함. `matchRoute('/editor/')` 는 `notfound` 반환하나, React Router 6는 `/editor/` 를 `/editor` 로 매칭함. FE-RISK-09에서 식별 + Sprint 5 E2E 보강 명시. 본 PR merge blocking은 아니나 향후 보강 필요.
- 통합 테스트: N/A (contract §6 비목표 명시, API 호출 0).
- E2E: N/A (Sprint 5 범위).

### 2.3 테스트 인프라

- vitest.config.ts: `environment: 'jsdom'`, `globals: false`, `include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']`. 향후 component test 대비 정합.

## 3. 보안 / 시크릿

### 3.1 시크릿 스캔

| 점검 항목 | 결과 |
|---|---|
| `.env` 실 파일 commit | 0 (.env.*.example만) |
| `.gitignore` 패턴 | `.env` + `.env.*` + `!.env.example` + `!.env.*.example` 정합 |
| 시크릿 값 하드코딩 | 0 (URL placeholder만: `http://localhost:3000/api`, `/api`) |
| API key / token | 0 |
| VITE_ prefix | 정합 (client 노출 의도, VITE_API_URL + VITE_APP_TITLE) |
| console.log 민감 정보 | 0 (console.error는 ErrorBoundary에서 error info만 출력) |

### 3.2 OWASP / XSS

- JSX auto-escape: React 기본 동작. `dangerouslySetInnerHTML` 사용 0.
- CDN 링크: Pretendard `cdn.jsdelivr.net` -- 신뢰 CDN. SRI(Subresource Integrity) hash 미적용 (**INFO-CR-03**: follow-up 권고, Sprint 5+).
- vite proxy `changeOrigin: false`: localhost-to-localhost 정합. SSRF 위험 0 (dev only).

### 3.3 판정

보안 위반 0. INFO 1건 (SRI hash).

## 4. 가독성 / 단순성

### 4.1 코딩 컨벤션 11 검증

| # | 규칙 | 판정 | 근거 |
|---|---|---|---|
| 1 | 파일명 PascalCase (FE 컴포넌트) | OK | Home.tsx, Layout.tsx, ErrorBoundary.tsx 등 |
| 2 | 파일명 camelCase (유틸) | OK | routes.tsx (router 디렉토리) |
| 3 | 한국어 주석 >= 80% (핵심 모듈) | OK | 모든 파일 헤더에 한국어 의도 주석 |
| 4 | 주석은 의도(Why) 우선 | OK | "BrowserRouter + Layout + Routes 조립", "children render fail을 fallback UI로 흡수" 등 |
| 5 | React 함수 컴포넌트만 (ErrorBoundary 제외) | OK | ErrorBoundary만 class (React Hook 미지원 명시) |
| 6 | Props interface 명명 | OK | `LayoutProps`, `Props` (ErrorBoundary) |
| 7 | `<Link>` 사용 (window.location 금지) | OK | Layout, NotFound에서 `<Link>` 사용 |
| 8 | import 순서 | OK | 외부 패키지 -> 내부 상대 경로 |
| 9 | `import type` 분리 | OK | `import type { ReactNode }`, `import type { Config }` |
| 10 | strict: true | OK | tsconfig.base.json `strict: true` 상속 |
| 11 | side-effect import 명시 | OK | main.tsx `import './styles.css'` |

### 4.2 구조 분석

- **파일 분할**: 22 파일 / 515 줄 -- 파일당 평균 23줄. 적절한 granularity.
- **컴포넌트 책임 분리**: App(조립) / Layout(shell) / ErrorBoundary(fail-soft) / pages(placeholder) / routes(경로 정의). SRP 준수.
- **config 파일 분리**: vite.config.ts / vitest.config.ts / tailwind.config.ts / postcss.config.js / tsconfig.json -- 각 도구별 독립 설정. 관심사 분리 정합.
- **JSX.Element 반환 타입**: 명시적 반환 타입 `JSX.Element` 사용. 컨벤션 11 §3 "public 함수 반환 타입 명시" 준수.

### 4.3 사소한 관찰

- **MINOR-CR-02**: `frontend/src/index.ts` placeholder (`export const SCAFFOLD_OK = true;`)가 잔존. Vite는 index.html을 entry로 사용하므로 런타임 영향 0이나, dead export. 삭제 권고 (Sprint 3 내 cleanup).
- **INFO-CR-04**: ErrorBoundary의 Props interface 이름이 `Props`로 generic. `ErrorBoundaryProps` 권고 (컨벤션 11 §3 React `<Component>Props` 명명). MINOR 수준이나 skeleton이므로 follow-up.

### 4.4 design token chain 검증

```
10 §3 토큰 정의
    -> styles.css :root CSS Variables (31 variables)
        -> tailwind.config.ts theme.extend (colors/fontFamily/fontSize/fontWeight/spacing)
            -> component classes (bg-primary-500, text-neutral-700, etc.)
```

Chain 무결성 확인. CSS Variables가 SoT, Tailwind는 래퍼. 다크 모드 확장 시 `:root` 만 갱신 가능.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-CR-01: matchRoute trailing slash 불일치 (/editor/ -> notfound vs React Router 매칭) | O | X | O | B. Same-area: router.test.ts 보강 (Sprint 5 E2E와 함께). FE-RISK-09 기존 식별 |
| MINOR-CR-02: frontend/src/index.ts placeholder 잔존 (dead export SCAFFOLD_OK) | O | X | O | B. Same-area: Sprint 3 cleanup commit 권고 |
| MINOR-CR-03: ErrorBoundary Props interface -> ErrorBoundaryProps 명명 권고 | O | X | O | B. Same-area: Sprint 3 후속 PR에서 rename |
| INFO-CR-01: contract devDeps 버전 vs 실 코드 (vitest ^1.6 -> ^2.1, testing-library/react ^14 -> ^16, jsdom ^24 -> ^25) | O | X | O | C. None: 코드가 더 최신, contract 정합 불요 (contract는 최소 baseline) |
| INFO-CR-02: contract에 typescript@^5.6 devDeps 명시 vs workspace root 제공 | O | X | O | C. None: monorepo workspace root 관리 정합 |
| INFO-CR-03: Pretendard CDN link에 SRI (Subresource Integrity) hash 미적용 | O | X | O | A. Derived: Sprint 5+ follow-up (보안 강화) |
| INFO-CR-04: ErrorBoundary console.error는 dev only 의도 -- prod에서 noise 가능 | O | X | O | C. None: Sentry 등 Phase 2 명시 (contract §6) |
| INFO-CR-05: @tailwindcss/forms plugin 포함하나 본 PR에서 form 사용 0 | O | X | O | C. None: Sprint 4 Editor 대비 선행 설치 (scope creep 아님) |

## 6. NEEDS-WORK 항목

없음. MAJOR 0. MINOR 3건 모두 non-blocking (기존 risk에서 식별 + follow-up 명시). PASS 판정.

### 종합 점수표

| 축 | 점수 | 비고 |
|---|---|---|
| 컨트랙트 충실도 | 25/25 | Before/After 전수 반영 |
| 테스트 커버리지 | 6/5+ (AC-04) | 요구 초과 |
| 보안 / 시크릿 | CLEAN | 위반 0 |
| 가독성 / 단순성 | GOOD | 컨벤션 11 전수 준수 |
| 커밋 시퀀스 | 5/5 (code) + 1 docs 위임 | plan 정합 |
| AC 매핑 | 5/5 | AC-01~05 전수 커버 |
| Risk mitigation | 12/12 | FE-RISK-01~12 모두 코드 근거 확인 |
| 부팅 자산 동기 | 3 profile 정합 | ADR-0037 v1.1 + ADR-0040 |

### AI 게이트 5번째 축 참고 (reviewer 소관 외)

- `ui_changed=true` 첫 발동 확인.
- stylesheet >= 1: styles.css (Tailwind base + 31 CSS Variables) 확인. ADR-0038 충족.
- `golden_path_verified`: 사용자 P14 위임 (reviewer agent는 브라우저 실행 불가). gstack /qa 또는 수동 검증 필요.
- screenshots: 사용자 위임.

### AI 게이트 6번째 축

- `.env.{dev,stg,prod}.example`: 3 profile 모두 VITE_API_URL + VITE_APP_TITLE 추가. 동기 정합.
- LOCAL.md v0.4: frontend 도입 반영.
- 12-scaffolding v0.3: frontend 골격 실 도입 반영.
- 부팅 자산 same-PR 동기: commit 5 (1302a00)에서 일괄 처리. ADR-0040 충족.
