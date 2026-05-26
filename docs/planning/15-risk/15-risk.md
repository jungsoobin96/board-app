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
| v0.2 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #5 PR #33 — 3 profile 부팅 smoke 자동화 fan-in. RISK-13/14/15 신설 (smoke timeout false-negative · child zombie · smoke 출력 시크릿 노출). R-N-04 dev only PASS + stg/prod N/A 위임 상태가 #5 PR #33으로 3 profile 실 PASS 정식 충족 baseline 진입(머지 후 효력). |
| v0.3 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #6 PR — 댓글 API 도입 fan-in. RISK-16 신설 (nested router mergeParams 누락 회귀 패턴 — articles 단일 라우터에선 미발현, comments 도입으로 첫 적용). |

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
| RISK-13 | smoke 5초 timeout false-negative (CI runner·WSL2 등 느린 환경) | 3 | 2 | Medium | Sprint 1 / Issue #5 (PR #33) + Sprint 2+ 전 PR (6번째 축) | smoke.ts warmup 500ms + SMOKE_TIMEOUT_MS env override + child stderr 첨부. Found-Q-1로 CI smoke job 별 follow-up 권고 |
| RISK-14 | smoke child process zombie 잔존 → 후속 EADDRINUSE | 4 | 2 | Medium | Sprint 1 / Issue #5 (PR #33) + Sprint 2+ smoke 호출 전 PR | scripts/smoke.ts SIGTERM → 1초 → SIGKILL fallback + process.on('SIGINT') cleanup. AC-04 검증 |
| RISK-15 | smoke 출력에 시크릿 노출 (DATABASE_URL 등) — CLAUDE.md §보안 §2 위배 위험 | 5 | 1 | Medium | 전 Sprint smoke 호출 시 | scripts/smoke.ts 출력 화이트리스트 (profile/PORT/ready ms/HTTP status only). reviewer agent grep 검증 + child stderr 5줄 첨부도 raw bash (시크릿 미포함) |
| RISK-16 | nested router 마운트 시 `Router({ mergeParams: true })` 옵션 누락 → 부모 path param(`:articleId`) 추출 실패 → 모든 endpoint 400/500 | 4 | 2 | Medium | Sprint 2 / Issue #6 (PR feat/comments-api-issue-6) + Sprint 4+ 추가 nested 도메인 | routes/<domain>.ts 신설 시 mergeParams 옵션 명시 (comments 답습) + integration test 자동 검출 (happy path 200 응답 = 옵션 정상 작동 증거) + code-review 점검 항목 추가 |

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

### RISK-13: smoke 5초 timeout false-negative (CI runner·WSL2)

