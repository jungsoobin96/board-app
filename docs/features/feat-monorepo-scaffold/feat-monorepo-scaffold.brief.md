---
doc_type: feature-brief
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

# feat-monorepo-scaffold — Feature Brief

> Issue #1, Sprint 1, mode=add. 14-wbs §"Sprint 1" 매핑.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P1 intention-brief) |

## 1. 한 줄 의도

pnpm workspaces 기반 monorepo 골격 + 빌드·lint·typecheck 표준화를 도입해 Sprint 1 이후 모든 이슈가 동일한 부팅·검증 경로를 사용하게 한다.

## 2. 사용자 가치

- **학습자**(본 RFP의 1차 사용자): `pnpm install --frozen-lockfile` 한 줄로 환경 부팅 가능 (R-N-04 부팅) — 환경 차이로 인한 진입 장벽 제거.
- **리뷰어/협업자**: 모든 PR이 동일한 `pnpm lint`·`pnpm typecheck` 게이트를 통과해 코드 품질 하한선 보장.
- **CI/Workflow**: 단일 명령 패턴(`pnpm <script>`) 으로 워크플로 단순화 — 다음 이슈부터 backend/frontend/shared 패키지가 같은 명령 체계로 부팅.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| 패키지 구조 | 단일 root (planning 산출 문서만 존재, src 코드 0건) | pnpm workspaces 4개 — `frontend/`·`backend/`·`shared/`·`e2e/` |
| 패키지 매니저 | 미선택 | pnpm (12-scaffolding §1·§5 정합) |
| 빌드 명령 | 없음 | `pnpm -r build` (root + 워크스페이스 fan-out) |
| 타입 체크 | 없음 | `pnpm typecheck` (root → tsconfig.base.json 상속) |
| Lint | 없음 | `pnpm lint` (ESLint + Prettier flat config) |
| 워크스페이스 placeholder | 없음 | 각 워크스페이스 `src/index.ts` (no-op) + `package.json` |
| .gitignore | 미흡 (toolkit 기본) | `.env*`·`*.db`·`dist`·`coverage`·`node_modules` 명시 (R-N-07 보안) |
| EditorConfig | 없음 | `.editorconfig` (LF · UTF-8 · indent 2 spaces) |

## 4. 모드 자동 감지 결과

- **mode**: add
- **근거** (ADR-0032 부정 시그널 0건):
  - 라벨: `type:chore` + `area:infra` (type:bug ❌, design 키워드 ❌)
  - 자연어: "monorepo 스캐폴딩 및 빌드·lint 골격" — 기존 동작 변경 ❌ (신규 추가)
  - 코드베이스 상태: `src/` 트리·`package.json` 모두 부재 → breaking 가능성 ❌
  - 결정: 기본값(add) 자동 진행. type:chore는 ADR-0032 규칙 4 "라벨 부재여도 동일하게 add" 정합.

## 5. 영향 범위

- **신규 파일** (root): `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig`
- **갱신 파일**: `.gitignore` (R-N-07 보안 보강 — `.env*`·`*.db`·`dist`·`coverage`)
- **신규 워크스페이스 디렉토리** 4개:
  - `frontend/` — Vite + React + Tailwind 진입점 (다음 이슈 #10에서 실 도입, 본 이슈는 빈 placeholder)
  - `backend/` — Express + Prisma 진입점 (다음 이슈 #2에서 실 도입, 본 이슈는 빈 placeholder)
  - `shared/` — DTO/error contract 타입 정의 (다음 이슈 #11에서 실 도입)
  - `e2e/` — Playwright 시나리오 (Sprint 5 #21에서 실 도입)
- **외부 영향 없음**: 본 이슈는 main에 코드 0줄 → workspace skeleton만. CI workflow는 *이미 등록된 2개* 외 신규 등록 안 함 (별 이슈)

## 6. 비목표

- 본 이슈는 **워크스페이스 진입점만** 만든다 — 실 모듈 코드(Express server·React App·Prisma schema)는 후속 이슈 #2·#3·#10에서 도입.
- **CI workflow 신설 안 함** — GitHub Actions에서 `pnpm lint`·`pnpm typecheck` 자동 실행 워크플로 등록은 별 이슈로 분리 (현재 등록 workflow는 `issue-pr-title-lint` + `sync-issue-labels` 2개만).
- **frontend·backend 의존 라이브러리(React·Express·Prisma) 추가 안 함** — 후속 이슈에서 도입. 본 이슈에서는 `typescript`·`eslint`·`prettier`·`@types/node` 정도만 root devDep.
- **3 profile `.env.{dev,stg,prod}.example` 신설 안 함** — 본 이슈는 backend 부재 상태라 DATABASE_URL 등 정의 불가. 이슈 #2 (backend 골격)에서 도입. LOCAL.md §3은 이미 작성됨.

## 7. Open Questions

- (해소) ESLint flat config vs legacy `.eslintrc.cjs` — flat config 채택 (Node 20+ 표준, 2026 시점 stable)
- (해소) Prettier 단독 vs `eslint-config-prettier` 병합 — 둘 다 (prettier-config 충돌 회피)
- (보류) tsconfig path alias (`@app/shared` 등) — 본 이슈는 root tsconfig.base.json만, 워크스페이스별 alias는 각 이슈에서 도입 시점에 추가
