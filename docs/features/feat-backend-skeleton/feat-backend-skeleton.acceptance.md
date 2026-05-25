---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-N-02, R-N-04]
  F-ID: [F-12]
  supersedes: null
---

# feat-backend-skeleton — Acceptance Criteria

> Issue #2 · mode=add · P6 acceptance-criteria. PR Manual verification·DoD coverage 원본.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P6 acceptance-criteria) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: backend dev profile 5초 이내 ready (R-N-04)

- **Given**: `cp .env.dev.example .env.dev` 후 `pnpm install --frozen-lockfile` 완료
- **When**: `pnpm --filter @app/backend dev` 실행
- **Then**: 5초 이내 stdout에 `Listening on http://localhost:3000` 1줄 출력
- **측정 방법**: 수동 확인 (PR Manual verification)
- **R-ID**: R-N-04

### AC-02: GET /healthz 200 응답

- **Given**: AC-01 통과 상태 (서버 ready)
- **When**: `curl -i http://localhost:3000/healthz`
- **Then**: HTTP 200 + body `{"ok":true}`
- **측정 방법**: 자동 테스트 (supertest)
- **R-ID**: R-N-04

### AC-03: 도메인 에러 throw → `{ error }` 직렬화 (R-N-02)

- **Given**: errorHandler 미들웨어 등록 상태
- **When**: route handler에서 `throw new ValidationError('VAL_TITLE_REQUIRED', '제목은 필수입니다')`
- **Then**: HTTP 400 + body `{"error":"제목은 필수입니다"}` (stack·code 응답 누락, stderr만 출력)
- **측정 방법**: 자동 테스트 (vitest + supertest 4 시나리오 — ValidationError 400, NotFoundError 404, RepositoryError 500, 기본 Error 500 SRV_INTERNAL)
- **R-ID**: R-N-02

### AC-04: 기본 Error fallback → 500 + 한국어 (R-N-02)

- **Given**: errorHandler 등록 상태
- **When**: route handler에서 `throw new Error('unexpected')`
- **Then**: HTTP 500 + body `{"error":"서버 오류가 발생했습니다"}` + stderr `[SRV_INTERNAL] ...stack...` 출력
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-02

### AC-05: env 누락 시 부팅 차단 (R-N-04)

- **Given**: `.env.dev`에서 `PORT` 키 삭제
- **When**: `pnpm --filter @app/backend dev` 실행
- **Then**: process.exit(1) + stderr `[ENV] 환경 변수 검증 실패: PORT...` 출력. `Listening on...` 메시지 미출력
- **측정 방법**: 자동 테스트 (env.test.ts에서 zod schema 직접 호출 — 부팅 실 검증은 Manual)
- **R-ID**: R-N-04

### AC-06: request-logger 1줄 출력

- **Given**: AC-01 통과 상태 (서버 ready)
- **When**: `curl http://localhost:3000/healthz`
- **Then**: stdout에 `GET /healthz 200 <N>ms` 패턴 1줄 (NODE_ENV=dev 한정. stg/prod에선 LOG_LEVEL>info만)
- **측정 방법**: 자동 테스트 (request-logger.test.ts — console.log spy)
- **R-ID**: R-N-04

### AC-07: pnpm test 모든 단위 테스트 PASS

- **Given**: AC-01·AC-02·AC-03·AC-04·AC-05·AC-06 단위 테스트 구현
- **When**: `pnpm --filter @app/backend test` 실행
- **Then**: 6+ assertion 모두 PASS, exit 0
- **측정 방법**: 자동 테스트
- **R-ID**: R-N-02, R-N-04 (양쪽 cover)

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: ≥ 6 assertion (error-handler 4 + env 1 + request-logger 1 + healthz 통합 1) 모두 PASS — `pnpm --filter @app/backend test` exit 0
- [ ] **AI 게이트** (D-06 1단): qa-test --ai 6축 PASS — Build·Automated tests·Manual verification 명시·DoD coverage 명시·UI 골든패스(N/A)·3 profile 부팅(dev 1회 + stg/prod N/A 사유 명시)
- [ ] **Test Plan 4블록**: PR body Build·Automated tests·Manual verification·DoD coverage 4 절. ADR-0046 §2.3 Manual + DoD coverage는 미체크 직렬화
- [ ] **tested 라벨**: ADR-0046 v1.2 폐지 — pr-body-checkboxes workflow 미등록 트랜지션, 사용자 Manual ✅로 갈음
- [ ] **Approve**: 사용자 self-approve 허용 (branch protection 미적용)
- [ ] **CI green**: 등록 workflow 2개 PASS

## 3. 비기능 인수

- **부팅 시간**: dev profile 5초 이내 (R-N-04). 측정: AC-01에서 `time pnpm --filter @app/backend dev` 또는 시각 측정.
- **응답 시간**: `/healthz` 100ms 이내 (학습 프로젝트 lower bound). 본격 측정은 #5·#20에서.
- **에러 응답 schema 통일**: R-N-02 — 모든 4xx/5xx `{ error: string }`만. stack/code 응답 누락 100%.
- **보안**: `.env.{dev,stg,prod}.example`은 예시 값만 (실 시크릿 0). `.env.*`는 `.gitignore` (R-N-07, 이슈 #1에서 적용).

## 4. 회귀 인수

- **회귀 #1**: dev profile 5초 이내 부팅 — Manual verification에서 사용자가 1회 확인
- **회귀 #2**: 4 도메인 에러 분기 — vitest 자동 (PR 머지 후 다른 이슈가 errorHandler 변경 시 회귀 감지)
- **회귀 #3**: 다음 이슈 #3 (Prisma)에서 본 PR의 env.DATABASE_URL을 PrismaClient에 주입할 때 정상 동작 — 본 PR 후속 검증 (다음 PR에서 자연 검증)
