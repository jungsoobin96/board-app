---
doc_type: risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: operations
related:
  R-ID: [R-F-07, R-N-01, R-N-02, R-N-03, R-N-04, R-N-07]
  F-ID: [F-07, F-09, F-12]
  supersedes: null
---

# Conduit Lite — Risk Register

> NEW_PROJECT Phase 3/4 운영 산출. 시스템 차원 리스크 식별·완화·등급 + High 리스크의 단계적 롤아웃 전략. 14 WBS의 우선순위 보정 입력.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-wbs Phase 3/4) |

## 1. 리스크 일람

> 영향·가능성 1~5 척도. 등급 = max(영향, 가능성)에 따라 — 1·2=Low / 3=Medium / 4·5=High.

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 | 영향 받는 Sprint/Issue | 대응 |
|---|---|---|---|---|---|---|
| RISK-01 | 인증 없음 — 운영 환경 오용 가능성 | 4 | 2 | High | Sprint 6 / ISSUE-022 (README §보안) | F-12 README 명시 + 데모용 명시 |
| RISK-02 | SQLite 동시 쓰기 락 | 2 | 2 | Low | Sprint 1 / ISSUE-005 | 단일 인스턴스 데모 가정 + README 안내 |
| RISK-03 | tagList 입력 형식(쉼표·trim) 검증 누락 | 2 | 3 | Medium | Sprint 1 / ISSUE-004, Sprint 4 / ISSUE-014 | M9 validator + Vitest 단위 + 통합 |
| RISK-04 | cascade 삭제 누락 → 고아 댓글 | 4 | 2 | High | Sprint 1 / ISSUE-003, Sprint 2 / ISSUE-008, Sprint 4 / ISSUE-015 | ON DELETE CASCADE schema-level + 통합 테스트 |
| RISK-05 | 스택 자유도(JS/TS·ORM) 미확정 → 산출 흐트러짐 | 2 | 1 | Low | Sprint 1 전체 | 02 Feasibility leaning 확정 (TS+Prisma) |
| RISK-06 | yq 미설치 — schema validate 자동화 미실행 | 2 | 4 | Medium | 전 Sprint (검증 단계) | LLM 수작업 강제 + 사용자 yq 설치 권고 (LOCAL.md) |
| RISK-07 | README 재현성 10명 시도 KPI 인력 확보 | 3 | 3 | Medium | Sprint 6 / ISSUE-024 | KPI는 Project Brief 목표값 — 실제 충족 어려우면 ADR로 KPI 완화 |
| RISK-08 | Playwright 도입 비용 vs gstack `/qa` 충분 여부 | 2 | 3 | Medium | Sprint 5 / ISSUE-021 | MVP는 gstack `/qa` + Playwright 핵심 5건 절충 |
| RISK-09 | monorepo 부팅 함정 (root .env cwd 미스매치) | 3 | 3 | Medium | Sprint 1 / ISSUE-002·005 | LOCAL.md §1.5.1 (b) dotenv-cli 래핑 강제 |
| RISK-10 | 학습 친화성 vs 모범 사례 충돌 (예: TypeScript strict, 트랜잭션 wrapper 추상화) | 2 | 3 | Medium | Sprint 1~5 (코드 작성 단계) | 11 Conventions §3 + §4 (한국어 주석으로 의도 설명) |
| RISK-11 | 응답 시간 KPI(<200ms) 측정 환경 차이 | 2 | 3 | Medium | Sprint 5 / ISSUE-020 | 로컬 SQLite 기준 명시 + p95 측정 도구 통일 |
| RISK-12 | 한국어 주석 ≥80% 자동 측정 도구 부재 | 2 | 4 | Medium | Sprint 6 / ISSUE-023 | scripts/check-comment-coverage.sh 작성 또는 수동 grep |

## 2. 리스크 상세

### RISK-01: 인증 없음 — 운영 환경 오용 가능성

- **카테고리**: 보안
- **설명**: 본 MVP는 의도적으로 인증을 제거한 학습 데모(RFP §2.3). 누군가 운영 환경에 잘못 배포할 경우 모든 사용자가 임의 글 작성·수정·삭제 가능.
- **영향**: 4 — 데이터 손실·서비스 abuse 위험
- **가능성**: 2 — README와 도메인 자체가 학습 색이 강해 운영 배포는 드뭄
- **현재 상태**: 식별
- **트리거 신호**: GitHub Pages 같은 공개 호스팅에 본 코드가 게시될 때, 또는 외부에서 자체 인스턴스가 24시간 이상 가동되는 신호.
- **완화 전략**:
  - F-12 README §보안 절에 "공개 데모용, 운영 사용 금지" 한국어/영문 병기 경고 (O-18로 결정)
  - 메인 페이지 헤더 또는 footer에도 시각적 경고 노출 (10 LLD §화면 상세에 footer 안내)
  - 시드 데이터에 "이 데이터는 학습 데모용입니다" 명시
