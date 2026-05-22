---
doc_type: test-design
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-N-01, R-N-07]
  F-ID: [F-12]
  supersedes: null
---

# 04-performance Performance & Security Tests — test-design

> 13-test-design 5절 폴더 sub-file (ADR-0030). 성능·보안 테스트의 범위·도구·시점을 명시한다.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 성능 테스트

본 MVP의 성능 목표는 **로컬 SQLite 환경에서 GET /api/articles p95 < 200ms** (R-N-01). 측정·검증은 다음과 같이 수행한다.

- **측정 도구**: Vitest + Supertest 통합 테스트에서 `performance.now()` wrapping. 100건 시드 + 100회 호출의 95th percentile 산출.
- **측정 시나리오**:
  1. `articles?page=1&limit=10` (basic)
  2. `articles?tag=javascript&page=1` (tag filter)
  3. `articles/:id` (단일 상세)
  4. `articles/:id/comments` (댓글 목록)
- **합격 기준**: 위 4 시나리오 모두 p95 < 200ms. 1 케이스라도 초과 시 WARN(로그 출력) — BLOCK은 아님 (MVP는 학습 목적).
- **Phase 2 후보**: 1000건 이상 부하 시 인덱스 추가 검토. 본 MVP는 측정만, 부하 테스트는 out-of-scope.
- **FE 성능**: LCP 측정은 본 MVP에서 별도 자동화 안 함. gstack `/qa`에서 lighthouse mark만 참고 (R-N-06 viewport 검증과 별 축).
- **부팅 시간**: dev/stg/prod 모두 *부팅 명령 실행 후 5초 이내 ready 신호* 목표 (R-N-04 smoke 합격 기준).

## 2. 보안 테스트

본 MVP는 인증 없는 학습 데모이므로 **시크릿 미커밋·스택 미노출 검증**이 보안 테스트의 본질이다 (R-N-07).

- **시크릿 미커밋 검증**:
  - 정적 grep — `grep -rE "(api[_-]?key|password|secret|token)" .` (false-positive 무시, 의심 라인 수동 검토)
  - .gitignore에 `.env*`, `*.key`, `*.pem`, `*.db` 명시
  - PreToolUse 훅(CLAUDE.md 보안 #5)이 Write/Edit 차단
- **스택 트레이스 미노출 (R-N-02)**:
  - 통합 테스트에서 의도 throw 주입 → 5xx 응답 body에 `at ... ` 라인 또는 파일 경로 포함 여부 grep
  - 실제: `expect(response.body.error).toBe("서버 오류가 발생했습니다")` + `expect(response.body).not.toHaveProperty("stack")`
- **SQL injection**: Prisma client는 parameterized query만 — raw `$queryRaw` 사용 시 검토 필요. MVP는 raw 미사용.
- **XSS**: 본 MVP는 plain text 본문(Markdown 미렌더링, RFP §2.3). React가 기본 escape 제공. dangerouslySetInnerHTML 사용 금지를 11 Conventions §3에 명시.
- **CORS**: dev only — `http://localhost:5173` 화이트리스트. 운영은 same-origin. middleware 단위 테스트로 검증.
- **README 보안 안내 (F-12)**: README에 "공개 데모용, 운영 환경 사용 금지" 명시 + 시크릿 0건 grep 결과를 CI에서 로그.
- **Phase 2 보안 후보**: 인증 도입 시 — bcrypt cost ≥ 12, session 쿠키 httpOnly+secure+sameSite=lax, CSRF 토큰. 본 MVP 범위 외.

## 3. 도구·시점

| 종류 | 도구 | 시점 |
|---|---|---|
| 성능 — API 응답 시간 | Supertest + `performance.now()` (custom wrapper) | 매 PR (CI integration job) |
| 성능 — 부팅 시간 smoke | `pnpm smoke:3profiles` (자체 스크립트) | 매 PR (CI smoke job) |
| 성능 — LCP·viewport | gstack `/qa` (수동 참고) | UI 변경 PR (ADR-0011) |
| 보안 — 시크릿 정적 검사 | grep + `.gitignore` lint | 매 PR (lint job) |
| 보안 — 스택 미노출 | Supertest assert (body 검사) | 매 PR (integration job) |
| 보안 — SQL injection 정적 | Prisma client API 사용 사실 (raw 사용 0건 grep) | 매 PR (lint job) |
| 보안 — XSS 정적 | ESLint rule `react/no-danger` | 매 PR (lint job) |
| 보안 — CORS 단위 | Vitest 단위 (middleware) | 매 PR (unit job) |
