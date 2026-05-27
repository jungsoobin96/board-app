---
doc_type: feature-risk
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

# feat-comment-create-delete-ui — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| RISK-01 | 작성 더블 클릭으로 createComment 2회 호출 → 중복 댓글 | 3 | 3 | Med |
| RISK-02 | 응답 후 추가에서 race — 빠른 연속 작성 시 순서 뒤바뀜 | 2 | 2 | Low |
| RISK-03 | commentsLocal 동기화 useEffect deps 누락 → useComments 업데이트 시 stale | 3 | 2 | Low |
| RISK-04 | 글 삭제 모달 / 댓글 삭제 모달 동시 활성 가능성 (state 분리 누락) | 3 | 2 | Low |
| RISK-05 | CommentList onDelete prop 제거 시 기존 호출자 회귀 (현재 Article 1곳) | 2 | 1 | Low |
| RISK-06 | 빈 body 검증 우회 (공백만 입력) — backend 422 | 2 | 2 | Low |
| RISK-07 | 모바일 textarea 너무 작아 사용성 저하 | 2 | 2 | Low |
| RISK-08 | XSS — 사용자 입력 body가 dangerouslySetInnerHTML 없이도 React가 자동 escape 보장 | 4 | 1 | Low |

High 등급 없음.

## 2. 리스크 상세

### RISK-01 — 작성 더블 클릭
- **원인**: 사용자가 "댓글 작성"을 빠르게 두 번 클릭.
- **영향**: 중복 댓글 2건 등록. 시각적/실용적 혼란.
- **완화**: CommentForm submit 중 버튼 disabled + 라벨 "작성 중…". RTL 테스트 (d)가 pending 검증.

### RISK-02 — race (응답 순서)
- **원인**: 사용자가 작성1 클릭 → 작성2 클릭 (작성1 응답 도착 전). 응답 도착 순서 ≠ 클릭 순서.
- **영향**: 댓글 prepend 순서가 클릭 순서와 다름.
- **완화**: pending 중 disabled로 클릭 자체 차단 (RISK-01 mitigation과 동일).

### RISK-03 — commentsLocal 동기화
- **원인**: useEffect deps에 commentsState.status 또는 data 누락 → useComments fetch 완료 시 commentsLocal 미반영.
- **영향**: 댓글이 빈 상태로 보임.
- **완화**: `useEffect(() => { if (commentsState.data) setCommentsLocal(commentsState.data); }, [commentsState.data, commentsState.status])`. RTL 테스트가 success 분기에서 데이터 확인.

### RISK-04 — 글/댓글 모달 동시 활성
- **원인**: confirmTargetType state가 'article'·'comment' 동시 truthy.
- **영향**: 모달 2개 stacking → UX 깨짐.
- **완화**: 단일 ConfirmModal mount + targetType + targetCommentId state로 분기. 두 모달이 동시에 mount되지 않도록 controlled 패턴. handleDelete*가 targetType을 set하고, handleConfirmDelete가 type에 따라 분기.

### RISK-05 — onDelete prop 제거
- **원인**: 향후 CommentList 리팩토링 시 onDelete 제거.
- **영향**: 현 Article 호출자만 영향 — 컴파일 에러로 즉시 드러남.
- **완화**: optional prop이라 의도적 변경만. backward 호환 자연 보장.

### RISK-06 — 빈 body 우회
- **원인**: 사용자가 공백 100자 입력 → frontend trim 안 하면 통과.
- **영향**: backend 422 → 사용자 혼란.
- **완화**: CommentForm validate()에서 `body.trim().length === 0`으로 빈 값 + 공백만 모두 차단. M9 검증 룰 정합.

### RISK-07 — 모바일 textarea
- **원인**: textarea 기본 rows=2 등 너무 작음.
- **영향**: 사용자가 긴 댓글 작성 어려움.
- **완화**: Tailwind responsive (rows=3 모바일 / rows=4 데스크탑). 사용자 검증.

### RISK-08 — XSS
- **원인**: 사용자 입력 body 렌더 시 HTML/script 주입.
- **영향**: 다른 사용자 세션에 script 실행 위험.
- **완화**: React가 JSX children을 자동 escape. `dangerouslySetInnerHTML` 사용 안 함. CommentList는 `<p>{comment.body}</p>` 형식이라 안전.

## 3. High 등급 단계적 롤아웃

High 등급 없음 — N/A.

## 4. 데이터 영속성 변경

본 PR은 frontend-only. backend는 #6에서 검증된 endpoint 호출만.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음.