- **대응 이슈**: ISSUE-022 (README §보안 작성)

### RISK-02: SQLite 동시 쓰기 락

- **카테고리**: 기술
- **설명**: SQLite는 쓰기 직렬화 — 동시 N명이 글/댓글 작성 시 일시 락 발생 가능. 본 MVP는 단일 인스턴스 학습 데모로 영향 미미하지만 다중 데모 시나리오에서 발현 가능.
- **영향**: 2 — UX 지연, 데이터 손실 없음
- **가능성**: 2 — 학습 환경에서 동시 사용 드뭄
- **현재 상태**: 식별
- **트리거 신호**: `SQLITE_BUSY` 또는 `database is locked` 에러 발생.
- **완화 전략**:
  - SQLite WAL 모드 권장 (Open Question O-04 — Sprint 1 / ISSUE-003에서 결정)
  - LOCAL.md에 "다중 데모 시 단일 인스턴스 권장" 안내
  - Phase 2+에서 도입 시 PostgreSQL 마이그레이션 ADR
- **대응 이슈**: ISSUE-005 (LOCAL.md §1.5 보강)

### RISK-03: tagList 입력 형식 검증 누락

- **카테고리**: 기술
- **설명**: 사용자가 쉼표 구분 태그 입력 시 빈 토큰·공백·중복·과길이를 정규화하지 않으면 빈 태그 또는 중복 태그 DB 저장 가능.
- **영향**: 2 — UX 저하, 데이터 무결성 미손상
- **가능성**: 3 — 사용자 입력 다양성 높음
- **현재 상태**: 식별
- **트리거 신호**: GET `/api/tags` 결과에 빈 문자열 또는 중복 태그가 보임.
- **완화 전략**:
  - M9 BE-validators `normalizeTags()` 단위 테스트로 trim·lower·중복 제거 강제 (R-F-02)
  - 통합 테스트에서 시드 데이터의 tagList에 의도적 잡음 포함해 검증
  - FE EditorForm에서 사전 hint ("쉼표로 구분")
- **대응 이슈**: ISSUE-004, ISSUE-014

### RISK-04: cascade 삭제 누락 → 고아 댓글

- **카테고리**: 기술
- **설명**: 글 삭제 시 종속 댓글이 함께 제거되지 않으면 articleId가 가리키는 글이 없는 고아 댓글이 DB에 남음. R-F-07 핵심 요구사항.
- **영향**: 4 — 데이터 정합성 깨짐, 평가 기준 RFP §10 #6 미충족
- **가능성**: 2 — schema-level CASCADE로 보장하지만 schema.prisma 작성 실수 가능
- **현재 상태**: 식별
- **트리거 신호**: 통합 테스트 `cascade.integration.test.ts` 실패 또는 글 삭제 후 GET `/api/articles/:id/comments` 가 빈 응답 아님.
- **완화 전략**:
  - `prisma/schema.prisma`에서 Comment·ArticleTag 관계에 `onDelete: Cascade` 명시 강제
  - 통합 테스트(ISSUE-008)에서 의도적으로 댓글 3건 시드 후 글 삭제 → Comment 테이블 0건 확인
  - E2E(F-07) 시각 확인 — 댓글 영역 빈 상태
- **대응 이슈**: ISSUE-003 (schema), ISSUE-008 (test), ISSUE-015 (UX)

### RISK-05: 스택 자유도 미확정 → 산출 흐트러짐

- **카테고리**: 운영
- **설명**: 02 Feasibility로 leaning(TS + Prisma + pnpm workspaces)을 확정했지만 도중 변경 시 11·12 코드 규약·scaffolding 산출이 함께 흔들림.
- **영향**: 2 — 일정 지연
- **가능성**: 1 — leaning 확정 후 학습 데모라 흔들 동기 적음
- **현재 상태**: 해소 (02 Feasibility v0.1로 확정)
- **트리거 신호**: 사용자가 "JS만 쓰자" 등 큰 변경 요청.
- **완화 전략**: ADR-0044 단일 trunk + 이슈별 PR로 변경 발생 시 명시 처리.
- **대응 이슈**: (현재 해소, 별 이슈 없음)

### RISK-06: yq 미설치 — schema validate 자동화 미실행

