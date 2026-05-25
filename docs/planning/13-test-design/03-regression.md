---
doc_type: test-design
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-07, R-N-02, R-N-04]
  F-ID: [F-07, F-09]
  supersedes: null
---

# 03-regression Regression Test Policy — test-design

> 13-test-design 5절 폴더 sub-file (ADR-0030). 회귀 범위·자동화 정책·트리거를 명시한다.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 회귀 범위

본 프로젝트의 회귀 테스트는 **02-catalog의 매트릭스 ✅로 표시된 모든 시나리오를 매 PR마다 자동 실행**한다. 추가로 다음 항목을 회귀 범위에 둔다:

- **cascade 무결성 (R-F-07)** — 글 삭제 시 댓글이 함께 제거되는 핵심 시나리오. 통합 + E2E 모두 매 PR.
- **에러 schema 일관성 (R-N-02)** — 모든 4xx/5xx 응답이 `{ error: string }` 형식 유지. 통합 회귀.
- **3 profile 부팅 (R-N-04)** — dev/stg/prod 모두 ready 신호 + GET /api/articles 200. 통합 smoke.
- **디자인 토큰 회귀 (10 §3 + 12 §8)** — Tailwind 빌드가 토큰 변경을 정상 반영하는지 snapshot 1종.
- **README 재현성 (R-N-03)** — 주기적 (매 milestone 종료) 새 PC 시뮬레이션. CI 자동화는 어려우므로 수동 + LOCAL.md sync lint.

## 2. 자동화 정책

- **CI 트리거**: GitHub Actions `pr` + `push:main`. 다음 job 실행:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test:unit` (모든 워크스페이스)
  - `pnpm test:integration` (backend)
  - `pnpm --filter @app/backend smoke:3profiles` (dev/stg/prod 부팅 smoke)
  - `pnpm --filter @app/e2e test` (Playwright, 선택)
- **AI 게이트 통합 (D-06)**: 위 CI 결과 + AI 게이트 6축 (PR body schema·UI 검증·부팅 자산 sync 등)이 모두 PASS여야 머지 가능.
- **로컬 사전 실행**: 개발자는 PR 직전에 위 명령들을 로컬에서 1회 실행. AI 게이트 prereq.
- **flaky test 정책**: 동일 PR에서 2회 retry 후에도 실패 시 BLOCK. retry 횟수는 `vitest.config.ts` `retry: 2`로 설정.
- **gstack `/qa` 통합**: UI 변경(ui_changed=true) PR은 gstack `/qa`로 골든 패스 1회 + 스크린샷 `docs/features/<slug>/screenshots/`에 저장 (CLAUDE.md 필수 규칙 #9, ADR-0011).

## 3. 회귀 트리거

다음 변경 발생 시 회귀 회수를 강제한다:

| 변경 | 트리거되는 회귀 |
|---|---|
| 04 SRS·05 PRD 시나리오 변경 | 02-catalog 해당 R-/F- subsection 갱신 + 매트릭스 셀 재평가 (ADR-0035) |
| `prisma/schema.prisma` 변경 | cascade 통합 테스트 + migration apply 검증 |
| `frontend/src/styles.css` 또는 `tailwind.config.ts` 변경 | 디자인 토큰 snapshot 회귀 + gstack `/qa` 1회 |
| `backend/src/middleware/error-handler.ts` 변경 | 에러 schema 통합 회귀 전체 |
| `.env.{dev,stg,prod}.example` 변경 | 3 profile 부팅 smoke 전체 + LOCAL.md sync lint |
| `package.json` 또는 `pnpm-lock.yaml` 변경 | 전체 회귀 + lockfile 정합 검증 |
| 09 API Spec 엔드포인트 추가 | 신규 엔드포인트의 단위+통합+E2E 시나리오 02-catalog 추가 (BLOCK 검증) |
| 새 milestone 종료 | README 재현성 수동 회귀 (UC-06, 10명 시도 권고) |
| **이슈 단위 점진 갱신 (ADR-0035)** | `check-test-catalog-sync.sh` WARN 발생 시 본 sub-file 갱신 또는 sync 이슈 신규 |
