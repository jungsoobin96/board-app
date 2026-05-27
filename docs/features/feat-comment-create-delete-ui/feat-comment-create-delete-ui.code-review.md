---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: reviewer@agent.local
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comment-create-delete-ui — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | reviewer | 초안 (Sprint 4 #16 독립 리뷰) |

## 0. Verdict

**PASS** | MAJOR 0 | MINOR 2 | INFO 2

- Reviewer: @reviewer (Generator != Evaluator)
- Review at: 2026-05-27
- 근거: Contract Before/After 7항 전수 정합, AC-01~AC-07 커버, 단위 74 PASS / 0 fail, 시크릿 0건, XSS dangerouslySetInnerHTML 부재, #15 회귀 0건. MINOR/INFO는 same-PR 보정 권고이며 merge blocking 아님.

## 1. 컨트랙트 충실도

Contract Before/After 7행 대비 코드 정합 확인:

1. CommentForm.tsx 신규 (controlled body+author, 인라인 검증, onSubmit prop, pending disabled, NormalizedError alert) -- OK
2. CommentList.tsx Props: `onDelete?: (commentId: number) => void` optional 추가 -- OK
3. CommentList.tsx JSX: onDelete 있을 때만 삭제 버튼 렌더 -- OK
4. Article.tsx commentsLocal useState + useEffect mirror -- OK
5. Article.tsx handleCreateComment (응답 후 prepend, 낙관적 갱신 X) + handleDeleteComment (ConfirmModal 흐름) -- OK
6. ConfirmModal confirmTarget 단일 state로 글/댓글 분기 -- OK. 동시 활성 차단 (null -> article | comment, 단일 mount)
7. 단위 테스트 8건 추가 (CommentForm 4 + CommentList 1 + Article 3) -- OK

응답 후 추가 패턴: plan 5 결정과 정합 (낙관적 갱신 없음). body reset + author 유지: CommentForm L49 `setBody('')` only, author 미터치 -- OK.

## 2. 테스트 커버리지

- CommentForm 4 cases: controlled, 빈 body 차단, 정상 submit (body reset + author 유지 + trim), NormalizedError alert
- CommentList 1 case: onDelete prop 클릭 시 commentId 전달 (기존 3 cases 회귀 0)
- Article 3 cases: 작성 성공 prepend, 삭제 확정 즉시 제거, 빈 body 인라인 에러
- #15 회귀: 3 cases within(dialog) selector로 보강 -- 정상 통과
- 전체 74 PASS / 0 fail / 1 skipped (integration, pre-existing)
- CommentList snapshot 자동 재생성: wrapper span 추가는 의도적 (onDelete 렌더 영역 확보)

## 3. 보안 / 시크릿

- dangerouslySetInnerHTML: 전체 src/ 0건 -- XSS 안전
- 시크릿 노출: 0건 (grep 확인 -- .env/.key/.pem 매치는 import.meta.env / e.key 등 코드 패턴만)
- CommentForm body/author 사용자 입력 -> React JSX children 자동 escape -> 안전

## 4. 가독성 / 단순성

- CommentForm 112 lines: validate 분리, 단일 책임, 읽기 쉬움
- CommentList onDelete optional: backward 호환, 최소 변경
- Article ConfirmTarget discriminated union: 타입 안전, 글/댓글 분기 명확
- confirmTitle/confirmMessage 파생 변수: ConfirmModal props 전달 깔끔
- handleCreateComment가 error를 throw하면 CommentForm catch에서 처리 -- 책임 분리 적절

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-01: useEffect deps `[commentsState.data]`만 사용. risk.md RISK-03은 `[data, status]` 권고. 현재 구현이 기능적으로 정확하나(data 참조 변경 시 발동) risk.md와 불일치 | O | X | O | INFO -- risk.md 문구 정정 권고 |
| MINOR-02: CommentForm `id="comment-body"` / `id="comment-author"` 하드코딩. 동일 페이지에 CommentForm 2개 mount 시 id 충돌. 현재 Article 1곳만 사용하므로 실질 문제 없음 | O | X | O | MINOR -- 향후 재사용 시 id prop 또는 useId 고려 |
| INFO-01: CommentForm textarea rows=3 고정. acceptance.md 3.비기능 "모바일 rows=3, 데스크탑 rows=4" 명시인데 반응형 분기 없음 | O | X | O | INFO -- CSS-only 차이, follow-up 가능 |
| INFO-02: Article.tsx L189 `commentsState.status === 'empty'` 분기에서 `commentsLocal`이 `[]`이면 CommentList 빈 메시지 렌더. 작성 후 삭제로 0건 돌아가면 "아직 댓글이 없습니다" 즉시 노출 -- 의도된 동작 확인 | O | X | O | INFO -- 의도적 UX 판단 |

## 6. NEEDS-WORK 항목

없음. MINOR/INFO 4건은 merge blocking 아님. P10 진입 가능.
