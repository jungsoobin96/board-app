---
doc_type: feature-risk
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-01]
  F-ID: [F-01]
  supersedes: null
---

# 응답 시간 측정 통합 (Issue 20) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — 3 F-RISK 모두 Low |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | CI 환경 (GitHub Actions runner)에서 p95 200ms 초과로 WARN 폭증 | 2 | 2 | Low |
| F-RISK-02 | seed100Articles 100 글 + ArticleTag 라운드로빈 시드 시간 자체가 testTimeout 15s 초과 | 3 | 1 | Low |
| F-RISK-03 | dev.db 단일 writer + singleFork 환경에서 다른 통합 테스트와 동시 실행 시 측정값 변동 | 2 | 2 | Low |

## 2. 리스크 상세

### F-RISK-01 — CI WARN 폭증

GitHub Actions runner는 로컬보다 CPU/IO 변동 큼. p95가 200ms 초과 가능. 단 본 PR은 **BLOCK 없이 WARN만** (CI gate 아님). console.warn 출력으로 추적만, 머지 차단 없음.

**완화책**: 본 의도(acceptance §AC-02) — WARN 출력만으로 R-N-01 추적 충족. CI 환경 별도 임계는 contract §6 비목표.

### F-RISK-02 — 시드 시간 초과

seed100Articles는 100 article create + 라운드로빈 ArticleTag (~150 create) + 댓글 3 — 100+150+3 = ~253 prisma create. 로컬 SQLite ~1초. 측정 4 시나리오 × 100회 ~3초. 총 ~4초 < testTimeout 15000ms 충분.

**완화책**: 사전 검증 실측 — `pnpm test:integration` 출력 `tests/integration/perf.integration.test.ts (1 test) 3979ms` → 약 4초. testTimeout 15s 안에 충분.

### F-RISK-03 — singleFork 격리

vitest.integration.config.ts: `pool: 'forks' + singleFork + fileParallelism: false`. dev.db SQLite 단일 writer 한계 (08 §7 RISK-02) 대응. 다른 통합 테스트와 순차 실행 → 측정값 격리.

beforeEach deleteMany로 데이터 초기화 → 매 테스트 격리.

**완화책**: 사전 검증 25 passed 확인.

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 단위 통합 1건 추가.

## 4. 데이터 영속성 변경

없음 — dev.db는 beforeEach deleteMany로 격리. 영구 변경 없음.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. Sprint 6+ CI 환경 p95 임계 정책 검토 후보 (contract §6 비목표 명시).
