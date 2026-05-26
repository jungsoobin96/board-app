---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-12]
  supersedes: null
---

# feat-error-schema-integration — Acceptance Criteria

> Issue #9 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 전 9 endpoint × ~2 에러 → `{error:string}` + stack/code 미노출

- **Given**: backend dev DB + 다양한 invalid 입력 (page=-1, id=abc, body={} 등) + 미존재 ID.
- **When**: 각 endpoint를 supertest로 호출.
- **Then**: 모든 4xx 응답이 `{ error: '<한국어 메시지>' }` schema만. `res.body.stack`·`res.body.code` 없음.
- **측정 방법**: 자동 테스트 — `error-schema.integration.test.ts` 11 케이스 (a~j + l).
- **R-ID**: R-N-02.

### AC-02: 의도 throw → 500 + 일반 메시지 + stderr stack (body에는 미포함)

- **Given**: vi.mock(tag.service)로 `list()` throw 주입.
- **When**: `GET /api/tags`.
- **Then**: HTTP 500 + `res.body === { error: '서버 오류가 발생했습니다' }`. stderr에 `[SRV_INTERNAL]` + stack 출력 (errorSpy로 확인). body에는 stack/code 없음.
- **측정 방법**: 자동 테스트 — `error-schema.integration.test.ts` AC-02 케이스 (k).
- **R-ID**: R-N-02.

### AC-03: notFoundHandler → 404 + "요청한 리소스를 찾을 수 없습니다"

- **Given**: 미등록 path (`/nonexistent`).
- **When**: GET 호출.
- **Then**: HTTP 404 + `{ error: '요청한 리소스를 찾을 수 없습니다' }`.
- **측정 방법**: 자동 테스트 — `error-schema.integration.test.ts` AC-03 케이스 (l).
- **R-ID**: R-N-02.

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — 본 PR 단위 변경 0. 기존 49+ baseline 회귀 0.
- [ ] **통합 테스트** — `pnpm --filter @app/backend test:integration` 34+ passed (기존 22 + 신규 12).
- [ ] **AI 게이트** 6축 PASS:
  - 1축 Build — 사용자 위임
  - 2축 코드 리뷰 — P9 reviewer agent
  - 3축 Test Plan 4블록 — P10
  - 4축 시크릿 스캔 — 본 PR env·schema 0
  - 5축 브라우저 — N/A (ui_changed=false)
  - 6축 로컬 부팅 — 사용자 위임 (부팅 자산 0)
- [ ] **Test Plan 4블록**.
- [ ] **tested 라벨** — 자리 라벨.
- [ ] **Approve** ≥ 1.
- [ ] **CI green** — workflow 미구축 N/A 사유.

## 3. 비기능 인수

- **성능**: 통합 테스트 12 케이스 < 2s (mock 격리 + supertest).
- **로깅**: 본 PR test에서 console.error를 spy로 mute → CI 로그 깔끔.
- **보안**: 시크릿 노출 0 — DATABASE_URL 미접근.

## 4. 회귀 인수

- **R-1**: articles 9 + comments 7 + tags 3 + cascade 3 = 22 통합 PASS 유지.
- **R-2**: 단위 49+ PASS 유지.
- **R-3**: 단위 errorHandler.test.ts 5 케이스 PASS 유지 (별 axis).
- **R-4**: smoke 3 profile 회귀 0.
- **R-5**: typecheck + build PASS.
- **R-6**: 13/02-catalog R-N-02 §2 매트릭스 ✅ 완결.
