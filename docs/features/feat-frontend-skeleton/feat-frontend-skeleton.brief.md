---
doc_type: feature-brief
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

# feat-frontend-skeleton — Feature Brief

> Sprint 3 첫 이슈 — Issue #10. frontend 빈 워크스페이스를 실 동작 가능한 Vite + React + Tailwind + React Router 6 + design token 골격으로 도입. **ui_changed=true 첫 PR** — AI 게이트 5번째 축(브라우저 골든패스 + stylesheet) 본격 발동.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | jungsoobin96@users.noreply.github.com | 초안 (Sprint 3 진입) |

## 1. 한 줄 의도

frontend 골격 도입 — Vite dev 부팅 `:5173` ready + 5 routes(Home·Article·Editor·NotFound + Editor/:id) + Tailwind utility로 10 §3 design token 4종(Color·Typography·Spacing·Component primitives) 적용 + Pretendard 폰트 + ErrorBoundary placeholder.

## 2. 사용자 가치

- **방문자**: brand 일관성 있는 UI (디자인 토큰 매핑) 첫 노출 — bg/text/spacing 통일
- **FE 개발자**: Sprint 3 #11~#13 + Sprint 4 모든 페이지가 본 골격 위에 빌드 — Blocker 해소
- **품질**: stylesheet 적용 baseline + a11y 기본(시맨틱 + focus) + 반응형 컨테이너 준비

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `frontend/package.json` scripts.dev | `echo 'dev script placeholder ...'` | `vite` (실 부팅, :5173) |
| `frontend/package.json` dependencies | `@app/shared` 하나만 | `react@^18` + `react-dom@^18` + `react-router-dom@^6` |
| `frontend/package.json` devDependencies | 0 | `vite@^5` + `@vitejs/plugin-react@^4` + `typescript@^5.6` + `@types/react@^18` + `@types/react-dom@^18` + `tailwindcss@^3.4` + `postcss@^8.4` + `autoprefixer@^10.4` + `@tailwindcss/forms@^0.5` + `vitest@^1` (단위 test) |
| `frontend/index.html` | 부재 | 신설 — Pretendard CDN link + `<div id="root">` + Vite entry script |
| `frontend/src/main.tsx` | 부재 | 신설 — ReactDOM.createRoot + App + styles.css import |
| `frontend/src/App.tsx` | 부재 | 신설 — BrowserRouter + Routes (5 경로) + Layout 컨테이너 |
| `frontend/src/styles.css` | 부재 | 신설 — `@tailwind base/components/utilities` + 10 §3 CSS Variables 토큰 4종 |
| `frontend/tailwind.config.ts` | 부재 | 신설 — theme.extend.colors/fontFamily/fontSize/spacing이 CSS Variables 인용 |
| `frontend/postcss.config.js` | 부재 | 신설 — tailwindcss + autoprefixer |
| `frontend/vite.config.ts` | 부재 | 신설 — plugin-react + dev server 5173 + proxy /api → http://localhost:3000 |
| `frontend/src/router/routes.tsx` | 부재 | 신설 — M1 FE-router. 5 path 정의 + matchRoute 헬퍼 (단위 test 대상) |
| `frontend/src/pages/{Home,Article,Editor,NotFound}.tsx` | 부재 | 신설 — placeholder (제목 + design token utility 적용) |
| `frontend/src/components/{Layout,ErrorBoundary}.tsx` | 부재 | 신설 — 헤더/메인 wrap + React error boundary |
| `frontend/tests/unit/router.test.ts` | 부재 | 신설 — matchRoute 단위 3+ 케이스 |
| `frontend/tsconfig.json` | 빈 placeholder | tsx 지원 + jsx pragma + DOM lib |
| AC: `pnpm --filter @app/frontend dev` | echo placeholder | `Local: http://localhost:5173/` 5초 이내 ready |
| AC: `bg-primary-500` 클래스 | 미적용 | 10 §3 토큰 색상 (`#3b82f6`) 시각 적용 |
| 부팅 자산 (`.env.{dev,stg,prod}.example`) | 무변경 | + `VITE_API_URL` 추가 (12 §6 정합) |
| pnpm-lock.yaml | 변경 0 (Sprint 2 baseline) | **변경 필수 — 사용자 위임 (LLM node PATH 부재)** |
| smoke | dev/stg/prod backend만 | dev backend 그대로 유지 (frontend smoke는 본 PR 미도입, Sprint 5 또는 별 follow-up) |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0 — design *시각 변경*은 새 token 도입이지만 "기존 UI 변경"이 아닌 *신설*) / modify(0)
- **라벨**: `type:feature` + `area:frontend` + `priority:P0`
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**
- **trace**: type:feature + 신설 모듈 9+ 파일 + 기존 동작 변경 0 → add 확정. design 시그널은 *변경*에 가까울 때 발동(다크모드·리브랜딩 등). 본 PR은 *초기 시각 디자인 도입*이라 add 적합.

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `frontend/{index.html,vite.config.ts,tailwind.config.ts,postcss.config.js}` + `src/{main,App,styles.css,router/routes,pages/*,components/{Layout,ErrorBoundary}}` | ~15 신설 파일 |
| 변경 코드 | `frontend/package.json` (scripts + dependencies + devDependencies 대폭) + `frontend/tsconfig.json` (tsx 지원) | 2 파일 |
| 신규 테스트 | `frontend/tests/unit/router.test.ts` | matchRoute 3+ 케이스 |
| 부팅 자산 | `.env.{dev,stg,prod}.example`에 `VITE_API_URL` 추가 | profile 3분기 동기 (ADR-0037 v1.1) |
| LOCAL.md | §3 frontend dev 부팅 안내 추가 | ADR-0040 동기 |
| 12-scaffolding §5·§7 | 본 PR이 §5 frontend dev 명령 실 도입 | 정합 PASS |
| pnpm-lock.yaml | **갱신 필수** | LLM node PATH 부재로 *사용자 PowerShell `pnpm install` + lock commit 위임* |
| AI 게이트 5번째 축 | **첫 발동** — ui_changed=true 첫 PR | stylesheet 적용 근거 명시 + 사용자 브라우저 검증 위임 (gstack /qa 또는 수동) |
| 13/02-catalog | R-F-08·R-N-06·F-11 fan-in 후속 (placeholder 단위 router test) | docs-update에서 |

