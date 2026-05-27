---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-02, R-F-05, R-F-08]
  F-ID: [F-03, F-06, F-11]
  supersedes: null
---

# feat-editor-page — Acceptance Criteria

> Issue #14 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: /editor 신규 모드 → 빈 form 노출

- **Given**: backend dev 서버 부팅, `frontend dev` 5173.
- **When**: 브라우저 `http://localhost:5173/editor` 진입.
- **Then**: title·author·body·tagList 4 필드 모두 빈 값 + "발행" 버튼 노출.
- **측정 방법**: 수동 + Editor.test 신구 분기 케이스 + screenshots/editor-new.png.
- **R-ID**: R-F-02, R-F-08, F-03.

### AC-02: /editor 신규 모드 → 4 필드 입력 → "발행" → POST → /article/:id navigate

- **Given**: AC-01 상태 + 4 필드 정상 입력.
- **When**: "발행" 클릭.
- **Then**: createArticle 호출 → 응답 article.id 받음 → `/article/:newId` navigate. 새 article 페이지 노출.
- **측정 방법**: 수동 (사용자 P14) + EditorForm.test submit 케이스.
- **R-ID**: R-F-02, F-03, F-11.

### AC-03: /editor/:id 수정 모드 → 사전 로드 → "저장" → PUT → /article/:id navigate

- **Given**: 시드된 글 (예: id=66) 존재.
- **When**: `http://localhost:5173/editor/66` 진입.
- **Then**: useArticle로 로딩 → 4 필드에 기존 값 사전 로드 + "저장" 라벨 + 수정 후 클릭 시 updateArticle 호출 → `/article/66` navigate.
- **측정 방법**: 수동 + Editor.test 수정 모드 케이스 + screenshots/editor-edit.png.
- **R-ID**: R-F-02, F-06, F-11.

### AC-04: 빈 title submit → 인라인 에러 + 입력값 보존 + onSubmit 미호출

- **Given**: AC-01 상태 + title 빈 값 + body/author 입력.
- **When**: "발행" 클릭.
- **Then**: title input 하단 인라인 에러 "제목은 필수입니다" 노출 + body/author 값 보존 + POST 호출 0회.
- **측정 방법**: 수동 + EditorForm.test 검증 실패 케이스 + screenshots/editor-validation-error.png.
- **R-ID**: R-F-05.

### AC-05: /editor/99999 (미존재 id) → NotFound

- **Given**: id=99999 미존재.
- **When**: 브라우저 진입.
- **Then**: useArticle 404 분기 → NotFound 컴포넌트 직 렌더 (URL `/editor/99999` 유지).
- **측정 방법**: 수동.
- **R-ID**: R-F-08.

### AC-06: Article /article/:id "수정" 버튼 → /editor/:id

- **Given**: 시드 글 (id=66) Article 페이지.
- **When**: "수정" 버튼 클릭.
- **Then**: `/editor/66` navigate. AC-03 진입.
- **측정 방법**: 수동 (AC-03 골든패스 시작점).
- **R-ID**: R-F-08, F-06.

### AC-07: 단위 — RTL + Editor 신구 분기 4+ PASS

- **Given**: vitest 실행.
- **Then**: EditorForm RTL 4 + Editor 신구 분기 RTL 2 = 6+ PASS. 합산 47 + 6 = 53+ passed 기대.
- **측정 방법**: 자동 (`pnpm --filter @app/frontend test:unit`).
- **R-ID**: R-F-02, R-F-05.

## 2. Definition of Done (D-06)

- [ ] **단위** — frontend 53+ passed (기존 47 + 신규 6, snapshot 1 추가).
- [ ] **통합** — N/A (MSW skip 패턴 #12·#13 동일).
- [ ] **AI 게이트** 6축:
  - 1·2 사용자 위임
  - 3 ✅
  - 4 ✅ (시크릿 0)
  - 5 **ui_changed=true** — 사용자 브라우저 검증 + screenshots/editor-new.png + editor-edit.png + editor-validation-error.png ≥1 첨부
  - 6 사용자 위임 (부팅 자산 0)
- [ ] Test Plan 4블록.
- [ ] tested 라벨 자리.
- [ ] Approve ≥ 1.
- [ ] CI green N/A.

## 3. 비기능 인수

- 성능: 폼 입력 즉각 (state 갱신 < 50ms), submit POST < 500ms (10건 시드 가정)
- a11y: `<form>` + `<label htmlFor>` + `<input id>` 매칭, 에러 메시지 `aria-describedby` 결합, "발행" 버튼 명확
- 보안: React JSX auto-escape (XSS 0), dangerouslySetInnerHTML 미사용, payload JSON.stringify만

## 4. 회귀 인수

- R-1: backend 9 endpoint baseline (영향 0 — 호출자만)
- R-2: frontend 47 + 2 skip = 49 (#13 후) 회귀 0
- R-3: smoke 3 profile (backend 영향 0)
- R-4: Article 페이지(#13) 동작 회귀 0 ("삭제" 버튼은 mount 유지)
- R-5: useArticle hook (#13) 재사용 정합 (Editor 수정 모드)
- R-6: NotFound 컴포넌트 재사용 (Editor 404 분기)
