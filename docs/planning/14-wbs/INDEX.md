---
doc_type: index
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: operations
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# 14-wbs — Index

> 본 폴더는 1수준 산출 `14-wbs` (ADR-0015 §2.1, ADR-0031 재할당 — 기존 13→14). NEW_PROJECT Phase 3/4 운영 산출.

| 파일 | 한 줄 요약 |
|---|---|
| [14-wbs.md](14-wbs.md) | 6 Sprint × 25 Issue 분해. R-/F- 100% 매핑. §7 sprint-bootstrap YAML (ADR-0045 v1.1 `{{WBS_URL}}` placeholder) |

## 정합
- 정본 schema: `.claude/schemas/wbs.schema.yaml`
- 게이트: operations
- 상류: [15 Risk](../15-risk/15-risk.md) (우선순위 보정 입력)
- 하류: `scripts/sprint-bootstrap.sh` → GitHub Milestones·Issues (`/flow-bootstrap`)
