---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: []
  supersedes: null
---

# bug-pre-existing-ts-errors-fix — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — AC-01~03 + DoD 6 + 회귀 AC-R-01~06 (이슈 #48) |

## 1. 인수 기준 (Given/When/Then)

### AC-01 — frontend typecheck 0 에러
- **Given**: 본 PR 적용 후, `pnpm install --frozen-lockfile` 완료
- **When**: `pnpm --filter @app/frontend typecheck` 실행
- **Then**: 에러 0건 + exit 0 (3건 모두 해소)

### AC-02 — vite build 회귀 0
- **Given**: 본 PR 적용 후
- **When**: `pnpm --filter @app/frontend exec vite build` 실행
- **Then**: PASS + dist/ 생성됨 + Sprint 6 baseline 동일 산출

### AC-03 — vitest 단위 테스트 회귀 0
- **Given**: 본 PR 적용 후
- **When**: `pnpm --filter @app/frontend test:unit` 실행
- **Then**: 86+ tests passed (+1 skip) / 0 failed (Sprint 6 baseline 유지). 특히 `frontend/tests/unit/router/routes.test.ts` matchRoute 단위 테스트 전수 PASS (runtime 동작 변경 0건 확정 증거)

## 2. Definition of Done (D-06)

- [ ] 본 acceptance §1·§4 인수 기준 모두 PASS (사람 ✅)
- [ ] AI 테스트 게이트 6축 PASS (D-06 1단, ADR-0011·0037·0038)
- [ ] PR 본문 Test Plan 4블록 작성 (Build/Automated tests/Manual verification/DoD coverage)
- [ ] pr-body-checkboxes status check PASS (Manual + DoD 모든 체크박스 ✅, ADR-0046 §2.5)
- [ ] Approve ≥ 1 + CI green (D-06 2단)
- [ ] 머지 후 #48 자동 close (`Closes #48`) + `status:*` 라벨 정리

## 3. 비기능 인수

- **Breaking**: no (type-only 변경 — runtime 동작 0건 변경, ADR-0011 호환)
- **성능**: 회귀 0건 (vite build·vitest 실행 시간 baseline 동일 — type-only emit 0줄)
- **보안**: 회귀 0건 (`import.meta.env.VITE_API_URL` 타입만 인식, 값 노출 변경 0건. ENV 키는 dev 기본값 `http://localhost:3000/api` fallback 유지)
- **a11y / 모바일 반응형**: N/A (UI 변경 0건)

## 4. 회귀 인수

### AC-R-01 — frontend typecheck 0 에러 (정본 검증 수단)
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/frontend typecheck`
- **Then**: 에러 0건 + exit 0 (3건 해소 + 신규 0건)

### AC-R-02 — frontend vitest 회귀 0
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/frontend test:unit`
- **Then**: Sprint 6 baseline 86+ PASS / 0 FAIL 유지

### AC-R-03 — frontend vite build 회귀 0
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/frontend exec vite build`
- **Then**: PASS + dist/ 생성 (회귀 0건)

### AC-R-04 — backend 회귀 0
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/backend test`
- **Then**: 64 PASS / 0 FAIL (회귀 0건 — backend 영향 없음 확인)

### AC-R-05 — 통합 + e2e 회귀 0
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/backend test:int` + `pnpm --filter @app/e2e test`
- **Then**: 36 + 5 PASS (회귀 0건)

### AC-R-06 — matchRoute 단위 테스트 회귀 0 (runtime 동작 동일 증거)
- **Given**: 본 PR 머지 후 main
- **When**: `pnpm --filter @app/frontend test:unit -- routes.test.ts`
- **Then**: 기존 matchRoute test cases 100% PASS — `articleMatch[1]!` non-null assertion이 runtime 동작 0건 변경 확정
