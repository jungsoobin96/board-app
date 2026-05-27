---
doc_type: feature-contract
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: [F-04]
  supersedes: null
---

# NotFound + ErrorBoundary 폴리시 — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — Toast 신규 + 3종 단위 테스트 (#17) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 후속 implementation-planner가 본 표를 파싱해 selective read.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-F-08 (NotFound + 홈으로), R-N-02 (5xx 일반 메시지 토스트·스택 미노출) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-04 (간접 — 글 상세 404 → NotFound 분기는 이미 `Article` 페이지에서 구현됨) |
| 영향 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md | M5 frontend pages·components (NotFound·ErrorBoundary 기존 + Toast 신규) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | (none) — 본 PR은 API 직접 호출 없음, 5xx Toast 사용처는 후속 PR |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | §3 명명 (PascalCase Component), §4 테스트 (Vitest + RTL) |

## 1. 변경 의도

`NotFound`·`ErrorBoundary`는 Sprint 3에서 이미 추가되었으나 단위 테스트가 부재했고, `Toast`(success/error variant) 컴포넌트는 미구현이다. 본 PR은 (a) `Toast.tsx` 신규 작성 + (b) 3종(NotFound·ErrorBoundary·Toast) 단위 테스트로 회귀 보호 + (c) Sprint 4 마지막 이슈로서 frontend 안정성 폴리시 한 번에 마무리.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/src/components/Toast.tsx` | 없음 | **신규** — `ToastVariant = 'success' \| 'error'`, `<Toast variant message onDismiss?>`, `role="alert"`, auto-dismiss 3000ms 기본 (prop `durationMs` override 가능), close button (`aria-label="알림 닫기"`). 스택 미노출 보장 (message 단순 문자열 prop만, Error 객체 직 렌더 X). |
| `frontend/tests/unit/components/Toast.test.tsx` | 없음 | **신규 4 case** — (a) success variant 색상·`role="alert"` (b) error variant + 닫기 클릭 → onDismiss 호출 (c) 자동 dismiss 타이머 (vi fake timer) (d) message가 Error 객체 stack을 노출하지 않음 |
| `frontend/tests/unit/pages/NotFound.test.tsx` | 없음 | **신규 2 case** — (a) heading "찾을 수 없는 페이지" 노출 (b) "홈으로" Link href="/" |
| `frontend/tests/unit/components/ErrorBoundary.test.tsx` | 없음 | **신규 3 case** — (a) 정상 자식 그대로 통과 (b) throwing 자식 → fallback `role="alert"` + "오류가 발생했습니다" 노출 (c) 스택 미노출 (Error.message·stack을 렌더 트리에 직접 박지 않음 — fallback이 fixed 한국어 텍스트만 노출) |
| 기존 `NotFound.tsx`·`ErrorBoundary.tsx`·`App.tsx`·`router/routes.tsx` | 그대로 | **수정 없음** — wiring(App에 ErrorBoundary, routes에 `path="*"` catch-all) 모두 Sprint 3에서 완성됨 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/components/Toast.tsx` (신규) | 본 PR에서 호출처 없음 (primitive만) | 후속 PR에서 hooks/페이지가 5xx 응답 등에 사용. 본 PR scope 밖 |
| `frontend/src/components/ErrorBoundary.tsx` | 변경 없음 | `App.tsx`가 이미 wrapping (정상) |
| `frontend/src/pages/NotFound.tsx` | 변경 없음 | `routes.tsx`의 `path="*"` catch-all + `Article.tsx`의 404 분기에서 이미 사용 (정상) |
| `frontend/src/App.tsx` | 변경 없음 | ErrorBoundary→Layout→AppRoutes 구조 유지 |
| `frontend/src/router/routes.tsx` | 변경 없음 | 5 path + catch-all 유지 |

## 4. Backward Compatibility

- Breaking: **no**
- 마이그레이션 필요: **no**
- 신규 파일 4개 추가, 기존 파일 수정 0건. 기존 컴포넌트의 prop signature·동작 모두 그대로 유지.

## 5. Rollback 전략

- revert 가능: **yes** (단일 PR, 신규 파일만 추가 — 기존 코드 영향 없음)
- 절차 (3단계 이내):
  1. `git revert <merge_commit>` (squash 머지 가정)
  2. `pnpm install && pnpm -r build && pnpm test`
  3. PR open → 머지
- 데이터 손상 위험: **없음** (frontend 컴포넌트만, DB·API 무관)

## 6. 비목표

- Toast queue/stacking·portal 마운트는 본 PR scope 밖 (Sprint 5+).
- ErrorBoundary가 비동기 5xx HTTP 응답을 catch — React render-fail 전용이라 catch 불가. 5xx 처리는 호출자(hook)가 NormalizedError로 처리 후 Toast 표시하는 후속 패턴.
- Sentry 등 외부 송신 wiring (현 `console.error`만 유지, 별도 ADR로 추후 결정).
- E2E 테스트는 Sprint 5 일괄.
