---
doc_type: feature-investigation
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: []
  F-ID: [F-09]
  supersedes: null
---

# bug-residual-and-open-questions-resolve — Bug Investigation

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 회귀 191 PASS + grep 0건 → 결함 0건 확정 + Open Q 점검 결과 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 현상 / 보고

본 이슈 #25는 *특정 결함 보고가 아닌* Sprint 6 마지막 "잔여 buffer" 성격으로 등록. WBS 14 §"Sprint 6" #25 정의:
- "Open Q O-01~O-24 일부 미결정" → 본 PR 진입 시점 실제는 O-01~O-29 (29건)
- "잔여 버그 — 발견 시점 결정" → 능동적 탐색

즉, 본 PR은 *발견된 결함이 없으면* 그 사실을 회귀 전수 + 코드 grep 결과로 *결함 0건 확정 baseline*을 박는 것이 목표. mode=bug strict rule의 "재현 필수"는 본 PR scope에서 "결함 0건을 재현 절차로 입증"으로 해석.

## 2. 재현 절차

본 PR은 *결함을 재현*하지 않고 *결함이 없음을 재현*한다. 즉, "회귀 전수 + grep으로 잔여 결함 후보를 능동 탐색했고 0건"임을 누구나 동일 절차로 확인 가능하게 박는다.

```bash
# 1. 작업 디렉토리 진입
cd /path/to/board-app

# 2. backend 단위 회귀
pnpm --filter @app/backend test
# 기대: 64 passed, 0 failed

# 3. backend 통합 회귀 (DB seed 포함)
pnpm --filter @app/backend test:integration
# 기대: 36 passed, 0 failed

# 4. frontend 단위 회귀
pnpm --filter @app/frontend run test:unit
# 기대: 86 passed, 1 skipped, 0 failed

# 5. e2e 회귀 (Playwright)
pnpm --filter @app/e2e test
# 기대: 5 passed, 0 failed

# 6. backend src 결함 마커 능동 탐색
grep -rE "TODO|FIXME|BUG|HACK|XXX" backend/src
# 기대: 0 matches

# 7. 종합: 결함 0건 확정 baseline
```

## 3. 환경 / 컨텍스트

