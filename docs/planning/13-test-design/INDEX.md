---
doc_type: index
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# 13-test-design — Index

> 본 폴더는 1수준 산출 `13-test-design` test-design 폴더 분할 산출 (ADR-0030 + ADR-0036). NEW_PROJECT Gate C 산출. 폴더 내 sub-file 5종.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 파일 목록

| 파일 | 한 줄 요약 |
|---|---|
| [01-strategy.md](01-strategy.md) | Test Strategy — 비-TDD + 부분 BDD 표현·도구 선택·커버리지 ≥80% |
| [02-catalog.md](02-catalog.md) | Test Scenario Catalog — §1 단위/§2 통합/§3 E2E + §4 레벨 매트릭스 (❌ 금지) |
| [03-regression.md](03-regression.md) | Regression Test Policy — 회귀 범위·자동화·트리거 |
| [04-performance.md](04-performance.md) | Performance & Security Tests — 성능 측정·보안 시크릿/스택 검증 |
| [05-delivery-format.md](05-delivery-format.md) | Customer Delivery Format — 산출 포맷·ID 채번 (TC-/IT-/E2E-/SC-)·전달 시점 |

## 정합
- 정본 schema: `.claude/schemas/test-design.schema.yaml` (folder_split.subfiles)
- 폴더 분할 결정: ADR-0030
- sub-file 본문 BLOCK: ADR-0034
- 02-catalog 섹션 구조: ADR-0036 (§1 단위 / §2 통합 / §3 E2E / §4 매트릭스)
- 점진 갱신: ADR-0035 (`check-test-catalog-sync.sh` WARN 기반)
- 게이트: C
