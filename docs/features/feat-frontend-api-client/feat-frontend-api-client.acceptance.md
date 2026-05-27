---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# feat-frontend-api-client — Acceptance Criteria

> Issue #11 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: apiClient.listArticles happy → Article[] 반환

- **Given**: vitest에서 `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({articles:[{id:1,...}], total:1, page:1, limit:10}), { status:200 })))`.
- **When**: `await listArticles({page:1})`.
- **Then**: 결과 `ListResult<Article>` 타입. fetch 호출 URL은 `GET /api/articles?page=1` 정확 매칭.
- **측정 방법**: 자동 테스트 (client.test.ts AC-01).
- **R-ID**: R-N-02 (응답 schema), F-01·F-02.

### AC-02: 4xx 응답 → NormalizedError throw

- **Given**: fetch mock이 `new Response(JSON.stringify({error:'잘못된 페이지/리미트 값입니다'}), {status:400})` 반환.
- **When**: `await listArticles({page:-1})`.
- **Then**: `NormalizedError` throw. `err.status === 400`. `err.message === '잘못된 페이지/리미트 값입니다'`.
- **측정 방법**: 자동 테스트 (client.test.ts AC-02).
- **R-ID**: R-N-02.

### AC-03: offline (fetch reject) → NormalizedError(status=0)

- **Given**: `vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('NetworkError')))`.
- **When**: `await listArticles({page:1})`.
- **Then**: `NormalizedError` throw. `err.status === 0`. `err.message === '네트워크 오류'`.
- **측정 방법**: 자동 테스트 (client.test.ts AC-03).
- **R-ID**: R-N-02.

### AC-04: 9 method 모두 URL/method 정합

- **Given**: 각 method 호출.
- **When**: fetch mock 호출 인자 검사.
- **Then**: 9 method 각각 09 §3 명시 URL/method 정확 매칭 (예: `createComment(1, {body, author})` → `POST /api/articles/1/comments` body JSON).
- **측정 방법**: 자동 테스트 (client.test.ts 9 case).
- **R-ID**: R-N-02, F-01~F-08.

### AC-05: normalizeError 5xx + body parse fail fallback

- **Given**: fetch mock이 `Response('not json', {status:500})` 반환.
- **When**: client method 호출.
- **Then**: `NormalizedError(500, '서버 응답을 처리할 수 없습니다')` throw.
- **측정 방법**: 자동 테스트 (normalize-error.test.ts AC-05).
- **R-ID**: R-N-02.

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — `pnpm --filter @app/frontend test:unit` 22+ passed (기존 6 + 신규 16+).
- [ ] **통합 테스트** — N/A (frontend 통합 미도입, Sprint 5 E2E).
- [ ] **AI 게이트** 6축:
  - 1축 Build — 사용자 위임
  - 2축 코드 리뷰 — P9 reviewer agent
  - 3축 Test Plan 4블록 — P10
  - 4축 시크릿 스캔 — VITE_API_URL 외 시크릿 0
  - 5축 UI 골든패스 + stylesheet — **N/A (ui_changed=false)** — `.ts` 만, UI 표면 변경 0
  - 6축 로컬 부팅 — 사용자 위임 (부팅 자산 0)
- [ ] **Test Plan 4블록**.
- [ ] **tested 라벨** — 자리 라벨.
- [ ] **Approve** ≥ 1.
- [ ] **CI green** — workflow 미구축 N/A.

## 3. 비기능 인수

- **성능**: 단위 16+ 케이스 < 1s.
- **보안**: 시크릿 0 — VITE_API_URL은 client 노출 의도.
- **타입 안전**: shared 4 type 모두 export + frontend import → 응답 미스매치 typecheck 검출.

## 4. 회귀 인수

- **R-1**: backend 9 endpoint + cascade + error schema integration 34+ baseline 회귀 0.
- **R-2**: backend unit 49+ baseline 회귀 0.
- **R-3**: frontend matchRoute 6 unit (#10) PASS 유지.
- **R-4**: smoke 3 profile 회귀 0 (backend 영향 0).
- **R-5**: shared 패키지 build PASS (SCAFFOLD_OK → 4종 re-export 교체).
- **R-6**: 09 API spec 9/9 정합 — client 9 method 1:1 URL 매칭.
