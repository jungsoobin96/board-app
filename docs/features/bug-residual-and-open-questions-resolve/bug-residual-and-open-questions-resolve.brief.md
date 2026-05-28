---
doc_type: feature-brief
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

# bug-residual-and-open-questions-resolve — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 8 sections + mode=bug 결정 trace + 잔여 결함 0건 확인 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

Sprint 6 마지막 잔여 작업으로 01~14 산출에 누적된 Open Q O-01~O-29 (29건)를 일괄 점검·분류하고, backend 잔여 결함 0건임을 회귀 100% PASS + 코드 grep 0건으로 확정한다.

## 2. 사용자 가치

- **외부 평가자**: 본 PR 머지 후 docs/planning/ 산출 어떤 절을 펴도 "미결정 Open Q" 가 보이지 않음 — Sprint 6 산출 정합성 100% 가독성 확보
- **저자 본인**: Open Q 29개 결정 1건의 ADR(`0049-open-questions-resolution.md`)로 묶어 향후 Phase 2 진입 시 *결정 trace* 한곳에서 조회 가능
- **다음 학습 사이클 협업자**: backend 회귀 100건 + 통합 36건 PASS 결과를 본 PR `bug-*.investigation.md`에 박아 *MVP 안정성 baseline* 명시

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (본 PR 진입 전) | 변경 후 (본 PR 산출) |
| --- | --- | --- |
| Open Q 해소 상태 | O-01~O-29 (29건) 산재 — 일부 이미 해소(예: O-19 #24 eval-matrix), 일부 미결정 | `openq-resolution.md` 1건에 29건 분류 표 (✅ 해소완료 / 🆕 본 PR ADR 결정 / 🔁 Phase 2 보류 / 🔁 중복) + 산출별 §Open Questions 행에 상태 마커 inline 갱신 |
| ADR 결정 누적 | ADR 0048까지 (가장 최근 = ADR-0048 P-1 이슈 상태 검사) | ADR-0049 신설 — Open Q 29건 일괄 결정 ADR |
| backend 잔여 결함 baseline | 알려진 결함 보고 0건 (불확실) | "회귀 100% PASS + grep 0건"으로 *결함 0건* 명시 확정 (investigation.md) |
| Sprint 6 진행도 | 3/N (#22 + #23 + #24 머지 완료) | 4/N (#25 머지 = Sprint 6 P0 + P1 100% 완료) |
| 잔여 P1 | #25 (본 PR) + #48 (frontend, Sprint 5 이관) + #56 (title-lint, Sprint 5 이관) | #48 + #56 만 잔여 (Sprint 5 이관건 — Sprint 7 또는 별 retro 처리) |

## 4. 모드 자동 감지 결과

- **mode**: `bug` (자동 결정)
- **결정 trace**:
  - 규칙 1 (ADR-0032) — 이슈 라벨 `type:bug` 명시 → **mode=bug** 우선 매핑
  - 규칙 2 (UI/design) — 키워드 0건 → 부정 시그널 0
  - 규칙 3 (modify) — "동작 다르게"/breaking 키워드 0건 → 부정 시그널 0
  - 규칙 4 (add) — 본 라벨 `type:bug`가 명시되어 우선 → add 후순위
  - 종합: 부정 시그널 동시 충돌 0건 → 자동 결정 통과 (질문 금지, 규칙 4 기본값 발동 안 함)
- **모드별 강제 단계 적용**:
  - P3a `debug-investigator` 선행 — 본 PR scope에서 "재현할 결함이 없음을 회귀 전수 + grep 결과로 확정"이 *재현 산출* 역할 (investigation.md §"재현 결과: 결함 0건 확인")
  - 회귀 테스트 추가 강제 — 본 PR scope에서 결함 0건 + Open Q 해소는 docs only 변경이므로 회귀 테스트 추가 필요성 N/A (investigation.md §"회귀 테스트 추가 필요성: N/A 사유" 명시)

## 5. 영향 범위

| 영역 | 파일 | 변경 |
| --- | --- | --- |
| 신규 features 폴더 | `docs/features/bug-residual-and-open-questions-resolve/` | brief / contract / plan / eng-review / acceptance / risk / code-review / ai-qa-report 8건 + `bug-*.investigation.md` (mode=bug 강제) + `bug-*.openq-resolution.md` (Open Q 29건 분류) |
| ADR 신설 | `docs/planning/adr/0049-open-questions-resolution.md` | Open Q 29건 일괄 결정 ADR |
| 01~14 산출 inline update | `docs/planning/0X-*/0X-*.md` §Open Questions | 각 O-* 행에 상태 마커 (✅/🆕/🔁) 추가. WARN 등급 갱신 (변경 이력 한 줄 추가) |
| 14 WBS | `docs/planning/14-wbs/14-wbs.md` §8 Open Questions | O-25~O-29 결정 마커 갱신 |
| CHANGELOG | `docs/planning/CHANGELOG.md` | Sprint 6 진행 표기 갱신 |
| 코드·테스트·DB | (없음) | **무변경** — backend 회귀 100% PASS + grep 0건 = 결함 0건 |

docs only PR.

## 6. 비목표

- **신규 기능 구현 0건** — F-13 페이지네이션 등 Phase 2 항목은 본 PR scope 밖
- **KPI 완화 ADR 본 PR scope 밖** — O-28 (RFP §10 #7 KPI 완화)은 본 PR에서 *Phase 2 후보로 보류* 결정만, 별 ADR은 후속 이슈
- **외부 시도자 추가 측정 본 PR scope 밖** — #24 attempts.md §8 결과(N=2/10 환경 의존)는 그대로 유지
- **frontend 잔여 #48 결함 본 PR scope 밖** — area:backend 한정. frontend TS 3건은 별 PR #48
- **title-lint 정책 본 PR scope 밖** — #56 별 PR

## 7. Open Questions

본 PR 자체의 Open Q (점검 대상 O-01~O-29와 별개):

- O-25-1: ADR-0049 본문에 29건 모두 *근거 인용*을 넣으면 분량 권고 300줄 초과 위험 — 표 형식 1행/O로 압축 결정 (본 PR plan §1 C2 commit 결정)
- O-25-2: 01~14 산출 inline update를 commit 1개로 묶을지 산출별로 분할할지 — commit 1개로 묶음 (atomic + reviewer 부담 ↓)
- O-25-3: backend "결함 0건 확정"의 baseline 보장 기간 — *본 PR 머지 시점* baseline. 향후 회귀 시 별 이슈 (KPI 측정과 동일)

## 8. 다음 단계

- P3a `/debug-investigator` — `bug-*.investigation.md` 작성 (회귀 100% PASS + grep 0건 + Open Q 29건 점검 결과)
- P3 `/change-contract` — §0 5행 + Before/After + Rollback
- P4 `/implementation-planner` — 5 commits DAG (investigation → openq-resolution → ADR-0049 → 산출 inline update → CHANGELOG)