- **카테고리**: 회귀
- **설명**: `pnpm smoke:3profiles`가 5초 timeout으로 backend ready 신호 polling. CI runner(GitHub Actions) 또는 WSL2 / 저사양 머신에서 Express + Prisma init이 5초 초과 → backend 정상 부팅 중인데 smoke FAIL 처리.
- **영향**: 3 — AI 게이트 6번째 축 false-positive BLOCK → 사용자 PR 머지 지연
- **가능성**: 2 — warmup 500ms + 5.5초 polling 총 시간이 Express+Prisma init 정합 (< 2초)
- **현재 상태**: 식별 + 본 PR(#5 PR #33)에 완화책 통합
- **트리거 신호**: CI runner 도입(Found-Q-1 별 이슈) 후 실 측정. 평균 1500ms 미만 정합 확인.
- **완화 전략**:
  - scripts/smoke.ts warmup 500ms (첫 polling 전) + polling 250ms × 20회 = 총 5.5초
  - `SMOKE_TIMEOUT_MS` env override 지원 (default 5000)
  - child stderr 첫 5줄 PR body 첨부 (Express listening 신호 vs Prisma error 구분)
  - Found-Q-1 (CI smoke job 신설) follow-up 이슈에서 CI runner 측정값 수집
- **대응 이슈**: Issue #5 (본 PR), Found-Q-1 (follow-up)

### RISK-14: smoke child process zombie 잔존

- **카테고리**: 운영
- **설명**: scripts/smoke.ts가 spawn한 backend child process를 kill 못 시키고 exit. PORT 3000/3001/3002 점유 잔존 → 다음 smoke 또는 `pnpm dev` 실행 시 EADDRINUSE. Windows에서 더 까다로움.
- **영향**: 4 — 개발 흐름 중단 + 수동 `lsof -i :3000 | kill` 또는 `Get-NetTCPConnection` 필요
- **가능성**: 2 — SIGTERM → 1초 grace → SIGKILL fallback 명시 + process.on('SIGINT')·('exit') 양쪽 cleanup
- **현재 상태**: 식별 + 본 PR(#5 PR #33)에 완화책 통합 (smoke.ts:killChild)
- **트리거 신호**: smoke 후 `lsof -i :3000` 결과 1건 이상 (= zombie).
- **완화 전략**:
  - SIGTERM → SIGKILL 2단 fallback (smoke.ts:killChild)
  - process SIGINT 핸들러 등록 (사용자 Ctrl+C 대비)
  - try/finally로 fail path에도 cleanup 보장
  - AC-04 명시 (smoke 후 PORT 점유 0건 자동 검증)
- **대응 이슈**: Issue #5 (본 PR)

### RISK-15: smoke 출력에 시크릿 노출 (CLAUDE.md 보안 §2 위배 위험)

- **카테고리**: 보안
- **설명**: scripts/smoke.ts가 디버깅용으로 `console.log(process.env)` 또는 `DATABASE_URL` 같은 출력 추가하면 PR diff에 시크릿 값 leak. MVP는 시크릿 없지만 Phase 2+ secret manager 도입 시 치명적.
- **영향**: 5 — CLAUDE.md 보안 §1·§2 절대 규칙 위배
- **가능성**: 1 — smoke.ts 출력 화이트리스트 (profile/PORT/ready ms/HTTP status only) + reviewer agent grep 명시
- **현재 상태**: 완화 (본 PR 출력 화이트리스트 + reviewer grep PASS)
- **트리거 신호**: PR diff에 `console.log(process.env`·`DATABASE_URL`·`JWT_SECRET` 패턴 1건 이상 → 즉시 BLOCK + revert.
- **완화 전략**:
  - smoke.ts 출력 화이트리스트 강제 — 시크릿 값 절대 출력 금지
  - child stderr/stdout pipe는 raw 전달이지만 backend 정상이면 시크릿 미출력 (Express log = method/path/status, Prisma log = query만, LOG_LEVEL=info/warn 억제)
  - P9 code-review reviewer agent가 매 smoke 변경 PR에서 `console.log(process.env\|DATABASE_URL\|JWT_SECRET)` grep 0건 강제
  - settings.json PreToolUse 훅이 `.env*` 직접 Write/Edit 차단
- **대응 이슈**: Issue #5 (본 PR — 화이트리스트 도입), Sprint 2+ smoke 본문 변경 PR마다 reviewer grep 의무

### RISK-16: nested router 마운트 시 mergeParams 옵션 누락 → path param 추출 실패

- **카테고리**: 회귀
- **설명**: Express에서 부모 라우터의 path param(`:articleId`)을 자식 라우터에서 추출하려면 `Router({ mergeParams: true })` 옵션이 필수. 옵션 누락 시 `req.params.articleId === undefined` → `parsePathId(undefined)` → ValidationError throw → 모든 endpoint 400 (또는 service에 NaN articleId 전파 시 500). articles 단일 라우터에선 미발현, comments 도입(#6)으로 첫 nested 패턴 적용.
- **영향**: 4 — 모든 endpoint 차단 (CI fail)
- **가능성**: 2 — articles 패턴 답습 + integration test 자동 검출
- **현재 상태**: 완화 (Issue #6 PR에서 mergeParams=true 명시 + integration AC-01 happy path가 자연 검출)
- **트리거 신호**: 신규 nested router 추가 시 integration test happy path 모두 400/500 → mergeParams 누락 추정.
- **완화 전략**:
  - routes/<domain>.ts 신설 시 `Router({ mergeParams: true })` 명시 (comments 답습 — code-review checklist에 추가)
  - integration test happy path 1건 이상 보장 (200 응답 = articleId 정상 추출 증거)
  - P9 code-review에서 nested router 신설 PR마다 mergeParams 옵션 grep 점검
- **대응 이슈**: Issue #6 (본 PR — comments 도입 + 완화 패턴 정립), Sprint 4+ 추가 nested 도메인 (댓글 reply 등 가능성) PR마다 동일 점검

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
