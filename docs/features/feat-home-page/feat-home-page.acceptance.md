---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04, R-N-06]
  F-ID: [F-01, F-02, F-08, F-11]
  supersedes: null
---

# feat-home-page — Acceptance Criteria

> Issue #12 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: GET / → 카드 10 + 페이지네이션 + 사이드바

- **Given**: backend에 글 15+ 시드 + 태그 5+ 시드 (seed.ts 또는 사용자 사전 시드).
- **When**: 브라우저 `http://localhost:5173/` 진입.
- **Then**: ArticleCard 10건 노출 + Pagination (1·2·다음) + 사이드바 TagList (인기 태그 5건+) 노출. 1초 이내 응답.
- **측정 방법**: 수동 확인 (사용자 P14 위임, ui_changed=true).
- **R-ID**: R-F-01, R-F-04, F-01·F-02·F-08.

### AC-02: "다음" 클릭 → ?page=2 + 11~20번째 글

- **Given**: AC-01 상태.
- **When**: Pagination "2" 또는 "다음" 클릭.
- **Then**: URL `?page=2` 갱신 + 카드 11~20번째 노출. brower history.back으로 1페이지 복귀 가능.
- **측정 방법**: 수동 확인 + Pagination.test.tsx onPageChange.
- **R-ID**: R-F-01, F-01.

### AC-03: 태그 클릭 → /?tag=name + 필터링

- **Given**: AC-01 상태.
- **When**: 사이드바 인기 태그 칩 (예: "javascript") 클릭.
- **Then**: URL `/?tag=javascript` 갱신 + 카드 목록이 해당 태그 글만 필터링.
- **측정 방법**: 수동 확인 + TagList.test.tsx onTagClick.
- **R-ID**: R-F-04, F-02.

### AC-04: `?tag=ghost` (존재 X 태그) → "결과 없음"

- **Given**: `?tag=ghost` URL 직접 진입.
- **When**: Home mount.
- **Then**: listArticles 응답 `articles: [], total: 0` → ArticleCard 0건 + inline "결과 없음" 메시지 노출. error 아님 (empty 상태).
- **측정 방법**: 수동 확인 + integration MSW.
- **R-ID**: R-F-04.

### AC-05: 768px 미만 사이드바 stack

- **Given**: 브라우저 viewport 360px (모바일).
- **When**: `/` 진입.
- **Then**: 글 목록 + 사이드바가 세로 stack. 가로 스크롤 0.
- **측정 방법**: 수동 확인 (DevTools device emulation).
- **R-ID**: R-N-06, F-11.

### AC-06: RTL snapshot 3 + useArticles hook 단위 PASS

- **Given**: vitest 실행.
- **When**: `pnpm --filter @app/frontend test:unit`.
- **Then**: ArticleCard/Pagination/TagList snapshot 3 + useArticles 상태 전이 단위 PASS.
- **측정 방법**: 자동 테스트.
- **R-ID**: R-F-01, R-F-04.

### AC-07: MSW Home 통합 1건 PASS

- **Given**: MSW handlers (`/api/articles` + `/api/tags` happy).
- **When**: Home 컴포넌트 mount + useEffect fetch.
- **Then**: 카드 N건 + 사이드바 N건 + Pagination active page 검증.
- **측정 방법**: 자동 테스트 (home.integration.test.tsx).
- **R-ID**: R-F-01, R-F-04.

## 2. Definition of Done (D-06)

- [ ] **단위** — frontend 30+ passed (기존 25 + 신규 5+).
- [ ] **통합** — frontend 1 (MSW Home).
- [ ] **AI 게이트** 6축:
  - 1·2축 사용자 위임
  - 3축 ✅
  - 4축 ✅ (시크릿 0)
  - 5축 **ui_changed=true 강제** — 사용자 브라우저 검증 + 스크린샷 (Home 카드 10 + 사이드바)
  - 6축 사용자 위임 (msw devDeps lock 갱신)
- [ ] Test Plan 4블록.
- [ ] tested 라벨 자리.
- [ ] Approve ≥ 1.
- [ ] CI green N/A.

## 3. 비기능 인수

- 성능: 첫 페이지 응답 < 1초 (15 시드 가정).
- a11y: header·nav·main 시맨틱 (#10) + ArticleCard `<article>` + Pagination `<nav aria-label="페이지네이션">`.
- 반응형: 768px 미만 stack (AC-05).

## 4. 회귀 인수

- R-1: backend 9 endpoint baseline 회귀 0.
- R-2: frontend matchRoute 6 + api 19 = 25 unit 회귀 0.
- R-3: smoke 3 profile baseline 유지 (backend 영향 0).
- R-4: typecheck + build PASS.
- R-5: msw devDeps 추가만 — 기존 의존성 영향 0.
- R-6: 10 §2 S-01 layout 정합.
