---
doc_type: feature-risk
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# feat-tags-api — Feature Risk

> Issue #7 · mode=add · P7 산출. 6 카테고리 점검 + High 0 (read-only endpoint + articles·comments 답습).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| T-RISK-01 | Prisma `_count.articleTags` orderBy 미지원 또는 syntax 오류 → typecheck/runtime 실패 | 4 | 2 | Medium |
| T-RISK-02 | app.ts 등록 순서 오류 (notFoundHandler 이후) → /api/tags 모두 404 | 5 | 1 | Medium |
| T-RISK-03 | 30종 시드 데이터 격리 실패 → 다른 통합 테스트에 영향 | 3 | 2 | Low |
| T-RISK-04 | 동률 빈도 정렬 안정성 부재 → 테스트 flaky | 2 | 3 | Low |
| T-RISK-05 | 빈 결과 응답 형식 — 200+빈 배열 vs 404 일관성 | 2 | 1 | Low |
| T-RISK-06 | 시크릿 노출 (DATABASE_URL 로그) | 5 | 1 | Medium |
| T-RISK-07 | 성능 — 태그 수가 많아질 때 `_count` 집계 비용 | 3 | 2 | Low |

High 등급 0. mode=add + 단일 read-only endpoint + articles·comments 답습.

## 2. 리스크 상세

### T-RISK-01: Prisma `_count.articleTags` orderBy syntax

- **시나리오**: Prisma 5.x `orderBy: { articleTags: { _count: 'desc' } }` 문법이 schema 정의에 따라 type error 가능. ArticleTag relation을 Tag 모델에 정의해뒀으므로 정상 작동 기대.
- **카테고리**: 회귀 (build)
- **완화**: typecheck로 자동 검출. integration test happy 응답이 정렬 검증.
- **검증**: AC-01 케이스 (count desc 첫 요소 검증)

### T-RISK-02: app.ts 등록 순서

- **시나리오**: tags 라우터를 notFoundHandler 이후 등록 → 모든 /api/tags 404
- **완화**: contract §3 + plan commit 4에 등록 순서 명시 (articles → comments → tags → notFoundHandler)
- **검증**: integration AC-01 200 응답 = 정상 마운트

### T-RISK-03: 30종 시드 격리

- **시나리오**: beforeEach deleteMany 누락 → 다른 테스트의 태그 잔존 → AC 검증 영향
- **완화**: articles·comments 패턴 답습 (deleteMany cascade 순서)
- **검증**: 5회 연속 실행

### T-RISK-04: 동률 정렬 안정성

- **시나리오**: 동일 count 시 Prisma 기본 정렬 (입력 순서·DB row 순)이 테스트 환경마다 다를 수 있음 → tags[0] 등 특정 index 단언 시 flaky
- **완화**: AC-03 케이스는 *5종 모두 포함*만 검증 (특정 순서 단언 X). secondary sort는 비목표.
- **검증**: AC-03 케이스 `expect(tags).toContainEqual({name, count})` 형식

### T-RISK-05: 빈 결과 응답 형식

- **시나리오**: 200 vs 404 일관성
- **완화**: contract §6 + plan §5 결정 4 = 200+빈 배열 (articles list 답습)
- **검증**: AC-02 케이스 명시 — `expect(res.status).toBe(200); expect(res.body.tags).toEqual([])`

### T-RISK-06: 시크릿 노출

- **시나리오**: tag.service·repo에 console.log(process.env) 등 leak
- **완화**: 본 PR env·schema 미수정. reviewer agent grep 검증
- **검증**: code-review reviewer agent

### T-RISK-07: 성능 — `_count` 집계 비용

- **시나리오**: 태그 수가 1000+ 시 매번 `_count` 집계 → 응답 시간 증가
- **완화**: MVP는 수십 태그 가정. 상한 20 + 단일 인스턴스. Phase 2+ Redis 캐싱 (contract §6)
- **검증**: AC 응답 < 200ms (30종 시드)

## 3. High 등급 단계적 롤아웃

High 0 — 불필요. 단일 PR 머지.

## 4. 데이터 영속성 변경

- **schema**: 0 (Tag·ArticleTag 모델 #3 그대로)
- **migration**: 0
- **dev/stg/prod.db**: 본 PR 영향 0
- **신규 시드**: 0 — 통합 테스트 자체 시드 (beforeEach)

## 5. 15-risk.md 갱신 항목

본 PR scope 외. P13 docs-update에서 13/02-catalog F-02·F-08 fan-in만 처리.
