---
doc_type: feature-brief
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

# feat-editor-page — Feature Brief

> Sprint 4 첫 PR — Issue #14. Editor placeholder → 실 form (글 작성·수정). Sprint 3 마무리 후 첫 신규 기능.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (Sprint 4 첫 PR) |

## 1. 한 줄 의도

Editor 페이지 실 구현 — controlled 4 필드(title·author·body·tagList) + 인라인 검증 + createArticle/updateArticle 호출 + 성공 시 `/article/:id` navigate. `/editor/:id`는 useArticle로 기존 값 사전 로드 + 버튼 "저장". Article 페이지의 "수정" 버튼이 `/editor/:id`로 navigate.

## 2. 사용자 가치

- **작성자**: 글 신규 발행 + 기존 글 수정의 핵심 흐름 완결
- **방문자**: Article 상세에서 "수정" 클릭 → Editor 진입 + 사전 로드 → 저장 → Article 상세로 복귀, 전체 라이프사이클 첫 가시화
- **개발자**: EditorForm controlled 패턴 — Sprint 4 댓글 작성에서 동일 패턴 재사용

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `frontend/src/pages/Editor.tsx` | placeholder ("Editor (신규/수정)") | 실 구현 — useParams 신구 분기 + useArticle (수정 모드 사전 로드) + `<EditorForm />` |
| `frontend/src/components/EditorForm.tsx` | 부재 | 신설 — controlled 4 필드 + 인라인 검증 + submit 핸들러 props |
| `frontend/src/pages/Article.tsx` | "수정" 버튼 onClick=()=>{} (mount만, #13) | onClick=navigate(`/editor/${id}`) 결합 |
| 단위 테스트 | 47 + 2 skip = 49 (#13 후) | + EditorForm RTL (controlled·validation·submit 보존) + Editor 신구 분기 RTL = 51+ |
| 09 API spec 정합 | client 9/9 wrap (#11) | 사용처: createArticle·updateArticle 첫 사용 |
| ui_changed | true (#13) | true (Editor.tsx rewrite + EditorForm 신설 + Article 수정 버튼 결합) |
| 부팅 자산 | 변경 없음 | 변경 없음 (deps 추가 없음) |

## 4. 모드 자동 감지 결과

- **부정 시그널**: 0건 (UI 변경이지만 *디자인 토큰·리브랜딩* 아님 / *기존 동작 변경* 아님 / *버그* 아님)
- **라벨**: `type:feature` + `area:frontend` + `priority:P0`
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `frontend/src/components/EditorForm.tsx` | 1 신설 |
| 변경 코드 | `frontend/src/pages/Editor.tsx` (placeholder → 실 구현) · `frontend/src/pages/Article.tsx` (수정 버튼 결합) | 2 rewrite/edit |
| 신규 테스트 | RTL EditorForm + Editor 신구 분기 = 2 신설 파일 | |
| 부팅 자산 | 변경 없음 | 0 |
| ui_changed | true | 5번째 axis 강제 — Editor 신구·검증 에러 스크린샷 ≥1장 첨부 |
| 13/02-catalog | R-F-05·F-03·F-06 fan-in | docs-update |

## 6. 비목표

- **글 삭제 실 동작** — Sprint 4 `feat-article-delete-ux` (#15)에서 결합. 본 PR은 Article 삭제 버튼 mount 유지.
- **댓글 작성/삭제 UI** — Sprint 4 `feat-comment-create-delete-ui` (#16)
- **태그 자동완성** — MVP 평문 입력 + 쉼표 구분만
- **본문 마크다운 렌더링** — MVP 평문 + `white-space: pre-wrap`
- **이미지 업로드·첨부 파일** — MVP 글에 이미지 0
- **navigate 후 toast 알림** — MVP 즉시 redirect
- **수정 모드 dirty check (이탈 시 경고)** — MVP 단순 navigate
- **MSW 통합 test** — #12·#13과 동일 vitest jsdom 미작동, skip 패턴 유지
- **E2E** — Sprint 5

## 7. Open Questions

- **O-EP1**: 인라인 검증 표시 시점 — onBlur vs onSubmit. → 답: onSubmit (10 §2 S-03 "발행 클릭 시 인라인 에러 표시"). onBlur 추가는 Sprint 5 UX 폴리시.
- **O-EP2**: 수정 모드 useArticle 404 분기 — Editor에서 NotFound 직 렌더 vs `<Navigate>`. → 답: 직 렌더 (Article과 동일 패턴, URL 유지로 사용자 history 보존).
- **O-EP3**: tagList 표시 형식 — input 입력 시 (`"javascript, intro"`) vs 칩 UI. → 답: input + 쉼표 구분 (10 §2 S-03 placeholder "태그 (쉼표 구분)" 정합). 칩 UI는 Sprint 5.
- **O-EP4**: submit 실패 시 navigate skip + 입력값 보존 — 검증 에러는 인라인 + 네트워크 에러는 form 상단 alert. → 답: 둘 다 form 상단 alert + 입력값 보존 (10 §2 S-03 "실패 시 인라인 에러 + 입력값 보존").
