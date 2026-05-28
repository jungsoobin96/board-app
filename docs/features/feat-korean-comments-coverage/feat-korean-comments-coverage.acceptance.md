---
doc_type: feature-acceptance
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-05]
  F-ID: [F-10]
  supersedes: null
---

# feat-korean-comments-coverage — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | AC-01~04 + DoD 6항 + 회귀 인수 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 스크립트 신설 + 실행 가능

- **Given** `scripts/check-comment-coverage.sh`가 신설되어 있고
- **When** `bash scripts/check-comment-coverage.sh` 실행
- **Then** 4 layer (controllers·services·repositories·components) 각각 한국어 주석 커버리지 %가 stdout에 출력되고, 누락 함수 목록(파일:라인)이 노출된다. 모두 ≥ 80%이면 exit 0, 1 layer라도 < 80%이면 exit 1.

### AC-02: 4 layer 한국어 주석 커버리지 ≥ 80%

- **Given** `backend/src/controllers`·`backend/src/services`·`backend/src/repositories`·`frontend/src/components` 4 layer
- **When** `bash scripts/check-comment-coverage.sh` 실행
- **Then** 4 layer 각각 한국어 주석/exported 함수 비율 ≥ 80% (R-N-05 / F-10 Acceptance 정합)

### AC-03: 주석 형식 — JSDoc 한국어 의도

- **Given** 4 layer의 exported 함수·컴포넌트
- **When** 함수 헤더 바로 위 주석 라인 검사
- **Then** JSDoc 형식 `/** 한국어 의도 ... */`로 통일 (11-coding-conventions §4 정합). 영어 주석은 보존 (혼용 허용), 한국어 비율만 ≥ 80% 측정.

### AC-04: 런타임 회귀 0건

- **Given** 본 PR이 주석만 추가하고 런타임 코드 무변경
- **When** `pnpm --filter @app/backend test` + `pnpm --filter @app/frontend test` + 3 profile dev 부팅
- **Then** backend 36 + frontend 86 = 122 tests 전수 통과 (변화 없음), 3 profile 모두 ready 신호 + 에러 0건

## 2. Definition of Done (D-06)

- [ ] 단위 테스트 (스크립트 자체가 측정 도구, R-N-05 §3축 모두 N/A 정합)
- [ ] AI 게이트 6축 PASS (1~4축 자동/리뷰/Test Plan/시크릿 + 5축 N/A `ui_changed=false` + 6축 3 profile 부팅 PASS)
- [ ] Test Plan 4블록 (Build / Automated tests / Manual verification / DoD coverage)
- [ ] PR Approve ≥ 1 + status check `pr-body-checkboxes` PASS (사용자 책임 3단: Manual ✅ + DoD ✅ + 머지)
- [ ] CI green
- [ ] (이슈 본문 DoD #1) `scripts/check-comment-coverage.sh` 신설
- [ ] (이슈 본문 DoD #2) 4 layer 각각 ≥ 80%
- [ ] (이슈 본문 DoD #3) CI lint job 추가 — **N/A** (선택, 본 PR scope 밖, O-23-3 결정으로 후속 이슈 분리)
- [ ] (이슈 본문 DoD #4) 결과 PR body — 측정 결과 표 + 4 layer 커버리지 % + 누락 함수 0건

## 3. 비기능 인수

- **재현 가능성**: 스크립트 grep 룰이 결정론적 — 같은 입력에서 같은 출력. 사용자가 `bash scripts/check-comment-coverage.sh` 실행 시 PR body 측정 결과와 일치
- **외부 의존 없음**: POSIX bash + grep만 사용 (yq·gh·jq 등 불필요). 새 PC + Node 20에서 즉시 실행 가능 (Sprint 6 KPI 정합)
- **성능**: 19 파일 × grep 1회 < 5초 (i7급 PC 기준). CI 통합 시에도 부담 없음
- **보안**: secret·환경변수·외부 호출 0건. 정적 파일 읽기만

## 4. 회귀 인수

- **AC-R-01**: `pnpm --filter @app/backend test` — 36 integration tests 전수 통과 (변화 없음, 주석은 런타임 영향 0)
- **AC-R-02**: `pnpm --filter @app/frontend test` — 86 unit tests 전수 통과 (변화 없음)
- **AC-R-03**: `pnpm --filter @app/backend build` — tsc 컴파일 PASS (주석은 TS 컴파일 영향 0)
- **AC-R-04**: `pnpm --filter @app/frontend build` — vite 빌드 PASS
- **AC-R-05**: 3 profile (dev/stg/prod) 부팅 — 각 ready 신호 + 에러 0건 (AI 게이트 6번째 축)
- **AC-R-06**: E2E 5 spec — `pnpm --filter @app/e2e test` 전수 통과 (주석은 E2E 영향 0)
