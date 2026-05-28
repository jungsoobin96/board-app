---
doc_type: adr
version: v0.1 (Accepted)
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: C
related:
  R-ID: []
  F-ID: [F-09]
  supersedes: null
---

# ADR 0049 — Open Questions O-01~O-29 일괄 결정

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 29건 일괄 결정 (✅17 + 🆕2 + 🔁P2 8 + 🔁중복 2) |

## 1. 컨텍스트

Sprint 1~6 동안 docs/planning/ 01·03·04·05·10·14 산출에 누적된 Open Q는 O-01~O-29 (29건). 일부는 후속 산출에서 이미 결정됐으나(O-01 React+Vite, O-03 Prisma 등), 일부는 명시 결정 없이 미결정 상태(O-17 반응형 검증 단위, O-23 모바일 inline vs 메뉴 등). Sprint 6 마지막 잔여 작업(#25)으로 *일괄 점검·결정·보류 분류*를 박지 않으면 외부 평가자가 산출 §Open Questions 절을 펴면 미결정 항목을 만나 평가 시간 낭비 + 학습 친화성(F-09) 손상. 본 ADR은 29건 일괄 결정으로 미결정 가시성 0건을 목표.

분량 가드: ADR-0049 본문이 29건 결정 + 근거 인용 + 대안 비교를 전수 담으면 300줄 초과 위험 (운영 문서 가드는 산출 문서엔 WARN만, BLOCK 없음. CLAUDE.md §"분량 가드" 정합). 본 ADR은 결정 요약을 표 형식 1행/O로 압축 + 근거 인용은 부속 문서 `docs/features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md` §8 인용.

## 2. 결정

29건을 4 카테고리로 분류·결정:

| 카테고리 | 건수 | 결정 형식 |
| --- | --- | --- |
| ✅ 해소완료 | 17 | 이미 다른 산출에서 결정된 항목. 본 ADR은 *마커 부착*만 (산출 §Open Questions 행에 ✅ + 근거 file:line 인용) |
| 🆕 본 ADR 신규 결정 | 2 | O-17·O-23 — 본 ADR §"신규 결정 본문" 참조 |
| 🔁 Phase 2 보류 | 8 | MVP scope 밖 — 백로그 명시만. 별 이슈 등록 없음 (보류) |
| 🔁 중복 | 2 | O-12 / O-22 — 다른 O-* 결정과 동일. 마커 + 매핑 명시만 |

전체 분류 표는 부속 문서 [`openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

### 신규 결정 본문 (🆕)

**O-17 — 반응형 검증 단위**: E2E 단일 시나리오로 그룹화 결정. viewport별 분리(mobile / tablet / desktop 각 1건씩) 시 시나리오 폭증(현 5건 → 15건). 본 MVP 학습 부담 ↑ + 분기별 차이 검증은 13-test 03-regression의 시각 회귀 보조로 충분.

**O-23 — 모바일 수정/삭제 inline vs 더보기 메뉴**: inline 유지 결정. 10 LLD §1.2 정합 (Modify/Delete 동일 행). 더보기 메뉴 도입 시 신규 token (메뉴 패딩·icon·드롭다운 애니메이션) + 학습 부담. 모바일에서 inline 두 버튼이 좁다면 Phase 2에서 메뉴 도입 ADR 신설.

## 3. 검토된 대안

- **A. 29건 분산 ADR 29건 신설** (각 결정마다 1 ADR): 분량 권고 위반 없음 + 결정 trace 분산. 단점: ADR 폭증(0049~0077), 협업 검색 비용 ↑. 외부 평가자가 결정 위치를 찾기 어려움
- **B. 본 ADR 1건에 29건 전체 본문 인용** (current 폐기 대안): 단일 SoT 장점. 단점: 분량 300줄 초과 위험 (각 O별 본문 + 대안 + 근거 ≥ 15줄 × 29건 = 435줄)
- **C. 본 ADR + 부속 분류 표** (본 결정, 표 형식 1행/O 압축): 본 ADR ~150줄 + 부속 분류 표 ~80줄. 단일 SoT 유지 + 분량 권고 준수. 외부 평가자 1 진입점 (본 ADR §2 표 → 부속 §8) 검색 비용 최소

## 4. 결과 (Consequences)

### 긍정

- docs/planning/ 산출 §Open Questions 절에 마커 부착 → 미결정 가시성 0건
- 향후 Phase 2 진입 시 🔁 8건이 한 표에 정리 → 후속 이슈 등록 시 즉시 인용
- ADR 폭증 없음 (0049 1건만 신설)
- 결정 trace 단일 SoT(본 ADR + 부속 분류 표) → 외부 협업 진입 비용 ↓

### 부정

- 본 ADR이 *결정 요약*만 담아 *근거 인용*은 부속 문서 의존 → 외부 평가자가 본 ADR만 보면 ✅ 17건의 근거 인용 file:line을 보지 못함. 완화: 본 ADR §2 첫 줄에 부속 문서 링크 강조 + ADR 본문 첫 문단에 "전체 분류 표는 부속 문서 §8 참조" 명시
- 🔁 Phase 2 8건이 *별 이슈 등록* 없이 보류 → 본 PR 머지 후 즉시 추적 누락 위험. 완화: P13 docs-update에서 CHANGELOG §"Current Status"에 "Phase 2 보류 8건 — 후속 이슈 후보 (별 PR)" 1줄 추가

### 후속 작업

- 본 PR 머지 후 1주 이내 (자율, 별 PR): KPI 완화 ADR (O-28) 별 이슈 등록 — #24 attempts.md §8 N=2/10 baseline + 외부 시도자 추가 측정 가정
- Phase 2 진입 시점에 (별 PR): O-04·O-08·O-10·O-11·O-21·O-24·O-27 7건 별 이슈 등록

## 5. 추적 / 재검토 시점

- 본 ADR 재검토 트리거:
  - 새 Open Q O-30 이상 발견 시 — 본 ADR §2 표에 추가 행 + 부속 문서 §8 표에 추가 행 + 산출 §Open Questions 마커 부착 (별 PR)
  - 🔁 Phase 2 8건 중 1건이라도 Phase 2 진입 결정 → 별 ADR 신설로 본 ADR 해당 행 ✅ 전환 (별 PR)
  - 🆕 O-17 또는 O-23 결정 reversal 트리거 — 별 ADR 신설 + 본 ADR 해당 행 supersedes 표기

- 재검토 주기: 정기 X. 트리거 기반.
