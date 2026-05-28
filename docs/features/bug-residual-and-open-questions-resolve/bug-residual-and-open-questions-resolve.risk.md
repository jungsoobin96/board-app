---
doc_type: feature-risk
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: []
  F-ID: [F-09]
  supersedes: null
---

# bug-residual-and-open-questions-resolve — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 4 F-RISK Low 등급 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | "결함 0건" baseline 박은 후 후속 회귀 발견 — baseline 신뢰성 손상 | 3 | 2 | Low |
| F-RISK-02 | Open Q 29건 일괄 결정 ADR-0049이 분량 권고 300줄 초과 — 운영 가드 WARN | 2 | 2 | Low |
| F-RISK-03 | 산출 inline 마커 추가가 §Open Questions 외 절을 침범 — 검토자 혼동 | 2 | 1 | Low |
| F-RISK-04 | O-* 결정 표기와 실제 산출 상태 불일치 — 외부 평가자가 결정 trace 오인 | 2 | 2 | Low |

> 모든 RISK Low — docs only PR (코드·테스트·DB 무변경). Rollback 단순 (revert 1 commit). High 등급 0건이므로 §3 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: "결함 0건" baseline 박은 후 후속 회귀 발견

- **카테고리**: 운영
- **트리거 신호**: 본 PR 머지 후 backend 회귀 191건 중 1건이라도 다음 PR에서 flaky·실패 → "결함 0건" baseline 신뢰성 손상
- **완화 전략**: investigation.md §"환경 / 컨텍스트"에 *본 PR 머지 시점 baseline*임을 명시 — 향후 회귀 발견 시 별 이슈 (`/flow-feature --mode=bug "..."`)로 P3a 재현 + 회귀 테스트 추가 + 수정. baseline 본 시점 1회 측정이므로 *과거 사실*은 손상되지 않음. F-RISK-01의 "신뢰성 손상" 인식은 실제 결함 발생 시 별 PR에서 자연 해소됨
- **검증 방법**: P10 ai-qa-report §"Automated tests"에서 회귀 191건 PASS 재확인 + §"발견 사항" 0건 확인

### F-RISK-02: ADR-0049 분량 권고 300줄 초과 위험

- **카테고리**: 운영 (문서)
- **트리거 신호**: ADR-0049 작성 시 29건 결정 + 근거 인용 + 대안 비교가 합산 300줄 초과 → settings.json hook WARN 출력
- **완화 전략**: plan §5 O-25-1 결정 정합 — 표 형식 1행/O로 *압축*. 근거 인용은 산출 위치만 명시 (예: "O-19 → #24 eval-matrix.md §8"), 본문 인용 없음. 9 sections 표준은 유지하되 §"Decision" 절에 표 1개로 응축. 권고 가이드는 *운영 문서 한정* (CLAUDE.md §"분량 가드")이고 ADR은 산출 문서 → WARN만, BLOCK 없음. 300줄 초과해도 머지 가능
- **검증 방법**: P9 code-review에서 ADR-0049 줄수 확인 + 표 형식 1행/O 적용 여부 확인

### F-RISK-03: 산출 inline 마커가 §Open Questions 외 절 침범

- **카테고리**: UX (문서)
- **트리거 신호**: 01·03·04·05·10·14 산출 6건의 §Open Questions 행에 마커를 추가하는 과정에서 다른 절(예: §"Decision", §"비목표")까지 수정해버림 → 검토자가 의도하지 않은 변경 발견
- **완화 전략**: plan §1 C3 commit이 *§Open Questions 행만* 변경되도록 atomic 보장. 변경 이력 표에 v0.X 한 줄 추가는 *§"변경 이력" 절*만 (이는 schema 정합 요구). 그 외 절 무변경. P9 code-review에서 `git diff <base>...HEAD -- docs/planning/0X-*` 출력의 변경 행이 §Open Questions + §"변경 이력" 절에만 한정됨을 확인
- **검증 방법**: P9 code-review에서 6 산출 diff 출력 확인 + 마커 추가 행 외 변경 0건

### F-RISK-04: O-* 결정 표기와 실제 산출 상태 불일치

- **카테고리**: 운영 (문서)
- **트리거 신호**: `openq-resolution.md`에서 "O-15 ✅ 해소완료 — 10 LLD §2.1 인기 태그 20개 고정"라고 박았는데 10 LLD §2.1을 다시 보니 *실제로는* 결정 명시가 없음 → 외부 평가자 혼동
- **완화 전략**: `openq-resolution.md` 작성 시 각 ✅ 행에 *근거 인용 file:line* 표기 (예: `docs/planning/10-lld-screen-design/10-lld-screen-design.md:42`). P9 code-review에서 ✅ 행 전수 1회 spot-check (29건 중 ✅ 표기 행 모두 file:line 정합 확인). 🆕 / 🔁 행은 본 PR ADR-0049 결정 또는 Phase 2 보류이므로 별도 산출 인용 불필요
- **검증 방법**: P9 code-review에서 ✅ 행 file:line 정합 확인

## 3. High 등급 단계적 롤아웃

- N/A — High 등급 RISK 0건. 모두 Low.
- docs only PR이므로 부분 배포·feature flag·canary 등 단계적 롤아웃 메커니즘 부적용. revert는 단일 squash commit (Rollback 3단계 — contract §5).

## 4. 데이터 영속성 변경

- 없음. DB·파일시스템·세션 상태 무변경. bug-* 10 docs + ADR-0049 + 6 산출 inline update + CHANGELOG는 정적 파일(읽기만, 영속 상태 아님). backend 회귀 시드는 *기존* `prisma/seed.ts` 그대로.

## 5. 15-risk.md 갱신 항목

- 없음. 본 변경의 4 F-RISK는 모두 Low + 본 feature 범위 내 한정. 15-risk 1수준 산출에 fan-in 불필요. P13 docs-update에서 docs/planning/CHANGELOG.md §"Current Status"에 "Sprint 6 #25 Open Q 29건 해소 + 결함 0건 baseline" 1줄만 추가.
