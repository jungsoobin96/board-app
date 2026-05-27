---
doc_type: feature-contract
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

# 태그 필터 UX 마무리 + URL state (Issue 18) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — TagList active 분기 1줄 + RTL 2건 + 회귀 모두 PASS |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-F-01 (글 목록), R-F-04 (태그 API) |
| F-ID (기능) | 05-prd | F-02 (태그 필터), F-08 (인기 태그 사이드바) |
| 영향 모듈 | 08-lld-module-spec | frontend/components/TagList, frontend/pages/Home (Home은 read-only 참조) |
| 영향 엔드포인트 | 09-lld-api-spec | (none — frontend UI 변경, BE 무관) |
| 적용 컨벤션 절 | 11-coding-conventions | (none — 기존 패턴 답습) |

## 1. 변경 의도

사이드바 TagList의 active 태그 칩 재클릭 시 `onTagClick(null)` 호출하여 `?tag` 쿼리 해제 동작 추가. URL state(useSearchParams) 양방향 sync는 Sprint 3 #12 PR #40에서 이미 구현됨 — 본 PR은 active 칩 toggle 동작 정합 마무리.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| TagList active 칩 onClick | `onClick={() => onTagClick(tag.name)}` — active든 비-active든 같은 호출 | `onClick={() => onTagClick(active ? null : tag.name)}` — active면 해제, 비-active면 선택 |
| active 칩 재클릭 사용자 경험 | URL 무변동 (set과 같은 효과, 무동작 인지 부담) | `?tag` 제거 + `?page` 초기화 → 전체 목록 노출 |
| 별도 "필터 해제 ×" 버튼 | 사이드바 상단에 있음 (active 시 노출) | 변경 없음 — 명시적 해제 진입점 보존 (redundancy 의도) |
| 비-active 칩 onClick | `onTagClick(tag.name)` | 동일 (변경 없음) |
| `aria-pressed` | active 시 `true` | 동일 (변경 없음) |
| 단위 테스트 (TagList) | 4 it (snapshot + selectedTag 노출 + onTagClick(name) + 빈 배열) | 6 it (+ active 재클릭 onTagClick(null) + 비-active 선택 회귀) |
| Home handleTagClick(null) | `params.delete('tag') + params.delete('page')` | 동일 (재사용) |
| `?tag` + `?page` 동시 적용 | 가능 (직접 URL 진입) | 동일 |
| 단위 카운트 frontend | 83 passed + 1 skip | **85 passed + 1 skip** (+2) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/components/TagList.tsx` line 38 | active 분기 onClick 1줄 | 본 PR diff |
| `frontend/tests/unit/components/TagList.test.tsx` | RTL 4 it → 6 it (+2 신규: active 재클릭 해제 / 비-active 선택) | 본 PR diff |
| `frontend/src/pages/Home.tsx` handleTagClick | 변경 없음 — `onTagClick(null)` 분기 이미 처리 | 영향 없음 |
| `frontend/tests/integration/home.integration.test.tsx` | 변경 없음 — 통합 테스트는 currently skipped (MSW + vitest jsdom #11 follow-up) | 영향 없음 |
| `frontend/tests/unit/components/__snapshots__/TagList.test.tsx.snap` | 변경 없음 — onClick handler 변경, 시각 동일 | 영향 없음 |
| `docs/planning/13-test-design/02-catalog.md` §1 단위 F-02·F-08 | 기존 fan-in 그대로, RTL 시나리오 +2 흡수 (별도 row 추가 불필요 — 기존 시나리오 정합) | 영향 없음 |
| `docs/features/feat-tag-filter-url-state/*.md` | 신설 8건 (brief·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 mode=add N/A) | 본 PR diff |

## 4. Backward Compatibility

- Breaking: **no** — `onTagClick` prop 시그니처 `(name: string \| null) => void` 그대로. 호출처(Home)는 null 처리 이미 구현. UI 시각 변화 없음 (onClick handler만 변경)
- 마이그레이션 필요: **no**
- 사용자 노출: 직관적 toggle UX 강화 — 기존 "필터 해제 ×" 버튼은 보존 (redundancy로 양 진입점 제공)
- 영향 사용자: Home 사이드바 사용자 (전 사용자)

## 5. Rollback 전략

- revert 가능: **yes** — `git revert <merge-sha>`로 TagList.tsx 1줄 + RTL 2 it 일괄 제거
- rollback 절차 (1단계): `git revert <PR-#-merge-sha>` → active 칩 재클릭 동작 원복
- 데이터 손상 위험: **없음** — 클라이언트 사이드 UI 변경, BE 무관

## 6. 비목표

- 다중 태그 선택 (multi-select) — RealWorld 원본 단일 태그만, MVP scope 밖
- 태그 정렬·필터 변경 — F-08 backend `_count.articleTags` orderBy 그대로
- TagList 색상/spacing 디자인 토큰 변경 — 별 PR(ADR-0038 §10 LLD)
- 키보드 navigation Tab/Enter 보강 — Sprint 6+ a11y 후보
- E2E Playwright 시나리오 — Sprint 5 #21에서 일괄
- "필터 해제 ×" 버튼 제거 — redundancy 의도 보존 (active 칩 재클릭 + 명시적 버튼 양 진입점)
