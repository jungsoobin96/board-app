---
doc_type: feature-risk
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

# feat-frontend-api-client — Feature Risk

> Issue #11 · mode=add · P7. High 0, Medium 5.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| FE-API-RISK-01 | SCAFFOLD_OK 제거 → backend/frontend 잠재 import 회귀 (현재 0이지만 미래 import 시 typecheck fail) | 3 | 1 | Low |
| FE-API-RISK-02 | shared types 추가 시 `pnpm -r build` 순서 의존 — shared가 frontend·backend 빌드 전에 컴파일돼야 함 | 4 | 2 | Medium |
| FE-API-RISK-03 | `import.meta.env.VITE_API_URL` undefined 시 client URL 깨짐 | 4 | 2 | Medium |
| FE-API-RISK-04 | offline 감지 — fetch reject가 항상 TypeError인지 (브라우저별 차이) | 3 | 2 | Low |
| FE-API-RISK-05 | NormalizedError class instanceof — bundler가 다중 instance 만들 가능성 (실 발생 매우 드뭄) | 2 | 1 | Low |
| FE-API-RISK-06 | 9 method API path 오타 → 4xx/5xx | 4 | 2 | Medium |
| FE-API-RISK-07 | fetch mock 누수 — afterEach unstub 누락 시 후속 test 영향 | 3 | 2 | Low |
| FE-API-RISK-08 | 시크릿 노출 (URL에 token 포함 등) | 5 | 1 | Medium |
| FE-API-RISK-09 | shared 패키지 ESM/CJS 호환성 — `"type": "module"` + main/types 정합 | 3 | 2 | Low |
| FE-API-RISK-10 | TypeScript composite project references 깨짐 — shared가 frontend 의존 references에 추가됐는지 | 4 | 1 | Medium |

High 0. Medium 5 모두 mitigation 명시.

## 2. 리스크 상세

### FE-API-RISK-02: shared build 순서

- **시나리오**: `pnpm -r build` 시 frontend·backend가 shared 컴파일 전에 빌드 시도 → import 실패
- **완화**: shared `package.json` `"main": "./dist/index.js"` + `"types": "./dist/index.d.ts"` (이미 설정됨). pnpm workspaces topological sort + tsc -b references.
- **검증**: pnpm -r build 실 실행 (사용자 P14)

### FE-API-RISK-03: VITE_API_URL undefined

- **시나리오**: `.env.dev` 미생성 또는 VITE_API_URL 누락 시 `import.meta.env.VITE_API_URL === undefined` → client URL `undefined/api/articles`
- **완화**: client.ts에서 fallback (`?? 'http://localhost:3000/api'`). #10에서 `.env.example` 3 profile 모두 VITE_API_URL 명시
- **검증**: 단위 test에서 base URL 검증

### FE-API-RISK-04: offline 감지

- **시나리오**: 브라우저별 fetch reject error type 차이 (TypeError·DOMException 등) → status=0 분기 누락
- **완화**: try/catch 후 *모든* reject를 NormalizedError(0)로 wrap (error type 무관)
- **검증**: normalize-error.test.ts AC-03 mockRejectedValue

### FE-API-RISK-06: API path 오타

- **시나리오**: client.ts `/api/articles/${id}/coments` 오타 → 404
- **완화**: 9 method 단위 test가 URL 정확 검증 (`expect(fetch).toHaveBeenCalledWith('http://...:3000/api/articles/1/comments', ...)`)
- **검증**: AC-04 단위 9 case

### FE-API-RISK-08: 시크릿 노출

- **시나리오**: token·secret을 URL query param에 포함 (예: `?token=xxx`) → reverse proxy 로그 leak
- **완화**: MVP는 인증 0 — 시크릿 0. NormalizedError stack도 코드 trace만
- **검증**: reviewer agent grep `process.env|JWT|SECRET` 0건

### FE-API-RISK-10: composite references

- **시나리오**: frontend/tsconfig.json `references` 에 shared 누락 → import 시 typecheck 실패
- **완화**: #10에서 이미 `references: [{ path: '../shared' }]` 설정됨
- **검증**: typecheck

## 3. High 등급 단계적 롤아웃

High 0 — 불필요.

## 4. 데이터 영속성 변경

- schema 0
- migration 0

## 5. 15-risk.md 갱신 항목

본 PR scope 외.
