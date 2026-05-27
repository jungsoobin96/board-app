---
doc_type: feature-brief
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

# NotFound + ErrorBoundary 폴리시 — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 채움 — Toast 신규 + 단위 테스트 3종 (Issue #17, Sprint 4 마지막) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

이미 존재하는 NotFound·ErrorBoundary의 폴리시(라우터 catch-all wiring + render-fail fallback)에 더해, 5xx 응답·일반 알림에 쓰일 **Toast(success/error variant)** 컴포넌트를 신규 작성하고 3종(NotFound·ErrorBoundary·Toast) 단위 테스트로 골든패스를 보장한다.

## 2. 사용자 가치

- 미일치 경로(`/asdf`)·미존재 글 id(`/article/999`) 진입 시 빈 화면 대신 한국어 안내 + "홈으로" CTA 제공
- 자식 컴포넌트 render fail이 발생해도 흰 화면 대신 일반 메시지 fallback (스택 미노출, 보안 개선)
- 향후 API 호출 실패 등 비차단 알림에 재사용 가능한 Toast primitive 확보 (success/error variant)

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| NotFound 페이지 | 존재 (간단) — App→Layout→`*` route catch-all 완성 | 그대로 유지 + 단위 테스트 신규 |
| ErrorBoundary | 존재 (class component, App 직상위) — render-fail 잡음 | 그대로 유지 + 단위 테스트 신규 (throwing child 시 fallback 노출) |
| Toast 컴포넌트 | **없음** | **신규** — success/error variant + auto-dismiss + `role="alert"` |
| 단위 테스트 | NotFound·ErrorBoundary·Toast 모두 부재 | 3종 모두 신규 (`tests/unit/{pages,components}/`) |
| Article 404 분기 | `useArticle`가 404 → NotFound 직 렌더 (`/article/999`) — 이미 동작 | 그대로 유지, NotFound 테스트가 회귀 보호 |

## 4. 모드 자동 감지 결과

- 자동 결정: **mode=add**
  - 시그널 1 (bug 키워드/로그): 0건
  - 시그널 2 (UI/token/리브랜딩 키워드): 0건 (Toast는 신규 추가지 design refresh가 아님)
  - 시그널 3 (기존 동작 변경/breaking): 0건 (NotFound·ErrorBoundary 유지, Toast 신규)
  - 시그널 4 (기본값): `type:feature` 라벨 + 신규 컴포넌트 도입 → **mode=add**
- 부정 시그널 0건 → 사용자 질문 없이 자동 진행 (ADR-0032 §2.1)

## 5. 영향 범위

- 신규 파일
  - `frontend/src/components/Toast.tsx` (신규)
  - `frontend/tests/unit/components/Toast.test.tsx` (신규)
  - `frontend/tests/unit/components/ErrorBoundary.test.tsx` (신규)
  - `frontend/tests/unit/pages/NotFound.test.tsx` (신규)
- 수정 없음 (기존 NotFound.tsx·ErrorBoundary.tsx·App.tsx·routes.tsx 모두 유지)
- 문서
  - `docs/features/feat-notfound-and-error-boundary/` 8종
  - `docs/planning/13-test-design/02-catalog.md` (R-F-08 §1 FE + R-N-02 §1 FE fan-in)
  - `docs/planning/CHANGELOG.md` (Sprint 4 #17 항목)

## 6. 비목표

- 5xx 응답을 ErrorBoundary가 잡지 않는다 — ErrorBoundary는 React render-fail 전용. 5xx HTTP 응답은 호출자(hook)가 `NormalizedError`로 처리하고 Toast로 표시하는 패턴은 후속 작업.
- Toast queue/stacking·자동 dismiss 타이머 정밀 제어는 Sprint 5+ (현재는 단일 Toast + 자동 dismiss 3s 기본만).
- Sentry 등 외부 송신 wiring은 ADR로 별도 결정 (현 `console.error`만 유지).
- E2E 테스트는 Sprint 5 일괄.

## 7. Open Questions

(없음 — 본 이슈는 신규 컴포넌트 추가 + 회귀 테스트 추가의 단순 패턴)
