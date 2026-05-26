---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# feat-tags-api — Acceptance Criteria

> Issue #7 · mode=add · P6 산출. 이슈 본문 AC 2건을 schema 정합 Given/When/Then으로 풀고, DoD 6 axis + Test Plan 4블록.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: GET /api/tags happy — 빈도 desc 상위 20개

- **Given**: 30종 태그가 DB에 존재 + 각 태그가 articleTags 매핑으로 1+ 글에 사용됨 (다양한 빈도 분포).
- **When**: `GET /api/tags` 전송.
- **Then**: HTTP 200 + response body `{ tags: [{name: string, count: number}, ...] }` 반환. tags.length = 20 (상한 적용). count desc 정렬 (첫 요소가 가장 많이 사용된 태그).
- **측정 방법**: 자동 테스트 (`backend/tests/integration/tags.integration.test.ts` AC-01 케이스).
- **R-ID**: R-F-04 (태그 API), F-02·F-08.

### AC-02: GET /api/tags 빈 → 200 + tags=[]

- **Given**: Tag 테이블 0건 (또는 모든 태그가 어떤 글에도 미사용 시 — Prisma _count=0인 태그도 응답에 포함 vs 제외는 결정 11번 참조).
- **When**: `GET /api/tags` 전송.
- **Then**: HTTP 200 + response body `{ tags: [] }`. 404 아님.
- **측정 방법**: 자동 테스트 (integration AC-02 케이스).
- **R-ID**: R-F-04.

### AC-03: 동률 빈도 처리 — 동일 count 5종 모두 포함

- **Given**: 5종 태그가 동일하게 count=3 (동률).
- **When**: `GET /api/tags` 전송.
- **Then**: HTTP 200 + tags에 5종 모두 포함 (상한 20 내). 정렬 안정성(secondary sort)은 본 PR 비목표 — Prisma 기본 동작 의존.
- **측정 방법**: 자동 테스트 (integration AC-03 케이스).
- **R-ID**: R-F-04.

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — `pnpm --filter @app/backend test`로 tag.service 3+ 케이스 PASS. 기존 46+ baseline 회귀 0.
- [ ] **통합 테스트** — `pnpm --filter @app/backend test:integration`로 tags.integration.test.ts 3+ PASS. 기존 18 baseline 회귀 0.
- [ ] **AI 게이트** 6축 PASS (ADR-0011·0037·0038):
  - 1축 자동 테스트 — Build + tests PASS (사용자 위임)
  - 2축 코드 리뷰 — P9 reviewer agent verdict=PASS
  - 3축 Test Plan 4블록 — P10 ai-qa-report
  - 4축 시크릿 스캔 — 본 PR env·schema 미수정 자동 통과
  - 5축 브라우저 골든패스 — `ui_changed=false` N/A
  - 6축 로컬 부팅 — `pnpm smoke:3profiles` PASS (부팅 자산 미변경)
- [ ] **Test Plan 4블록** — PR body 4 subsection. Manual·DoD 미체크.
- [ ] **tested 라벨** — ADR-0046 v1.2 폐지, status check 자동 발행 (자리 라벨).
- [ ] **Approve** ≥ 1.
- [ ] **CI green** — workflow 미구축 단계 N/A 사유 명시.

## 3. 비기능 인수

- **성능**: GET /api/tags 응답 < 200ms (30종 태그 가정). p95 측정은 Sprint 5 #20에서.
- **로깅**: 요청 1건당 method+path+status 1줄 (#2 requestLogger 그대로).
- **보안**: 입력 0 (쿼리·body 없음) — 검증 불필요. Prisma parameterized query. 시크릿 노출 0.

## 4. 회귀 인수

- **R-1**: articles 5 endpoint 회귀 0 — integration 9건 PASS 유지.
- **R-2**: comments 3 endpoint 회귀 0 — integration 7건 PASS 유지.
- **R-3**: cascade 회귀 0 — cascade.integration 2건 PASS 유지 + comments AC-06 PASS 유지.
- **R-4**: app.ts 라우터 등록 순서 — articles → comments → tags → notFoundHandler. F-RISK-03 보전.
- **R-5**: smoke 3 profile 부팅 — Sprint 1 #5 baseline. 부팅 자산 미변경.
- **R-6**: 09 API spec 정합 — **9/9 완결**.
