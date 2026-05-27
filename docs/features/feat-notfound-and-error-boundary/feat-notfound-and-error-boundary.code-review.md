---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: woosung.ahn@bespinglobal.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: [F-04]
  supersedes: null
---

# NotFound + ErrorBoundary 폴리시 — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | reviewer (woosung.ahn@bespinglobal.com) | Verdict PASS -- Toast + 3종 단위 테스트 코드 리뷰 완료 |
| v0.1 | 2026-05-27 | reviewer | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

**PASS** -- MAJOR 0건, MINOR 1건 (문서 한정, 코드 변경 불필요).

- [reviewer]: woosung.ahn@bespinglobal.com
- [review_at]: 2026-05-27

근거: 8개 체크리스트 항목 모두 충족. 신규 파일 4개(Toast.tsx + 테스트 3종), 기존 파일 수정 0건. 단위 테스트 9 case 모두 PASS (vitest 83 passed / 1 skipped 중 9건 신규). 보안 룰 R-N-02 충족 (Toast `message: string` 타입 강제 + ErrorBoundary fallback 고정 한국어). 빌드 PASS (vite), typecheck 3건 사전 존재 에러는 main baseline과 동일 (Sprint 4 follow-up backlog). scope creep 없음.

## 1. 컨트랙트 충실도

### 1.1 Before/After 반영 여부

| Contract Before/After 항목 | 코드 반영 | 판정 |
| --- | --- | --- |
| `Toast.tsx` 신규 -- ToastVariant, role="alert", auto-dismiss 3000ms, 닫기 버튼 aria-label="알림 닫기" | Toast.tsx L8-55: 모두 구현 확인 | OK |
| `Toast.test.tsx` 신규 4 case | Toast.test.tsx: 4 case (a-d) 구현 확인 | OK |
| `NotFound.test.tsx` 신규 2 case | NotFound.test.tsx: 2 case 구현 확인 | OK |
| `ErrorBoundary.test.tsx` 신규 3 case | ErrorBoundary.test.tsx: 3 case 구현 확인 | OK |
| 기존 NotFound/ErrorBoundary/App/routes 수정 없음 | `git diff --name-only`: 4 신규 파일만, 기존 파일 0건 | OK |

### 1.2 Contract case (d) 매핑 주의

Contract는 Toast.test.tsx case (d)를 "message가 Error 객체 stack을 노출하지 않음"으로 명시하나, 실제 구현은 "durationMs={null} -> 자동 dismiss 미발생" 테스트. R-N-02 스택 미노출은 TypeScript 타입 시스템(`message: string`)에서 컴파일 타임 강제되고, risk.md F-RISK-03도 "tsc step에서 자연 흡수"로 명시. 런타임 테스트 슬롯을 더 유의미한 null-duration 시나리오에 활용한 판단은 합리적. **코드 측 변경 불필요 -- acceptance.md AC-04의 `bg-success-500` 표기만 `bg-secondary-500`으로 정정 권장** (MINOR, 아래 참조).

## 2. 테스트 커버리지

### 2.1 Plan Subtask 커밋 매핑

| Plan 커밋 | 실제 커밋 | 매핑 |
| --- | --- | --- |
| 커밋 1: `feat(frontend): Toast 컴포넌트 (success/error variant + auto-dismiss) (#17)` | `adfa32f feat(frontend): Toast 컴포넌트 (success/error variant + auto-dismiss) (#17)` | OK |
| 커밋 2: `test(frontend): NotFound + ErrorBoundary 단위 테스트 (#17)` | `124d715 test(frontend): NotFound + ErrorBoundary 단위 테스트 (#17)` | OK |

### 2.2 단위 테스트 매핑

| AC | 테스트 파일 | 케이스 | 커버 |
| --- | --- | --- | --- |
| AC-01 (NotFound heading + CTA) | NotFound.test.tsx | case 1: heading 노출 + id 검증, case 2: Link href="/" | OK |
| AC-02 (ErrorBoundary fallback) | ErrorBoundary.test.tsx | case b: throwing -> role="alert" + 고정 한국어 | OK |
| AC-03 (ErrorBoundary 스택 미노출) | ErrorBoundary.test.tsx | case c: queryByText(/내부 SQL 에러/) === null, /SELECT/ === null, /at Throwing/ === null | OK |
| AC-04 (Toast variant + 닫기) | Toast.test.tsx | case a: success variant bg-secondary-500, case b: error variant bg-danger-500 + onDismiss | OK |
| AC-05 (Toast auto-dismiss) | Toast.test.tsx | case c: vi.useFakeTimers + advanceTimersByTime(3000) -> onDismiss 1회 | OK |

누락 테스트 매핑: **없음**. 9 신규 테스트가 5개 AC를 완전 커버.

## 3. 보안 / 시크릿

### 3.1 R-N-02 스택 미노출

