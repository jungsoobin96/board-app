---
doc_type: feature-plan
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-N-04, R-N-07]
  F-ID: [F-09]
  supersedes: null
---

# feat-monorepo-scaffold — Implementation Plan

> Issue #1 · mode=add · contract §0 selective read 기반 (ADR-0018).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P4 implementation-planner) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(infra): root package.json + pnpm-workspace.yaml` | `package.json`, `pnpm-workspace.yaml` | N/A (인프라) | 없음 (신설) |
| 2 | `chore(infra): tsconfig.base.json + 워크스페이스 4종 tsconfig.json` | `tsconfig.base.json`, `frontend/tsconfig.json`, `backend/tsconfig.json`, `shared/tsconfig.json`, `e2e/tsconfig.json` | `pnpm typecheck` | 낮음 (워크스페이스 빈 src) |
| 3 | `chore(infra): ESLint flat + Prettier + EditorConfig` | `eslint.config.mjs`, `.prettierrc`, `.editorconfig` | `pnpm lint` | 낮음 (config 검증) |
| 4 | `chore(infra): 4 워크스페이스 placeholder package.json + src/index.ts` | `frontend/package.json`, `backend/package.json`, `shared/package.json`, `e2e/package.json` + 각 `src/index.ts` | `pnpm -r build` 시 0 error | 낮음 (no-op placeholder) |
| 5 | `chore(infra): .gitignore 보강 (.env*, *.db, dist, coverage)` | `.gitignore` | 시각 확인 (`git status` 후 placeholder 미추적) | 없음 (R-N-07 보안 강화) |
| 6 | `chore(infra): pnpm install lockfile 생성 + lint/typecheck 통합 검증` | `pnpm-lock.yaml` (자동 생성) | `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm typecheck` | 낮음 (frozen-lockfile 매칭) |

> **단일 커밋 통합 옵션**: 본 이슈는 인프라 chore이고 위 6 커밋이 모두 root config 신설이라 강한 결합. PR squash merge 시 어차피 1 커밋으로 압축되므로 *작업 중에는 분리 권장, 머지 후엔 1 commit*.

## 2. 의존성 그래프

```
[#1 root manifest]
    ├─→ [#4 워크스페이스 placeholder] (root에 등록되어야 워크스페이스 인식)
    └─→ [#6 pnpm install]
            └─→ frozen-lockfile 매칭 검증

[#2 tsconfig] ──→ [#6 typecheck 검증]
[#3 ESLint·Prettier] ──→ [#6 lint 검증]
[#5 .gitignore] (독립 — 다른 commit과 의존 없음)
```

- **선수**: 본 이슈는 외부 선수 없음 (첫 이슈, Blocked-by 없음)
- **후수 (본 PR 머지 후)**:
  - Issue #2 (backend 골격) — `backend/package.json`이 본 이슈의 root workspace에 등록되어야 부팅 가능
  - Issue #10 (frontend 골격) — `frontend/package.json` 동일
  - Issue #11 (shared types) — `shared/package.json` 동일

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| #1 | N/A — 단위 테스트 없음 (root manifest 정합은 #6에서 통합 검증) | (manifest schema 정합) |
| #2 | N/A — 단위 테스트 없음 (#6의 `pnpm typecheck`로 통합 검증) | 4 워크스페이스 모두 tsc -b PASS |
| #3 | N/A — config 자체 단위 테스트 없음 (#6의 `pnpm lint`로 통합 검증) | ESLint flat config 로딩 + Prettier 충돌 없음 |
| #4 | 각 워크스페이스 `src/index.ts`는 no-op (`export const SCAFFOLD_OK = true`) → tsc 컴파일 + ESLint lint 통합 검증 | 4 워크스페이스 모두 export 1건 |
| #5 | 시각 확인 — `git status` 후 `node_modules/`·`.env*`·`*.db` 패턴이 무시되는지 | 시크릿 파일 commit 차단 (R-N-07) |
| #6 | `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm typecheck` 3종 명령 PASS | R-N-04 부팅 충족 — fresh checkout fingerprint 검증 |

> **본 이슈 단위 테스트 없음 사유**: 본 이슈는 *워크스페이스 골격 자체*가 검증 대상. 단위 테스트는 Vitest 도입을 전제로 하는데 Vitest는 본 이슈 비목표(별 이슈 #4 backend 통합 테스트에서 도입). 본 이슈는 *통합 검증 3종 명령*으로 갈음. P10 qa-test --ai에서 본 명령들을 PR body Build/Automated tests에 채움.

## 4. 빌드·실행 검증 단계

```bash
# 1) 사전: pnpm 8.x 이상 설치 확인
pnpm --version  # → 9.x 권장 (root package.json packageManager 필드 매칭)

# 2) fresh checkout 부팅 (R-N-04)
pnpm install --frozen-lockfile

# 3) typecheck — 4 워크스페이스 모두 tsc -b 통과
pnpm typecheck

# 4) lint — ESLint 0 error
pnpm lint

# 5) build — 4 워크스페이스 placeholder no-op 빌드
pnpm -r build

# 6) 3 profile 부팅 smoke (ADR-0037, AI 게이트 6번째 축)
#    본 이슈는 backend·frontend 부재 상태라 실 부팅 N/A.
#    LOCAL.md §3 dev/stg/prod 명령은 후속 이슈 #2 머지 후부터 적용.
#    본 이슈 PR Manual verification에서 "3 profile 부팅 검증 N/A — 본 이슈는 워크스페이스 골격만, backend/frontend 부재" 사유 명시.
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — 본 이슈는 12-scaffolding §1~§7 SoT 실현이며, scaffolding 결정은 이미 게이트 C 산출에 흡수됨. 별도 ADR 신설 사유 없음.
- **결정 후보**:
  - (결정) pnpm packageManager 9.x 고정 — 12-scaffolding §1 정합
  - (결정) ESLint flat config 채택 — Node 20+ stable, legacy `.eslintrc.cjs` 대신
  - (결정) `tsconfig.base.json` strict mode ON + ES2022 + Bundler module resolution — 12-scaffolding §2
  - (보류) tsconfig path alias (`@app/shared/*` 등) — 후속 이슈 #11 shared types 도입 시점에서 결정
- **회귀 시나리오 (P10 회귀 회수 후보)**:
  - `pnpm install --frozen-lockfile` 실패 → packageManager 필드와 사용 중 pnpm 버전 불일치 시. 본 PR 머지 후 fresh checkout으로 1회 검증.
  - `pnpm lint` 실패 → ESLint flat config가 워크스페이스 src/index.ts placeholder를 검증 못함. eslint.config.mjs의 `files` 패턴 확인.
