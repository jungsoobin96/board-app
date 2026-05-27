---
doc_type: feature-brief
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

# 태그 필터 UX 마무리 + URL state (Issue 18) — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — TagList active 칩 재클릭 해제 동작 추가 (URL state는 이미 구현) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

사이드바 TagList의 active 태그 칩 재클릭 시 `?tag` 쿼리 제거(해제) 동작을 추가하여 태그 필터 UX 마무리.

## 2. 사용자 가치

- "javascript" 칩이 active일 때 다시 클릭하면 필터 해제 — 직관적 toggle UX
- `?tag` 해제 시 URL 쿼리도 제거 → 북마크/공유 시 의도 보존
- 현재는 active 칩 재클릭 시 같은 set 호출(무동작 인지 부담)인데, 해제 동작으로 ConfirmModal(#15) 같은 toggle 패턴 일관성 강화

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| TagList active 칩 재클릭 동작 | `onTagClick(tag.name)` — 같은 tag로 set, URL 무변동 | `onTagClick(null)` — 해제 신호 |
| Home handleTagClick(null) 동작 | 이미 구현됨 (params.delete('tag') + page=1 reset) | 변경 없음 |
| URL `?tag` sync | useSearchParams 기반 양방향 (Sprint 3 #12 PR #40부터) | 변경 없음 (재사용) |
| URL `?page` + `?tag` 동시 적용 | 이미 가능 (handlePageChange + handleTagClick) | 변경 없음 |
| 단위 테스트 카운트 | 83 passed + 1 skipped (Sprint 4 baseline) | 85 passed + 1 skipped (+2 신규: active 재클릭 해제 / 비-active 선택) |

## 4. 모드 자동 감지 결과

- 부정 시그널: type:bug=No / UI키워드=No (TagList는 컴포넌트지만 신규 UI 아님) / modify="마무리" 1건 / type:feature 라벨=Yes
- 충돌 0건 → ADR-0032 규칙 1·2 부정, 규칙 3(modify) + 규칙 4 기본값(add) 충돌 1건만 발생
- **결정: mode=add** (type:feature 라벨 우선 — ADR-0032 규칙 4 기본값). modify 시그널은 contract Before/After가 회귀 흡수
- Mode Decision Trace: type:feature 라벨 + 자연어 "마무리"의 modify 시그널 → 단일 시그널 충돌이라 BLOCK 안 됨 → 무질문 add 진행

## 5. 영향 범위

- `frontend/src/components/TagList.tsx` (active 분기 onClick 한 줄 변경)
- `frontend/tests/unit/components/TagList.test.tsx` (RTL 2건 추가: active 재클릭 해제 + 비-active 선택 확인)
- `frontend/src/pages/Home.tsx` (변경 없음 — handleTagClick(null) 이미 구현)
- `frontend/tests/unit/components/__snapshots__/TagList.test.tsx.snap` (스냅샷 변동 없음 — 시각 동일, onClick handler만 변경)
- 13/02-catalog §1 단위 — F-02·F-08·R-F-04 추가 fan-in (RTL 2건)
- 04-srs / 05-prd / ADR — 변경 없음 (기존 R-F-04 / F-02·F-08 acceptance 정합)

## 6. 비목표

- TagList 색상/spacing/디자인 토큰 변경 — token 변경은 별 PR(ADR-0038 §10 LLD)
- 다중 태그 선택 (multi-select) — RealWorld 원본 단일 태그만, 본 MVP scope 밖
- 인기 태그 정렬/필터 변경 — F-08은 backend `_count.articleTags` orderBy + take 20 그대로 유지
- 키보드 navigation (Tab/Enter) 별도 보강 — a11y 추가 보강은 Sprint 6+ 후보
- E2E Playwright 시나리오 추가 — Sprint 5 #21에서 일괄 처리

## 7. Open Questions

(없음 — TagList active 분기 1줄 + RTL 2건 단순 작업, modify Strict Rule N/A)
