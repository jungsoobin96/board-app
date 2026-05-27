---
doc_type: feature-acceptance
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

# feat-frontend-skeleton — Acceptance Criteria

> Issue #10 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | jungsoobin96@users.noreply.github.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: `pnpm --filter @app/frontend dev` → :5173 ready ≤ 5초

- **Given**: 사용자 PowerShell에서 `pnpm install` 완료 (lock 갱신).
- **When**: `pnpm --filter @app/frontend dev` 실행.
- **Then**: stdout에 `Local: http://localhost:5173/` 라인 5초 이내 출력. 에러 0건.
- **측정 방법**: 수동 확인 (LLM node PATH 부재 → 사용자 P14 위임).
- **R-ID**: R-F-08 (라우팅 baseline), F-11 (반응형 UI baseline).

### AC-02: bg-primary-500 utility → 10 §3 토큰 색상 적용

- **Given**: dev 부팅 후 브라우저로 `http://localhost:5173/` 진입.
- **When**: Home placeholder에 `<div class="bg-primary-500">` 등 utility 노출.
- **Then**: 시각적으로 파란색(`#3b82f6` from `--color-primary-500` CSS Variable) 배경 적용. DevTools에서 computed style이 token 값과 일치.
- **측정 방법**: 수동 확인 (사용자 브라우저 + DevTools — ADR-0011 골든패스 + ADR-0038 stylesheet 적용 근거).
- **R-ID**: R-F-08, F-11 (디자인 시스템).

### AC-03: 5 routes 모두 진입 시 해당 page placeholder 노출

- **Given**: dev 부팅.
- **When**: 브라우저로 5개 path 순차 진입:
  - `/` → Home
  - `/article/1` → Article (params.id=1)
  - `/editor` → Editor (신규)
  - `/editor/42` → Editor (수정 42)
  - `/nonexistent-path` → NotFound
- **Then**: 각 path마다 해당 page placeholder 컨텐츠 노출. URL 변경 정상. 콘솔 에러 0건.
- **측정 방법**: 수동 확인 (gstack /qa 또는 수동) — 사용자 위임.
- **R-ID**: R-F-08.

### AC-04: matchRoute 단위 테스트 5 케이스 PASS

- **Given**: `frontend/src/router/routes.tsx`의 `matchRoute(path)` 함수 export.
- **When**: vitest 실행.
- **Then**: 5 케이스 모두 PASS — `/`→'home', `/article/123`→'article'+params.id='123', `/editor`→'editor', `/editor/42`→'editor'+params.id='42', `/nonexistent`→'notfound'.
- **측정 방법**: 자동 테스트 (`pnpm --filter @app/frontend test:unit`).
- **R-ID**: R-F-08.

### AC-05: a11y 시맨틱 마크업 + focus ring

- **Given**: dev 부팅.
- **When**: 브라우저로 `/` 진입 + Tab 키.
- **Then**: `<header>`·`<nav>`·`<main>` 시맨틱 노드 노출 (DevTools Elements). Tab으로 nav 링크 진입 가능, focus ring 시각 적용 (primary-500 색상).
- **측정 방법**: 수동 확인 (사용자 위임).
- **R-ID**: R-N-06 (a11y 기본).

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — `pnpm --filter @app/frontend test:unit` matchRoute 5 PASS.
- [ ] **통합 테스트** — N/A (본 PR 통합 없음, Sprint 5 E2E).
- [ ] **AI 게이트** 6축:
  - 1축 Build — 사용자 위임 (`pnpm install + pnpm -r build`)
  - 2축 코드 리뷰 — P9 reviewer agent
  - 3축 Test Plan 4블록 — P10
  - 4축 시크릿 스캔 — 본 PR env 키 *추가*만, 시크릿 값 0
  - 5축 **브라우저 골든패스 + stylesheet (ui_changed=true 첫 발동)** — 사용자 위임 (gstack /qa 또는 수동) + stylesheet 근거 `tailwind base.css + 10 §3 토큰 CSS Variables`
  - 6축 로컬 부팅 — 사용자 위임 (backend smoke 그대로 + frontend dev :5173 수동 확인)
- [ ] **Test Plan 4블록** — PR body.
- [ ] **tested 라벨** — 자리 라벨.
- [ ] **Approve** ≥ 1.
- [ ] **CI green** — workflow 미구축 N/A 사유.

## 3. 비기능 인수

- **성능**: dev ready < 5초 (AC-01). 프로덕션 build LCP는 Sprint 5에서 측정.
- **a11y**: 시맨틱 마크업 + focus ring + Pretendard 한국어 친화 (AC-05).
- **반응형**: Tailwind responsive utility 기본 활용. 정밀 검증은 Sprint 5 #21.
- **보안**: env 키 *추가*만. `.env` 자체 commit 0 (`.env.example`만 commit). VITE_ prefix 정합.

## 4. 회귀 인수

- **R-1**: backend 9 endpoint + cascade + error schema integration 22+12 = 34+ passed 유지.
- **R-2**: 단위 49+ baseline 유지.
- **R-3**: smoke 3 profile dev/stg/prod ready 회귀 0 (backend 영향 0).
- **R-4**: typecheck + build PASS (frontend 추가 후).
- **R-5**: 부팅 자산 동기 (LOCAL.md §3 + 12-scaffolding §5·§7 + .env 3 profile).
- **R-6**: lock 갱신 후 `pnpm install --frozen-lockfile` PASS (사용자 검증).
