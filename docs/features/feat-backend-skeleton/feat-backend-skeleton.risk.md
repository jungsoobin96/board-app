---
doc_type: feature-risk
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

# feat-backend-skeleton — Feature Risk

> Issue #2 · mode=add · P7 risk-check.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | errorHandler 분기 누락으로 도메인 에러가 500 fallback에 흡수 | 3 | 2 | Medium |
| F-RISK-02 | dotenv-cli wrapping이 Windows PowerShell 환경에서 깨짐 (cross-env 부재) | 2 | 2 | Low |
| F-RISK-03 | validateEnv가 zod 에러를 한국어 변환 안 하면 R-N-02 위배 | 2 | 1 | Low |
| F-RISK-04 | vitest globals 미설정 시 supertest assertion 누락 | 1 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01: errorHandler 분기 누락

- **카테고리**: 호환성
- **트리거 신호**: 후속 이슈(#4 글 API 등)가 새 도메인 에러 클래스 추가 시 errorHandler에 분기 추가를 잊으면 500 fallback에 흡수되어 사용자 친화 메시지 누락
- **완화 전략**:
  - error-handler 단위 테스트 4 시나리오 (4 도메인 에러 + 기본 Error)로 분기 자체 커버
  - 11 §2 PREFIX 5개(`VAL_`·`NOT_FOUND_`·`REPO_`·`SRV_`·`DB_`) 중 본 PR은 4개 cover (DB_는 #3 Prisma에서 추가)
  - `code` 필드를 stderr에 명시 → 운영에서 5xx 원인 즉시 식별 가능
- **검증 방법**: AC-03·AC-04 자동 테스트로 회귀 감지

### F-RISK-02: dotenv-cli + Windows

- **카테고리**: 외부 의존
- **트리거 신호**: 학습자가 Windows 네이티브 PowerShell에서 `pnpm --filter @app/backend dev` 실행 시 dotenv-cli의 shell escape가 깨질 수 있음
- **완화 전략**:
  - LOCAL.md §1.5.1에서 "monorepo cwd 미스매치 회피 — dotenv-cli wrapping" 명시
  - `--filter @app/backend` 강제 (cwd가 root로 고정됨)
  - 발생 시 cross-env 도입 검토 (별 이슈)
- **검증 방법**: PR Manual verification에서 dev profile 부팅 1회 (사용자 환경)

### F-RISK-03: zod 에러 한국어 변환 누락

- **카테고리**: 호환성 / R-N-02 위배
- **트리거 신호**: zod의 기본 에러 메시지가 영어 (예: `Required`). validateEnv가 그대로 throw 시 stderr에 영어 노출
- **완화 전략**:
  - validateEnv 내부에서 zod result 파싱 → 한국어 메시지 변환 후 stderr 출력
  - 예: `[ENV] 환경 변수 검증 실패: PORT (필수), DATABASE_URL (필수)`
- **검증 방법**: AC-05 단위 테스트 — `expect(error.message).toMatch(/환경 변수/)`

### F-RISK-04: vitest globals 미설정

- **카테고리**: 호환성
- **트리거 신호**: vitest.config.ts에서 `globals: true` 누락 → `describe`/`it`/`expect` import 강제 → 학습자 친화성 ↓
- **완화 전략**:
  - vitest.config.ts에 `globals: true` + tsconfig에 `"types": ["vitest/globals"]` 명시 (또는 vitest/globals 직 import)
  - test 파일에서 import 1줄로 통일
- **검증 방법**: `pnpm test` 실행 — assertion 누락 시 즉시 발견

## 3. High 등급 단계적 롤아웃

본 이슈 High 등급 0건 (Medium 1·Low 3). 단계적 롤아웃 N/A — 단일 PR squash merge.

## 4. 데이터 영속성 변경

없음 — 본 PR은 DB·persistent state 신설 0건. `validateEnv()`가 DATABASE_URL 형식만 검증, 실 연결 시도 X.

## 5. 15-risk.md 갱신 항목

없음 — 본 이슈 단위 리스크 4건 모두 *이슈 범위 한정*. 단, F-RISK-01(errorHandler 분기 누락)은 후속 #4·#6·#7에서 새 에러 도메인 추가 시 반복 트리거 가능 — 15-risk RISK-02(에러 schema 회귀)에 흡수 검토.
