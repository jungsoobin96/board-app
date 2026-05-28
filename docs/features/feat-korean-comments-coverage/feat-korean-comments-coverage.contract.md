---
doc_type: feature-contract
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

# feat-korean-comments-coverage — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §0~§6 채움 (ADR-0018 §0 5행 포함) |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 본 contract가 건드리는 게이트 C 정본을 명시.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs | R-N-05 (학습 친화성 — 한국어 주석 ≥80%) |
| F-ID (기능) | docs/planning/05-prd | F-10 (한국어 주석된 학습 코드) |
| 영향 모듈 | docs/planning/08-lld-module-spec | (none) — 모듈 시그니처·동작·의존성 무변경. 주석은 모듈 spec 영역 밖 |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec | (none) — API 시그니처·응답 schema 무변경 |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions | §4 주석 정책 (JSDoc 단순화 + 첫 줄 한국어 의도 + 자동 측정 grep 룰) |

## 1. 변경 의도

핵심 4 layer(`backend/src/{controllers,services,repositories}` + `frontend/src/components`)의 *exported 함수·컴포넌트* 헤더에 한국어 의도 주석을 보강하고, 자동 측정 스크립트(`scripts/check-comment-coverage.sh`)를 신설하여 F-10 Acceptance "정적 측정 ≥ 80%"를 객관 검증 가능하게 만든다 (R-N-05 / F-10 / O-16 해소).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| 측정 스크립트 | 부재 (11-coding-conventions §4가 "ad-hoc grep 룰" 권고만, 12-scaffolding §3에서 정밀화 예고) | `scripts/check-comment-coverage.sh` 신설 — bash POSIX + grep, 4 layer 입력 → layer별 커버리지 % + 누락 함수 목록 출력 + 80% 미만 시 exit 1 |
| 4 layer 한국어 주석 커버리지 | 측정 안 됨 (산발) | 4 layer 각각 ≥ 80% 자동 검증 (스크립트 PASS) |
| 주석 형식 | 산발 (영어/한국어 혼용, 위치 불일정) | 11-coding-conventions §4 형식 통일 — JSDoc `/** 한국어 의도 */` 함수/컴포넌트 헤더 위 |
| 누락 함수 식별 | 수동 PR 리뷰 의존 | 스크립트 출력으로 누락 함수 경로:라인 자동 노출 |
| 측정 도구 결정 (O-16) | 미해소 — "grep 룰 vs 수동 리뷰" 선택 보류 | grep 룰 채택 (스크립트 신설로 자동화) — Open Questions O-16 해소 |
| CI 통합 | 없음 | 본 PR scope 밖 — 별도 후속 이슈 (DoD #3 *선택* 유지) |
| F-10 / R-N-05 Acceptance | ❌ 측정 불가 | ✅ 스크립트 출력으로 검증 가능 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/controllers/*.ts` | exported 함수 헤더 한국어 주석 보강 (런타임 동작 0 영향) | 누락 함수에 JSDoc `/** 한국어 의도 */` 추가. 시그니처·구현 무변경 |
| `backend/src/services/*.ts` | 동상 | 동상 |
| `backend/src/repositories/*.ts` | 동상 | 동상 |
| `frontend/src/components/**/*.tsx` | 동상 (React FC 컴포넌트·exported 헬퍼 함수) | 동상 |
| `scripts/check-comment-coverage.sh` | 신설 파일 | grep 룰 기반 측정 스크립트. POSIX bash. 외부 의존(`yq`·`gh`) 없음 |
| `docs/planning/11-coding-conventions/11-coding-conventions.md` §4 | read-only 참조 (정본) | 본문 변경 없음 — 본 PR이 §4의 "12-scaffolding §3에서 정밀화" 예고를 *스크립트로 정밀화* 함 |
| `docs/planning/CHANGELOG.md` §"Current Status" | 진행 상황 갱신 | P13 docs-update에서 "Sprint 6 #23 한국어 주석 ≥80% + 스크립트" 1줄 |
| `docs/planning/14-wbs/14-wbs.md` Sprint 6 #23 행 | issue close 시 DoD 4항 ✅ | WBS 본문 변경 없음 (이슈 자체에 DoD 체크리스트) |

## 4. Backward Compatibility

- **Breaking: no**
- **마이그레이션 필요: no**
- **이유**: 주석은 컴파일·런타임 동작 0 영향. 스크립트 신설은 신규 파일(기존 워크플로 무변경). CI lint job은 본 PR scope 밖이므로 PR 차단·머지 게이트 영향 0.
- **deprecation 일정**: N/A — 폐기 대상 없음.
- **버전 영향**: internal docs/code-quality change → semver patch (board-app v1.x.y).

## 5. Rollback 전략

- **revert 가능: yes**
- **rollback 절차** (3단계):
  1. `git revert <merge-commit-sha>` — merge commit 한 건만 되돌리면 `scripts/check-comment-coverage.sh` 삭제 + 4 layer 주석 추가분 복구.
  2. `git push origin main` — origin 동기.
  3. (검증) `bash scripts/check-comment-coverage.sh` 실행 → "No such file" 정상 (스크립트 삭제 확인).
- **데이터 손상 위험**: 없음. 코드·DB·런타임 상태 무변경.
- **rollback trigger**: 스크립트 grep 룰이 *과측정*(false positive)으로 80% 통과처럼 보이지만 실제 누락 다수인 경우 → hotfix(같은 PR 추가 커밋으로 grep 룰 정밀화) 우선, revert는 최후.

## 6. 비목표

- **e2e·shared layer 주석 측정** — F-10 정의 4 layer 밖. 본 PR scope 밖.
- **테스트 코드 주석 측정** — 테스트는 학습 대상 코드 아님 (R-N-05 "핵심 모듈" 정의 외).
- **자동 주석 생성(LLM 보강)** — 본 PR은 사람이 *의미 있는* 한국어 주석 직접 작성. 자동 생성은 학습 가치 낮음 + O-16 결정 "grep 룰" 정합.
- **CI lint job 강제** — DoD #3 *선택* 유지. 본 PR은 스크립트 신설 + 측정 + 보강만. CI 통합은 별도 후속 이슈로 분리 가능.
- **영어 주석 제거** — R-N-05는 "한국어 주석 비율"만 측정. 영어 주석 보존 (혼용 허용).
- **함수 본문 내 한국어 주석 측정** — O-23-1 결정: 함수 헤더(JSDoc) 위 라인만 측정 (정적 grep 단순 + 11-coding-conventions §4 형식 정합).
- **본 PR이 12-scaffolding §3 본문 갱신** — 12-scaffolding §3 "정밀화 예고"를 *스크립트로* 충족. 12-scaffolding 본문 보강은 별 PR 분리 가능 (정본 단방향 참조).
