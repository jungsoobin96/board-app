---
doc_type: feature-contract
version: v0.3
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-07]
  F-ID: [F-01, F-02, F-03, F-04, F-07]
  supersedes: null
---

# E2E 골든 패스 (Playwright 5건) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.3 | 2026-05-28 | jungsoobin96 | §2 channel='chrome' + headless=false 옵션 보정 (code-review Q1 발견 → 같은 PR 보정, chromium_headless_shell extract stuck 우회) |
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — §0~§6 채움 (5 spec + global-setup + webServer 자동 부팅) |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-F-01 (글 목록), R-F-02 (글 작성), R-F-03 (글 상세), R-F-04 (글 삭제 cascade), R-F-07 (태그 필터) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-01 (Home 목록), F-02 (Editor 작성), F-03 (Article 상세), F-04 (Delete cascade), F-07 (Tag 필터) |
| 영향 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md | e2e/specs (신설 5), e2e/global-setup (신설 1), e2e/playwright.config (신설 1) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | GET /api/articles, GET /api/articles/:slug, POST /api/articles, DELETE /api/articles/:slug, GET /api/tags, POST /api/articles/:slug/comments — global-setup 시드 + 5 spec 골든 패스에서 호출 |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | (none) — Playwright 신규 도구 도입, 기존 컨벤션 무영향 |

## 1. 변경 의도

