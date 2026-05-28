---
doc_type: feature-plan
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03, R-N-04, R-N-07]
  F-ID: [F-09, F-12]
  supersedes: null
---

# feat-readme — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 2 commits DAG + 테스트 매핑 + 빌드 검증 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| C1 | `docs(docs): README 10 섹션 신설 (#22)` | `README.md` (신설) | N/A (docs only) | 0 (신설, 코드 무변경) |
| C2 | `docs(docs): feat-readme 산출 8 docs + ai-qa-report (#22)` | `docs/features/feat-readme/feat-readme.{brief,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md` | N/A (docs only) | 0 (신설, 코드 무변경) |

> 참조 정본 인용 (contract §0 selective read 결과):
> - R-N-03·R-N-04·R-N-07: docs/planning/04-srs (학습자 진입·평가 기준 노출·운영 격리)
> - F-09·F-12: docs/planning/05-prd (설치·실행 가이드 / 평가 기준 매핑)
> - 적용 컨벤션: docs/planning/11-coding-conventions §1 명명 (마크다운 제목·앵커 lowercase-hyphen)
> - 정본 참조: RFP.md §1.2·§6·§10·§11 / LOCAL.md §2·§3·§4·§5·§6 / docs/planning/12-scaffolding/typescript.md §5

## 2. 의존성 그래프

```
C1 (README.md 신설)
 │
 └─ no dependency (LOCAL.md 등 기존 정본 read-only 참조만)

C2 (8 docs 묶음)
 │
 ├─ depends on: C1 (README 본문 확정 후 ai-qa-report 작성에 §섹션 인용)
 └─ co-evolves with: P9 code-review + P10 ai-qa-report (같은 PR 내 단계)
```

- 순환 없음 (C1 → C2 단방향)
- C1·C2 모두 atomic — 단일 git commit 1개로 분할 가능
- 추정 작업량: ~3h (C1 2h README 본문 + C2 1h docs 8건) → WBS 1d 범위 내

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| C1 | N/A (docs only, 코드 무변경) | N/A — 자동 테스트 대상 아님 |
| C2 | N/A (docs only) | N/A |
| (전체 PR) | `bash .claude/scripts/validate-doc.sh` 8 docs 전수 | schema 강제 8건 모두 PASS (BLOCK 미발생) |
| (전체 PR) | UC-06 수동 시도 | README §평가 기준 표 7행 × 통과 방법 따라 1회 수동 시도 (이슈 본문 DoD #6 — `test-final-golden-path` 후속에서 깊이 검증) |
| (전체 PR) | RFP §10 7항 ↔ README §평가 기준 매핑 ↔ 본 PR PR body 매핑 3방향 정합 | 사람 검토 (P9 code-review + P14 휴먼 게이트) |

> 신규 단위 테스트·통합 테스트·E2E spec 0건. `frontend/tests` / `backend/tests` / `e2e/specs` 무변경. 회귀는 기존 36 backend + 86 frontend + 5 e2e가 그대로 통과해야 함 (P10 자동 회귀 검증).

## 4. 빌드·실행 검증 단계

> 12-scaffolding/typescript.md §5 + LOCAL.md §3 native script 직호출 (ADR-0041).

```bash
# (1) docs validate — 신설 8 docs 전수 schema 검증
for f in docs/features/feat-readme/feat-readme.*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || exit 1
done

# (2) 회귀 — 코드 무변경 검증 (build/tests/e2e)
pnpm --filter @app/backend test       # backend 36 integration tests
pnpm --filter @app/frontend test      # frontend 86 unit tests
pnpm --filter @app/backend build      # tsc 검증
pnpm --filter @app/frontend build     # vite 빌드

# (3) 3 profile 부팅 smoke (AI 게이트 6번째 축, ADR-0037 v1.1)
pnpm dev:local   # dev profile ready 신호 + 에러 0건
pnpm dev:stg     # stg profile ready 신호 + 에러 0건
pnpm dev:prod    # prod profile ready 신호 + 에러 0건

# (4) workflow 로컬 검증 (ADR-0047) — manual reproduction
gh pr view <PR_N> --json body --jq '.body' | awk '/^### Manual verification/{f=1;next} /^### |^---/{f=0} f' | grep -cE '^[[:space:]]*-[[:space:]]*\[ \]'
# → 0 (모든 Manual checkbox 미체크) → pr-body-checkbox-gate.yml 시뮬레이션 PASS 예상
```

## 5. 점진 합의 / 결정 발생 항목

- O-22-1 결정: 평가 기준 #4 페이지네이션은 "⚠️ Phase 2 예정 (F-13)" 명시 (RFP 추적성 보존). → README §평가 기준 표 행에 명시.
- O-22-2 결정: §학습 가이드는 Phase 2 4단계 + Next 권고 1줄 위주. 코드 한국어 주석 가이드는 별도 백로그.
- O-22-3 결정: 라이선스 명시 본 PR scope 밖, 별도 백로그.
- 결정 자체는 모두 contract.md §0 selective read 단계에서 사용자 의도 명시 (이슈 본문 DoD 6항 + Acceptance Criteria 3항)와 일치하여 추가 ADR 불필요.
