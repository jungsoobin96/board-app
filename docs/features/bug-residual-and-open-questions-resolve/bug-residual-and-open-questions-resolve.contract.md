---
doc_type: feature-contract
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

# bug-residual-and-open-questions-resolve — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §0 5행 + Before/After 5행 + Rollback 3단계 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | (none) — 본 PR은 R-ID 변경 0 (docs 정합 갱신만) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-09 (간접 — docs Open Q 해소가 학습 친화성 기능 정합) |
| 영향 모듈 | docs/planning/08-lld-module-spec | (none) — 코드·모듈 무변경 (결함 0건 baseline) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | (none) — API 무변경 |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | (none) — 컨벤션 변경 0 |

## 1. 변경 의도

Sprint 6 마지막 잔여 작업으로 docs/planning/ 산출에 누적된 Open Q O-01~O-29 (29건)를 ADR-0049로 일괄 결정 + 각 산출 §Open Questions 행에 상태 마커(✅/🆕/🔁) inline 추가하고, backend 잔여 결함 0건임을 회귀 191 PASS + grep 0건 baseline으로 확정한다.

## 2. Before / After

| 항목 | Before (본 PR 진입 전) | After (본 PR 산출) |
| --- | --- | --- |
| Open Q 해소 상태 | O-01~O-29 (29건) 산재 — 일부 이미 해소(O-19 #24·O-05 #23 등) + 일부 미결정 | `openq-resolution.md` 1건에 29건 분류 표 + 산출별 §Open Questions inline 상태 마커 |
| ADR 누적 | 0048까지 | 0049 신설 — Open Q 29건 일괄 결정 |
| backend 잔여 결함 baseline | "잔여 buffer" — 알려진 결함 없으나 baseline 미명시 | `investigation.md`에서 "회귀 191 PASS + grep 0건 = 결함 0건" baseline 박음 |
| Sprint 6 진행도 | 3/N (#22 + #23 + #24 머지 완료) | 4/N (#25 머지 = Sprint 6 P0 + P1 본 sprint 작업 완료) |
| docs/planning/CHANGELOG.md §Current Status | "Sprint 6 진행: 3/N" | "Sprint 6 진행: 4/N (#25 완료, P0+P1 본 sprint 작업 100%)" |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `docs/features/bug-residual-and-open-questions-resolve/` (신설) | brief / contract / plan / eng-review / acceptance / risk / code-review / ai-qa-report 8건 + investigation.md + openq-resolution.md = 10건 신설 | 본 PR로 신설 |
| `docs/planning/adr/0049-open-questions-resolution.md` (신설) | Open Q 29건 일괄 결정 ADR | 본 PR C2 commit으로 신설 |
| `docs/planning/01-project-brief/01-project-brief.md` §8 Open Questions | O-01~O-05 행에 상태 마커 inline 추가 | C3 commit (산출 inline update) |
| `docs/planning/03-user-scenarios/03-user-scenarios.md` §5 Open Questions | O-06~O-09 inline 마커 | C3 commit |
| `docs/planning/04-srs/04-srs.md` §6 Open Questions | O-10~O-14 inline 마커 | C3 commit |
| `docs/planning/05-prd/05-prd.md` §7 Open Questions | O-15~O-19 inline 마커 | C3 commit |
| `docs/planning/10-lld-screen-design/10-lld-screen-design.md` §5 Open Questions | O-20~O-24 inline 마커 | C3 commit |
| `docs/planning/14-wbs/14-wbs.md` §8 Open Questions | O-25~O-29 inline 마커 | C3 commit |
| `docs/planning/CHANGELOG.md` §Current Status | Sprint 6 진행 표기 4/N 갱신 + 본 PR 1줄 추가 | C4 commit |

> 단방향 참조 — Open Q 행에 마커 추가는 *주석 성격*이지 의미 변경 0 (이미 해소된 항목은 이미 다른 산출에서 결정되어 있음, 본 PR은 *마커*만 추가).

## 4. Backward Compatibility

- **Breaking**: no
- **마이그레이션 필요**: no
- **코드·런타임·DB 무영향**: docs only PR. backend·frontend·infra 0 byte 변경
- **deprecation 일정**: N/A
- **이유**: Open Q 마커 inline 추가는 산출 의미 *유지*하면서 *상태 가시성*만 ↑. ADR-0049는 신설 ADR이라 기존 ADR 무영향

## 5. Rollback 전략

- **revert 가능**: yes (squash 단일 commit)
- **rollback 절차** (3단계):
  1. `git log --merges --grep="#25" --oneline -1` → merge_commit hash 추출
  2. `git revert <merge_commit_hash> -m 1` → docs 변경 일괄 revert
  3. `git push origin main` + 회귀 191 PASS 재확인 (revert 후 baseline 동일)
- **데이터 손상 위험**: 없음 (DB·파일시스템·세션 상태 무변경)

## 6. 비목표

- **신규 기능 구현 0건** — F-13 페이지네이션 등 Phase 2 항목은 본 PR scope 밖
- **KPI 완화 ADR 본 PR scope 밖** — O-28 (RFP §10 #7 KPI 완화)은 본 PR에서 "Phase 2 후보로 보류" 결정만, 별 ADR은 후속 이슈
- **외부 시도자 추가 측정 본 PR scope 밖** — #24 attempts.md §8 결과 그대로 유지
- **frontend 잔여 #48 결함 본 PR scope 밖** — area:backend 한정
- **title-lint 정책 본 PR scope 밖** — #56 별 PR
- **회귀 테스트 추가 N/A** — 결함 0건 PR (mode=bug strict rule "회귀 테스트 추가 강제"는 *결함 수정 시* 적용; investigation.md §7 정합)
