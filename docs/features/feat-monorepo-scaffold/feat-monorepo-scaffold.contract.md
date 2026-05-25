---
doc_type: feature-contract
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

# feat-monorepo-scaffold — Change Contract

> Issue #1 · mode=add · selective read 원본(ADR-0018 §0 BLOCK 충족).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-N-04 (부팅 — `pnpm install --frozen-lockfile` 정상), R-N-07 (보안 — `.gitignore` 시크릿 차단) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | F-09 (간접 — README 부팅 가이드의 기반 환경) |
| 영향 모듈 | `docs/planning/08-lld-module-spec/08-lld-module-spec.md` | (none — 본 이슈는 워크스페이스 골격만, 8 LLD §1 12 모듈은 후속 이슈에서 채워짐) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none — backend 엔드포인트 없음) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md`, `docs/planning/12-scaffolding/typescript.md` | 11 §1 파일 명명·§3 import 순서·§5 ESLint 규칙 / 12 §1 패키지 매니저·§2 워크스페이스 레이아웃·§5 빌드·실행·§7 SoT |

## 1. 변경 의도

`board-app` 저장소를 `planning 산출만 있는 docs-only` 상태에서 `pnpm workspaces 부팅 가능한 monorepo 골격`으로 전환한다. 후속 25 이슈 모두 본 이슈의 골격 위에서 동작하므로 **본 이슈는 모든 Sprint의 선수 의존**(WBS Blocks: #2 backend-skeleton, #10 frontend-skeleton). R-N-04(부팅) 충족 + 12-scaffolding §1~§7 SoT 실현.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `package.json` (root) | 없음 | `{ "name": "board-app", "private": true, "packageManager": "pnpm@9.x", "scripts": { "lint": "eslint .", "typecheck": "tsc -b", "build": "pnpm -r build", "dev": "pnpm -r --parallel dev" } }` |
| `pnpm-workspace.yaml` | 없음 | `packages: [frontend, backend, shared, e2e]` |
| `tsconfig.base.json` (root) | 없음 | `{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "resolveJsonModule": true } }` |
| `eslint.config.mjs` (root, flat) | 없음 | `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-config-prettier` |
| `.prettierrc` | 없음 | `{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100 }` |
| `.editorconfig` | 없음 | `root = true` + LF·UTF-8·indent 2 spaces |
| `.gitignore` | toolkit 기본 | + `.env*` · `*.db` · `dist/` · `coverage/` · `*.log` (R-N-07) |
| 워크스페이스 디렉토리 4개 | 없음 | 각각 `package.json` + `src/index.ts` placeholder + `tsconfig.json` (extends `../tsconfig.base.json`) |
| `pnpm install --frozen-lockfile` | 실패 (manifest 없음) | PASS — `pnpm-lock.yaml` 생성 + 의존성 다운로드 |
| `pnpm lint` | N/A | PASS (0 error) |
| `pnpm typecheck` | N/A | PASS (워크스페이스 4개 placeholder 모두 `tsc -b` 통과) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| WBS Issue #2 (backend 골격) | Blocked-by #1 — `backend/package.json`이 본 이슈의 root workspace에 등록되어야 동작 | 본 PR 머지 후 #2 시작 가능 |
| WBS Issue #10 (frontend 골격) | Blocked-by #1 — `frontend/package.json` 동일 | 본 PR 머지 후 #10 시작 가능 |
| WBS Issue #11 (shared types) | Blocked-by #1 — `shared/package.json` 동일 | 본 PR 머지 후 #11 시작 가능 |
| WBS Issue #21 (E2E) | Blocked-by #1 — `e2e/package.json` 동일 | Sprint 5에 진입 시 |
| `LOCAL.md` §1·§3 | 본 PR 이전엔 "pnpm 미존재" 실패. 본 PR 후 §1 정상 부팅 가능 | LOCAL.md 본문 자체 변경 0 (§3 명령은 본 이슈에서 이미 정의됨) |
| `.github/workflows/issue-pr-title-lint.yml` | 영향 없음 (PR 제목만 검증) | 변경 없음 |
| `.github/workflows/sync-issue-labels.yml` | 영향 없음 | 변경 없음 |

## 4. Backward Compatibility

- **Breaking**: no — 기존 코드 0줄 상태에서 신규 추가. 깨뜨릴 호출자 없음.
- **마이그레이션 필요**: no — 기존 사용자(=학습자) 없음. 본 이슈가 *최초 코드 도입*.
- **호환 보장**: planning 산출 문서(`docs/planning/`)는 본 이슈가 건드리지 않음. 머지 후 docs와 code가 한 저장소에 공존.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**: PR 머지 후 회귀 발견 시 `git revert <merge-commit>` → main에 revert PR open. 본 이슈는 워크스페이스 *신설*이므로 revert가 안전 (기존 코드 파괴 0).
- **데이터 손상 위험**: 없음 — 본 이슈는 DB·persistent state 신설 0건. revert 시 `node_modules/`·`pnpm-lock.yaml` 만 잔존(둘 다 .gitignore + 사용자 환경 cleanup으로 회복).

## 6. 비목표

- CI에 `pnpm lint`/`typecheck` 자동 실행 workflow 등록 — 별 이슈
- 실제 backend·frontend·shared 모듈 코드 — 후속 이슈 #2·#3·#10·#11
- `.env.{dev,stg,prod}.example` 신설 — 이슈 #2 (backend 골격)에서 DATABASE_URL과 함께
- pnpm cache hit률 최적화 — 학습 프로젝트라 over-engineering 비목표
