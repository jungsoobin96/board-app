---
doc_type: feature-brief
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

# E2E 골든 패스 (Playwright 5건) — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — Playwright 도입 + 5 spec + global-setup 시드 + gstack 수동 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

Sprint 3·4 frontend 5 페이지(Home·Article·Editor·NotFound·Tag 필터)에 E2E 골든 패스 5 시나리오를 Playwright로 자동화하여 회귀 안전망을 구축한다.

## 2. 사용자 가치

기획서·개발자가 frontend 머지 후 5 골든 패스가 깨지지 않았음을 1회 명령(`pnpm --filter @app/e2e test`)으로 확인한다. Sprint 6+ 신규 기능 추가 시 회귀 감지 시간이 수동 클릭(5~10분) → 자동 1분으로 단축. 이슈 #21 acceptance "Playwright 5 시나리오 PASS + gstack /qa 콘솔 0 에러 + 스크린샷 5장"의 자동 부분(5 spec)을 본 PR에서, 수동 부분(gstack /qa)을 머지 전 수동 검증으로 충족.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| e2e workspace | placeholder만 (package.json `test:e2e` echo·src/ 빈 골격·dist) | Playwright 정식 도입 — playwright.config.ts + 5 spec + global-setup (API seed) |
| Playwright 설치 | 0건 (`grep playwright package.json`·`frontend/package.json` 모두 0) | `@playwright/test` devDependency 추가 + `npx playwright install chromium` (브라우저 다운로드) |
| 5 spec | 0건 | `e2e/specs/{article-create,article-detail-comment,article-delete-cascade,tag-filter,home-list}.spec.ts` 5건 |
| global-setup 시드 | 0건 (수동 `seed:dev`만) | `e2e/global-setup.ts` — Playwright Test 진입 시 backend API에 글 5·댓글 10·태그 8 seed (idempotent, dev.db) |
| 부팅 자동화 | 수동 2 터미널(`pnpm --filter @app/backend dev` + `pnpm --filter @app/frontend dev`) | playwright.config.ts `webServer` 옵션으로 backend + frontend 자동 부팅 |
| 회귀 안전망 | 단위(102) + 통합(25) — UI 흐름 미보호 | + E2E 5 시나리오 = 132 총 시나리오. 머지 전 자동 검증 |
| #21 DoD 5항 | 0/5 | 4/5 자동 (Playwright 설치·5 spec·global-setup·CI job 선택) + 1/5 수동(gstack /qa, 머지 전 사람 검증) |

## 4. 모드 자동 감지 결과

- 이슈 #21 라벨: `type:test` + `area:frontend` + `priority:P1`
- 부정 시그널 0건 — `type:bug` 라벨 없음, UI/design 키워드 없음, 기존 동작 변경 없음 (신규 E2E 도입 + e2e workspace placeholder → 정식 도입)
- ADR-0032 규칙 4 기본값 발동 → **mode=add 자동 결정** (질문 없이 진행)
- slug: `feat-e2e-golden-path` (이슈 본문 Blocks: Sprint 6 진입과 정합)

## 5. 영향 범위

- **e2e/ workspace**: package.json devDependency + scripts 갱신, playwright.config.ts 신설, global-setup.ts 신설, specs/ 5 파일 신설
- **루트 lockfile**: pnpm-lock.yaml 갱신 (@playwright/test + 의존성)
- **docs/features/feat-e2e-golden-path/**: 6 docs (brief·contract·plan·eng-review·acceptance·risk)
- **부팅 자산**: e2e 부팅은 playwright.config.ts `webServer` 옵션으로 backend + frontend 자동 시작. LOCAL.md §3 dev profile 명령과 정합 (단지 e2e가 backend dev + frontend dev를 자동 wrap)
- 영향 없음: backend/ src·tests / frontend/ src·tests / shared/ src — 본 PR은 e2e 신설만, 기존 src 무변경

## 6. 비목표

- viewport 4종 매트릭스 (360/768/1024/1440 × 5 페이지) — 본 PR 5 spec은 desktop default(1280×720) 1 viewport만. viewport 매트릭스는 후속 별 이슈 (#19 이관 사항 → 본 PR에 미포함, 발견 사항 후보)
- gstack `/qa` 자동화 — gstack은 LLM 호출이 필요한 인터랙티브 도구로 머지 전 사람이 1회 수동 (DoD 4항)
- CI GitHub Actions에서 Playwright job 정식 도입 — 본 PR은 로컬만, CI job 신설은 Sprint 6+ 후보 (이슈 본문 DoD 5항 "(선택)" 명시)
- 시각 회귀 (visual regression) snapshot — 본 PR은 functional E2E만. 스크린샷 첨부는 gstack /qa 머지 전 수동 단계
- a11y(axe-core) 통합 — 본 PR scope 밖, 후속 후보

## 7. Open Questions

- Q1. viewport 매트릭스를 #21에 통합? → 사용자 결정: scope 축소 (본 PR은 desktop 1만, viewport는 별 이슈 후보)
- Q2. e2e CI job 정식 도입? → 선택 DoD 5항 미충족 (Sprint 6+ 후보, ADR 없음)
