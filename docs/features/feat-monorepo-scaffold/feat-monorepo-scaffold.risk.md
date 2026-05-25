---
doc_type: feature-risk
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-N-04, R-N-07]
  F-ID: [F-09]
  supersedes: null
---

# feat-monorepo-scaffold — Feature Risk

> Issue #1 · mode=add · P7 risk-check. 본 이슈 단위 리스크 평가.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | pnpm 버전 불일치로 인한 `--frozen-lockfile` 실패 | 3 | 2 | Medium |
| F-RISK-02 | ESLint flat config 비호환 IDE/툴체인 (legacy `.eslintrc.cjs` 가정) | 2 | 1 | Low |
| F-RISK-03 | 워크스페이스 placeholder `src/index.ts` 미사용 export로 lint warning 발생 | 1 | 2 | Low |

## 2. 리스크 상세

### F-RISK-01: pnpm 버전 불일치

- **카테고리**: 외부 의존
- **트리거 신호**: 사용자 환경의 pnpm 버전이 `package.json:packageManager` 필드(9.x)와 다름. CI 환경에서도 동일 위험.
- **완화 전략**:
  - `packageManager` 필드를 `pnpm@9.x` (마이너 명시 — 예: `pnpm@9.15.0`)으로 고정
  - LOCAL.md §1 사전 요구사항에 "pnpm 9.x 설치" 명시 (이미 작성됨)
  - PR body Manual verification에 "pnpm --version 9.x 확인" 추가
- **검증 방법**: 본 PR Manual verification 항목으로 사용자가 1회 확인. 후속 이슈에서 CI workflow 등록 시 자동화.

### F-RISK-02: ESLint flat config 비호환

- **카테고리**: 호환성
- **트리거 신호**: VS Code/JetBrains 등 IDE가 ESLint legacy config(`.eslintrc.cjs`)를 가정하고 flat config(`eslint.config.mjs`)를 인식 못함.
- **완화 전략**:
  - VS Code: `dbaeumer.vscode-eslint` v3.0+ 권장 (flat config 지원). LOCAL.md 권장 확장에 추가 후보 (별 이슈)
  - CI `pnpm lint`는 ESLint CLI 직접 호출이라 flat config 정상 동작
  - 학습자 환경 차이가 발견되면 후속 이슈에서 `.eslintrc.cjs` legacy 추가 검토 (현 시점 비목표)
- **검증 방법**: PR Manual verification — 사용자가 본인 IDE에서 ESLint 동작 확인.

### F-RISK-03: placeholder export lint warning

- **카테고리**: 호환성
- **트리거 신호**: `src/index.ts` placeholder의 `export const SCAFFOLD_OK = true`가 *no-unused-vars* 같은 rule에서 warning 발생 가능.
- **완화 전략**:
  - placeholder는 *export*이므로 `no-unused-vars`는 자연 회피 (외부에서 import 가능 표시)
  - ESLint config에서 placeholder 패턴(`**/src/index.ts`) 별도 override 불필요
  - 후속 이슈가 placeholder를 실 모듈 코드로 교체하면 자연 해소
- **검증 방법**: AC-03 (`pnpm lint` 0 error)에서 자동 검증

## 3. High 등급 단계적 롤아웃

본 이슈는 High 등급 리스크 0건 (Medium 1건, Low 2건). 단계적 롤아웃 N/A — 단일 PR squash merge로 일괄 도입.

> Medium 1건(F-RISK-01)은 외부 의존 리스크이고 *사용자 환경 차이*로 인한 것. 코드 변경으로 회피 불가능 (packageManager 필드 고정이 최대 완화). 발생 시 사용자가 pnpm 버전 맞추면 즉시 해소.

## 4. 데이터 영속성 변경

없음 — 본 이슈는 DB·persistent state 신설 0건. `pnpm-lock.yaml`은 빌드 산출(외부 의존 hash)이지 데이터 아님.

## 5. 15-risk.md 갱신 항목

없음 — 본 이슈 단위 리스크 3건 모두 *이슈 범위 한정*. 프로젝트 전역 리스크 15-risk.md에는 흡수 사유 부재.

> 단, F-RISK-01(pnpm 버전 불일치)가 다음 4개 이슈(#2·#10·#11·#21)에서도 반복 트리거 가능 — 발생 빈도 보면서 15-risk RISK-11(외부 의존)에 흡수 검토.
