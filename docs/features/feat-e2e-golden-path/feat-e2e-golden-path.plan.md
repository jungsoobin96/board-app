---
doc_type: feature-plan
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-07]
  F-ID: [F-01, F-02, F-03, F-04, F-07]
  supersedes: null
---

# E2E 골든 패스 (Playwright 5건) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — 2 commit (Playwright 설치+config + 5 spec/global-setup) |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `test(e2e): Playwright 도입 + playwright.config + global-setup 시드 (#21)` | `e2e/package.json` (devDep + scripts 추가), `e2e/playwright.config.ts` (신설), `e2e/global-setup.ts` (신설), `pnpm-lock.yaml` (자동) | (없음 — 인프라 1차) | Low — 신규 파일만, 기존 backend/frontend/shared 무영향 |
| 2 | `test(e2e): 5 골든 패스 spec 추가 — Home·Editor·Article·Delete cascade·Tag filter (#21)` | `e2e/specs/{home-list,article-create,article-detail-comment,article-delete-cascade,tag-filter}.spec.ts` (신설 5) + `docs/features/feat-e2e-golden-path/*` 6 docs | 5 spec × 1 test each = 5 E2E test | Low — e2e 신설만, 기존 무변경 |

## 2. 의존성 그래프

```
[P0 context-loader] e2e/ workspace placeholder + scripts/setup-playwright.sh + LOCAL.md §3 dev profile 식별
   │
   ▼
[P1 brief] mode=add (type:test + 부정 시그널 0건) + slug=feat-e2e-golden-path
   │
   ▼
[P3 contract] §0 R-F-01~04+07 + F-01~04+07 + e2e/specs+global-setup+config 신설 + endpoints 6 read-only/POST seed
   │
   ▼
[P4 plan] 본 문서 (2 commit)
   │
   ▼
[P5/P6/P7] eng-review PASS / acceptance AC-01~05 / risk 3 F-RISK Low
   │
   ▼
[P8 implement] commit 1 (Playwright + config + global-setup) → commit 2 (5 spec + 6 docs) → `pnpm --filter @app/e2e test` 5 PASS 확인
   │
   ▼
[P9 reviewer] code-review.md verdict
   │
   ▼
[P10 qa-test --ai] 6축 + 3 profile smoke + workflow 양축 → PR open + Closes #21
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 | (없음) | 인프라 1차 — Playwright 설치 + playwright.config.ts(testDir=specs, projects=chromium, webServer=backend+frontend dev, baseURL=http://localhost:5173) + global-setup.ts (backend ready polling + POST /api/articles·comments idempotent seed 글5·댓글10·태그8) |
| 2 | `e2e/specs/home-list.spec.ts` it 1 | F-01 Home — http://localhost:5173/ 방문 → 글 5건·태그 8개 렌더 확인 (text/role locator) |
| 2 | `e2e/specs/article-create.spec.ts` it 1 | F-02 Editor — /editor 이동 → title·body·tags 폼 작성 → submit → /article/:slug 이동 + 작성 글 노출 확인 |
| 2 | `e2e/specs/article-detail-comment.spec.ts` it 1 | F-03+F-05 Article + 댓글 — global-setup 첫 글 방문 → 본문 노출 + 댓글 폼 작성 → 댓글 목록 새 항목 노출 |
| 2 | `e2e/specs/article-delete-cascade.spec.ts` it 1 | F-04 Delete cascade — global-setup 첫 글 방문 → Delete 버튼 클릭 → 확인 모달 → Home 이동 → 글 목록에서 미노출 확인 |
| 2 | `e2e/specs/tag-filter.spec.ts` it 1 | F-07 Tag — Home 방문 → 첫 태그 칩 클릭 → URL `?tag=...` 확인 → 글 목록 필터링 → 칩 재클릭으로 해제(PR #58 정합) |
| (기존) | 단위 102 · 통합 25 | 무변경, 회귀 영향 0 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 6 docs)
for f in docs/features/feat-e2e-golden-path/*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 6건 모두 OK

# 단계 B: 의존성 설치 (lockfile 갱신)
pnpm install
# 기대: @playwright/test + transitive deps 설치, lockfile 갱신 1줄 이상

# 단계 C: Playwright 브라우저 다운로드 (chromium 1)
pnpm --filter @app/e2e exec playwright install chromium
# 기대: chromium 1.49+ 설치 완료 (~150MB)

# 단계 D: backend·frontend 무회귀 (기존 명령)
pnpm --filter @app/backend run build           # 0 errors
pnpm --filter @app/backend run test:integration # 25 passed
pnpm --filter @app/frontend run build           # 0 errors
pnpm --filter @app/frontend run test            # 102 passed

# 단계 E: E2E 5 spec 실 실행
pnpm --filter @app/e2e test
# 기대: 5 passed (chromium 1 project), 약 1분 소요
# webServer가 backend(:3000) + frontend(:5173) 자동 부팅
# global-setup이 1회 시드, beforeAll만, afterAll cleanup 없음

# 단계 F: 3 profile smoke (R-OPS-SMOKE 자기 검증, ADR-0037 v1.1)
pnpm run smoke:3profiles
# 기대: 3/3 PASS

# 단계 G: workflow 양축 manual reproduction (R-OPS-WORKFLOW, ADR-0047)
PR_BODY="Closes #21"
ISSUES=$(printf '%s' "$PR_BODY" | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "21 "
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — mode=add 신규 도구(Playwright) 도입, breaking 없음, e2e workspace 정식 도입(placeholder → 실 도입). 별 결정 사항 없음
- **사용자 승인 필요 X**: P14 표준 휴먼 게이트만 (gstack /qa 수동 1회 머지 전)
- **결정 사항**:
  - viewport 1 (desktop default) — viewport 4종 매트릭스는 별 이슈 후보 (#19 이관 발견 사항)
  - chromium 1 project — firefox/webkit은 후속 (cross-browser는 Sprint 6+ 후보)
  - global-setup만 사용 (per-test setup 없음) — idempotent upsert seed로 격리 충족
  - webServer auto-boot — 사람이 별 터미널 띄울 필요 없음 (CI 친화)
  - dev.db 시드는 누적 가능성 있으나 upsert pattern으로 idempotent — 5 spec 매 실행마다 동일 baseline 보장
  - 5 spec 채택 — F-01·F-02·F-03+F-05·F-04·F-07 5개 골든 패스. F-06 Tag URL state는 PR #58 머지 완료 → tag-filter.spec에 통합
  - 비목표 6건 (viewport / gstack 자동 / CI job / visual regression / a11y / 부하)
- **PR title**: `test(e2e): E2E 골든 패스 5건 — Playwright + global-setup + webServer 자동 부팅 (#21)` — ADR-0021 정규식 `test` prefix 정합 + branch `feat/` (ADR-0044 mode=add 정합)
- **BLOCKED 분기**: pnpm install FAIL / Playwright 브라우저 다운로드 FAIL / 5 spec 중 1+ FAIL 시 BLOCKED
- **ui_changed=true 가능성**: e2e specs는 `.ts`만 (frontend src 무변경) — `ui_changed=false` 자동 판정. AI 게이트 5번째 축은 N/A 사유 명시 허용. **단 gstack /qa 머지 전 수동 검증은 acceptance에서 별 항목으로 강제** (스크린샷 5장 + 콘솔 0 에러)
