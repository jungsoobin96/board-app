---
doc_type: feature-plan
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

# feat-korean-comments-coverage — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 4 commits DAG + 테스트 매핑 + 빌드 검증 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| C1 | `feat(scripts): check-comment-coverage.sh — 한국어 주석 측정 (#23)` | `scripts/check-comment-coverage.sh` (신설) | 스크립트 자체가 측정 도구 — `bash scripts/check-comment-coverage.sh` 실행 시 4 layer 측정 출력 | 0 (신규 파일, 외부 의존 없음) |
| C2 | `docs(backend): controllers/services/repositories 한국어 주석 보강 (#23)` | `backend/src/controllers/{articles,comments,tags}.controller.ts` + `backend/src/services/{article,comment,tag}.service.ts` + `backend/src/repositories/{article,comment,tag}.repo.ts` (9 파일) | C1 스크립트로 측정 → 3 layer 모두 ≥ 80% | 0 (주석만 추가, 시그니처·구현 무변경) |
| C3 | `docs(frontend): components 한국어 주석 보강 (#23)` | `frontend/src/components/*.tsx` (10 파일) | C1 스크립트로 측정 → components ≥ 80% | 0 (주석만 추가, JSX·props·hook 무변경) |
| C4 | `docs(docs): feat-korean-comments-coverage 산출 8 docs + ai-qa-report (#23)` | `docs/features/feat-korean-comments-coverage/feat-korean-comments-coverage.{brief,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md` | N/A (docs only) | 0 (신설, 코드 무변경) |

> 참조 정본 인용 (contract §0 selective read 결과):
> - R-N-05: `docs/planning/04-srs/04-srs.md` §R-N-05 (학습 친화성 — 핵심 모듈 4 layer ≥ 80%, grep 비율 측정)
> - F-10: `docs/planning/05-prd/05-prd.md` §F-10 (한국어 주석된 학습 코드, R-N-05 매핑)
> - 적용 컨벤션: `docs/planning/11-coding-conventions/11-coding-conventions.md` §4 주석 정책 (JSDoc `/** 한국어 의도 */` 함수 헤더 위 + ad-hoc grep 룰)

## 2. 의존성 그래프

```
C1 (scripts/check-comment-coverage.sh 신설)
 │
 ├─ no upstream dependency (POSIX bash + grep만)
 └─ enables: C2·C3에서 측정 PASS 검증 + C4 ai-qa-report 측정 결과 인용

C2 (backend 3 layer 주석)
 │
 ├─ depends on: C1 (측정 도구 필요)
 └─ independent of: C3 (backend·frontend 영역 분리)

C3 (frontend components 주석)
 │
 ├─ depends on: C1
 └─ independent of: C2

C4 (8 docs 묶음)
 │
 ├─ depends on: C1·C2·C3 (ai-qa-report에 측정 결과·커버리지 % 인용)
 └─ co-evolves with: P9 code-review + P10 ai-qa-report (같은 PR 내 단계)
```

- 순환 없음 (C1 → {C2, C3} → C4)
- C2·C3는 병렬 가능 (backend·frontend 영역 분리)
- 추정 작업량: ~3.5h (C1 스크립트 30m + C2 backend 9 파일 1h + C3 frontend 10 파일 1.5h + C4 docs 1h) → WBS 1d 범위 내

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| C1 | N/A — 스크립트 자체가 측정 도구 (R-N-05 §"테스트 3축: 단위 N/A, 통합 N/A, E2E N/A 정적 분석" 정합) | 스크립트 실행 → 4 layer 커버리지 % 출력 + 80% 미만 시 exit 1. 누락 함수 경로:라인 출력 |
| C2 | N/A (주석만 추가, 런타임 동작 0) | 회귀 검증: `pnpm --filter @app/backend test` 36 integration tests 전수 통과 (변화 없음) |
| C3 | N/A (주석만 추가, 런타임 동작 0) | 회귀 검증: `pnpm --filter @app/frontend test` 86 unit tests 전수 통과 (변화 없음) |
| C4 | N/A (docs only) | `bash .claude/scripts/validate-doc.sh` 8 docs 전수 schema 검증 PASS |
| (전체 PR) | `bash scripts/check-comment-coverage.sh` | 4 layer (controllers·services·repositories·components) 모두 ≥ 80% PASS |
| (전체 PR) | 3 profile 부팅 smoke (AI 게이트 6번째 축) | dev/stg/prod 각 ready 신호 + 에러 0건 (주석은 부팅 영향 0이므로 회귀 신호) |

