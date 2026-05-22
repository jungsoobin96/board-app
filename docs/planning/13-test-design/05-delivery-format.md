---
doc_type: test-design
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# 05-delivery-format Customer Delivery Format — test-design

> 13-test-design 5절 폴더 sub-file (ADR-0030 + ADR-0034). 고객/평가자에게 전달할 시나리오 산출 형식·ID 채번 규칙·전달 시점을 명시.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 산출 범위 (단위·통합·E2E 시나리오)

본 프로젝트가 외부에 전달하는 테스트 산출 범위는 다음과 같다.

- **단위 테스트 보고**: vitest HTML 리포트 + line coverage HTML (≥ 80% — 01-strategy §3). CI artifact로 저장.
- **통합 테스트 보고**: vitest HTML + Supertest 시나리오별 pass/fail. 응답 시간 측정값도 포함 (R-N-01).
- **E2E 테스트 보고**: Playwright HTML 리포트 (선택) — 실패 시 스크린샷·trace 자동 첨부. 수동 골든 패스는 gstack `/qa` 스크린샷 `docs/features/<slug>/screenshots/`.
- **평가 기준 매핑** (RFP §10 7개 항목): 02-catalog 매트릭스에서 ✅ 셀이 평가 기준 7개와 어떻게 매핑되는지를 README §평가 기준 부분에 표로 명시.
- **고객 친화 산출**: 본 MVP는 학습 데모이므로 *공식 고객 납품*은 없지만, 부트캠프 평가자(Park 페르소나, UC-06) 대상 README §재현 절차와 §평가 기준 표를 산출로 본다.

## 2. 포맷·도구 (HTML/XLSX/Allure 등)

| 산출 | 포맷 | 도구 | 저장 위치 |
|---|---|---|---|
| 단위 + 통합 테스트 리포트 | HTML | Vitest reporter (`html`) | `coverage/index.html` + CI artifact |
| Line coverage 리포트 | HTML + JSON | Vitest v8 provider | `coverage/lcov-report/` |
| E2E 테스트 리포트 (선택) | HTML | Playwright reporter | `playwright-report/index.html` |
| 골든 패스 스크린샷 | PNG | gstack `/qa` | `docs/features/<slug>/screenshots/` (CLAUDE.md 필수 규칙 #9) |
| 평가 기준 매핑 표 | Markdown | 수동 작성 | `README.md` §평가 기준 |
| 시나리오 ID 카탈로그 | Markdown | 본 13-test-design `02-catalog.md` | `docs/planning/13-test-design/` |
| 변경 이력 | Markdown 표 | 각 산출 frontmatter + §변경 이력 | (각 산출 파일) |

> XLSX/Allure는 본 MVP 범위 외 — Phase 2+에서 고객 정식 납품이 요구될 때 도입. 본 MVP는 학습 친화 markdown + HTML로 충분.

## 3. 시나리오 ID 채번 규칙

본 프로젝트의 *고객 납품용 시나리오 ID 채번* prefix는 다음과 같다 (본 MVP는 내부 학습 목적이라 채번 룰만 정의, 적용은 Phase 2+에서 본격화):

- **TC-** (Test Case, 단위 + 통합 합산) — 예: `TC-001`, `TC-002`, ...
- **IT-** (Integration Test, 통합 전용) — 예: `IT-001`, `IT-002`, ...
- **E2E-** (End-to-End) — 예: `E2E-001`, `E2E-002`, ...
- **SC-** (Scenario, 평가 기준 매핑 단위) — 예: `SC-EVAL-01` (RFP §10 #1 "글 작성 즉시 노출"), `SC-EVAL-02`, ...
- **UC-** (Use Case, 03-user-scenarios 참조 — 본 13 카탈로그는 UC-XX와 fan-in으로 묶임)

채번 규칙 본 MVP 적용:
- 02-catalog의 ### subsection은 R-/F- 으로 채번 (현재). 고객 납품 발생 시 본 표의 TC-/IT-/E2E-/SC- 로 1:1 매핑 표 추가.
- 신규 시나리오는 *이슈 단위*로 추가 (ADR-0035 — `check-test-catalog-sync.sh` WARN 기반).

## 4. 전달 시점 (스프린트 종료·릴리스·고객 요청)

전달 시점은 다음 3 트리거 중 하나에서 산출:

- **스프린트 종료** — 본 프로젝트는 M1~M6 milestone 종료마다 vitest 리포트 + 02-catalog 매트릭스 최신본을 main 브랜치에 commit.
- **릴리스** — 본 MVP 완료(M6 종료) 시 README §평가 기준 표 + gstack 골든 패스 스크린샷 일괄 산출.
- **고객 요청** — 평가자(Park)가 README 따라 재현 검증 시 — README + 본 폴더 + coverage HTML이 그대로 산출. 별 가공 없음.

> 단일 환경 학습 데모이므로 "납품" 개념은 단순화 — main 브랜치 README + docs/planning/ + coverage/ 3종을 그대로 본 프로젝트의 *전달 산출*로 본다. Phase 2+ 고객 정식 납품 발생 시 XLSX/Allure 도입을 ADR로 결정.
