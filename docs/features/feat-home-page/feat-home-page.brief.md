---
doc_type: feature-brief
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

# feat-home-page — Feature Brief

> Sprint 3 세 번째 이슈 — Issue #12. Home placeholder를 실 글 목록 + 사이드바(인기 태그) + 페이지네이션으로 교체. **첫 실 사용자 노출 페이지**. ui_changed=true (스크린샷 첨부 필수).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (Sprint 3 세 번째 — 큰 PR 2d) |

## 1. 한 줄 의도

Home 페이지 실 구현 — 글 카드 10개 + Pagination + TagList 사이드바 + 5상태(loading/error/empty/success/idle) + URL이 상태 source-of-truth + AbortController 페이지 빠른 클릭 시 이전 요청 취소.

## 2. 사용자 가치

- **방문자**: 첫 페이지에서 최신 글 10개를 한눈에 + 인기 태그로 필터링
- **작성자**: 자기 글이 사이드바 인기 태그를 통해 노출되는 흐름 확인
- **개발자**: useArticles hook + ArticleCard/Pagination/TagList 컴포넌트 — Sprint 3 #13·Sprint 4에서 재사용 baseline

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `frontend/src/pages/Home.tsx` | placeholder (헤딩 + bg-primary-500 sanity 박스) | 실 구현 (loading skeleton → 글 카드 10 + Pagination + TagList + URLSearchParams hooks) |
| `frontend/src/components/ArticleCard.tsx` | 부재 | 신설 — Article 1건 카드 (제목·요약·작성자·createdAt·태그 칩) |
| `frontend/src/components/Pagination.tsx` | 부재 | 신설 — < 1 [2] 3 > navigation. ?page= URL 갱신 |
| `frontend/src/components/TagList.tsx` | 부재 | 신설 — 인기 태그 칩 목록. 클릭 → ?tag= URL 갱신 |
| `frontend/src/hooks/useArticles.ts` | 부재 | 신설 — useEffect + listArticles + AbortController + 5상태 |
| `frontend/src/hooks/useTags.ts` | 부재 | 신설 — useEffect + listTags + 5상태 |
| `frontend/src/components/Layout.tsx` | header + main (#10) | 변경 없음 (그대로 사용) |
| 단위 테스트 | 25 (router 6 + api 19) | + RTL snapshot 3 (ArticleCard·Pagination·TagList) + useArticles hook 단위 2 = 30+ |
| 통합 테스트 | N/A | + MSW 통합 1건 (Home 전체 + 글 10건 + 태그 5건 fetch happy) |
| `frontend/package.json` | (#10·#11 deps) | + msw devDeps (~^2.6) |
| ui_changed | false (#11) | **true** (`.tsx` 변경 + 신규 + RTL/MSW) |
| 부팅 자산 | 변경 없음 | 변경 없음 (msw devDeps만 lock 갱신 필요 — 사용자 위임) |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0) / modify(0 — Home placeholder를 실 구현으로 교체는 *대규모 신설*에 가까움) — 0건
- **라벨**: `type:feature` + `area:frontend` + `priority:P0`
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `frontend/src/{components/{ArticleCard,Pagination,TagList},hooks/{useArticles,useTags}}.tsx/.ts` | 5 신설 파일 |
| 변경 코드 | `frontend/src/pages/Home.tsx` (placeholder → 실 구현) + `frontend/package.json` (msw devDeps) | 2 파일 |
| 신규 테스트 | `frontend/tests/unit/components/*.test.tsx` (3 snapshot) + `hooks/useArticles.test.ts` + `tests/integration/home.integration.test.tsx` (MSW) | 5 파일 |
| pnpm-lock.yaml | msw 1건 추가 — 사용자 위임 (`pnpm install`) | 사용자 commit |
| ui_changed | true | **5번째 axis 강제** — gstack /qa 또는 수동 + 스크린샷 필수 (Home 실 글 목록 화면) |
| 13/02-catalog | F-01·F-02·F-08·F-11 fan-in | docs-update |

## 6. 비목표

- **Article 상세 페이지** — #13에서
- **Editor (작성/수정)** — Sprint 4
- **댓글 UI** — Sprint 4
- **반응형 정밀 검증** — Sprint 5 #21 (본 PR은 768px stack만)
- **E2E** — Sprint 5
- **Component primitives 라이브러리** — Sprint 4 (별 follow-up, #10에서 logged)
- **React Query 등 캐싱** — MVP 단순 fetch + useState
- **SSR** — MVP CSR only
- **이미지 lazy load** — MVP 카드에 이미지 없음

## 7. Open Questions

- **O-H1**: MSW vs vitest fetch mock — 통합 1건은 MSW (실 fetch 흐름 검증), 단위는 fetch mock. → 답: MSW 도입 (DoD-6 명시).
- **O-H2**: URL이 source-of-truth — page/tag를 useState vs useSearchParams. → 답: `useSearchParams` (React Router 6). 사용자 ←→ 버튼 정합 자동.
- **O-H3**: 5상태 표시 — Toast vs inline. → 답: inline (loading skeleton, error message, empty "결과 없음").
- **O-H4**: AbortController — 페이지 변경 빠른 클릭 시 이전 요청 취소. useEffect cleanup에서 abort.
- **O-H5**: Component primitives 미도입 — Button/Card/TagChip 모두 Tailwind utility로 직접 작성. Sprint 4에서 분리 가능.
