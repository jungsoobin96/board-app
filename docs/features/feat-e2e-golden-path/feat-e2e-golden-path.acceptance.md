---
doc_type: feature-acceptance
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

# E2E 골든 패스 (Playwright 5건) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — AC-01~05 5 spec + DoD 5항 + 회귀·비기능 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01 — Home 글 목록 + 태그 (F-01, R-F-01)

- **Given** global-setup이 글 5·태그 8 시드 완료, frontend dev :5173 + backend dev :3000 부팅
- **When** `e2e/specs/home-list.spec.ts` 실행 — Playwright `page.goto('/')`
- **Then** 글 카드 5건 노출(`.article-card` locator) + 사이드바 태그 8개 노출(`.tag-pill`) + 콘솔 에러 0 + p.assert pass

### AC-02 — Editor 글 작성 (F-02, R-F-02)

- **Given** 위와 동일 + `/editor` 라우트 접근 가능
- **When** `e2e/specs/article-create.spec.ts` 실행 — `page.goto('/editor')` → title="E2E Article" body="E2E test content." tags="e2e,playwright" 입력 → submit 버튼 클릭
- **Then** URL이 `/article/e2e-article` 패턴으로 이동 + 본문에 "E2E test content." 노출 + 콘솔 에러 0

### AC-03 — Article 상세 + 댓글 (F-03+F-05, R-F-03)

- **Given** 위와 동일 + global-setup 첫 글의 slug 알려짐
- **When** `e2e/specs/article-detail-comment.spec.ts` 실행 — 첫 글 방문 → 댓글 폼에 "Great article!" 입력 → submit
- **Then** 글 본문 + 기존 댓글 노출 + 새 댓글 "Great article!" 목록 새 항목으로 노출 + 콘솔 에러 0

### AC-04 — Delete cascade (F-04, R-F-04)

- **Given** 위와 동일 + 글 5건 baseline
- **When** `e2e/specs/article-delete-cascade.spec.ts` 실행 — 첫 글 방문 → Delete 버튼 클릭 → 확인 모달 OK
- **Then** URL이 `/` 이동 + 글 목록에 삭제된 글 미노출(4건만) + 콘솔 에러 0 (cascade는 backend integration이 보장, E2E는 UI 미노출만 확인)

### AC-05 — Tag 필터 (F-07, R-F-07)

- **Given** 위와 동일 + 첫 태그 칩 활성 가능
- **When** `e2e/specs/tag-filter.spec.ts` 실행 — Home 방문 → 첫 태그 칩 클릭 → URL `?tag=<name>` 확인 → 글 목록 필터링 확인 → 같은 칩 재클릭(active 해제)
- **Then** URL이 `/` (tag 파라미터 제거) + 글 목록 5건 baseline 복귀 + 콘솔 에러 0 (PR #58 active 재클릭 해제 정합)

## 2. Definition of Done (D-06)

### 단위 테스트
- [x] 본 PR은 E2E만 — 단위 테스트 추가 N/A. 기존 단위 102 무변경
- [x] 기존 통합 25 무변경

### AI 게이트 6축
- [x] 1축 자동 테스트: pnpm --filter @app/e2e test 5 PASS + backend/frontend 기존 회귀 PASS
- [x] 2축 코드 리뷰: feat-e2e-golden-path.code-review.md verdict PASS
- [x] 3축 Test Plan 4블록 (Build/Automated/Manual/DoD)
- [x] 4축 시크릿 스캔: 0건 (e2e specs는 URL·locator만)
- [x] 5축 브라우저 골든패스 실증: **ui_changed=false** (frontend src 무변경) — N/A 명시 허용. 단 본 PR이 E2E 자체이므로 자기 검증 (5 spec PASS = 골든 패스 실증). gstack /qa는 머지 전 사람 수동 (DoD 4항)
- [x] 6축 로컬 부팅: 3 profile smoke PASS

### Test Plan 4블록 (PR body)
- [x] Build: `pnpm install` + `pnpm -r build` 0 errors
- [x] Automated tests: `pnpm --filter @app/e2e test` 5 PASS + 기존 회귀 (단위 102 + 통합 25)
- [ ] Manual verification (사람): gstack /qa 1회 실행 → 5 spec 화면별 콘솔 0 에러 + 스크린샷 5장 첨부 + GitHub Actions 워크플로 로컬 검증 (act/manual)
- [ ] DoD coverage (사람): 본 acceptance AC-01~05 + DoD 5항 모두 PR diff에 매핑

### tested 라벨 → polished (사람)
- [x] D-06 2단 사람 책임: pr-body-checkboxes status check PASS (Manual + DoD 모두 ✅) + Approve + 머지 클릭

### Approve + CI green
- [x] reviewDecision = APPROVED 또는 reviewer 부재(branch protection 정합)
- [x] sync-labels + lint-title 2 status check SUCCESS

## 3. 비기능 인수

- **E2E 실행 시간**: `pnpm --filter @app/e2e test` 5 spec 완료까지 ≤ 2분 (webServer 부팅 ~10s + 5 spec 각 ~10s = 60s, 여유 1분)
- **idempotency**: global-setup 매 실행마다 upsert seed로 baseline 동일 보장 (5 spec 매 회 deterministic)
- **격리**: playwright projects=chromium 1 + workers=1 (default) — 매 spec 순차 실행, 데이터 race 없음
- **재현성**: dev.db 누적 가능성은 upsert 패턴으로 baseline 보장. 단 spec이 추가로 만든 데이터(Editor·Comment)는 다음 실행 baseline에 영향 없음 (Editor는 다른 slug, Comment는 누적되지만 spec assert는 새 댓글 노출만 확인)

## 4. 회귀 인수

- 기존 단위 102 (frontend): 무변경 PASS
- 기존 통합 25 (backend): 무변경 PASS — perf integration 1건 포함 (PR #62)
- backend·frontend·shared src 무변경 — 회귀 0
- pnpm-lock.yaml 변경은 @playwright/test 추가만 (기존 의존성 무영향)
- 3 profile smoke 3/3 PASS (dev/stg/prod) — ADR-0037 v1.1 정합
- workflow 양축 (sync-labels + lint-title) 정상 트리거 — workflow 미변경
