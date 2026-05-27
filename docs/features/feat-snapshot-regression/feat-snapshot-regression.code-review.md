---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 (reviewer agent) | 본문 -- 10항 리뷰 완료, verdict=PASS |
| v0.1 | 2026-05-27 | jungsoobin96 (reviewer agent) | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: @reviewer (reviewer agent, Generator != Evaluator)
- review_at: 2026-05-27
- MAJOR: 0
- MINOR: 0

Toast.test.tsx snapshot 1 it (2 sub-snap) 추가, 기존 4 it 무변경, 86 passed + 1 skipped 확인. feature docs 6건 contract 정합. 시크릿 0건. 머지 차단 사유 없음.

## 1. 컨트랙트 충실도

### 1-1. Toast.test.tsx 신규 it 패턴 적절성

**신규 it (line 61-73)**: `it('snapshot -- success + error variant 회귀 보호 (#19)', () => {...})`

구조:
1. success variant render (`variant="success"`, `message="저장 완료"`, `durationMs={null}`) -> `asFragment()` -> `toMatchSnapshot('Toast-success')`
2. `cleanup()` -- DOM 초기화 (success 잔여 render 제거)
3. error variant render (`variant="error"`, `message="서버 오류"`, `durationMs={null}`) -> `asFragment()` -> `toMatchSnapshot('Toast-error')`

`durationMs={null}`로 auto-dismiss timer 비활성화 -- snapshot 안정성 확보 (timer side-effect 배제). `vi.fn()` onDismiss는 호출 검증 불필요하므로 stub만. 기존 4종(ArticleCard/CommentList/Pagination/TagList) snapshot it 패턴과 일관: `render -> asFragment -> toMatchSnapshot(name)`.

1 it 내 2 sub-snap 분기:
- success 먼저 -> cleanup -> error 순서는 DOM 격리를 보장. `cleanup()`이 없으면 두 번째 `render`가 이전 DOM에 누적되어 fragment가 오염됨. cleanup 호출은 정확.
- 대안(2 separate it)도 가능하나, 기존 ArticleCard/CommentList/Pagination/TagList은 모두 단일 it 내 단일 snap이고, Toast만 variant 2종이 회귀 보호 가치를 가짐. 1 it에 sub-snap 명시로 묶는 것은 variant 간 결합도를 표현하면서도 각각 독립 snapshot 키를 가지므로 적절.

**기존 4 it 영향**: 모듈 수준 `afterEach(() => { cleanup(); vi.useRealTimers(); })` (line 12-15)가 각 it 사이 격리 보장. 신규 it 5는 `vi.useFakeTimers()` 미사용, `vi.fn()` only. 기존 it-3/it-4의 fake timer 상태가 신규 it에 누출될 경로 없음 (afterEach에서 `vi.useRealTimers()` 복원). PASS.

### 1-2. Toast.test.tsx.snap sub-snap 패턴

vitest `toMatchSnapshot(hint?)` API: hint 인자는 snapshot 키의 suffix로 사용됨. 생성 키 형식: `{describe} > {it} > {hint} {index}`.

실제 생성 키:
- `Toast > snapshot -- success + error variant 회귀 보호 (#19) > Toast-success 1`
- `Toast > snapshot -- success + error variant 회귀 보호 (#19) > Toast-error 1`