- **카테고리**: 운영
- **설명**: 본 도구체인은 `scaffold-doc.sh`·`validate-doc.sh`가 yq에 의존. 사용자 환경에 미설치 시 schema 적합성 자동 검증 없이 LLM 수작업으로 산출 작성.
- **영향**: 2 — 산출 품질 일부 schema 미정합 위험
- **가능성**: 4 — 본 프로젝트 진행 중 yq 미설치 확인됨
- **현재 상태**: 모니터링
- **트리거 신호**: `bash .claude/scripts/validate-doc.sh` 실행 시 `yq: command not found`.
- **완화 전략**:
  - LLM이 schema 정본을 직접 참조해 수작업 작성 (현 세션 적용)
  - LOCAL.md 또는 README에 yq 설치 권고 명시 (`winget install MikeFarah.yq`)
  - 사용자 설치 후 1회 일괄 검증 (`bash .claude/scripts/validate-doc.sh docs/planning/**/*.md`)
- **대응 이슈**: ISSUE-022 (README 환경 요구사항 절)

### RISK-07: README 재현성 10명 시도 KPI 충족

- **카테고리**: 운영
- **설명**: 01 Brief KPI #1 — 새 PC에서 README만으로 부팅 100% 성공 (10명 시도). 실제 10명을 확보·시뮬레이션하기 어려움.
- **영향**: 3 — KPI 미충족 시 학습 목표 측정 약화
- **가능성**: 3 — 시도자 모집·일정 조율 비용 큼
- **현재 상태**: 식별
- **트리거 신호**: Sprint 6 종료 시점에 시도자 5명 미만 확보.
- **완화 전략**:
  - 1차 KPI를 *3명 시도 100% 성공* + 추가 *주변 학습자 7명 비동기 시도*로 완화 ADR 검토 (Sprint 6 종료 시점)
  - LOCAL.md §1.5 함정 사전 안내로 시도 진입 장벽 낮춤
  - Discord/Slack 등 비동기 학습 커뮤니티에서 시도자 모집
- **대응 이슈**: ISSUE-024

### RISK-08: Playwright vs gstack `/qa`

- **카테고리**: 운영
- **설명**: E2E 자동화 도구 — Playwright는 비용·시간 부담, gstack `/qa`는 수동에 가까움. 본 MVP 학습 범위에서 어느 쪽이 충분한지 미확정.
- **영향**: 2 — E2E 자동화 부재 시 회귀 검증 비용↑
- **가능성**: 3 — 도입 비용 학습자에게 부담
- **현재 상태**: 식별
- **트리거 신호**: Sprint 5 / ISSUE-021 진입 시 Playwright 설정 1일 이상 소요.
- **완화 전략**:
  - 절충안 — Playwright는 핵심 5 시나리오(F-03·F-04·F-07·F-02·F-09)만 작성, 나머지는 gstack `/qa` 수동
  - Playwright 설정이 학습 부담 크면 본 MVP는 gstack `/qa` 단독으로 완화 + Phase 2+ Playwright 학습 트랙
- **대응 이슈**: ISSUE-021

### RISK-09: monorepo 부팅 함정 (root .env cwd 미스매치)

- **카테고리**: 기술
- **설명**: pnpm workspaces 구조에서 backend cwd에 `npx prisma migrate` 직접 호출 시 root `.env.dev` 자동 로드 안 됨 → `DATABASE_URL not found` 에러. LOCAL.md §1.5.1 사전 함정.
- **영향**: 3 — 부팅 실패 → 학습 진입 장벽
- **가능성**: 3 — 입문자가 cwd 함정 인지 못 함
- **현재 상태**: 완화 진행
- **트리거 신호**: `Error: Environment variable not found: DATABASE_URL`.
- **완화 전략**:
  - LOCAL.md §1.5.1 (b) **dotenv-cli 래핑** 채택 — backend `package.json` scripts 모두 `dotenv -e ../.env.{profile} --` 래핑
  - 직접 `npx prisma ...` 호출 금지 — 항상 `pnpm --filter @app/backend <script>`
  - troubleshooting §5.4에 증상별 해결책 명시
- **대응 이슈**: ISSUE-002, ISSUE-005

### RISK-10: 학습 친화성 vs 모범 사례 충돌

