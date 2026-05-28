---
doc_type: feature-risk
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03, R-N-04]
  F-ID: [F-09]
  supersedes: null
---

# feat-final-golden-path-eval — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 4 F-RISK Low 등급 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | UC-06 fresh checkout 시도 실패 — README 누락 단계 발견 | 3 | 2 | Low |
| F-RISK-02 | 외부 시도자 모집 지연 — 시도 1명만 확보로 KPI 1차 측정 미흡 | 2 | 3 | Low |
| F-RISK-03 | 평가 #4 ⚠️ N/A 표기 vs *완전 7/7* 인식 격차 — 외부 평가자 혼동 | 2 | 2 | Low |
| F-RISK-04 | README §10 신설 절이 §1~§9 인식 구조 침범 — 입문자 진입점 분산 | 2 | 1 | Low |

> 모든 RISK Low — docs only PR (코드·테스트·DB 무변경). Rollback 단순(revert 1 commit). High 등급 0건이므로 §3 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: UC-06 fresh checkout 시도 실패

- **카테고리**: 재현성
- **트리거 신호**: 저자 또는 외부 시도자가 README §3 설치 또는 §4 실행 단계에서 부팅 실패 — Node 버전 mismatch / pnpm 미설치 / 포트 충돌 / DB 시드 누락 등
- **완화 전략**: 실패 발견 시 *본 PR 같은 추가 commit*으로 README 보강 — UC-06 실패 흐름 1~3 대응(Node LTS 안내·포트 우회·`pnpm seed` 명시)이 이미 정본 명시되어 있으므로 *추가 케이스만* 보강. attempts.md에 실패 단계·우회 절차 기록은 *증거*로 보존(README 보강에도 attempts.md 기록은 유지 — 학습 자산). README 보강이 본 PR scope 안인 이유는 R-N-03 §"테스트 시나리오 Failure: 누락된 단계 발견 시 ADR로 README 보강" 정합.
- **검증 방법**: P10 ai-qa-report `## 6` 또는 P14 휴먼 게이트에서 attempts.md 시도 결과 1건 이상이 *최종 부팅 성공*인지 확인. 모든 시도 실패면 BLOCKED → README 추가 commit.

### F-RISK-02: 외부 시도자 모집 지연

- **카테고리**: 운영
- **트리거 신호**: 외부 동료 1명이 시도 응답 지연(>1~2일) → Sprint 6 마무리 일정(2026-06-12) 압박
- **완화 전략**: O-24-1 결정 정합 — (a) 저자 본 PC + 다른 PC 1대 fresh dir 시도 2회 우선 + (b) 동료 시도는 비동기 wait. 본 PR 머지 시점에 (b) 미응답이면 머지 후 외부 시도 결과 코멘트 보강 허용(별 PR 안 만듦, attempts.md update commit은 후속 docs-only PR 가능). KPI #1 1차 측정은 N=1~3로 충분 — AC-03 정합.
- **검증 방법**: P14 휴먼 게이트에서 attempts.md 시도 ≥ 1건 확인. KPI 미달분 사유 (`외부 시도자 모집 *완전 10명*은 본 PR scope 밖`)가 §3 인수에 명시되어 있는지 확인.

### F-RISK-03: 평가 #4 ⚠️ N/A 표기 인식 격차

- **카테고리**: 운영
- **트리거 신호**: 외부 평가자가 `eval-matrix.md`의 `6/7 PASS + 1 N/A` 표기를 *Sprint 1 MVP scope 부족*으로 오인 → 부정적 평가
- **완화 전략**: `eval-matrix.md` #4 행의 결과 컬럼에 `⚠️ N/A (Phase 2 F-13)` + 사유 컬럼에 "F-13 페이지네이션은 RFP §3 Phase 2 백로그이며 README §10에 명시"를 *동일 행 안*에 표기. README §10이 본 PR 동시 산출이므로 외부 평가자는 *한 PR 안에서* Phase 1/2 경계를 즉시 인지. KPI 완화 ADR은 본 PR scope 밖이지만 *Acceptance §3*에 KPI 1차 측정 미달분 사유가 명시되어 있어 외부 평가자가 본 PR 의도(*1차 측정*)를 오인하지 않음.
- **검증 방법**: P9 code-review에서 `eval-matrix.md` #4 행에 N/A 사유 + Phase 2 출처가 둘 다 명시되어 있는지 확인.

### F-RISK-04: README §10 신설 절이 인식 구조 침범

- **카테고리**: UX (문서)
- **트리거 신호**: 입문자가 README §1~§9를 읽는 도중 §10을 만나 *Phase 1 미완성*으로 오인 → 학습 의지 저하
- **완화 전략**: §10 제목을 *"Phase 2 향후 확장"* (미래 시점 명시) + 첫 줄에 "Phase 1 MVP는 §1~§9로 완결. 다음 학습 사이클을 위한 백로그를 본 절에 정리"라는 1줄 안내. README §6 평가 기준 표의 #4 행은 *기존 그대로 유지*(⚠️ Phase 2 예정 (F-13))되어 평가 표 ↔ §10 백로그가 자연 연결. 본 PR plan §1 C3 커밋이 §10만 단독 추가하므로 §1~§9 무변경 — 인식 구조 침범 최소.
- **검증 방법**: P9 code-review에서 §10 제목 + 첫 줄 안내 + §1~§9 무변경 확인.

## 3. High 등급 단계적 롤아웃

- N/A — High 등급 RISK 0건. 모두 Low.
- docs only PR이므로 부분 배포·feature flag·canary 등 단계적 롤아웃 메커니즘 부적용. revert는 단일 commit (Rollback 3단계 — contract §5).

## 4. 데이터 영속성 변경

- 없음. DB·파일시스템·세션 상태 무변경. attempts.md·eval-matrix.md·screenshots/는 정적 파일(읽기만, 영속 상태 아님). UC-06 fresh checkout 시도는 *임시 dir* 사용 권장(`/tmp/uc06-trial-*` 등) — 본 repo 작업 트리 오염 0.

## 5. 15-risk.md 갱신 항목

- 없음. 본 변경의 4 RISK는 모두 Low + 본 feature 범위 내 한정. 15-risk 1수준 산출에 fan-in 불필요. P13 docs-update에서 docs/planning/CHANGELOG.md §"Current Status"에 "Sprint 6 #24 UC-06 실증 + 평가 7개 매핑 + Phase 2 README" 1줄만 추가.
