---
doc_type: adr
version: v0.1
status: Accepted
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-N-03, R-N-04, R-N-07]
  F-ID: []
  supersedes: null
---

# ADR 0001 — agent-toolkit 도입 + board-app 정합 결정

**상태**: Accepted
**결정일**: 2026-05-22
**작성**: woosung.ahn@bespinglobal.com

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 — newProject(board-app) 도입 결정 사후 기록 |

## 1. 컨텍스트

board-app은 RFP `Conduit Lite` (15일 학습용 게시판 풀스택 — 글·댓글·태그 CRUD, BE-only/FE-only 비대상)를 구현하는 newProject이다. 다음 제약이 있었다.

1. **학습 친화** — 단일 개발자 학습 사이클, 한국어 주석 ≥80%(R-N-05), 평가 기준 7개(README·실행·테스트·주석·보안·성능·반응형) 충족 필요.
2. **재현 가능한 계획 산출** — RFP→SRS→PRD→Architecture→HLD→LLD→Scaffolding→Test Design→WBS 흐름이 *형식 일관*되게 산출되어야 함 (다른 학습 사이클에도 재사용 가능).
3. **게이트 기반 진행** — 학습자가 코드 작성 단계에서 정합성 점검 없이 진행하지 않도록 게이트 A·B·C·D-06 강제 필요.
4. **운영 메타** — 브랜치/PR/머지/CI 정책이 학습자가 임의로 우회하지 못하도록 schema-level enforcement 필요.

## 2. 결정

`c:\work\agent-toolkit\`을 `install.sh`로 board-app에 카피하고, 본 ADR 작성 이후의 모든 진행을 toolkit의 Meta Command + Harness로 운영한다.

도입 시점·범위:
- **도입 commit**: `5d59039 chore(toolkit): initial agent-toolkit import (install.sh)` (2026-05-22)
- **카피 대상**: `.claude/` (commands·harness·schemas·scripts·agents·skills), `CLAUDE.md`, `docs/planning/policies/`, `LOCAL.md` 템플릿
- **카피 제외**: agent-toolkit 자체 진화(toolkit 측 PR·toolkit 측 ADR 추가)는 별도 동기 절차(`manual-sync-guide.md` §5)로 처리. 본 프로젝트 폴더에 toolkit 측 ADR을 *복제하지 않는다* — `adr/INDEX.md` §"toolkit 측 참조 ADR"이 정본 위치를 가리킨다.

## 3. 검토된 대안

### 채택안 — agent-toolkit 도입 + Meta Command + Harness

Meta Command(`/flow-new-project`, `/flow-feature` 등) + Harness(Strict Rules 13개) + 28 doc_type schema + 6 에이전트 + D-06 2단 게이트를 그대로 적용. 학습자가 학습 사이클에 집중할 수 있도록 *형식·게이트·운영 메타*를 toolkit이 자동 강제.

### 대안 1 — 직접 작성 (toolkit 미도입)

도입 비용 0이지만 형식 일관성·게이트 enforcement 부재. 학습자가 코드를 먼저 작성하는 함정(게이트 C 미통과 상태에서 `/implement` 진입)을 막을 schema-level 강제 없음. **거부**.

### 대안 2 — 부분 도입 (schema만, Meta Command 미사용)

도입 비용 중간, schema 검증으로 산출 형식은 보장되나 Strict Rules · Artifact Binding이 schema 단독으로는 강제 불가. 게이트 우회 가능. **거부**.

### 대안 3 — 다른 프레임워크 (Cookiecutter 등 템플릿)

도입 비용 낮음, NEW_PROJECT 4 Phase 메타 + D-06 2단 게이트 같은 *흐름 강제* 미제공. **거부**.

## 4. 결과 (Consequences)

### 긍정

- **재현 가능 형식**: 28 doc_type schema가 모든 산출의 frontmatter·필수 절·표 컬럼·ID 패턴을 강제 → 같은 RFP 입력이 같은 형식 출력으로 산출.
- **게이트 강제**: `/plan-eng-review` PASS 없이 `/implement` 진입 차단 (필수 규칙 #2). 학습자가 코드를 먼저 작성하는 함정 방지.
- **PR 운영 일관성**: D-06 2단 게이트(AI + 휴먼) + ADR-0046 `manual_checkbox_must_be_unchecked` + ADR-0047 워크플로 양축 검증이 PR 품질의 하한선을 자동 보장.
- **부팅 자산 동기**: ADR-0037 v1.1 + ADR-0040으로 dev/stg/prod 3 profile 부팅 자산(`LOCAL.md` §3 + `.env.{profile}.example` + migrations)이 매 PR에서 동기 갱신 강제.

### 부정 / 트레이드오프

- **학습 곡선**: Meta Command + Harness + Strict Rules + schema 규칙을 학습자가 모두 이해해야 효율적 운영 가능. `.claude/USAGE_GUIDE.md` + `CLAUDE.md` v6 Addendum 1독 후 진행 권고.
- **외부 의존**: `gh` CLI + `yq` (mikefarah/yq v4+) 설치 필수. 미설치 시 sprint-bootstrap·validate-doc.sh가 동작 안 함. 본 프로젝트는 2026-05-25 기준 두 도구 모두 설치 완료.
- **동기 부담**: agent-toolkit 측 변경 사항을 `manual-sync-guide.md` §5 절차로 주기적 반영 필요. 자동 동기 미지원.
- **branch protection 트랜지션**: toolkit 도입 직후 branch protection 9개 규칙(ADR-0044 §5)이 GitHub Settings에 미적용 — 별 이슈로 등록·적용 필요.

### 영향 받는 문서

- `CLAUDE.md` — toolkit이 카피한 본문 (필수 규칙 13개·Strict Rules 등)이 board-app 운영 정본
- `docs/planning/policies/branch-strategy.md`, `pull-request.md` — toolkit 정책 정본 카피
- `LOCAL.md` — toolkit 부팅 가이드 템플릿이 본 프로젝트 부팅 사용자 가이드로 채택 (ADR-0040)
- `.claude/` 전체 — toolkit의 Meta Command·schemas·scripts·agents 카피
- `adr/INDEX.md` — toolkit 측 참조 ADR reference index

## 5. 추적 / 재검토 시점

다음 follow-up이 모두 완료되면 본 결정 안정화. 1개 이상 미해소 시 6개월 후(2026-11-25) 재검토.

- [ ] branch protection 9개 규칙 적용 (별 이슈)
- [ ] `pr-body-checkboxes` status check workflow 등록 (ADR-0046 §2.5 enforcement)
- [ ] `docs/planning/CHANGELOG.md` 생성 (sprint 모드 정본 마커, 별 PR 또는 첫 이슈에 포함)
- [ ] toolkit 측 ADR 진화 시 `manual-sync-guide.md` §5 절차로 주기 동기
- [ ] toolkit 회귀 격상: `docs/planning/policies/*.md` frontmatter 누락 — 28 doc_type schema에 'policy' 카테고리 없음, validate-doc.sh가 검출하나 본문 구조와 맞는 schema 없음. agent-toolkit 측 이슈로 격상 후보 (board-app 단독 해결 불가)
- 재검토 트리거: agent-toolkit 측 메이저 ADR 신설(예: ADR-0048+) 시 본 프로젝트 정합 영향 평가
