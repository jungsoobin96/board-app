---
doc_type: feature-acceptance
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

# feat-article-page — Acceptance Criteria

> Issue #13 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: /article/1 → 본문 + 댓글 + 수정/삭제 버튼

- **Given**: backend 시드 — 글 id=1 + 댓글 N건.
- **When**: 브라우저 `http://localhost:5173/article/1` 진입.
- **Then**: 글 제목·본문(whitespace 보존)·작성자·createdAt·태그 칩·댓글 목록·"수정" "삭제" 버튼 노출.
- **측정 방법**: 수동 (사용자 P14 + screenshots/article-detail.png).
- **R-ID**: R-F-03, R-F-06, F-04·F-05.

### AC-02: /article/999 → NotFound

- **Given**: id=999 미존재.
- **When**: 브라우저 진입.
- **Then**: NotFound 컴포넌트 노출 ("찾을 수 없는 페이지" + 홈으로 Link). URL 유지.
- **측정 방법**: 수동 + useArticle.test 404 케이스.
- **R-ID**: R-F-08.

### AC-03: 댓글 0건 → "댓글이 없습니다" 메시지

- **Given**: 글 id=1 + 댓글 0건.
- **When**: 진입.
- **Then**: CommentList 영역에 "아직 댓글이 없습니다" inline 메시지.
- **측정 방법**: 수동 + CommentList.test 빈 케이스.
- **R-ID**: R-F-06.

### AC-04: 단위 — RTL + hook 8+ PASS

- **Given**: vitest 실행.
- **Then**: Article·CommentList snapshot 2 + useArticle·useComments hook 6 = 8+ PASS.
- **측정 방법**: 자동 (`pnpm --filter @app/frontend test:unit`).
- **R-ID**: R-F-03, R-F-06.

### AC-05: 수정/삭제 버튼 mount (핸들러는 Sprint 4)

- **Given**: AC-01 상태.
- **When**: "수정"/"삭제" 버튼 클릭.
- **Then**: 버튼은 노출되나 onClick 핸들러는 빈 함수 (TODO comment 표기). Sprint 4에서 결합.
- **측정 방법**: 수동 (클릭 시 무반응 — 의도).
- **R-ID**: R-F-03.

## 2. Definition of Done (D-06)

- [ ] **단위** — frontend 47+ passed (기존 39 + 신규 8).
- [ ] **통합** — N/A (MSW skip 패턴 #12 동일).
- [ ] **AI 게이트** 6축:
  - 1·2 사용자 위임
  - 3 ✅
  - 4 ✅ (시크릿 0)
  - 5 **ui_changed=true** — 사용자 브라우저 검증 + screenshots/article-detail.png 첨부
  - 6 사용자 위임 (부팅 자산 0)
- [ ] Test Plan 4블록.
- [ ] tested 라벨 자리.
- [ ] Approve ≥ 1.
- [ ] CI green N/A.

## 3. 비기능 인수

- 성능: 글 상세 + 댓글 응답 < 1초 (10건 시드 가정)
- a11y: `<article>` + `<section aria-labelledby>` + 댓글 `<section aria-label="댓글">`
- 보안: React JSX auto-escape (XSS 0), dangerouslySetInnerHTML 미사용

## 4. 회귀 인수

- R-1: backend 9 endpoint baseline
- R-2: frontend 39 + 1 skip = 40 (#12 후) 회귀 0
- R-3: smoke 3 profile (backend 영향 0)
- R-4: Home 페이지(#12) 동작 회귀 0
- R-5: NotFound 컴포넌트 재사용 (404 직 렌더)
