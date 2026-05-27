---
doc_type: feature-acceptance
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — AC-01/02/03 + DoD 8항 + 회귀 2항 + 비기능 1항 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: `?tag=javascript` 진입 시 active 칩 시각 + 필터링 (이슈 본문 ①)

- **Given** Home `?tag=javascript` URL 직접 진입 + tags API 응답 ≥ 1건 ("javascript" 포함)
- **When** TagList 사이드바 렌더
- **Then** "javascript" 칩이 `aria-pressed="true"` + `bg-secondary-500 text-neutral-0` (active variant) + ArticleList는 javascript 태그 글만 노출. 측정 방법: RTL `expect(jsBtn).toHaveAttribute('aria-pressed', 'true')` (기존 test) + 사용자 시각 확인.

### AC-02: active 태그 재클릭 → `?tag` 제거 (이슈 본문 ②, **신규 본 PR 핵심**)

- **Given** Home `?tag=javascript` + "javascript" 칩 active
- **When** 같은 "javascript" 칩 click
- **Then** `onTagClick(null)` 호출 → Home `handleTagClick(null)` → `setSearchParams` `?tag` + `?page` 제거 → URL = `/` (전체 목록). 측정 방법: RTL `expect(onTagClick).toHaveBeenCalledWith(null)` (신규 it) + 사용자 시각 확인 (URL 변동 + 전체 글 목록).

### AC-03: `?tag=js&page=2` 직접 진입 시 둘 다 적용 (이슈 본문 ③)

- **Given** Home `?tag=js&page=2` URL 직접 진입
- **When** Home 렌더
- **Then** useArticles `{ page: 2, tag: 'js' }` 호출 + Pagination page=2 표시 + js 태그 글 노출. 측정 방법: 사용자 시각 확인 (Sprint 3 #12 PR #40부터 동작, 본 PR 회귀 무영향).

## 2. Definition of Done (D-06)

| # | 항목 | 검증 |
| --- | --- | --- |
| 1 | TagList.tsx active 분기 1줄 변경 | `git diff main...HEAD frontend/src/components/TagList.tsx` 1줄 |
| 2 | TagList.test.tsx RTL +2 it 추가 | grep test count 6 |
| 3 | `pnpm --filter @app/frontend run test:unit` 85 passed + 1 skipped | AC 측정 자동 |
| 4 | `pnpm typecheck` 0 신규 errors | pre-existing 3건은 #48 분리 |
| 5 | AI 게이트 6축 PASS (5번째 ui_changed=true → gstack /qa 사용자 위임 + 스크린샷, 6번째 3 profile smoke OK) | ai-qa-report §2 |
| 6 | Manual verification + DoD coverage 체크박스 *항상 미체크* | ADR-0046 §2.3 |
| 7 | 사람 Approve + 머지 + 자동 close + 라벨 자동 제거 | P14 휴먼 게이트 + ADR-0029 회귀 |
| 8 | 사용자 직접 검증 — 사이드바 javascript 칩 클릭 → ?tag=javascript → 재클릭 → ?tag 제거 (toggle 동작) | 스크린샷 3장 (before, active, after-toggle) |

## 3. 비기능 인수

- **R-OPS-AUTO-LABEL**: 본 PR open/머지 시 sync-issue-labels.yml 자동 trigger + 이슈 #18 라벨 자동 전이/제거 자연 회귀 (#51 H6 회복 + #52 R-OPS-* 정본 도입 후 정상 동작 확인)

## 4. 회귀 인수

- **회귀-01**: 비-active 태그 클릭 시 `onTagClick(name)` 호출 (기존 동작 보호 — RTL it 6)
- **회귀-02**: 명시적 "필터 해제 ×" 버튼은 그대로 동작 (active 칩 재클릭 toggle과 redundancy 의도 — 양 진입점 보존). 측정 방법: 기존 RTL it 2 (`selectedTag="javascript" → 필터 해제 버튼 노출 + aria-pressed`) PASS 유지
