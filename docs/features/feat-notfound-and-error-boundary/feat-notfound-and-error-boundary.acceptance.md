---
doc_type: feature-acceptance
version: v0.3
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: [F-04]
  supersedes: null
---

# NotFound + ErrorBoundary 폴리시 — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.3 | 2026-05-27 | jungsoobin96 | reviewer MINOR F-1: AC-04 색상 토큰 정정 (success-500 → secondary-500) |
| v0.2 | 2026-05-27 | jungsoobin96 | AC 5건 + DoD 6항 + 회귀 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 |

## 1. 인수 기준 (Given/When/Then)

### AC-01: NotFound heading + "홈으로" CTA

- Given: 사용자가 미일치 경로(`/asdf`) 또는 존재하지 않는 글 id(`/article/999`)에 진입
- When: 라우터가 `path="*"` 또는 `Article` 페이지 404 분기로 `NotFound` 컴포넌트를 렌더
- Then: heading "찾을 수 없는 페이지" + Link `to="/"` ("홈으로") 노출
- 측정 방법: 자동 테스트 (`NotFound.test.tsx` 2 case)
- R-ID: R-F-08

### AC-02: ErrorBoundary fallback 노출

- Given: 자식 컴포넌트가 render 중 throw
- When: React가 throw를 ErrorBoundary로 전파
- Then: `role="alert"` + "오류가 발생했습니다" + "새로고침해 주세요" 한국어 fallback 노출
- 측정 방법: 자동 테스트 (`ErrorBoundary.test.tsx` case b)
- R-ID: R-N-02

### AC-03: ErrorBoundary 스택 미노출

- Given: 자식 컴포넌트가 `throw new Error('내부 SQL 에러: SELECT * FROM users')` 발생
- When: ErrorBoundary fallback 노출
- Then: fallback DOM에 `'내부 SQL 에러'` 문자열·stack trace가 노출되지 않음 (고정 한국어 텍스트만)
- 측정 방법: 자동 테스트 (`ErrorBoundary.test.tsx` case c — `queryByText(/내부 SQL 에러/)` === null)
- R-ID: R-N-02

### AC-04: Toast success/error variant + 닫기

- Given: `<Toast variant="success|error" message="..." onDismiss={fn}>` mount
- When: 렌더 후 닫기 버튼 클릭
- Then: `role="alert"` 노출 + variant별 색상(`bg-secondary-500` success / `bg-danger-500` error — 10 §3 디자인 토큰에 success 전용 색상 미정의로 secondary green 재사용) + 닫기 클릭 시 `onDismiss` 1회 호출
- 측정 방법: 자동 테스트 (`Toast.test.tsx` case a·b)
- R-ID: R-N-02

### AC-05: Toast auto-dismiss

- Given: `<Toast ... durationMs={3000}>` mount (또는 default 3000)
- When: 3000ms 경과 (vi fake timers)
- Then: `onDismiss` 1회 자동 호출
- 측정 방법: 자동 테스트 (`Toast.test.tsx` case c)
- R-ID: R-N-02

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — Toast 4 / NotFound 2 / ErrorBoundary 3 = +9 신규 테스트, 모두 PASS
- [ ] **AI 게이트** 6축 PASS — Build·Tests·Manual·DoD coverage·UI 골든패스(`ui_changed=true`, /article/999 NotFound 확인)·3 profile 부팅
- [ ] **Test Plan 4블록** — PR body Build / Automated tests / Manual verification / DoD coverage 표 모두 작성
- [ ] **tested 라벨** — ADR-0046 v1.2로 폐지, status check `pr-body-checkboxes` PASS로 대체
- [ ] **Approve** ≥ 1
- [ ] **CI green** — GitHub Actions 모든 status check PASS

## 3. 비기능 인수

- a11y: Toast `role="alert"` (스크린리더 즉시 안내), 닫기 버튼 `aria-label="알림 닫기"`
- 성능: Toast auto-dismiss timer는 `setTimeout` 1회만, cleanup `clearTimeout` 보장 (메모리 누수 없음)
- 보안 (R-N-02): Toast `message` prop 타입 `string`만 — Error 객체 직 전달 차단 (호출자가 `NormalizedError.message` 추출 책임). ErrorBoundary fallback도 Error.message·stack 미렌더.

## 4. 회귀 인수

- 기존 `App` → `BrowserRouter` → `ErrorBoundary` → `Layout` → `AppRoutes` wiring 그대로 동작 (변경 없음)
- 기존 `Article` 페이지의 404 → `<NotFound />` 분기 정상 (`Article.test.tsx` case 'invalid id') 회귀 없음
- 기존 `routes.tsx`의 `path="*"` catch-all 정상
- 기존 25 unit tests 모두 통과 (#16 baseline)
