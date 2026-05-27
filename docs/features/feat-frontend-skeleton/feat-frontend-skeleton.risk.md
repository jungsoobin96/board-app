---
doc_type: feature-risk
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

# feat-frontend-skeleton — Feature Risk

> Issue #10 · mode=add · P7. 큰 PR — High 0 (deps 추가는 표준), Medium 7.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | jungsoobin96@users.noreply.github.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| FE-RISK-01 | pnpm-lock 갱신 누락/실패 → 사용자/CI install 실패 | 5 | 2 | Medium |
| FE-RISK-02 | vite proxy `/api` 설정 누락 → dev에서 backend 호출 실패 (#11 차단) | 4 | 2 | Medium |
| FE-RISK-03 | Tailwind content path 누락 → utility 미생성 → 시각 회귀 | 4 | 2 | Medium |
| FE-RISK-04 | CSS Variables 정의 누락 → token utility (bg-primary-500) 미적용 → 시각 회귀 | 4 | 2 | Medium |
| FE-RISK-05 | tsconfig jsx 설정 누락 → tsx 컴파일 실패 → build 차단 | 5 | 2 | Medium |
| FE-RISK-06 | React StrictMode 중복 mount → useEffect 2번 (#11+에서 발현) | 2 | 4 | Medium |
| FE-RISK-07 | Pretendard CDN 차단 (네트워크) → fallback 폰트 (system-ui) | 2 | 2 | Low |
| FE-RISK-08 | VITE_API_URL 누락 → api-client(#11) undefined | 4 | 2 | Medium |
| FE-RISK-09 | matchRoute 단위 테스트가 BrowserRouter mount 누락 → 실 router와 불일치 (false positive) | 3 | 3 | Medium |
| FE-RISK-10 | 시크릿 노출 (.env 실 파일 commit) | 5 | 1 | Medium |
| FE-RISK-11 | a11y 회귀 (시맨틱 누락 + focus invisible) | 3 | 2 | Low |
| FE-RISK-12 | LOCAL.md §3 + 12-scaffolding §5 frontend dev 동기 누락 → ADR-0040 위배 | 3 | 1 | Low |

High 0. Medium 9 — 모두 mitigation 명시.

## 2. 리스크 상세

### FE-RISK-01: lock 갱신 누락/실패

- **시나리오**: 사용자가 `pnpm install` 미실행 또는 `pnpm-lock.yaml` commit 누락 → 다른 사용자/CI에서 `pnpm install --frozen-lockfile` 실패
- **카테고리**: 운영
- **완화**: PR body Manual verification 1줄로 사용자 위임 절차 명시. plan §4에 정확 명령. 사용자 push 후 LLM이 확인 가능
- **검증**: 사용자 PowerShell 실행 후 `git status` clean 확인

### FE-RISK-02: vite proxy 누락

- **시나리오**: `vite.config.ts`에 `server.proxy` 누락 → `/api/*` 호출 시 vite가 404 → #11 api-client 차단
- **완화**: vite.config.ts에 `proxy: { '/api': 'http://localhost:3000' }` 명시. 본 PR test 0이지만 #11에서 자연 검출
- **검증**: P9 reviewer agent

### FE-RISK-03: Tailwind content path

- **시나리오**: `content` 누락 시 JIT가 utility tree-shake → 빈 CSS → 시각 회귀
- **완화**: `content: ['./index.html', './src/**/*.{ts,tsx}']` 명시
- **검증**: dev 부팅 후 bg-primary-500 시각 확인 (AC-02)

### FE-RISK-04: CSS Variables 정의

- **시나리오**: `:root { --color-* }` 누락 시 Tailwind theme.extend의 `var(--color-primary-500)`가 빈 값
- **완화**: styles.css `:root` 블록 명시 + Tailwind config가 variable 인용
- **검증**: AC-02 시각 확인

### FE-RISK-05: tsconfig jsx 설정

- **시나리오**: `jsx: "preserve"` 또는 `"react-jsx"` 누락 → tsx 컴파일 fail
- **완화**: tsconfig에 `"jsx": "react-jsx"` 명시 + `"lib": ["ES2022", "DOM", "DOM.Iterable"]`
- **검증**: typecheck (사용자 위임)

### FE-RISK-06: StrictMode 중복 mount

- **시나리오**: dev에서 React StrictMode가 effect를 2번 실행 → #11 api-client에서 duplicate request
- **완화**: AbortController 또는 cleanup function 활용 (#11에서 처리). 본 PR은 effect 0
- **검증**: #11 진행 시 명시

### FE-RISK-07: Pretendard CDN 차단

- **시나리오**: 사내 방화벽 등으로 Pretendard CDN 차단 → 시스템 폰트 fallback
- **완화**: font-family에 fallback chain (`-apple-system, system-ui, sans-serif`)
- **검증**: 시각적 가독성 유지

### FE-RISK-08: VITE_API_URL 누락

- **시나리오**: `.env.example`에 VITE_API_URL 없으면 #11 api-client가 undefined → API 호출 실패
- **완화**: 본 PR이 3 profile 모두 추가 (dev/stg=`http://localhost:3000/api`, prod=`/api`)
- **검증**: #11에서 자연 검출

### FE-RISK-09: matchRoute false positive

- **시나리오**: 단위 test가 matchRoute 직 호출만 → 실 BrowserRouter와 path 매칭 로직 불일치 가능
- **완화**: matchRoute가 React Router 6 path-to-regexp 동일 로직 사용. 향후 통합 test (Sprint 5)에서 보강
- **검증**: 단위 5 케이스 PASS + Sprint 5 E2E

### FE-RISK-10: 시크릿 노출

- **시나리오**: 사용자가 실수로 `.env`(non-example) commit
- **완화**: `.gitignore`에 `.env*` 패턴 (Sprint 1 #1 산출). PreToolUse hook이 .env Write 차단
- **검증**: P9 reviewer grep + git status

### FE-RISK-11: a11y 회귀

- **시나리오**: Layout이 `<div>`만 사용 → 시맨틱 손실
- **완화**: contract §2 + plan §5 결정 9에 시맨틱 마크업 명시. P9 reviewer 검토
- **검증**: AC-05 + 사용자 DevTools

### FE-RISK-12: LOCAL.md / 12-scaffolding 동기

- **시나리오**: ADR-0040 양축 SoT 누락 → 다음 PR에서 BLOCK
- **완화**: plan commit 5에 LOCAL.md §3 + 12-scaffolding §5·§7 동기 commit 분리
- **검증**: validate-doc.sh (12-scaffolding)

## 3. High 등급 단계적 롤아웃

High 0 — 불필요.

## 4. 데이터 영속성 변경

- schema 0
- migration 0
- DB 영향 0
- env 키 *추가* (VITE_API_URL) — 기존 키 무변경

## 5. 15-risk.md 갱신 항목

본 PR scope 외. 향후 frontend 관련 시스템 리스크 누적되면 별 진행. 본 PR로 *frontend layer 도입* 마일스톤 도달 — 15-risk에 "frontend 골격 도입 baseline" 1줄 fan-in 권고.