> 신규 단위·통합·E2E 0건. `frontend/tests` / `backend/tests` / `e2e/specs` 무변경. 회귀는 기존 36 backend + 86 frontend + 5 e2e가 그대로 통과해야 함 (P10 자동 회귀 검증). 측정 도구 자체는 R-N-05 §"테스트 3축 모두 N/A (정적 분석)" 결정으로 단위/통합/E2E 테스트 대상 아님.

## 4. 빌드·실행 검증 단계

> 12-scaffolding/typescript.md §5 + LOCAL.md §3 native script 직호출 (ADR-0041).

```bash
# (1) 스크립트 실행 — 4 layer 커버리지 측정 + 80% 충족 검증
bash scripts/check-comment-coverage.sh
# 기대: 4 layer 각각 ≥ 80% PASS, exit 0

# (2) docs validate — 신설 8 docs 전수 schema 검증
for f in docs/features/feat-korean-comments-coverage/feat-korean-comments-coverage.*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || exit 1
done

# (3) 회귀 — 코드 무변경 검증 (build/tests)
pnpm --filter @app/backend test       # backend 36 integration tests
pnpm --filter @app/frontend test      # frontend 86 unit tests
pnpm --filter @app/backend build      # tsc 검증
pnpm --filter @app/frontend build     # vite 빌드

# (4) 3 profile 부팅 smoke (AI 게이트 6번째 축, ADR-0037 v1.1)
pnpm dev:local   # dev profile ready 신호 + 에러 0건
pnpm dev:stg     # stg profile ready 신호 + 에러 0건
pnpm dev:prod    # prod profile ready 신호 + 에러 0건

# (5) workflow 로컬 검증 (ADR-0047) — manual reproduction
gh pr view <PR_N> --json body --jq '.body' | awk '/^### Manual verification/{f=1;next} /^### |^---/{f=0} f' | grep -cE '^[[:space:]]*-[[:space:]]*\[ \]'
# → 0 (모든 Manual checkbox 미체크) → pr-body-checkbox-gate.yml 시뮬레이션 PASS 예상
```

## 5. 점진 합의 / 결정 발생 항목

- **O-16 해소** (05-prd §7): F-10 한국어 주석 커버리지 측정 도구 — **grep 룰 기반 자동 측정** 채택. 사유: 11-coding-conventions §4가 이미 ad-hoc grep 룰 명시 + 정밀화 예고를 본 PR에서 스크립트로 실현. 수동 리뷰는 PR 코멘트 보강 단계로 보완 (자동 측정과 병행).
- **O-23-1 결정**: 한국어 주석 측정 단위 = **함수 헤더 1줄 위 주석 라인** (정적 grep 단순). 함수 본문 내 한국어 주석은 측정 대상 외 (11-coding-conventions §4 형식 정합).
- **O-23-2 결정**: "함수" 범위 = JS arrow function·class method·React FC·export default function 모두 포함. grep 룰 패턴 — `^export (async )?function`·`^export const \w+ = (async )?\(`·`^export default function`.
- **O-23-3 결정**: CI lint job 추가 = **본 PR 포함하지 않음** (별도 후속 이슈로 분리 가능). 사유: ADR-0047 workflow 양축 검증 부담 추가 + scope creep 회피 + DoD #3 *선택* 유지.
- 결정 자체는 모두 contract §0 selective read 단계에서 사용자 의도 명시(이슈 본문 DoD 4항 + Acceptance Criteria 2항)와 일치하여 추가 ADR 불필요.
