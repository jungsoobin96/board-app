---
doc_type: feature-plan
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

# feat-comment-create-delete-ui — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `feat(frontend): docs for Sprint 4 #16 (6 산출)` | docs/features/feat-comment-create-delete-ui/{brief,contract,plan,eng-review,acceptance,risk}.md | N/A (docs-only) | 없음 |
| 2 | `feat(frontend): CommentForm 컴포넌트 + CommentList onDelete prop` | frontend/src/components/CommentForm.tsx (신규, ~90 lines), frontend/src/components/CommentList.tsx (onDelete prop + 삭제 버튼 ~10 lines), tests/unit/components/CommentForm.test.tsx (신규, 4 cases), tests/unit/components/CommentList.test.tsx (onDelete 1 case 추가) | CommentForm RTL — controlled / 빈 body 인라인 검증 / 정상 submit + body reset / NormalizedError alert. CommentList RTL — onDelete 호출 (기존 3 cases 회귀) | 낮음 |
| 3 | `feat(frontend): Article 댓글 작성/삭제 결합 + 즉시 갱신 (#16)` | frontend/src/pages/Article.tsx (commentsLocal state + 핸들러 + CommentForm/CommentList wiring + 삭제 모달 type 분기), tests/unit/pages/Article.test.tsx (댓글 흐름 3 cases 추가) | Article RTL — 작성 성공 시 즉시 추가 / 삭제 모달 확정 시 즉시 제거 / 빈 body submit 인라인 에러 | 낮음 (기존 3 cases #15 흐름 회귀 없음) |
| 4 | `docs(plan): 13/02-catalog R-F-05·R-F-06 FE 시나리오 + CHANGELOG v0.13 (#16)` | docs/planning/13-test-design/02-catalog.md, docs/planning/CHANGELOG.md, docs/features/feat-comment-create-delete-ui/feat-comment-create-delete-ui.{code-review,ai-qa-report}.md | N/A | 없음 |

## 2. 의존성 그래프

```
1 (docs) ──> 2 (CommentForm + CommentList onDelete) ──> 3 (Article 결합) ──> 4 (catalog/CHANGELOG/code-review/ai-qa)
                       │                                     ▲
                       └─ CommentForm export + onDelete prop ┘
```

순환 없음. 2번 CommentForm + CommentList onDelete가 3번 Article의 import/prop 주입 대상이므로 2 선행 필수.

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 2 | tests/unit/components/CommentForm.test.tsx | (a) controlled — body/author 입력 시 state 갱신, (b) 빈 body submit → 인라인 에러 "본문은 필수입니다" + onSubmit 미호출, (c) 정상 submit → onSubmit 호출 with trimmed payload + body reset (author 유지), (d) submit error (NormalizedError) → 상단 alert + 입력값 보존 |
| 2 | tests/unit/components/CommentList.test.tsx | (e) onDelete prop 있고 클릭 시 onDelete(comment.id) 1회 호출 + 기존 3 cases 그대로 통과 |
| 3 | tests/unit/pages/Article.test.tsx | (f) CommentForm submit → createComment 1회 호출 + 댓글 영역에 즉시 추가(prepend), (g) 댓글 "삭제" 클릭 → ConfirmModal 노출 (메시지 "이 댓글을 삭제하시겠습니까?") → 확정 → deleteComment 1회 호출 + 즉시 제거, (h) CommentForm 빈 body submit → 인라인 에러 + createComment 미호출 + 글 본문/메타 그대로 |
| (전역) | 기존 66 + 신규 8 = 약 74+ 단위 테스트 PASS | 회귀 없음 |

## 4. 빌드·실행 검증 단계

```bash
export PATH="/c/Program Files/nodejs:$PATH"

cd /c/Users/정수빈SoobinJung/board-app/frontend
pnpm exec tsc --noEmit
pnpm run build
pnpm run test:unit -- --run

# 결과: 74+ tests passed / 0 failed / typecheck pre-existing 3건 main 동일 / build 동일
```

## 5. 점진 합의 / 결정 발생 항목

- **응답 후 추가 패턴**: createComment 응답을 받은 후 commentsLocal에 prepend. 낙관적 갱신 X — 실패 시 rollback 코드 복잡도 회피.
- **commentsLocal 동기화**: useComments status가 success/empty로 바뀔 때마다 useEffect로 commentsLocal 초기화 (Article unmount → remount 시 데이터 일관성).
- **body reset, author 유지**: 사용자가 같은 author로 연속 작성하는 경우가 일반적.
- **ConfirmModal target 분기**: `confirmTargetType: 'article' | 'comment' | null` + `confirmTargetCommentId: number | null` 추가 state. handleDelete*가 type을 설정하고 handleConfirmDelete가 type에 따라 deleteArticle vs deleteComment 호출.
- **모달 메시지 차별화**: ConfirmModal title/message props에 호출자가 동적 값 전달 — 컴포넌트 자체 변경 X (#15 검증).
- **CommentList onDelete optional**: undefined일 때 삭제 버튼 안 렌더 — 다른 호출자가 생기면 자연 backward 호환.
- **단위 테스트만, 통합/E2E는 Sprint 5**: WBS 정합. MSW handler는 vitest jsdom 통합 미작동(Sprint 3 follow-up)이라 단위 vi.spyOn만.
