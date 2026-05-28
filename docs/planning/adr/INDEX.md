---
doc_type: index
version: v0.3
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: operations
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# adr — Index

> 본 폴더는 1수준 산출 `adr` (ADR-0013 §1수준 전수 폴더 + ADR-0015 §3.3 4자리 평면 명명 + ADR-0031 +1 재할당 정합). 본 프로젝트(board-app)에서 발생한 아키텍처 결정을 4자리 평면 형식(`NNNN-<slug>.md`)으로 적층한다.
>
> **agent-toolkit 측 정본 ADR과의 관계**: agent-toolkit clone(`c:\work\agent-toolkit\docs\planning\adr/`)이 *toolkit 자체*의 결정 정본이고, 본 폴더는 *board-app 도입 + board-app 고유 결정*을 담는다. 본문 인용한 ADR-0011/0013/0015/0021/0031/0037/0038/0040/0044/0046/0047 등은 모두 agent-toolkit 측 정본 참조이며, 별도 복제 없이 본 INDEX의 §"toolkit 측 참조 ADR" 절에서 reference index로 묶는다.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.3 | 2026-05-28 | jungsoobin96@users.noreply.github.com | Issue #56 — ADR-0003 title-lint-and-branch-prefix-separation 등록 (workflow regex 9 type 확장 + §A·§B·§C 어휘 분리 명문화). |
| v0.2 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Issue #52 — ADR-0002 mod-r-ops-r-id-taxonomy 등록 (R-OPS-* 운영 비기능 R-ID prefix 체계 신설). 04-srs §3 정식 등록 + 13-catalog fan-in 동기. |
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 — 1수준 폴더 신설 + 0001 toolkit-adoption 등록 (게이트 C 회귀 보강) |

## board-app 측 ADR

| ID | 제목 | 상태 | 일자 |
|---|---|---|---|
| [0001](0001-toolkit-adoption.md) | agent-toolkit 도입 + board-app 정합 결정 | Accepted | 2026-05-22 |
| [0002](0002-mod-r-ops-r-id-taxonomy.md) | R-OPS-* 운영 비기능 R-ID prefix 체계 신설 | Accepted | 2026-05-27 |
| [0003](0003-title-lint-and-branch-prefix-separation.md) | Title-lint regex 9 type 확장 + branch prefix와 PR title type의 의도적 분리 | Accepted | 2026-05-28 |

## toolkit 측 참조 ADR (정본 = agent-toolkit, 본 프로젝트 본문 인용)

| ID | 제목 | 인용 위치 (본 프로젝트) |
|---|---|---|
| ADR-0001 | D-06 2단 게이트 (AI + 휴먼) | `pull-request.md`, `CLAUDE.md` |
| ADR-0010 | Schema-level Document Enforcement (28 doc_type) | `CLAUDE.md` §"산출 문서 Schema", `validate-doc.sh` |
| ADR-0011 | UI/FE 변경 시 dev 서버 + 브라우저 골든패스 강제 | `CLAUDE.md` 필수 규칙 #9 |
| ADR-0013 | 1수준 전수 폴더 구조 | `CLAUDE.md` §"분량 가드", `plan-eng-review.md` §2.5 |
| ADR-0015 | 1수준 16건 + 4자리 평면 명명 (`adr/NNNN-<slug>.md`) | 본 INDEX |
| ADR-0021 | 이슈/PR 제목 Conventional Commits 강제 | `.github/workflows/issue-pr-title-lint.yml` |
| ADR-0031 | 07 HLD 신설 + 1수준 재할당 (+1) | `07-hld/07-hld.md`, `08-lld-module-spec/08-lld-module-spec.md` |
| ADR-0037 | dev/stg/prod 3 profile 부팅 검증 (AI 게이트 6축 6번) | `CLAUDE.md` 필수 규칙 #10, `LOCAL.md` §3 |
| ADR-0038 | 12-scaffolding §8 스타일링 솔루션 + 10 LLD 디자인 토큰 4종 | `CLAUDE.md` 필수 규칙 #11, `12-scaffolding/typescript.md` §8 |
| ADR-0040 | LOCAL.md 부팅 사용자 가이드 정본 + §3 양축 동기 | `CLAUDE.md` 필수 규칙 #10, `LOCAL.md` |
| ADR-0044 | 단일 trunk + 이슈-1-브랜치-1-PR + rebase 금지 | `CLAUDE.md` 필수 규칙 #12, `policies/branch-strategy.md` |
| ADR-0046 | PR 정책 정본 + `manual_checkbox_must_be_unchecked` BLOCK | `policies/pull-request.md` |
| ADR-0047 | 매 PR GitHub Actions 워크플로 로컬 + GitHub 양축 검증 | `CLAUDE.md` 필수 규칙 #13, `policies/pull-request.md` §4.5 |

## 정합

- 정본 schema: `.claude/schemas/adr.schema.yaml` (toolkit 측)
- 게이트: operations (Phase 3/4 운영 산출 — ADR-0013·0015 강제)
- 폴더 구조 정본: agent-toolkit `docs/planning/conventions/file-numbering.md` §3.3 (4자리 평면)