vitest 공식 문서 (https://vitest.dev/api/expect.html#tomatchsnapshot) 확인: `toMatchSnapshot(propertyMatchers?, message?)` -- `message`(= hint)는 snapshot 이름으로 사용. 1 it 내 여러 `toMatchSnapshot(hint)` 호출은 각각 고유 키를 생성하며, 동일 hint가 반복될 때만 index가 증가. 본 PR에서 'Toast-success'와 'Toast-error'는 서로 다른 hint이므로 각각 index 1. **표준 사용법 정합**.

`.snap` 파일 내용 검증:
- Toast-success: `bg-secondary-500`, `role="alert"`, `text-neutral-0`, `"저장 완료"` -- Toast.tsx line 37 `variant === 'success' ? 'bg-secondary-500'` 정합
- Toast-error: `bg-danger-500`, `role="alert"`, `text-neutral-0`, `"서버 오류"` -- Toast.tsx line 37 `: 'bg-danger-500'` 정합
- 양쪽 모두 `aria-label="알림 닫기"` 버튼 포함 -- Toast.tsx line 48 정합

Tailwind class 변경 시 snapshot diff 자연 감지 의도 충족. PASS.

### 1-3. brief.md mode=add 결정 trace + Toast 채택 사유

- mode=add 결정: type:test 라벨 + 부정 시그널 0건 -> ADR-0032 규칙 4 기본값 add. "회귀"는 modify 시그널 약함 판정 -- 실제로 기존 코드 무변경(Toast.tsx 0줄 diff)이므로 add 정당
- Toast 채택 사유: "#17 PR #45에서 도입된 신규 컴포넌트 + variant 4종(success/error/warning/info 중 success/error 구현) 가장 회귀 보호 가치" -- Toast가 가장 최근 도입 + variant 분기로 bg 토큰이 2종 노출되어 snapshot 가치 최대. 적절
- 5종 도달 로직: 기존 4종 + Toast 1종 = 5종. #19 본문 DoD "snapshot 5 컴포넌트" 충족

PASS.

### 1-4. contract.md

- 0 Referenced-IDs: R-N-06(반응형 레이아웃 -- snapshot 회귀 보호로 토큰/시각 회귀 감지) + F-11(반응형 UI -- snapshot 회귀로 발현 보호). 영향 모듈 `frontend/components/Toast (read-only)` + `frontend/tests/unit/components`. 적절
- 2 Before/After 8행 모두 정량 측정 가능: snapshot 컴포넌트 수(4->5), it 개수(4->5), snapshot 파일(부재->신설), 단위 카운트(85->86), 토큰 회귀 감지(4->5 컴포넌트), viewport(없음->#21 이관), Effort(1d->0.5d). 모두 숫자/유무로 검증 가능
- 6 비목표 6건: viewport #21 이관, gstack /qa #21, Playwright #21, 5종 외 추가, 토큰 정의 변경 별 PR, CI gate Sprint 6+ -- scope 한정 명확

PASS.

### 1-5. plan.md

- 1 커밋 시퀀스: `test(frontend): Toast snapshot 회귀 보호 추가 -- snapshot 5종 (#19)`. Toast.test.tsx + snap + docs를 원자적 1 commit. diff 규모 소형이므로 분할 불필요
- 2 의존성 그래프: P0(context-loader) -> P1(brief) -> P3(contract) -> P4(plan) -> P5/6/7(eng-review/acceptance/risk) -> P8(implement) -> P9(code-review) -> P10(qa-test). ASCII 형식 명확
- 4 빌드/실행 검증 6단계: (A) validate-doc 8건, (B) pnpm test:unit 86, (C) snap 파일 존재, (D) snap 5종 count, (E) 3 profile smoke, (F) workflow 양축. 모두 실행 가능한 명령어 포함
- 5 BLOCKED 분기: "86 미달 시 BLOCKED, 5종 미만 시 BLOCKED" -- 명확한 실패 조건

PASS.

### 1-6. acceptance.md AC-01/02/03 + DoD 7항

- AC-01: snapshot 5 컴포넌트 도달. Given(PR 머지 후) / When(`ls *.snap | wc -l`) / Then(= 5). 측정 방법 ls count -- 실행 가능
- AC-02: Toast snapshot 2 sub-snap. Given(PR 머지 후) / When(`grep -cE '^exports\[' Toast.test.tsx.snap`) / Then(>= 2). 측정 방법 grep count -- 실행 가능
- AC-03: 86 passed + 1 skipped + 첫 실행 Snapshots: 2 written. Given(신규 it 5) / When(`pnpm test:unit`) / Then(86+1). 측정 방법 vitest 출력 -- 실행 가능
- DoD 7항: it count(grep) + snap 신설(AC-02) + 5종(AC-01) + 86 passed(AC-03) + AI 게이트(ai-qa-report) + Manual verification(미체크) + 사람 Approve. 모두 측정 가능
- 회귀-01: 기존 4 Toast it 모두 PASS 유지. 검증 시점(pnpm test:unit) + 실패 대응(격리/cleanup) 명시

PASS.

### 1-7. risk.md F-RISK-01/02/03

- F-RISK-01 snapshot diff 폭증 (Low, 영향2/가능성3): 완화책 "토큰 변경 PR은 vitest -u 일괄 갱신 + 시각 review" -- snapshot의 본래 의도(토큰 회귀 감지)와 정합하므로 diff는 기능 정상 작동. 등급 적절
- F-RISK-02 viewport 이관 (Low, 영향2/가능성2): 사용자 (C) 결정으로 scope 축소. #19 DoD 8항 중 4항 #21 이관 명시. 완화책 "#21 진입 시 자연 흡수". 적절
- F-RISK-03 fake timer 영향 (Low, 영향3/가능성1): afterEach `vi.useRealTimers()` 복원 + 신규 it fake timer 미사용. 가능성 1(극히 낮음) 적절. 86 passed로 사전 검증 완료

3건 모두 Low. PASS.

### 1-8. eng-review.md 6 발견 사항

4건 OX:
- Q1: viewport 4항 #21 이관 -- 부모(#19) 미명시 + 본 작업 없이 PR 머지 가능 + 별 이슈 -> A.Derived. 적절
- Q2: snapshot diff 폭증 운영 절차 -- 부모 미명시 + 머지 가능 + 운영 정책 영역 -> A.Derived. 적절
- Q3: 5종 외 추가 컴포넌트 coverage 확대 -- 부모 미명시 + 머지 가능 + 별 컴포넌트 -> A.Derived. 적절
- Q4: CI snapshot diff gate -- 부모 미명시 + 머지 가능 + CI 영역 -> A.Derived. 적절

OX 형식은 eng-review schema(`feature-eng-review.schema.yaml`)의 Q/답/처리 3열 형식. eng-review는 code-review와 다른 schema이므로 5열(3축 OX) 불필요. PASS.

## 2. 테스트 커버리지

### 2-1. 신규 it 5 (line 61-73) 분석

**sub-snap 1 -- Toast-success (line 62-65)**:
- `render(<Toast variant="success" message="저장 완료" onDismiss={vi.fn()} durationMs={null} />)`
- `expect(successFragment()).toMatchSnapshot('Toast-success')`
- Toast.tsx `variant === 'success'` 분기에서 `bg-secondary-500` 적용. snapshot이 이 class를 캡처. 토큰 변경 시 diff 감지 보장.

**sub-snap 2 -- Toast-error (line 69-72)**:
- `cleanup()` 후 `render(<Toast variant="error" message="서버 오류" onDismiss={vi.fn()} durationMs={null} />)`
- `expect(errorFragment()).toMatchSnapshot('Toast-error')`
- Toast.tsx `variant !== 'success'` 분기에서 `bg-danger-500` 적용. snapshot이 이 class를 캡처.

### 2-2. 기존 4 it 회귀 영향

| 기존 it | fake timer 사용 | 신규 it 5 영향 |
| --- | --- | --- |
| it-1 success variant role=alert | No | 없음 -- 독립 render |
| it-2 error variant + 닫기 클릭 | No | 없음 -- `durationMs={null}` 명시 |
| it-3 auto-dismiss 3000ms | Yes (`vi.useFakeTimers()`) | 없음 -- afterEach `vi.useRealTimers()` 복원 후 it-5 진입 |
| it-4 durationMs={null} no dismiss | Yes (`vi.useFakeTimers()`) | 없음 -- afterEach 복원 |

신규 it-5는 fake timer 미사용. `vi.fn()` only. 86 passed로 회귀 0건 확인. PASS.

### 2-3. snapshot 5종 카운트

`__snapshots__/` 디렉토리: ArticleCard.test.tsx.snap + CommentList.test.tsx.snap + Pagination.test.tsx.snap + TagList.test.tsx.snap + Toast.test.tsx.snap = **5종**. AC-01 충족.

### 2-4. 테스트 카운트

86 passed + 1 skipped (Sprint 5 #18 baseline 85 + 신규 1 it). 사전 검증 결과와 일치.

## 3. 보안 / 시크릿

### 시크릿 스캔 결과

- `frontend/tests/unit/components/Toast.test.tsx`: API Key / secret / token / credential / password / Bearer / ANTHROPIC 패턴 0건. 환경변수 참조 0건. 외부 URL 0건. **CLEAN**
- `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap`: Tailwind class + 한국어 메시지만. 시크릿 0건. **CLEAN**
- `docs/features/feat-snapshot-regression/*.md` 6건: 프로젝트 내부 경로 참조만. API Key / secret 패턴 0건. **CLEAN**

시크릿 노출 총 **0건**.

## 4. 가독성 / 단순성

### 4-1. Toast.test.tsx 구조

74줄 단일 describe. 5 it 모두 한국어 설명 + `#19` 이슈 참조(신규 it). `afterEach` 모듈 수준 cleanup + timer 복원이 최상단에 명시되어 각 it 간 격리 의도 명확.

### 4-2. snapshot it 내부 흐름

```
success render -> asFragment -> toMatchSnapshot('Toast-success')
-> cleanup()
-> error render -> asFragment -> toMatchSnapshot('Toast-error')
```

위에서 아래로 linear하게 읽히며 분기 없음. `cleanup()` 호출 위치가 두 variant 사이에 명확히 배치. `durationMs={null}`로 timer side-effect를 명시적으로 비활성화 -- 방어적 코딩.

### 4-3. sub-snap 네이밍

`'Toast-success'` / `'Toast-error'` -- 컴포넌트명 + variant를 결합. snapshot 키가 자기 설명적이며, `.snap` 파일에서 검색/식별 용이. 기존 4종은 hint 없는 `toMatchSnapshot()` 사용이나, Toast는 1 it 내 2 snap이므로 hint 필수 -- 적절한 차이.

### 4-4. author 일관성

author = `jungsoobin96@users.noreply.github.com` -- feature docs 6건 모두 동일. 이전 #51/#52/#18 패턴과 일관.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| 기존 4종(ArticleCard/CommentList/Pagination/TagList)은 hint 없는 `toMatchSnapshot()`, Toast만 hint 사용 -- 일관성 차이 | Yes | No | Yes | A.Now-Minor: 1 it 내 2 sub-snap 상황에서 hint는 필수(동일 hint index 충돌 방지). 기존 4종은 1 it 1 snap이므로 hint 불필요. 패턴 차이는 상황에 의한 것이며 정당 |
| Toast.test.tsx.snap 파일이 git에 커밋되면 향후 디자인 토큰 변경 PR마다 해당 파일 diff 발생 -- 리뷰 부담 | No | No | No | A.Derived: risk.md F-RISK-01에서 이미 식별 + 완화책(vitest -u + 시각 review) 명시. 운영 절차 명문화는 Sprint 6+ |
| eng-review.md 6 발견 사항 표가 3열(Q/답/처리) 형식이고 code-review의 5열(3축 OX)과 다름 | Yes | No | Yes | A.Now-Minor: eng-review와 code-review는 별도 schema. eng-review validate 통과했으므로 형식 정합. code-review 내 5열 OX는 본 문서에서 별도 적용 |

## 6. NEEDS-WORK 항목

(없음 -- verdict=PASS, MAJOR 0건, MINOR 0건. 발견 사항 3건 모두 머지 비차단.)
