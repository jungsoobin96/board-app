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

# 08-lld-module-spec — Index

> 본 폴더는 1수준 산출 `08-lld-module-spec` (ADR-0015 §2.1). NEW_PROJECT Gate C 산출 (LLD — 모듈/통신).

| 파일 | 한 줄 요약 |
|---|---|
| [08-lld-module-spec.md](08-lld-module-spec.md) | M1~M12 모듈 LLD — 외부 IF + 내부 컴포넌트 + 데이터 흐름 + 에러 처리 + 테스트 진입점 |

## 정합
- 정본 schema: `.claude/schemas/module-spec.schema.yaml`
- 게이트: C
- 상류: [07 HLD §1](../07-hld/07-hld.md) (모듈 fan-out 원본, ADR-0031)
