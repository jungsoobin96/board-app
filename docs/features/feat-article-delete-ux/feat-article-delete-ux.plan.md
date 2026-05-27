---
doc_type: feature-plan
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-article-delete-ux — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #15) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `feat(frontend): docs for Sprint 4 #15 (8 산출)` | docs/features/feat-article-delete-ux/{brief,contract,plan,eng-review,acceptance,risk}.md | N/A (docs-only) | 없음 |
| 2 | `feat(frontend): ConfirmModal 컴포넌트 (재사용)` | frontend/src/components/ConfirmModal.tsx (신규, ~80 lines), tests/unit/components/ConfirmModal.test.tsx (신규, 4 cases) | ConfirmModal RTL — open 시 confirm focus / ESC cancel / 확정 시 onConfirm 호출 / pending 중 disabled + alert | 낮음 (신규) |
| 3 | `feat(frontend): Article 삭제 핸들러 결합 + 모달 + cascade 시각 (#15)` | frontend/src/pages/Article.tsx (handleDelete + 모달 mount + state), tests/unit/pages/Article.test.tsx (신규 or 보강, 삭제 흐름 3 cases) | Article RTL — 삭제 버튼 클릭 시 모달 노출 / 확정 시 deleteArticle 호출 + navigate('/') / 실패 시 alert + 모달 유지 | 낮음 (기존 mount-only 핸들러 결합) |
| 4 | `docs(plan): 13/02-catalog R-F-03·R-F-07 FE 시나리오 보강 (#15)` | docs/planning/13-test-design/02-catalog.md (R-F-03 §1 + R-F-07 §1·§3에 FE 시나리오 fan-in), docs/planning/CHANGELOG.md (Sprint 4 진척 갱신) | N/A | 없음 |

> 커밋 1은 docs-only 선행 — reviewer agent가 contract/plan을 읽고 코드 PR을 평가하도록 하기 위함.
> 커밋 4는 `/docs-update` Phase 결과로 동일 PR에 추가.

## 2. 의존성 그래프

```
1 (docs) ──> 2 (ConfirmModal) ──> 3 (Article 결합) ──> 4 (catalog/CHANGELOG)
                  │                        ▲
                  └─ ConfirmModal export ──┘
```

순환 없음. 2번 ConfirmModal이 3번 Article의 import 대상이므로 2 선행 필수.

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 2 | tests/unit/components/ConfirmModal.test.tsx | (a) `open=true` → confirm 버튼 자동 focus, (b) ESC 누르면 onCancel 호출 + pending 중에는 무시, (c) confirm 클릭 시 onConfirm 호출 (pending이면 비활성), (d) `error` prop 있으면 `role="alert"` 노출 + 입력값(props) 유지 |
| 3 | tests/unit/pages/Article.test.tsx | (e) "삭제" 클릭 시 ConfirmModal 노출 (role="dialog"), (f) 확정 시 `deleteArticle(id)` 1회 호출 + `navigate('/')` 호출, (g) `deleteArticle` 거부 시 모달 유지 + alert 노출 + 글 본문 그대로 |
| (전역) | 기존 25 + 신규 7 = 약 32+ 단위 테스트 PASS | tsc/build 미회귀 |

## 4. 빌드·실행 검증 단계

```bash
# (PATH override — git-bash node 인식 보정)
export PATH="/c/Program Files/nodejs:$PATH"

# typecheck + build + test 일괄
cd /c/Users/정수빈SoobinJung/board-app/frontend
pnpm exec tsc --noEmit
pnpm run build
pnpm run test -- --run

# 결과: 32+ tests passed / 0 failed / typecheck OK / build OK
```

## 5. 점진 합의 / 결정 발생 항목

- ConfirmModal API 결정 — `error: NormalizedError | null` prop으로 받음 (모달 내부에서 alert 렌더). 호출자(Article)가 `deleteError` state를 관리하고 prop으로 주입. 모달 자체가 try/catch를 하지 않는 *제어형* 패턴(controlled).
- focus trap은 *최소*만 — confirm/cancel 두 버튼만 Tab 순환. 외부 라이브러리 도입 안 함 (분량 가드 — useRef + onKeyDown으로 직 구현).
- 외부 클릭(backdrop) cancel은 본 PR 제외 — Open Q에서 결정. 키보드(ESC)만 cancel.
- pending 중 ESC도 무시 (race 방지) — 사용자가 "취소 → 재확정" race 시 deleteArticle 2회 호출 위험 차단.
- 삭제 성공 후 cascade는 backend가 처리 (#8 PR #36) — FE는 navigate만 하고 목록에서 재로딩 시 자연 미노출. 별도 invalidation 로직 없음 (React Query 미사용, 목록은 새로 mount되며 useArticles로 재 fetch).
