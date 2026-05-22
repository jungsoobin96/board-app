---
doc_type: test-design
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12]
  supersedes: null
---

# 01-strategy Test Strategy — test-design

> 13-test-design 5절 폴더 sub-file (ADR-0030). 본 sub-file은 본 프로젝트의 테스트 방법론·레벨·커버리지 목표를 확정한다. ADR-0034 본문 BLOCK 3종(방법론·레벨·커버리지) 충족.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 방법론 (TDD/BDD)

본 프로젝트는 **비-TDD** + 부분 BDD 표현 방법론을 채택한다.

- **비-TDD를 채택한 이유**: 개발 입문자가 1차 학습 대상. TDD의 "테스트 먼저" 흐름은 학습 부담을 가중하므로, 본 MVP에서는 *구현 직후 단위/통합/E2E 테스트를 동반 작성*하는 절차로 유사 효과를 얻는다.
- **BDD 표현은 Acceptance에 한정**: 04 SRS R-F-XX·05 PRD F-XX의 Acceptance 절은 Given/When/Then 형식을 사용 (이미 ADR-0014로 강제). 본 BDD 표현은 테스트 코드 작성 시 `describe("Given ...", ...)`로 매핑.
- **TDD 도입 가능성 (Phase 2)**: 학습자가 1차 완주 후 일부 모듈(예: BE-validators M9)에 한해 TDD로 재작성하는 학습 트랙 추가 가능.
- **회귀 우선 원칙**: 버그 발견 시 *재현 테스트 먼저 작성 → 그 후 수정* (간이 TDD 패턴). 본 원칙은 03-regression sub-file에 상세.

## 2. 도구 선택

| 레벨 | 도구 | 이유 |
|---|---|---|
| 단위 | Vitest 1.x | Vite 생태계 통합·ESM 친화·jest API 호환. 입문자 자료 풍부. |
| 단위 (React) | Vitest + @testing-library/react + jsdom | 사용자 관점 테스트 표준. snapshot 보조. |
| 통합 (Backend) | Vitest + Supertest 7 | Express app 인스턴스를 직접 wrap해 HTTP 호출 → 실제 SQLite 작용 확인. |
| 통합 (DB cascade) | Vitest + Prisma test DB (file:./prisma/test.db) | 실 SQLite 파일로 ON DELETE CASCADE 검증 (R-F-07). |
| E2E | Playwright 1.x (선택) | 브라우저 자동화. gstack `/qa` 골든 패스 보완. 본 MVP는 *수동 골든패스 + Playwright 핵심 시나리오 5건* 권고. |
| 정적 검증 | TypeScript `tsc --noEmit` + ESLint 9 + Prettier 3 | 코드 작성 단계 lint. |
| 성능 측정 | Supertest + `performance.now()` (단순 측정) | R-N-01 응답 시간 < 200ms p95 검증. |
| 보안 정적 | grep 룰 + PreToolUse 훅 (CLAUDE.md 보안 #5) | 시크릿 미커밋 (R-N-07) 검증. |

본 카탈로그 + 단위/통합/E2E 매핑은 02-catalog sub-file에 R-/F-ID별로 fan-in.

## 3. 커버리지 목표 (≥ 80%)

본 프로젝트는 **단위·통합 합산 line coverage ≥ 80%** 목표를 채택한다 (ADR-0015 §2.3).

- **목표 80%**: 핵심 모듈 — `backend/src/controllers/`·`backend/src/services/`·`backend/src/validators/`·`backend/src/repositories/`·`backend/src/middleware/`·`frontend/src/components/`·`frontend/src/api/`. 단위 + 통합 line coverage 합산.
- **측정 도구**: `vitest --coverage` (v8 provider). HTML 리포트는 `coverage/index.html`.
- **CI 강제**: `pnpm test:coverage` 가 80% 미만 시 exit 1 (PR 머지 BLOCK 조건의 일부).
- **E2E**: line coverage 측정 외 — *시나리오 통과율 100%*가 목표 (RFP §10 평가 기준 7개 항목 모두 통과).
- **분야별 예외**: 학습용 비핵심 모듈(예: `frontend/src/pages/NotFound.tsx`)은 coverage 산정에서 제외 가능 (`vitest.config.ts` `coverage.exclude`). 예외는 ADR로 명시.
- **R-N-05 한국어 주석 ≥80%**는 별 룰(11 Coding Conventions §4)이며, 본 line coverage와는 별 축.
