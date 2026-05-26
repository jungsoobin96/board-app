---
doc_type: feature-brief
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

# feat-error-schema-integration — Feature Brief

> Sprint 2 마지막 이슈 — Issue #9. 9 endpoint × ~2 에러 케이스 통합 회귀로 R-N-02(`{error:string}` + stack 미노출) 정합 검증. Sprint 2 100% 완결 + Sprint 3 진입 baseline.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (Sprint 2 마지막 진입) |

## 1. 한 줄 의도

9 endpoint × 4xx/5xx 에러 응답 통합 회귀 — R-N-02 정합(`{error:string}` + stack/code 미노출) + 의도 throw → 500 + 한국어 fallback + stderr stack 양축 검증.

## 2. 사용자 가치

- **운영**: 에러 응답에 시크릿·스택이 노출되지 않음 (보안)
- **FE 개발자**: 모든 에러가 동일 schema로 표준화 → 에러 핸들링 코드 단순화
- **품질**: M10 errorHandler 4 분기(Val/NF/Repo/기본) 모두 통합 layer에서 정합 검증 — 단위 회귀와 별 axis

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `backend/tests/integration/error-schema.integration.test.ts` | 미존재 | 신설 (~12-18 it 케이스) |
| 단위 errorHandler 회귀 | `tests/unit/error-handler.test.ts` 5 케이스 (#2 산출) | 그대로 + 통합 layer 별 추가 |
| 의도 throw 500 통합 검증 | 0 | 1 케이스 (vi.mock service throw + stderr spy + body 검증) |
| 통합 테스트 합계 | 22 passed (#8 PR #36 후) | + 신규 케이스들 ≈ 35+ passed |
| R-N-02 검증 매트릭스 | 단위 + 각 PR별 endpoint별 통합 (부분) | **모든 9 endpoint 통합 회귀 완결** |
| 부팅 자산 | 변경 없음 | 동일 |
| 09 API spec 정합 | 9/9 endpoint 완결 | 동일 (검증만, 변경 0) |
| 13/02-catalog R-N-02 매트릭스 | ✅·✅·✅ 명시 | 실 코드 정합 완결 |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug/design/modify 0
- **라벨**: `type:test` + `area:backend` + `priority:P0`
- **자연어**: "통합 회귀" — 신규 시나리오 추가
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add**

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `backend/tests/integration/error-schema.integration.test.ts` | 신설 (~200 lines) |
| src 변경 | 없음 (test 전용 — 회귀 위험 최소) | 0 |
| 부팅 자산 | 변경 없음 | 0 |
| 의존성 | 없음 (vi.mock·supertest·기존 PrismaClient 재사용) | 0 |
| 09 API spec | 영향 없음 (검증만) | 0 |
| 13/02-catalog | R-N-02 §2 fan-in 갱신 (실 코드 정합 명시) | docs-update에서 |

## 6. 비목표

- **errorHandler 코드 수정** — #2 산출 그대로
- **새 에러 클래스 도입** — 4종 (Val/NF/Repo + 기본 Error) 그대로
- **E2E 에러 시나리오** — Sprint 4 `feat-notfound-and-error-boundary`에서 인라인
- **rate limit / circuit breaker** — MVP 범위 외
- **에러 로깅 외부 송신** (Sentry 등) — MVP 범위 외
- **에러 메시지 i18n** — 한국어 fixed (R-N-02)

## 7. Open Questions

- **O-E1**: 의도 throw 주입 방법 — vi.mock service vs route에 throw 핸들러 추가. → 답: vi.mock(article.service 등) — 기존 코드 변경 0.
- **O-E2**: notFoundHandler 케이스 — `/nonexistent-path` GET → 404 통합 포함. → 답: 포함 (M10 정합).
- **O-E3**: stderr spy로 stack 출력 확인 vs 부정 단언만. → 답: spy 포함 — body에 stack 없음 + stderr에 stack 있음 양축.
- **O-E4**: 통합 테스트가 단위 errorHandler.test.ts와 중복? → 답: *층위 다름*. 단위는 mock express. 통합은 실 buildApp + 실 SQLite + 실 endpoint 흐름. 두 layer 모두 가치.