e2e/ placeholder workspace에 Playwright 정식 도입 + 5 골든 패스 spec + global-setup(API 시드) + webServer(backend·frontend 자동 부팅)을 통합하여 Sprint 3·4 frontend 5 페이지의 회귀 안전망을 구축한다. 이슈 #21 acceptance의 자동 부분(Playwright 5 PASS)을 본 PR로, 수동 부분(gstack /qa)을 머지 전 사람 검증으로 충족.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| e2e/package.json devDependency | 0 (placeholder) | `@playwright/test`: ^1.49 추가 (lockfile 갱신) |
| e2e/package.json scripts.test | `"test:e2e": "echo 'placeholder'"` | `"test:e2e": "playwright test"` + `"test:e2e:install": "playwright install chromium"` 추가 |
| e2e/playwright.config.ts | 부재 | 신설 — testDir=specs, projects=chromium 1 (channel='chrome' Windows 시스템 Chrome 사용 — 로컬 chromium_headless_shell extract stuck 우회), webServer=backend dev + frontend dev 자동, baseURL=http://localhost:5173, globalSetup=global-setup.ts, use.headless=false (channel='chrome' 정합) |
| e2e/global-setup.ts | 부재 | 신설 — Playwright Test 진입 시 1회: backend `/api/articles?limit=1` polling으로 ready 확인 → 글 5·댓글 10·태그 8 idempotent seed (dev.db, beforeAll 한 번만) |
| e2e/specs/ 5 파일 | 부재 | 신설 — `home-list.spec.ts`(F-01), `article-create.spec.ts`(F-02), `article-detail-comment.spec.ts`(F-03+F-05), `article-delete-cascade.spec.ts`(F-04), `tag-filter.spec.ts`(F-07) |
| 회귀 검증 명령 | 수동 클릭 (5~10분) | `pnpm --filter @app/e2e test` 1회 (~1분 예상) — 5 spec PASS |
| frontend dev 서버 부팅 | 수동 2 터미널 | playwright.config.ts `webServer` 자동 부팅 (test 진입 직전 backend + frontend 동시 띄움, test 종료 시 자동 종료) |
| pnpm-lock.yaml | 현재 | @playwright/test + transitive deps 추가 |
| LOCAL.md §3 | 본 e2e 명령 미명시 | (별 PR 후보) — 본 PR에서는 e2e workspace 안에서 self-contained, LOCAL.md 부팅 자산은 변경 0 (backend·frontend dev 명령 무변경) |
| 6 docs | 부재 | 신설 — docs/features/feat-e2e-golden-path/* 6건 (brief·contract·plan·eng-review·acceptance·risk) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `e2e/playwright.config.ts` (신설) | testDir + projects + webServer + globalSetup 단일 진입점 | 신설 |
| `e2e/global-setup.ts` (신설) | backend API 호출자 — POST /api/articles·POST /api/articles/:slug/comments 시드 | 신설 — fetch + retry polling |
| `e2e/specs/home-list.spec.ts` (신설) | frontend Home page http://localhost:5173/ 방문 | 신설 — 글 5건 표시·태그 8 표시 확인 |
| `e2e/specs/article-create.spec.ts` (신설) | frontend /editor 페이지 — 폼 작성 + submit + Article page 이동 | 신설 |
| `e2e/specs/article-detail-comment.spec.ts` (신설) | frontend /article/:slug + 댓글 작성·노출 | 신설 |
| `e2e/specs/article-delete-cascade.spec.ts` (신설) | frontend Article delete + Home 재방문 시 미노출 | 신설 |
| `e2e/specs/tag-filter.spec.ts` (신설) | frontend Home + 태그 칩 클릭 → ?tag=... URL state + 글 필터링 | 신설 |
| `e2e/package.json` | scripts.test:e2e 변경 + devDependency 추가 | 변경 |
| `pnpm-lock.yaml` | lockfile 갱신 | 변경 (자동) |
| backend dev 서버 | playwright webServer가 자동 부팅 — `pnpm --filter @app/backend dev` cwd=root | 무변경 (read-only 사용) |
| frontend dev 서버 | playwright webServer가 자동 부팅 — `pnpm --filter @app/frontend dev` cwd=root | 무변경 (read-only 사용) |
| backend/prisma/dev.db | global-setup이 seed:dev로 사전 시드, spec 종료 후 cleanup 없음 (다음 실행 시 idempotent re-seed) | 데이터 누적 가능성 — beforeAll 시드는 upsert 패턴으로 idempotent 보장 |

## 4. Backward Compatibility

- Breaking: **no** — e2e workspace는 placeholder였고, 본 PR로 정식 도입. 기존 backend·frontend·shared 어떤 모듈도 무변경
- 마이그레이션 필요: no
- 사용자 노출 변화: 없음 (개발자 도구만, end user 무영향)
- API 변경: 없음 (read-only 호출 + POST seed는 dev.db 한정)

## 5. Rollback 전략

- revert 가능: **yes** — 1단계 `git revert <merge-commit>`로 e2e/* 신설 + e2e/package.json 변경 + pnpm-lock.yaml 변경 + 6 docs 모두 원복
- rollback 절차:
  1. `git revert <merge-commit>` (squash 머지 후 단일 commit)
  2. `pnpm install` (lockfile 동기)
  3. e2e workspace는 placeholder로 복귀
- 데이터 손상 위험: 없음 — dev.db는 본 PR 무관 무영향 (global-setup이 idempotent upsert만)
- backend·frontend·shared 무영향이므로 rollback이 다른 영역에 회귀 없음

## 6. 비목표

- viewport 4종 매트릭스(360/768/1024/1440 × 5 페이지 = 20 매트릭스) — 본 PR은 desktop 1280×720 default 1 viewport만. viewport 매트릭스는 후속 별 이슈 (#19 이관 사항 → 발견 사항으로 등록 후보)
- gstack `/qa` 자동화 — gstack은 인터랙티브 LLM 호출 도구, 머지 전 사람 1회 수동 실행 (DoD 4항)
- CI GitHub Actions Playwright job 신설 — 본 PR은 로컬만, CI 통합은 Sprint 6+ 후보 (이슈 본문 DoD 5항 "(선택)")
- 시각 회귀 snapshot — Playwright의 `expect(page).toHaveScreenshot()` 미사용, functional E2E만
- a11y(axe-core) 통합 — 별 이슈 후보
- 부하 테스트 / 동시성 — Playwright는 functional, 부하는 별 도구 (#20 perf integration이 backend 측 일부 cover)
- backend·frontend·shared src 코드 변경 — 본 PR scope 밖
