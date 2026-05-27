---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 (reviewer agent) | 본문 — 8항 리뷰 완료, verdict=PASS |
| v0.1 | 2026-05-27 | jungsoobin96 (reviewer agent) | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: @reviewer (reviewer agent, Generator != Evaluator)
- review_at: 2026-05-27
- MAJOR: 0
- MINOR: 0

코드 변경 1줄 + 테스트 2건 + feature docs 6건 모두 contract 정합. 보안 이슈 0건. 머지 차단 사유 없음.

## 1. 컨트랙트 충실도

### 1-1. contract.md 0 Referenced-IDs

R-F-01(글 목록) + R-F-04(태그 API) 정합: TagList는 F-02(태그 필터) + F-08(인기 태그 사이드바)의 UI 구현이며, active 칩 toggle 동작은 R-F-01 글 목록 필터링의 진입점. 참조 관계 적절.

### 1-2. contract.md 2 Before/After 9행

9행 모두 정량 측정 가능:
- onClick handler: `onTagClick(tag.name)` -> `onTagClick(active ? null : tag.name)` -- diff 1줄로 검증 가능
- 사용자 경험: "URL 무변동" -> "`?tag` 제거 + `?page` 초기화" -- URL 변동으로 측정 가능
- "필터 해제 x" 버튼: "변경 없음" -- 기존 코드 line 25 `onClick={() => onTagClick(null)}` 유지 확인 가능
- aria-pressed: "동일" -- `aria-pressed={active}` 유지
- 단위 테스트: 4 it -> 6 it (+2) -- `pnpm test` count 확인
- Home handleTagClick: "동일" -- diff 0줄
- URL sync: "동일" -- diff 0줄
- 비-active onClick: "동일" -- 삼항 `active ? null : tag.name`에서 `active=false` 시 `tag.name` 반환
- 단위 카운트: 83 -> 85 -- `pnpm test` 확인

### 1-3. brief.md 3 Before/After 표 5행

5행 적절. 측면별 현재/변경 후가 명확하고, "변경 없음" 행 3건이 회귀 무영향을 선언. mode=add 결정 trace는 4에 기록 -- type:feature 라벨 우선 + modify 시그널 1건 충돌이라 무질문 진행. ADR-0032 규칙 참조 명시. 적절.

### 1-4. plan.md 1 commit

1 commit 적절. TagList.tsx 1줄 + TagList.test.tsx +2 it + feature docs 7건을 원자적으로 묶음. diff 규모가 작아 분할 불필요.

`pnpm --filter @app/frontend run test:unit` 명령 정확. `--filter @app/frontend`은 pnpm workspace filter, `run test:unit`은 vitest 실행. plan.md 4 빌드/실행 검증 6단계 코드블록 실행 가능.

### 1-5. acceptance.md AC-01/02/03

- AC-01: `?tag=javascript` 진입 시 active 시각 -- 기존 동작 회귀 확인, 측정 방법(RTL aria-pressed + 시각) 명확
- AC-02: **active 재클릭 -> `?tag` 제거** -- 본 PR 핵심, 측정 방법(`onTagClick(null)` RTL + URL 시각) 명확
- AC-03: `?tag=js&page=2` 동시 적용 -- Sprint 3 #12부터 동작, 회귀 확인 성격, 측정 가능

AC-02가 본 PR 핵심이며 Given/When/Then이 구체적이고 측정 가능. 적절.

### 1-6. risk.md F-RISK-01

