---
doc_type: index
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: B
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# 04-srs — Index

> 본 폴더는 1수준 산출 `04-srs` (ADR-0015 §2.1). NEW_PROJECT Gate B 산출.

| 파일 | 한 줄 요약 |
|---|---|
| [04-srs.md](04-srs.md) | R-F-01~08 (기능) + R-N-01~07 (비기능) 카탈로그 — 각 R-ID에 우선순위·Acceptance·3축 테스트 결정 |

## 정합
- 정본 schema: `.claude/schemas/srs.schema.yaml`
- 게이트: B (팀 합의)
- 폴더 구조: ADR-0015
- 강제 규칙: ADR-0014 (Happy + Failure), ADR-0023 (단위·통합·E2E 3축)
