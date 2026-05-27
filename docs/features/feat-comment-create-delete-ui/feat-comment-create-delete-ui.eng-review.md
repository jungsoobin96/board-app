---
doc_type: feature-eng-review
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comment-create-delete-ui — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16) |

## 0. Verdict

**VERDICT: PASS** — `/implement` 진입 허가.

- reviewer: @jungsoobin96 (self, planning Phase pre-implement)
- review_at: 2026-05-27

근거: contract §0 5행 BLOCK 통과. plan 4 커밋 DAG 순환 없음. CommentList onDelete prop이 optional이라 backward 호환 보장 — 기존 3 cases 회귀 위험 없음. ConfirmModal target 분기는 type+commentId state 2개로 명확. 응답 후 추가 패턴은 race 회피 + 단순성으로 적절.

## 1. Contract 검토

- §0 5행 모두 채움 ✓ — R-F-05/R-F-06 + F-05 + 4 모듈 (Article·CommentForm·CommentList·ConfirmModal 재사용) + 2 endpoint (POST·DELETE comments) + §3·§4 컨벤션.
- §1 의도 — "mount-only 읽기 → 작성·삭제 결합" 명확.
- §2 Before/After 7행 — CommentForm 신규 / CommentList props 확장 / Article state 추가 / 핸들러 / 삭제 모달 분기 / 단위 테스트.
- §3 Call Sites — Article·CommentList·client·ConfirmModal 모두 라인 명시.
- §4 Breaking=no — optional prop 추가, 신규 컴포넌트만.
- §5 Rollback revert PR 1단 + 데이터 손상 없음.
- §6 비목표 7항 — 낙관적 갱신 / 수정 UI / 페이지네이션 / 권한 / Toast / Context — scope creep 차단.

## 2. Plan 검토

- 4 커밋 DAG — docs → CommentForm+CommentList prop → Article 결합 → 후속 docs. 순환 없음.
- 각 커밋 atomic.
- 테스트 매핑 — CommentForm 4 + CommentList 1 + Article 3 + 기존 66 = 74+ PASS 목표.
- 빌드·실행 검증 — PATH override 패턴 (#14·#15 LLM 직접 PASS baseline).
- 점진 합의 6항 — 응답 후 추가 / commentsLocal 동기화 / body reset / target 분기 / 모달 메시지 / onDelete optional — 모든 결정이 §6 비목표와 정합.

## 3. UX 검토

- CommentForm: body textarea + author input + "댓글 작성" 버튼. 빈 body 검증 인라인. submit pending 중 disabled + "작성 중…".
- 댓글 영역: form → 목록(최신순 prepend). 모바일에서 textarea 작게 (~3 rows) + 데스크탑 그대로.
- 삭제 모달: "이 댓글을 삭제하시겠습니까?" — 글 삭제 모달과 메시지만 차별화. UX 일관성.
- a11y: CommentForm `<label htmlFor>` body·author + form aria-labelledby="comment-form-title". CommentList 삭제 버튼 `aria-label="댓글 #N 삭제"`.

## 4. 6단계 폴더링 충족

- frontend/src/components/ — CommentForm 컴포넌트 평면 (ArticleCard·ConfirmModal 등과 같은 층) ✓
- frontend/tests/unit/components/ — CommentForm.test.tsx + CommentList.test.tsx 보강 ✓
- frontend/tests/unit/pages/ — Article.test.tsx 보강 ✓
- docs/features/feat-comment-create-delete-ui/ — 산출 폴더 (mode=add → feat- 접두) ✓
- docs/features/feat-comment-create-delete-ui/screenshots/ — 3장 ✓

## 5. frontmatter / Manifest 검증

- 3 산출 (brief/contract/plan) `validate-doc.sh OK` 확인.
- 본 eng-review·acceptance·risk는 본 호출과 후속에서 검증.
- 7 필드 frontmatter 모두 충족.
- related.R-ID·F-ID 정합 ([R-F-05, R-F-06] + [F-05]).

## 6. 발견 사항 (3축 OX)

본 review 단계 신규 발견 없음. plan §5 결정 외 추가 backlog 없음.

| Q | 답 | 처리 |
| --- | --- | --- |
| Q1 in_scope==False | (N/A 발견 없음) | — |
| Q2 blocks_parent_merge==False | (N/A) | — |
| Q3 same_area==False | (N/A) | — |

## 7. NEEDS-WORK 항목

없음. `/implement` 진입 허가.