## 6. 비목표

- **실 페이지 컨텐츠** — Home·Article·Editor 페이지 본문은 Sprint 3 #11·#12·#13에서
- **api-client** — Sprint 3 #11 (`feat-frontend-api-client`)
- **에러 정규화** — #11에서
- **댓글·태그 UI** — Sprint 4
- **반응형 정밀 검증** — Sprint 5 #21
- **E2E 시나리오** — Sprint 5
- **다크 모드** — Phase 2 (10 §5 O-21)
- **Pretendard self-host** — 본 PR은 CDN 사용 (10 §5 O-20). README 재현성과 LCP는 Sprint 5 follow-up
- **frontend smoke** — backend smoke는 Sprint 1 #5. frontend는 Sprint 5 또는 별 follow-up
- **CI workflow** — Sprint 1 follow-up

## 7. Open Questions

- **O-F1**: pnpm-lock.yaml 갱신 — LLM Bash에서 node PATH 부재 → 사용자가 PowerShell에서 `pnpm install` 후 lock을 같은 브랜치에 commit. 사전 합의 (Sprint 1 #5 동일 패턴).
- **O-F2**: React Router 6 `<Routes>` vs `createBrowserRouter` (data router) — MVP는 `<Routes>` (학습 단순). data router는 Phase 2.
- **O-F3**: vite proxy `/api` → backend `:3000` — dev only. stg/prod는 same-origin reverse proxy 가정 (or VITE_API_URL absolute).
- **O-F4**: design token CSS Variables fallback (구브라우저) — Pretendard CDN + IE 미지원 명시. README §보안에 명시.
- **O-F5**: ErrorBoundary는 fail-soft (children render fail 시 fallback UI 노출) vs Sentry 등 외부 송신. 본 PR은 fail-soft만 (MVP).