- **카테고리**: 운영
- **설명**: TypeScript strict 모드·트랜잭션 wrapper·Layered 아키텍처 등 모범 사례가 입문자에게 부담될 수 있음. 본 MVP의 RFP §6.5 "학습 친화성" 원칙과 충돌 가능.
- **영향**: 2 — 학습 진입 장벽
- **가능성**: 3 — 입문자 1차 학습 대상
- **현재 상태**: 모니터링
- **트리거 신호**: 학습자 피드백에서 "너무 복잡" 또는 "왜 이렇게?" 빈도.
- **완화 전략**:
  - 11 Conventions §4 (주석 정책) — 핵심 모듈 한국어 주석 ≥80%로 *왜* 설명
  - 12 §3 디자인 패턴 — Layered 선택 *이유*를 입문자 학습 가치로 명시
  - README §학습 가이드 절에 "기본 흐름 → 고도화" 학습 트랙 안내
- **대응 이슈**: ISSUE-023, ISSUE-022

### RISK-11: 응답 시간 KPI 측정 환경 차이

- **카테고리**: 기술
- **설명**: R-N-01 p95 < 200ms는 *로컬 SQLite* 기준. 시도자의 PC 사양·디스크 IO에 따라 측정값 차이 큼.
- **영향**: 2 — KPI 신뢰성 저하
- **가능성**: 3 — 입문자 환경 다양
- **현재 상태**: 식별
- **트리거 신호**: Sprint 5 / ISSUE-020 응답 시간이 PC별로 100~500ms 사이 편차.
- **완화 전략**:
  - 04 SRS R-N-01 비고에 "로컬 SQLite 기준" 명시 (현재 충족)
  - 측정 방법 통일 — Supertest + `performance.now()`로 100회 측정 후 p95
  - PC 사양 기록(`/proc/cpuinfo` 또는 wmic) 함께 보고
- **대응 이슈**: ISSUE-020

### RISK-12: 한국어 주석 ≥80% 자동 측정 도구 부재

- **카테고리**: 운영
- **설명**: R-N-05·F-10 한국어 주석 ≥80% KPI를 자동 측정할 표준 도구 부재. grep 룰로 ad-hoc 측정.
- **영향**: 2 — KPI 측정 신뢰성 저하
- **가능성**: 4 — Sprint 6에서 직면 확실
- **현재 상태**: 식별
- **트리거 신호**: ISSUE-023 진입 시 측정 룰 정의 필요.
- **완화 전략**:
  - `scripts/check-comment-coverage.sh` 작성 — 핵심 4 디렉토리 함수 헤더의 한국어 주석 비율 grep 측정
  - 또는 수동 리뷰 — PR 코멘트에서 "한국어 주석 ≥80% 확인" 체크리스트
  - 11 Conventions §4 주석 형식(JSDoc + 한국어 첫 줄)을 강제하므로 측정은 grep으로 충분
- **대응 이슈**: ISSUE-023

## 3. High 리스크 단계적 롤아웃

본 §은 등급 **High** 리스크(RISK-01·RISK-04)에 대한 단계적 완화 롤아웃을 명시.

### RISK-01 (인증 없음) 단계적 롤아웃

- **Stage 1 (M1·Sprint 1)** — 식별만, MVP 진입.
- **Stage 2 (M6·Sprint 6 / ISSUE-022)** — README §보안 한국어/영문 병기 경고 + 데모용 명시 (F-12).
- **Stage 3 (M6 종료)** — UI footer에도 "공개 데모용 — 운영 사용 금지" 시각 경고 추가. 시드 데이터에도 데모 명시 문구.
- **Rollback trigger**: 외부 호스팅에 본 코드가 무단 배포된 증거 발견 시 — README와 footer 경고를 더 강하게 보강 + Phase 2 세션 인증 도입 ADR.
- **합격 기준**: F-12 평가 기준 — README와 footer 어느 쪽도 경고 노출.

### RISK-04 (cascade 누락) 단계적 롤아웃

- **Stage 1 (Sprint 1 / ISSUE-003)** — schema.prisma에서 `onDelete: Cascade` 명시. PR 시점에 `pnpm prisma format` + 정합 검토.
- **Stage 2 (Sprint 2 / ISSUE-008)** — 통합 테스트 추가 — 댓글 3건 시드 후 글 삭제 → Comment·ArticleTag 테이블 0건 확인. CI 회귀 매 PR.
- **Stage 3 (Sprint 4 / ISSUE-015)** — E2E 시각 확인. 글 상세에서 "삭제" → 홈에서 미노출 + 만약 다시 직 URL 진입 시 NotFound.
- **Stage 4 (Sprint 6 / ISSUE-024)** — 평가 기준 RFP §10 #6 통과 시 본 리스크 해소 처리.
- **Rollback trigger**: 통합 테스트가 cascade 실패 → 즉시 PR BLOCK + schema.prisma 점검 (잘못된 `onDelete: SetNull` 등).
- **합격 기준**: 통합 테스트 PASS + E2E 시각 확인 + 평가 기준 #6 통과.