- **OS**: Windows 11 Pro 10.0.22000 (저자 본 PC)
- **Node**: v20+ (LOCAL.md §2 안내)
- **pnpm**: workspaces (@app/backend, @app/frontend, @app/shared, @app/e2e)
- **DB**: SQLite (Prisma) — `prisma/dev.db` (dev profile)
- **시점**: 2026-05-28 16:31 KST 시도
- **base**: main `ce4eea8` (PR #67 머지 직후 fast-forward)
- **branch**: 본 PR 진입 전 main 깨끗 (untracked `.claude/scheduled_tasks.lock` 1건만)

## 4. 로그·증적

### backend 단위 (64 PASS)

```
Test Files  9 passed (9)
     Tests  64 passed (64)
  Duration  4.24s
```

### backend 통합 (36 PASS)

```
Test Files  6 passed (6)
     Tests  36 passed (36)
  Duration  7.15s
```

p95 perf 측정 결과: R-N-01 (응답 시간 < 200ms) 4 시나리오 × 100회 모두 statusAllOk=true + p95 평균 ~19~63ms 범위.

### frontend 단위 (86 PASS + 1 skipped)

```
Test Files  18 passed | 1 skipped (19)
     Tests  86 passed | 1 skipped (87)
  Duration  23.41s
```

skipped 1건 = 사전 합의된 skip (mode=bug scope 밖).

### e2e (5 PASS)

```
Running 5 tests using 1 worker
  ok 1 [chromium] › article-create.spec.ts:3:1 → Editor 신규 글 작성
  ok 2 [chromium] › article-delete-cascade.spec.ts:3:1 → Article 삭제 + cascade
  ok 3 [chromium] › article-detail-comment.spec.ts:3:1 → Article 상세 + 댓글
  ok 4 [chromium] › home-list.spec.ts:3:1 → Home 글 목록 + 인기 태그
  ok 5 [chromium] › tag-filter.spec.ts:3:1 → Tag 칩 클릭
  5 passed (13.5s)
```

### backend src 결함 마커 grep (0건)

```
$ grep -rnE "TODO|FIXME|BUG|HACK|XXX" backend/src
(0 matches)
```

### 종합

| 회귀 카테고리 | 결과 | 결함 |
| --- | --- | --- |
| backend 단위 | 64 PASS / 0 FAIL | 0 |
| backend 통합 | 36 PASS / 0 FAIL | 0 |
| frontend 단위 | 86 PASS / 0 FAIL (+1 사전 skip) | 0 |
| e2e Playwright | 5 PASS / 0 FAIL | 0 |
| backend src 결함 마커 grep | 0 matches | 0 |
| **합계** | **191 PASS, 0 FAIL** | **0** |

## 5. 가설 + 근거

| 가설 | 근거 | 검증 방법 | 결과 |
| --- | --- | --- | --- |
| H1: backend에 *알려진* 잔여 결함이 있을 것 | WBS #25 "잔여 버그" 명시 | 회귀 전수 + grep 0건 능동 탐색 | ❌ 기각 — 결함 0건 |
| H2: backend src에 TODO/FIXME/BUG 코멘트가 남아 있을 것 | Sprint 1~6 동안 누적 가능성 | `grep -rnE` 전수 | ❌ 기각 — 0건 |
| H3: 회귀 한 시나리오라도 flaky 가능성 | 통합 36건 + e2e 5건 일부 환경 의존 | 1회 시도 (반복 미실행, 본 PR scope 밖) | ⚠️ 1회 시도 PASS — 다회 검증은 후속 |
| H4: Open Q 29건 중 *결함성* 미결정 항목 (예: 보안·계약 위배)이 섞여 있을 것 | O-* 분류 일부가 결함 영향 가능성 | `openq-resolution.md`에서 1건씩 카테고리 분류 | ❌ 기각 — 29건 모두 결정·보류·중복 (결함 카테고리 0건) |

## 6. 근본 원인 (Root Cause)

**결함 0건 확정**. 따라서 "근본 원인 = N/A".

본 PR scope에서 모든 가설은 능동 탐색 후 기각됨:
- H1·H2: backend는 Sprint 1~6 동안 acceptance·code-review·qa-test 6축 게이트를 거쳐 누적 결함 0건으로 유지됨 → 본 PR 진입 시점 baseline "결함 0건"
- H3: 1회 시도 PASS — flaky 가능성은 본 PR scope 밖 (후속 KPI #1 측정 별 ADR 후보, O-28 정합)
- H4: Open Q 29건 점검 결과 "보류"·"이미 해소" 위주 — 결함 영향 0건. 자세한 분류는 `openq-resolution.md` 참조

## 7. 회귀 테스트 추가 항목

**N/A — 본 PR은 결함 0건 PR**.

mode=bug strict rule "회귀 테스트 추가 강제"는 *결함 수정 시* 적용 — 본 PR은 결함 0건이므로 회귀 테스트 추가 N/A. 기존 191건 회귀가 그대로 유지·실행됨이 baseline.

향후 잔여 결함 발견 시 별 이슈 (`/flow-feature --mode=bug "..."`)에서 P3a 재현 + 회귀 테스트 추가 + 수정 코드 3종 세트가 강제됨.

## 8. 영향 받는 다른 영역

- **frontend**: 본 PR scope 밖 (area:backend 한정). frontend TS 3건 (#48)는 별 PR 처리 예정
- **infra**: 본 PR scope 밖. title-lint 정책 (#56)도 별 PR
- **docs**: 본 PR이 docs only — `docs/features/bug-*/` 신설 + `docs/planning/adr/0049-*.md` 신설 + 01~14 산출 inline update + CHANGELOG. 정합성 점검은 P9 code-review에서 확인
