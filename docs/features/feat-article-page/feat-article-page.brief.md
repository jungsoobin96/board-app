---
doc_type: feature-brief
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-06, R-F-08]
  F-ID: [F-04, F-05]
  supersedes: null
---

# feat-article-page — Feature Brief

> Sprint 3 마지막 — Issue #13. Article 상세 placeholder → 실 본문 + 댓글 목록. **머지 시 Sprint 3 100% COMPLETE** → Sprint 4 진입.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (Sprint 3 마지막) |

## 1. 한 줄 의도

Article 상세 페이지 실 구현 — getArticle + listComments 병렬 + 본문/메타/태그/댓글 목록 + 404 NotFound + 수정/삭제 버튼 mount(핸들러는 Sprint 4).

## 2. 사용자 가치

- **방문자**: Home 카드 클릭 → 글 본문 + 댓글 흐름 완결
- **작성자**: 수정/삭제 버튼 mount (실 동작은 Sprint 4 `feat-editor-page`·`feat-article-delete-ux`)
- **개발자**: useArticle/useComments hook 패턴 — Sprint 4 댓글 작성/삭제 UI에서 재사용 baseline

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `frontend/src/pages/Article.tsx` | placeholder ("Article :id") | 실 구현 — useArticle + useComments + 본문/메타/태그/CommentList + 수정/삭제 버튼 mount |
| `frontend/src/pages/NotFound.tsx` | placeholder (홈으로 Link만) | 변경 없음 (재사용) — useArticle 404 분기에서 NotFound 컴포넌트 직 렌더 |
| `frontend/src/components/CommentList.tsx` | 부재 | 신설 — Comment 배열 props → `<ul>` + 댓글 1건 카드 (body·author·createdAt) |
| `frontend/src/hooks/useArticle.ts` | 부재 | 신설 — getArticle(id) + 5상태 + AbortController signal forwarded |
| `frontend/src/hooks/useComments.ts` | 부재 | 신설 — listComments(articleId) + 5상태 + AbortController |
| 단위 테스트 | 39 + 1 skip = 40 (#12 후) | + RTL Article·CommentList snapshot 2 + useArticle/useComments hook 2 = 44+ |
| 09 API spec 정합 | client 9/9 wrap | 사용처: getArticle·listComments 첫 사용 |
| ui_changed | true (#12) | true (Article.tsx rewrite + CommentList 신설) |
| 부팅 자산 | 변경 없음 | 변경 없음 (msw devDep 그대로) |

## 4. 모드 자동 감지 결과

- **부정 시그널**: 0건
- **라벨**: `type:feature` + `area:frontend` + `priority:P0`
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `frontend/src/{components/CommentList,hooks/{useArticle,useComments}}.tsx/.ts` | 3 신설 파일 |
| 변경 코드 | `frontend/src/pages/Article.tsx` (placeholder → 실 구현) | 1 rewrite |
| 신규 테스트 | RTL Article·CommentList snapshot + useArticle/useComments hook = 4 신설 파일 | |
| 부팅 자산 | 변경 없음 | 0 |
| ui_changed | true | 5번째 axis 강제 — Article 화면 스크린샷 1장 첨부 |
| 13/02-catalog | R-F-03·R-F-06·F-04·F-05 fan-in | docs-update |

## 6. 비목표

- **댓글 작성/삭제 핸들러** — Sprint 4 `feat-comment-create-delete-ui`
- **글 수정·삭제 실 동작** — Sprint 4 `feat-editor-page`·`feat-article-delete-ux` (본 PR은 버튼 mount만)
- **MSW 통합 test** — #12와 동일 vitest jsdom 미작동, skip 패턴 유지
- **반응형 정밀 검증** — Sprint 5 #21
- **E2E** — Sprint 5
- **마크다운 렌더링** (글 본문 markdown 등) — MVP 평문만
- **이미지/첨부 파일** — MVP 글에 이미지 0

## 7. Open Questions

- **O-AP1**: 글 본문 표시 — `<pre>` (whitespace 보존) vs `<div>` (CSS pre-wrap). → 답: `<div>` + `white-space: pre-wrap` (10 §2 S-02 정합).
- **O-AP2**: 404 분기 — `<NotFound />` 직 렌더 vs `<Navigate>`. → 답: 직 렌더 (URL은 `/article/999` 유지, 사용자 history 보존).
- **O-AP3**: 수정/삭제 버튼 동작 — Sprint 4 위임이지만 본 PR에서 mount만 + onClick=()=>{}. 별 #14·#15 PR에서 핸들러 결합.
