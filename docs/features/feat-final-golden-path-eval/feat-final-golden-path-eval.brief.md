---
doc_type: feature-brief
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

# feat-final-golden-path-eval — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 8 섹션 채움 + mode=add 결정 트레이스 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

UC-06 "새 PC에서 README 재현"을 저자 1회 + 외부 1~2명으로 실제 수행하고, RFP §10 평가 기준 7개를 1:1로 검증한 결과를 `docs/features/feat-final-golden-path-eval/`에 증거(스크린샷·시도 로그·매핑 표) + Phase 2 로드맵을 README §10에 정리한다.

## 2. 사용자 가치

- **평가자(Park, UC-06 주체)**: README 절차만으로 새 PC에서 부팅·시드 노출·평가 기준 통과 여부를 5분 내 판정 가능 — KPI #1 (10명 시도 100% 성공)의 1차 측정 근거
- **저자(jungsoobin96)**: Sprint 1~5 누적 산출이 외부 재현 가능한 골든패스로 통합 검증되어 Phase 2 진입 시점 명확
- **차회 학습자**: Phase 2 로드맵(F-13 페이지네이션 등 백로그)이 README §10에 명시되어 다음 학습 사이클의 시작점 인지

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| UC-06 실증 | #22 PR #65로 README 작성 완료, 실제 *fresh checkout 시도 결과* 0건 | 저자 1회 + 외부 시도 1~2명 시도 결과 md 기록 (`feat-final-golden-path-eval.attempts.md`) |
| 평가 기준 7개 매핑 | README §6 표 7행 (이미 매핑 — Sprint 5 시점) | 동일 표 + 통과 결과(스크린샷·시도 시점·검증 결과) 1:1 첨부 (`feat-final-golden-path-eval.eval-matrix.md`) |
| Phase 2 로드맵 | RFP.md만 안내 (README에 별도 절 없음) | README §10 "Phase 2 향후 확장" 절 추가 — F-13 페이지네이션·세션 인증·검색 등 백로그 5~7건 1:1 매핑 |
| gstack `/qa` 최종 호출 | Sprint 5 #21 시점 E2E 5건 PASS 기록 (`docs/features/feat-e2e-golden-path/`) | UC-06 흐름을 gstack `/qa`로 1회 최종 호출 + 스크린샷 (`screenshots/uc06-*.png`) |
| Sprint 6 P0 누적 진행 | #22 (README) + #23 (한국어 주석) 완료, #24 본 작업 진행 중 | Sprint 6 P0 3건 완료, 잔여는 #25 (P1 잔여 버그) |

## 4. 모드 자동 감지 결과

- **mode**: `add` (ADR-0032 규칙 4 — 부정 시그널 0건, 자동 결정·질문 금지)
- **트레이스**:
  - 부정 시그널 ① `type:bug` 라벨: ❌ 없음 (라벨은 `type:test`)
  - 부정 시그널 ② UI/시각/token/리브랜딩/다크모드 키워드: ❌ 없음 (스크린샷 첨부는 *시각 변경*이 아닌 *증거 첨부*)
  - 부정 시그널 ③ 기존 동작 변경 / "바꿔" / breaking: ❌ 없음 (UC-06 실증 + 평가 매핑 + README Phase 2 절 *신규 추가*)
  - 합계: 부정 시그널 0건 → 규칙 4 발동 → **mode=add 자동 결정**
- **타입 표**: `type:test` 라벨은 *테스트 작업* 의미. ADR-0032 표에서 `type:test`는 부정 시그널 어느 칸에도 매핑 안 됨 → add 결정에 영향 없음.

## 5. 영향 범위

- **신설 디렉토리**: `docs/features/feat-final-golden-path-eval/` (P8 산출 폴더)
  - `feat-final-golden-path-eval.{brief,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md` (8 산출)
  - `feat-final-golden-path-eval.attempts.md` (UC-06 시도 결과)
  - `feat-final-golden-path-eval.eval-matrix.md` (RFP §10 평가 기준 7개 매핑 + 통과 결과)
  - `screenshots/uc06-*.png` (gstack `/qa` 스크린샷 1~3장)
- **README 수정**: `README.md` §10 신설 "Phase 2 향후 확장" 절 (~30 라인 추가)
- **R-ID·F-ID 정본 read-only 참조**: `docs/planning/04-srs/04-srs.md` §R-N-03/04, `docs/planning/05-prd/05-prd.md` §F-09, `docs/planning/03-user-scenarios/03-user-scenarios.md` §UC-06, RFP.md §10
- **코드 영향**: 0 (docs only)
- **외부 의존 추가**: 0 (gstack `/qa`는 이미 도입)

## 6. 비목표

- KPI #1 "10명 시도 100% 성공" *완전 달성*은 본 PR scope 밖 — 본 PR은 1~3명 표본으로 *1차 측정*만. 10명 미달 시 KPI 완화 ADR을 산출할 수 있으나 (Acceptance 3번 항목 명시), ADR 자체 작성은 후속 이슈 분리 가능.
- 평가 기준 #4 (페이지네이션) 구현은 본 PR scope 밖 — F-13으로 Phase 2 로드맵에만 명시 후 ⚠️ N/A 처리.
- gstack `/qa` 자동화 스크립트 추가는 본 PR scope 밖 (O-09 → 12 Test Design 결정 사항).
- 시도자 3명이 모두 동일 PC 환경에서 시도하는 *통제 변수 실험*은 본 PR scope 밖 — fresh checkout 재현성 1차 측정에 집중.

## 7. Open Questions

- O-24-1: 외부 시도자 1~2명을 어떻게 모집할 것인가? 후보 — (a) 저자 본인이 *다른 PC 2대*로 fresh checkout 시도(가장 빠름), (b) 동료 1~2명에게 git clone 부탁(외부 검증). DoD #2 "외부 시도 1~2명"의 실제 의미는 P1 contract 단계에서 (a)·(b) 중 채택 결정. **Sprint 6 P0 완수가 우선이라면 (a) 우선 + (b) 보조** 권장.
- O-24-2: 평가 기준 #4 (페이지네이션 F-13) ⚠️ 결과를 *7/7*에서 어떻게 표현할까? 후보 — (a) `6/7 PASS + 1 N/A (Phase 2)`로 표기, (b) RFP §10 평가 기준 7개 *재정의* ADR(Phase 1 scope에서 F-13 제외 명시). 후보 (a)가 적은 변경 + KPI 1차 완화 ADR 후보.
- O-24-3: gstack `/qa` 호출 결과의 스크린샷이 `docs/features/feat-final-golden-path-eval/screenshots/`와 README §6 표 모두에 첨부될 때 — *중복 인용*을 피하려면 README 표는 기존대로 `e2e/specs/*.spec.ts` 참조만 유지하고 본 PR 산출은 별도 위치만 두는 게 정합. P1 contract Before/After에서 확정.
