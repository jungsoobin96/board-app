---
doc_type: feature-contract
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

# feat-article-page — Change Contract

> Issue #13 · mode=add · P3.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-03 (글 상세), R-F-06 (댓글 인터페이스), R-F-08 (라우팅) |
| F-ID | docs/planning/05-prd/05-prd.md | F-04 (글 상세), F-05 (댓글 — 목록만, 작성/삭제는 Sprint 4) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M2 §M3 §M4 | M2 Article 페이지·NotFound 재사용, M3 CommentList 신설, M4 api-client #11 사용 |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | GET /api/articles/:id (getArticle), GET /api/articles/:id/comments (listComments) — read-only |
| 규약 | docs/planning/10-lld-screen-design/10-lld-screen-design.md §2 S-02 + §3, docs/planning/11-coding-conventions/11-coding-conventions.md §3 | 10 §2 S-02 layout + §3 design token utility |

## 1. 변경 의도

#10 Article placeholder를 실 사용자 노출 상세 페이지로 교체. useArticle + useComments hook 병렬 fetch. 404 분기에서 NotFound 컴포넌트 직 렌더 (URL 유지). 수정/삭제 버튼 *mount만* (핸들러는 Sprint 4 별 PR). CommentList placeholder (작성/삭제 UI는 Sprint 4). ui_changed=true (Article rewrite + CommentList 신설).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/src/pages/Article.tsx` | placeholder ("Article :id") | 실 구현 (~80 line) — useArticle + useComments + 본문 + 메타 + 태그 + CommentList + 수정/삭제 버튼 mount |
| `frontend/src/components/CommentList.tsx` | 부재 | 신설 — Comment[] props → `<ul>` + 댓글 1건 카드 (body·author·createdAt·삭제 버튼 placeholder) |
| `frontend/src/hooks/useArticle.ts` | 부재 | 신설 — getArticle(id) + 5상태 + AbortController signal (useArticles 패턴 답습) |
| `frontend/src/hooks/useComments.ts` | 부재 | 신설 — listComments(articleId) + 5상태 + AbortController |
| `frontend/src/pages/NotFound.tsx` | placeholder (#10) | 변경 없음 (재사용 — useArticle 404 시 직 렌더) |
| 단위 테스트 | 39 + 1 skip = 40 (#12 후) | + RTL Article·CommentList snapshot 2 + useArticle/useComments hook 2 = 44+ passed |
| 09 API spec 사용처 | client 9/9 wrap (#11) | getArticle·listComments 첫 사용처 |
| ui_changed | true (#12) | true (Article.tsx rewrite + CommentList 신설) |
| 부팅 자산 | 무변경 | 무변경 |
| 코드 라인 추가 | — | 약 +250 (src) + +180 (test) + +200 (docs) ≈ 630 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/pages/Article.tsx` | placeholder → 실 구현 (rewrite) | 본 PR |
| `frontend/src/api/client.ts` (#11) | getArticle·listComments 첫 사용처 | 변경 없음 |
| `frontend/src/pages/NotFound.tsx` (#10) | useArticle 404 시 직 렌더 | 변경 없음 (재사용) |
| Sprint 4 `feat-editor-page` | "수정" 버튼 onClick에 navigate(/editor/:id) 결합 | 본 PR은 mount만 — Sprint 4가 핸들러 결합 |
| Sprint 4 `feat-article-delete-ux` | "삭제" 버튼 onClick + Modal 결합 | 동일 |
| Sprint 4 `feat-comment-create-delete-ui` | CommentList에 작성 form + 댓글별 삭제 버튼 결합 | 본 PR은 목록 mount만 |

## 4. Backward Compatibility

- **Breaking**: no — Article placeholder rewrite + 신규 모듈
- **마이그레이션**: no
- **API 호출**: 신규 사용처 (backend 영향 0 — read-only)
- **버전 bump**: 0

## 5. Rollback 전략

- **Revert 가능**: yes — git revert
- **데이터 손상 위험**: 없음 (read-only)
- **Rollback 절차**: revert → CI green (#10·#11·#12 baseline 회귀)
- **부팅 자산 회귀**: 0

## 6. 비목표

- 댓글 작성/삭제 핸들러 — Sprint 4
- 글 수정/삭제 실 동작 — Sprint 4
- MSW 통합 — vitest jsdom 미작동, skip 패턴 #12 답습
- 반응형 정밀 — Sprint 5
- E2E — Sprint 5
- 마크다운 렌더링 — MVP 평문
- 이미지/첨부 — MVP 0
- Component primitives — Sprint 4
