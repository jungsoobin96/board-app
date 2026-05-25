---
doc_type: feature-acceptance
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

# feat-monorepo-scaffold — Acceptance Criteria

> Issue #1 · mode=add · P6 acceptance-criteria. PR Manual verification·DoD coverage의 원본.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: fresh checkout 부팅 (R-N-04)

- **Given**: fresh git clone 후 `pnpm 9.x` 설치된 환경
- **When**: `pnpm install --frozen-lockfile` 실행
- **Then**: `pnpm-lock.yaml` 매칭 검증 + 모든 워크스페이스 의존성 설치 + exit 0
- **측정 방법**: 자동 테스트 (PR CI에서 명령 실행 — workflow 미등록은 본 이슈 비목표, 본 PR Manual verification에서 사람이 1회 실 부팅 검증)
- **R-ID**: R-N-04

### AC-02: typecheck PASS (R-N-04 부팅 정합)

- **Given**: AC-01 통과 상태
- **When**: `pnpm typecheck` 실행
- **Then**: 4 워크스페이스 모두 `tsc -b` 0 error
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-04

### AC-03: lint PASS (코딩 컨벤션 강제)

- **Given**: AC-01 통과 상태
- **When**: `pnpm lint` 실행
- **Then**: ESLint 0 error (warning 0 권고). placeholder `src/index.ts`도 lint 통과
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-04

### AC-04: build PASS (no-op placeholder 빌드)

- **Given**: AC-01·AC-02 통과 상태
- **When**: `pnpm -r build` 실행
- **Then**: 4 워크스페이스 placeholder 모두 0 error (실 build script 없는 워크스페이스는 no-op `echo "no build"` 허용)
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-04

### AC-05: .gitignore 보안 차단 (R-N-07)

- **Given**: AC-01 통과 상태
- **When**: 임시로 `touch .env.dev` + `touch test.db` + `git status` 실행
- **Then**: 두 파일 모두 `Untracked files`에 *나타나지 않음* (`.env*`·`*.db` 패턴이 ignored)
- **측정 방법**: 수동 확인 (Manual verification 체크박스)
- **R-ID**: R-N-07

### AC-06: 워크스페이스 4종 인식 확인

- **Given**: AC-01 통과 상태
- **When**: `pnpm -r list --depth 0` 실행
- **Then**: `frontend`·`backend`·`shared`·`e2e` 4 워크스페이스 모두 인식 (각 `package.json`이 root에 등록됨)
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-04

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: N/A — 본 이슈는 인프라 chore. 단위 테스트는 Vitest 도입 후 (별 이슈). 통합 검증 3종 명령(`pnpm install --frozen-lockfile`/`lint`/`typecheck`)으로 갈음.
- [ ] **AI 게이트** (D-06 1단): `qa-test --ai` 6축 모두 PASS — Build·Automated tests·Manual verification 명시·DoD coverage 명시·UI 골든패스(N/A 사유)·3 profile 부팅(N/A 사유)
- [ ] **Test Plan 4블록**: PR body에 Build·Automated tests·Manual verification·DoD coverage 4 절 모두 포함, ADR-0046 §2.3에 따라 Manual verification·DoD coverage는 미체크 직렬화
- [ ] **tested 라벨**: ADR-0046 v1.2에서 폐지 — 본 이슈는 `pr-body-checkboxes` status check가 자동 발행 (workflow 등록 시점부터 적용). 현 시점은 사용자가 Manual verification 체크박스 ✅를 직접 클릭하여 갈음.
- [ ] **Approve**: 사람 리뷰 ≥ 1 (사용자 본인 self-approve 허용 — branch protection 미적용 트랜지션)
- [ ] **CI green**: workflow 2개(`issue-pr-title-lint`·`sync-issue-labels`) 모두 PASS

## 3. 비기능 인수

- **부팅 시간**: `pnpm install --frozen-lockfile` 3분 이내 (네트워크 정상 가정, 측정 환경: 일반 dev 머신)
- **저장소 크기 증가**: +1MB 이내 (lockfile + placeholder src). `node_modules/` 제외.
- **보안 검토**: 시크릿/credentials 파일 0건 — `cat .env*` 같은 명령 PR에서 실행 안 함 (CLAUDE.md 보안 절대 규칙 #3)

## 4. 회귀 인수

- **회귀 시나리오 #1**: 본 PR 머지 후 fresh checkout으로 `pnpm install --frozen-lockfile` 재실행 → AC-01 재현 (P14 휴먼 게이트에서 사용자가 수행)
- **회귀 시나리오 #2**: `git status` 후 ignored 파일 확인 (AC-05 재현)
- **회귀 시나리오 #3**: 다음 이슈 #2 (backend 골격)에서 `backend/package.json` 추가 후 `pnpm install` 시 workspace로 인식되는지 — 본 이슈 후속 검증 (다음 PR에서 자연 검증됨)
