---
doc_type: feature-contract
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

# feat-home-page — Change Contract

> Issue #12 · mode=add · P3. Home placeholder → 실 구현 (글 목록 + 사이드바 + 페이지네이션).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-01 (글 목록 페이지네이션), R-F-04 (태그 필터), R-N-06 (반응형) |
| F-ID | docs/planning/05-prd/05-prd.md | F-01 (글 목록), F-02 (태그 필터), F-08 (인기 태그 사이드바), F-11 (반응형 UI) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M2 §M3 §M4 | M2 FE-pages (Home 실 구현), M3 FE-components (ArticleCard·Pagination·TagList 신설), M4 FE-api-client 사용 (#11 산출) |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | GET /api/articles (listArticles), GET /api/tags (listTags) — read-only |
| 규약 | docs/planning/10-lld-screen-design/10-lld-screen-design.md §2 S-01 + §3 component primitives, docs/planning/11-coding-conventions/11-coding-conventions.md §3 | 10 §2 S-01 layout + 인터랙션 + 반응형 + §3 design token utility (Card·Button·TagChip) 직 적용 |

## 1. 변경 의도

#10 Home placeholder를 실 사용자 노출 페이지로 교체. `useArticles`·`useTags` hook이 #11 api-client 첫 사용처. URL이 상태 source-of-truth (`?page=2&tag=javascript`) — useSearchParams. 5상태 (loading skeleton/error inline/empty "결과 없음"/success/idle) inline 표시. AbortController로 페이지 빠른 클릭 시 이전 요청 취소. 768px 미만 사이드바 stack 반응형. MSW 통합 1건으로 fetch 전체 흐름 검증.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/src/pages/Home.tsx` | placeholder (40 line, sanity 박스) | 실 구현 (~100 line) — useArticles + useTags + 5상태 + Pagination + TagList 배치 |
| `frontend/src/components/ArticleCard.tsx` | 부재 | 신설 — Article props → 카드 (제목·요약·작성자·createdAt·태그칩). `<Link to="/article/:id">` |
| `frontend/src/components/Pagination.tsx` | 부재 | 신설 — `{page, total, limit, onPageChange}` props. < 1 [2] 3 > navigation. 현재 페이지 강조 |
| `frontend/src/components/TagList.tsx` | 부재 | 신설 — `{tags, selectedTag, onTagClick}` props. 인기 태그 칩 목록. 현재 선택 태그 강조 |
| `frontend/src/hooks/useArticles.ts` | 부재 | 신설 — useEffect + apiClient.listArticles + AbortController + 5상태 (idle/loading/success/error/empty) |
| `frontend/src/hooks/useTags.ts` | 부재 | 신설 — useEffect + apiClient.listTags + 5상태 |
| `frontend/package.json` | (#10·#11) | + `msw@^2.6` devDeps |
| `frontend/tests/unit/components/ArticleCard.test.tsx` | 부재 | 신설 — RTL snapshot 1건 (sample Article props) |
| `frontend/tests/unit/components/Pagination.test.tsx` | 부재 | 신설 — RTL snapshot 1건 + onPageChange click 단위 |
| `frontend/tests/unit/components/TagList.test.tsx` | 부재 | 신설 — RTL snapshot 1건 + onTagClick 단위 |
| `frontend/tests/unit/hooks/useArticles.test.ts` | 부재 | 신설 — AbortController + 5상태 전이 단위 (fetch mock) |
| `frontend/tests/integration/home.integration.test.tsx` | 부재 | 신설 — MSW로 /api/articles + /api/tags mock → Home 컴포넌트 mount → 카드 10건 + 사이드바 5건 노출 검증 |
| `frontend/tests/setup/msw.ts` | 부재 | 신설 — MSW server setup 헬퍼 (handlers + listen/close) |
| 단위 합계 | 25 (#11 후) | + 5 (3 snapshot + 1 hook + ...) ≈ 30+ |
| 통합 합계 | 0 (frontend) | + 1 (Home MSW) |
| ui_changed | false (#11) | **true** |
| 부팅 자산 | 무변경 | msw devDeps만 (lock 갱신 — 사용자 위임) |
| 코드 라인 추가 | — | 약 +400 (src) + +300 (test) + +250 (docs) ≈ 950 |
| 09 API spec 정합 | #11 9/9 | 동일 (사용처 확장) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/pages/Home.tsx` | placeholder → 실 구현 (rewrite) | 본 PR |
| `frontend/src/api/client.ts` (#11) | listArticles·listTags 호출 첫 사용처 | 변경 없음 (호출만) |
| `frontend/src/components/Layout.tsx` (#10) | 변경 없음 (그대로 wrap) | 변경 없음 |
| Sprint 3 #13 (Article 상세) | ArticleCard·Layout 재사용 가능 | baseline 제공 |
| Sprint 5 #21 반응형 검증 | 768px stack 패턴 baseline | 향후 |
| Sprint 4 Editor·댓글 UI | Pagination·TagList 패턴 재사용 가능 | 향후 |

## 4. Backward Compatibility

- **Breaking**: no — Home placeholder를 실 구현으로 교체. 외부 호출자 0 (Home은 진입점)
- **마이그레이션**: no
- **API 호출**: 신규 (backend 영향 0 — read-only)
- **버전 bump**: 0

## 5. Rollback 전략

- **Revert 가능**: yes — git revert.
- **데이터 손상 위험**: 없음 (read-only).
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR
  2. `pnpm install` (lock 자동 회귀)
  3. CI green (Home placeholder 회귀 + #11 client 그대로)
- **부팅 자산 회귀**: msw devDeps 제거 — 사용자 install로 자동.

## 6. 비목표

- Article 상세 — #13
- Editor·댓글 — Sprint 4
- 반응형 정밀 검증 — Sprint 5 #21
- E2E — Sprint 5
- Component primitives 분리 — Sprint 4 follow-up
- React Query·SWR — MVP 미도입
- SSR — CSR only
- 이미지 lazy load — 카드 이미지 0