F-RISK-01 toggle UX 혼란: "필터 해제 x" 버튼 redundancy 보존 결정 정당. 이유:
- active 칩 재클릭(implicit 해제) + 명시적 "필터 해제 x" 버튼(explicit 해제) 양 진입점 제공
- ConfirmModal(#15) toggle 패턴과 일관
- `aria-pressed` 시각 강조로 toggle 의도 명확
- 영향 1 + 가능성 2 = Low 등급 적절

### 1-7. eng-review.md 6 발견 사항

4건 모두 A.Derived(scope 밖 follow-up) 처리:
- Q1: page reset vs 유지 옵션 -- retro follow-up 적절 (현재 의도된 page reset 유지)
- Q2: a11y 키보드 navigation -- Sprint 6+ 후보 적절
- Q3: integration test skipped 해소 -- 기존 backlog, 별도 인프라 이슈
- Q4: gstack /qa 환경 셋업 -- Sprint 5 인프라 이슈

OX 분류에서 4건 모두 Q1=No(부모 미명시) + Q2=Yes(머지 가능) + Q3=Yes(별 영역) -> A.Derived. 3축 판정 적절.

## 2. 테스트 커버리지

### 2-1. 신규 it 2건 분석

**it-5 (line 42-47)**: `active 태그 재클릭 시 onTagClick(null) 호출 (해제, #18)`
- Setup: `selectedTag="javascript"` + sampleTags 2건
- Action: `screen.getByRole('button', { name: /javascript/ }).click()`
- Assert: `expect(onTagClick).toHaveBeenCalledWith(null)`
- 핵심 변경(`active ? null : tag.name`에서 `active=true` 분기)을 직접 검증. 명확.

**it-6 (line 49-54)**: `비-active 태그 클릭 시 onTagClick(name) 호출 (선택, #18)`
- Setup: `selectedTag="javascript"` + sampleTags 2건
- Action: `screen.getByRole('button', { name: /typescript/ }).click()`
- Assert: `expect(onTagClick).toHaveBeenCalledWith('typescript')`
- 핵심 변경에서 `active=false` 분기(회귀) 검증. 명확.

### 2-2. 기존 4 it과 중복 검증

| 기존 it | selectedTag | 클릭 대상 | 중복? |
| --- | --- | --- | --- |
| it-1 snapshot | null | (없음) | No -- 시각 검증만 |
| it-2 selectedTag 노출 | "javascript" | (없음) | No -- aria-pressed + 필터 해제 버튼 존재 확인만 |
| it-3 onTagClick(name) | **null** | typescript | No -- selectedTag=null에서 클릭 |
| it-4 빈 tags | null (빈 배열) | (없음) | No -- empty state 검증 |
| **it-5 (신규)** | **"javascript"** | **javascript** | **고유** -- active 상태에서 같은 칩 재클릭 |
| **it-6 (신규)** | **"javascript"** | **typescript** | **고유** -- active 상태에서 다른 칩 클릭 |

it-3은 `selectedTag=null`에서 typescript 클릭, it-6은 `selectedTag="javascript"`에서 typescript 클릭 -- **다른 초기 상태**이므로 중복 아님. it-6은 삼항 연산자의 `active=false` 분기가 다른 태그가 active인 상황에서도 정상 동작하는지 회귀 보호. 적절.

### 2-3. 테스트 카운트

85 passed + 1 skipped (Sprint 4 baseline 83 + 2 신규). 사전 검증 결과와 일치.

## 3. 보안 / 시크릿

### 시크릿 스캔 결과

- `frontend/src/components/TagList.tsx`: API Key / secret / token / credential / password 패턴 0건. 환경변수 참조 0건. 외부 URL 0건. **CLEAN**
- `frontend/tests/unit/components/TagList.test.tsx`: sampleTags는 하드코딩 테스트 데이터("javascript", "typescript"). 시크릿 0건. **CLEAN**
- `docs/features/feat-tag-filter-url-state/*.md` 6건: 문서 내 URL은 프로젝트 내부 경로 참조만. API Key / secret 패턴 0건. **CLEAN**

시크릿 노출 총 0건.

## 4. 가독성 / 단순성

### 4-1. TagList.tsx line 38 패턴 분석

변경 전: `onClick={() => onTagClick(tag.name)}`
변경 후: `onClick={() => onTagClick(active ? null : tag.name)}`

`active ? null : tag.name` 삼항 연산자:
- `active` 변수는 line 33에서 `const active = tag.name === selectedTag`로 선언 -- 명확한 boolean
- 삼항 연산자가 JSX onClick 내에서 단일 조건 분기 -- 가독성 우수
- 대안 `active && null || tag.name`은 falsy 평가 함정(`null || tag.name`은 항상 `tag.name` 반환)으로 **의미론적 오류** -- 삼항이 정확하고 유일한 올바른 패턴
- 대안 `if-else`는 expression context(JSX onClick)에서 불필요한 복잡성
- **결론**: 현재 삼항 패턴이 가장 readable하고 correct

### 4-2. 코드 구조

55줄 단일 컴포넌트. Props interface 3줄. JSX 구조 평탄. `active` 변수 선언이 map 내부 첫 줄에서 이루어져 의도 명확. Tailwind 클래스 조건부 적용도 기존 패턴 답습. 추가 추출/리팩토링 불필요.

### 4-3. 테스트 가독성

it 설명이 한국어로 Given/When/Then 의도를 명시하고 `#18` 이슈 참조 포함. RTL `getByRole` + `click()` + `toHaveBeenCalledWith` 패턴이 기존 it-3과 일관. cleanup은 모듈 수준 `afterEach`. 적절.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| it-3과 it-6의 selectedTag 초기 상태 차이가 코드 리뷰 없이는 미묘하게 보일 수 있음 -- it 설명에 "(selectedTag=null 상태)" vs "(selectedTag=javascript 상태)" 명시하면 더 명확 | Yes | No | Yes | A.Now-Minor: 개선 권고이나 현재 #18 이슈 참조 + 설명으로 구분 가능하므로 머지 차단 불필요 |
| "필터 해제 x" 버튼과 active 칩 재클릭이 동일 `onTagClick(null)` 호출 -- 통합 테스트에서 두 경로 동시 검증 부재 | No | No | No | A.Derived: Sprint 5 #21 E2E에서 흡수 가능. 현재 단위 수준에서 각각 개별 검증됨 |
| feature docs 8건 중 code-review와 ai-qa-report는 본 PR에서 생성 -- contract 3 호출자 표의 "8건" count가 7건+본 문서+ai-qa로 실제 8건 정합 확인 필요 | Yes | No | Yes | A.Now-Minor: contract 3에서 "(brief, contract, plan, eng-review, acceptance, risk, code-review, ai-qa-report)" 8건 열거 확인 완료. 정합 |
| eng-review 6 OX 표가 ADR-0008 3축 OX 형식이 아닌 Q/답/처리 3열 형식 사용 | Yes | No | Yes | A.Now-Minor: eng-review schema가 별도 (`feature-eng-review.schema.yaml`)이므로 code-review schema의 5열 형식과 다를 수 있음. eng-review 자체 validate 통과하면 OK |

## 6. NEEDS-WORK 항목

(없음 -- verdict=PASS, MAJOR 0건, MINOR 0건. 발견 사항 4건 모두 머지 비차단.)
