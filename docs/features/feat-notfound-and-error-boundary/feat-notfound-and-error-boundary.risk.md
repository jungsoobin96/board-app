---
doc_type: feature-risk
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

# NotFound + ErrorBoundary 폴리시 — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 3 RISK 식별, 모두 Low |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | Toast auto-dismiss 타이머 메모리 누수 | 2 | 2 | Low |
| F-RISK-02 | ErrorBoundary 테스트 시 console.error noise | 1 | 4 | Low |
| F-RISK-03 | Toast `message` prop 타입 우회 (Error 객체 강제 전달) | 3 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01: Toast auto-dismiss 타이머 메모리 누수

- 카테고리: 성능
- 트리거 신호: Toast가 unmount되기 전 `setTimeout` callback이 살아 있으면 stale state 업데이트 + memory leak 경고
- 완화 전략: `useEffect` cleanup으로 `clearTimeout` 호출 보장. `durationMs === null`일 때는 타이머 자체 등록 X
- 검증 방법: 자동 테스트 (Toast.test.tsx case c — `vi.useFakeTimers` + advanceTimersByTime + `vi.clearAllTimers`로 cleanup 검증)

### F-RISK-02: ErrorBoundary 테스트 시 console.error noise

- 카테고리: 외부 의존
- 트리거 신호: React가 자식 throw 시 자체적으로 `console.error`를 호출 → 테스트 output 오염 (CI 노이즈)
- 완화 전략: ErrorBoundary 테스트 case b·c에서 `vi.spyOn(console, 'error').mockImplementation(() => {})` + `afterEach restoreAllMocks` (Sprint 4 표준 패턴 — `Article.test.tsx`와 동일)
- 검증 방법: 자동 테스트 — CI log에서 `Error: Throwing for test` 노이즈 0건 확인 (시각 grep)

### F-RISK-03: Toast `message` prop 타입 우회 (Error 객체 강제 전달)

- 카테고리: 보안
- 트리거 신호: 호출자가 `message={err as any}` 또는 `message={String(err)}` (toString이 stack 포함하는 커스텀 Error)로 우회 → 스택 노출 (R-N-02 위반)
- 완화 전략: prop 타입 `message: string`으로 컴파일 타임 강제 + 본 PR에서 호출처 0건 (후속 PR에서 hooks/페이지가 사용 시점에 별도 review). 단위 테스트 case d로 `message` prop이 string-only임을 명시적으로 검증 (NormalizedError instance 전달 시 TypeScript 컴파일 에러 — 본 검증은 tsc step에서 자연 흡수)
- 검증 방법: 자동 테스트 (Toast.test.tsx case d) + tsc strict mode

## 3. High 등급 단계적 롤아웃

(없음 — 모든 리스크 Low)

본 PR은 신규 파일만 추가 + Backward=no 미해당 + Rollback revert 가능. 단계적 롤아웃 필요 X. 머지 후 즉시 main 반영해도 회귀 위험 매우 낮음.

## 4. 데이터 영속성 변경

(없음 — frontend 컴포넌트만, DB·API·스토리지 무관)

## 5. 15-risk.md 갱신 항목

(없음 — 모두 Low + 본 PR scope에서 완결되는 자체 리스크. 15-risk.md는 시스템 레벨 high 리스크만 누적)