- **Toast**: `message: string` prop 타입으로 Error 객체 직접 전달 차단 (컴파일 타임). JSDoc 주석에 "R-N-02 강제" 명시. 호출자가 `NormalizedError.message` 추출 책임 명시. -- OK
- **ErrorBoundary**: fallback UI가 `getDerivedStateFromError`에서 `{ hasError: true }`만 설정하고, `render()`에서 고정 한국어 텍스트("오류가 발생했습니다" / "새로고침해 주세요")만 출력. `error.message`나 `error.stack`을 DOM에 렌더하지 않음. -- OK
- **ErrorBoundary 테스트 case c**: 의도적으로 SQL 에러 문자열을 throw하고 DOM에서 미노출 검증 -- OK

### 3.2 시크릿 누출

- 신규 4파일에 `.env`, `API_KEY`, `SECRET`, `process.env`, `import.meta.env` 참조 없음. -- OK
- `console.log`, `debugger` 문 없음. -- OK

## 4. 가독성 / 단순성

### 4.1 코딩 컨벤션 준수

| 규칙 | 적용 | 판정 |
| --- | --- | --- |
| PascalCase 컴포넌트 | `Toast`, `ToastVariant`, `ToastProps` | OK |
| 함수 컴포넌트 우선 (ErrorBoundary 제외) | Toast는 함수 컴포넌트 | OK |
| useEffect cleanup | Toast L33: `return () => window.clearTimeout(id)` | OK |
| `import type` 분리 | Toast는 React 런타임 import만 (type-only 불필요) | OK |
| 테스트 경로 `tests/unit/{components,pages}/` | Toast.test, ErrorBoundary.test, NotFound.test 모두 규약 경로 | OK |
| afterEach cleanup | 3종 테스트 모두 `afterEach(() => cleanup())` | OK |
| MemoryRouter wrap (Link 테스트) | NotFound.test.tsx: MemoryRouter wrap | OK |

### 4.2 코드 품질

- **onDismissRef 패턴** (Toast L23-26): stale closure 방지를 위한 ref 사용. 표준 React 패턴. -- OK
- **`durationMs === null` 얼리 리턴** (Toast L29): auto-dismiss 비활성화 시 타이머 미등록. 간결. -- OK
- **`window.setTimeout` / `window.clearTimeout`** (Toast L30-33): 명시적 전역 참조로 Node.js `setTimeout` 타입 충돌 방지. -- OK
- **Throwing 헬퍼 컴포넌트** (ErrorBoundary.test L11-13): 테스트용 throw 컴포넌트. 간결하고 명확. -- OK
- **console.error mock** (ErrorBoundary.test L20-23): React 내부 console.error 노이즈 흡수 + afterEach restoreAllMocks. F-RISK-02 완화 패턴. -- OK

### 4.3 죽은 코드 / TODO / 디버그 print

- 신규 4파일에 TODO/FIXME/HACK/XXX/console.log/debugger 없음. -- OK
- 기존 파일 `home.integration.test.tsx`의 TODO는 이전 Sprint 잔존 (본 PR 무관). -- OK

### 4.4 Scope Creep

- 변경 파일 4개 모두 신규. 기존 파일 수정 0건. Contract 명시 범위와 정확히 일치. -- OK

## 5. 발견 사항 (3축 OX 분류)

| # | 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- | --- |
| F-1 | acceptance.md AC-04의 Then절에 `bg-success-500` 표기 -- 실제 코드는 `bg-secondary-500` (Tailwind config에 `success` 토큰 부재, 코드 주석 L36에 "success 전용 색상 미정의 -> secondary-500 재사용" 명시). 코드가 정확하고 acceptance 문서 표기만 불일치. | Yes | No | Yes (문서) | MINOR -- acceptance.md AC-04 `bg-success-500` -> `bg-secondary-500` 표기 정정 권장. 코드 변경 불필요. |
| F-2 | contract.md Toast.test case (d) 설명 "message가 Error 객체 stack을 노출하지 않음" vs 실제 구현 "durationMs={null} -> 자동 dismiss 미발생". R-N-02는 tsc 타입 레벨에서 보장되어 런타임 테스트 슬롯을 null-duration에 활용. | Yes | No | Yes (문서) | MINOR -- 문서 정합 차이이나, plan.md/risk.md에서 이미 정당화됨 ("tsc step에서 자연 흡수"). 코드 변경 불필요. |

## 6. NEEDS-WORK 항목

**MAJOR**: 없음.

**MINOR**: 1건 (F-1, 문서 표기 정정 -- 머지 비차단).

- F-1: `docs/features/feat-notfound-and-error-boundary/feat-notfound-and-error-boundary.acceptance.md` AC-04 Then절의 `bg-success-500` -> `bg-secondary-500` 정정 권장. 이 정정은 같은 PR 내 추가 커밋으로 수행 가능.
