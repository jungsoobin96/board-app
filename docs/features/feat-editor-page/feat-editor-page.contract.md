---
doc_type: feature-contract
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

# feat-editor-page — Change Contract

> Issue #14 · mode=add · P3.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-02 (글 작성), R-F-05 (입력 검증), R-F-08 (라우팅) |
| F-ID | docs/planning/05-prd/05-prd.md | F-03 (글 작성), F-06 (글 수정), F-11 (페이지 라우팅) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M2 §M4 | M2 Editor 페이지 신구 분기 + EditorForm 신설, M4 api-client createArticle/updateArticle 첫 사용처 |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | POST /api/articles (createArticle), PUT /api/articles/:id (updateArticle), GET /api/articles/:id (수정 모드 사전 로드 — useArticle 재사용) |
| 규약 | docs/planning/10-lld-screen-design/10-lld-screen-design.md §2 S-03·S-04 + §3, docs/planning/11-coding-conventions/11-coding-conventions.md §3 | 10 §2 S-03·S-04 layout + 검증 룰 M9 + §3 design token utility |

## 1. 변경 의도

#13 Article 상세 페이지 머지 직후 — `/editor`·`/editor/:id` placeholder를 실 form으로 교체. controlled 4 필드(title·author·body·tagList) + 인라인 검증(M9 정합) + createArticle/updateArticle 호출. 수정 모드는 useArticle로 기존 값 사전 로드. Article의 "수정" 버튼 onClick=navigate(`/editor/${id}`) 결합. ui_changed=true (Editor rewrite + EditorForm 신설 + Article 버튼 결합).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/src/pages/Editor.tsx` | placeholder ("Editor (신규/수정)", 22 line) | 실 구현 (~80 line) — useParams 신구 분기 + useArticle (수정 모드 사전 로드) + `<EditorForm initialValues={} onSubmit={} />` |
| `frontend/src/components/EditorForm.tsx` | 부재 | 신설 (~150 line) — controlled 4 필드 + 인라인 검증 (M9 룰) + submit 핸들러 props + loading/error state |
| `frontend/src/pages/Article.tsx` (수정 버튼) | `onClick={() => {}}` (mount만, #13) | `onClick={() => navigate('/editor/' + article.id)}` |
| 단위 테스트 | 47 + 2 skip = 49 passed (#13 후) | + RTL EditorForm (controlled·validation·submit error 보존, 3-4건) + Editor 신구 분기 RTL (2건) = 53+ passed |
| 09 API spec 사용처 | client 9/9 wrap (#11) | createArticle·updateArticle 첫 사용처 |
| ui_changed | true (#13) | true (Editor.tsx rewrite + EditorForm 신설 + Article 수정 버튼 결합) |
| 부팅 자산 | 무변경 | 무변경 |
| 코드 라인 추가 | — | 약 +280 (src) + +200 (test) + +220 (docs) ≈ 700 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/pages/Editor.tsx` | placeholder → 실 구현 (rewrite) | 본 PR |
| `frontend/src/components/EditorForm.tsx` | 신설 | 본 PR |
| `frontend/src/pages/Article.tsx` (#13) | "수정" 버튼 onClick에 useNavigate 결합 | 본 PR 추가 edit |
| `frontend/src/api/client.ts` (#11) | createArticle·updateArticle 첫 사용처 | 변경 없음 |
| `frontend/src/hooks/useArticle.ts` (#13) | Editor 수정 모드 사전 로드 재사용 | 변경 없음 |
| `frontend/src/pages/NotFound.tsx` (#10) | Editor 수정 모드 404 시 직 렌더 | 변경 없음 |
| Sprint 4 `feat-article-delete-ux` (#15) | Article "삭제" 버튼 onClick 결합 | 본 PR 범위 밖 |
| Sprint 4 `feat-comment-create-delete-ui` (#16) | CommentList 작성/삭제 결합 | 본 PR 범위 밖 |
| Sprint 5 E2E | Editor 신구 → 발행/저장 → Article navigate 골든패스 | Sprint 5 |

## 4. Backward Compatibility

- **Breaking**: no — Editor placeholder rewrite + 신규 컴포넌트
- **마이그레이션**: no
- **API 호출**: 신규 사용처 (backend 영향 0 — 09 API spec 9/9 wrap 이미 존재)
- **버전 bump**: 0

## 5. Rollback 전략

- **Revert 가능**: yes — git revert
- **데이터 손상 위험**: 없음 (POST/PUT은 backend validation으로 흡수 — frontend는 호출자만, 본 PR이 새 데이터 schema 추가 0건)
- **Rollback 절차**: revert → CI green (#10·#11·#12·#13 baseline 회귀, Editor placeholder 복귀)
- **부팅 자산 회귀**: 0

## 6. 비목표

- 글 삭제 핸들러 — Sprint 4 #15
- 댓글 작성/삭제 UI — Sprint 4 #16
- 태그 칩 UI — MVP input + 쉼표 구분만
- 마크다운 렌더링 — MVP 평문
- 이미지/첨부 — MVP 0
- navigate 후 toast — MVP 즉시 redirect
- dirty check (이탈 경고) — MVP 단순 navigate
- MSW 통합 — vitest jsdom 미작동, skip 패턴 답습
- 반응형 정밀 — Sprint 5
- E2E — Sprint 5
- Component primitives — Sprint 4 별 PR
