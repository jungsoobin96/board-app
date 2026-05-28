---
doc_type: feature-brief
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-05]
  F-ID: [F-10]
  supersedes: null
---

# feat-korean-comments-coverage — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 8섹션 채움 + mode=add 결정 근거 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

핵심 4 layer(controllers·services·repositories·components) 한국어 주석 커버리지를 *측정 가능*하게 만들고 ≥ 80% 충족시켜 학습자가 "왜" 패턴을 모국어로 학습할 수 있게 한다 (R-N-05 / F-10).

## 2. 사용자 가치

- **학습자(Junior dev / 신규 합류자)**: 핵심 layer 함수마다 한국어 주석으로 "왜 이 패턴인지" 즉시 이해 → RFP §6.5 학습 친화성 목표 달성.
- **저자·리뷰어**: PR마다 커버리지 측정 자동화 → 회귀(주석 누락) 즉시 감지 + PR 코멘트 보강 요청 자동.
- **운영**: 측정 스크립트(`scripts/check-comment-coverage.sh`)가 CI lint job(선택)으로 진화 가능 — F-10 Acceptance "Failure: 누락 모듈 발견 시 보강 요청" 자동화 기반.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| 한국어 주석 커버리지 측정 도구 | 부재 (O-16 미해소) | `scripts/check-comment-coverage.sh` 신설 — grep 룰 기반 (O-16 결정) |
| 4 layer 함수 헤더 한국어 주석 | 산발적 (측정 안 됨) | 4 layer 각각 한국어 주석 비율 ≥ 80% (자동 측정) |
| 회귀 방지 | 수동 PR 리뷰 의존 | 스크립트 실행 1회로 누락 함수 목록 출력 — PR Manual verification에 결과 포함 |
| CI 통합 | 없음 | 본 PR scope 밖 (선택, DoD #3) — 후속 이슈로 분리 가능 |
| F-10 Acceptance 충족 | ❌ (측정 불가) | ✅ (스크립트 출력으로 검증) |

## 4. 모드 자동 감지 결과

- **mode**: **add** (자동 결정, ADR-0032 규칙 4)
- **결정 근거 (Mode Decision Trace)**:
  - 부정 시그널 #1 (`type:bug` 라벨 / 에러 로그): 0건 (라벨 `type:docs`)
  - 부정 시그널 #2 (UI/design 키워드): 0건
  - 부정 시그널 #3 (기존 동작 변경 / breaking 가능성): **0건** — 주석 추가는 런타임 동작·시그니처·API 영향 0
  - 신규 add 시그널: **신설 스크립트(`scripts/check-comment-coverage.sh`)** + 신설 파일 유형 (주석은 신규 텍스트 추가)
- **결정**: 부정 시그널 0건 → 규칙 4 기본값 add. 사용자 질문 없이 자동 진행.
- **slug 접두**: `feat-` (feature-*.schema.yaml filename_pattern 정합)
- **branch**: `feat/korean-comments-coverage-issue-23` (ADR-0044)

## 5. 영향 범위

**신설**:
- `scripts/check-comment-coverage.sh` (신규, bash POSIX, grep 룰 기반)

**변경 (주석만 추가, 런타임 동작 0 영향)**:
- `backend/src/controllers/` 함수 헤더 한국어 주석 ≥ 80%
- `backend/src/services/` 함수 헤더 한국어 주석 ≥ 80%
- `backend/src/repositories/` 함수 헤더 한국어 주석 ≥ 80%
- `frontend/src/components/` 함수/컴포넌트 헤더 한국어 주석 ≥ 80%

**참조 정본 (read-only)**:
- `docs/planning/04-srs/04-srs.md` §R-N-05
- `docs/planning/05-prd/05-prd.md` §F-10
- `docs/planning/11-coding-conventions/11-coding-conventions.md` (주석 컨벤션, 있으면)
- `docs/planning/12-scaffolding/typescript.md` (layer 정의 정본)

**무영향**:
- 런타임 동작, API 시그니처, DB schema, UI 렌더링, 테스트 결과 모두 무변경.
- 회귀 위험 0 (주석은 컴파일·실행 영향 0).

## 6. 비목표

- **e2e·shared layer 주석 커버리지**: F-10 정의 4 layer 밖 — 본 PR scope 밖.
- **테스트 코드(`*.test.ts`·`*.spec.ts`) 주석 커버리지**: 테스트는 학습 대상 코드 아님 — scope 밖.
- **CI lint job 강제**: DoD #3 *선택* 명시 — 본 PR은 스크립트 신설 + 보강만, CI 통합은 별도 후속 이슈로 분리 가능.
- **자동 보강 (LLM이 주석 자동 작성)**: 본 PR은 사람(저자)이 *의미 있는* 한국어 주석 직접 작성. 자동 생성 주석은 학습 가치 낮음.
- **영어 주석 제거**: 기존 영어 주석 보존 — 한국어 주석 *추가*만 (혼용 허용, R-N-05 "한국어 주석 비율"만 측정).

## 7. Open Questions

- O-23-1: 한국어 주석 측정 단위 — **함수 헤더 1줄 위 주석 라인** vs **함수 본문 한국어 주석 포함**. 결정: 함수 헤더 라인 위 (정적 측정 단순 + grep 룰 일관). P3 contract에서 확정.
- O-23-2: "함수" 범위 — JS arrow function·class method·React FC 컴포넌트 모두 포함하는가? 결정: 모두 포함 (각 layer에서 export되는 모든 함수/컴포넌트 단위). grep 룰로 `function `·`const ... = (`·`export default function`·`async function` 패턴 매칭. P3 contract §0 코딩 컨벤션 절 참조.
- O-23-3: CI lint job 추가 여부 — DoD #3 선택. 본 PR scope 결정: **포함하지 않음** (별도 후속 이슈로 분리 — 본 PR은 스크립트 신설 + 측정 + 보강만). 사유: ADR-0047 workflow 검증 부담 추가, scope creep 회피.
