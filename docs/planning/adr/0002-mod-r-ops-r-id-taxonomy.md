---
doc_type: adr
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: C
related:
  R-ID: [R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# ADR 0002 — R-OPS-* 운영 비기능 R-ID prefix 체계 신설

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 컨텍스트 + 결정 + 대안 3건 + 결과 + 재검토 시점 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 컨텍스트

#47 PR #49 + #51 PR #53에서 운영 자동화 신뢰성(workflow 라벨 자동 전이·workflow 양축 검증·3 profile smoke·LOCAL.md 동기) 검증을 위해 `R-OPS-AUTO-LABEL`이라는 ad-hoc R-ID를 schema BLOCK 우회용으로 도입했음. `.claude/schemas/feature-acceptance.schema.yaml`이 `related.R-ID` 비어있는 케이스를 BLOCK으로 강제(`R-` pattern 충족 필요)하므로 ad-hoc이라도 형식상 만족시키기 위함.

문제:
1. `R-OPS-AUTO-LABEL`이 04-srs 정본에 부재 — 정합성 파괴 (다른 R-/F-ID는 모두 04-srs/05-prd 정본 기반)
2. 후속 PR(#48 등)에서 동일한 운영 비기능 검증 시 같은 우회를 반복하거나 ad-hoc R-ID를 매번 새로 만들게 됨
3. ADR-0029(FSM 라벨 자동화)·ADR-0037 v1.1(3 profile smoke)·ADR-0040(LOCAL.md 동기)·ADR-0047(workflow 양축)에 대응하는 R-ID가 없어 13/02-catalog fan-in 추적 불가
4. agent-toolkit upstream 다른 newProject에도 같은 패턴 위험

운영 비기능을 04-srs §3에 정식으로 등록하면 R-N-* 기존 7건과 별도 prefix(`R-OPS-*`)로 분리해서 의도/범위를 명확히 할 수 있다 — R-N-*는 *제품 비기능*(성능·에러·README·반응형·보안), R-OPS-*는 *운영 자동화*(라벨/smoke/workflow/docs-sync).

## 2. 결정

**04-srs §3 비기능에 `R-OPS-*` prefix 체계 신설**. 첫 4건 등록:
- `R-OPS-AUTO-LABEL` (P0, ADR-0029) — FSM 라벨 자동 전이
- `R-OPS-SMOKE` (P0, ADR-0037 v1.1) — 3 profile 부팅 smoke 자동화
- `R-OPS-WORKFLOW` (P0, ADR-0047) — GitHub Actions workflow 양축 검증
- `R-OPS-DOCS-SYNC` (P1, ADR-0040) — LOCAL.md ↔ 12-scaffolding 동기

각 R-OPS-*는 R-N-*와 같은 schema 형식: 출처·우선순위·설명·Acceptance(G/W/T)·테스트 시나리오·3축(단위/통합/E2E) 결정.

13/02-catalog §1 단위 = R-OPS-* 모두 N/A (운영 인프라는 단위 테스트 부적합), §2 통합 = 4건 fan-in(workflow 양축 + label 전이 + smoke + docs-sync 실측 시나리오), §3 E2E = N/A.

### 명명 규칙

- prefix `R-OPS-` (고정)
- suffix는 대문자 + 하이픈 분리, 짧고 명사형 (예: `AUTO-LABEL`, `SMOKE`, `WORKFLOW`, `DOCS-SYNC`)
- 출처는 반드시 ADR ID 명시 (`R-OPS-*`는 ADR로부터 파생)

## 3. 검토된 대안

### 대안 A — `R-N-08`/`R-N-09`... 기존 R-N-* prefix에 통합 (기각)

- 장점: prefix 신설 비용 0, 04-srs §3 안에 자연 흡수
- 단점: R-N-*는 *제품 비기능*인데 운영 자동화는 의미가 다름. 혼동 위험. agent-toolkit 다른 newProject에 전파 시 `R-N-*` 번호가 newProject마다 달라져 cross-reference 불가
- 기각 사유: 의미 분리 우선 — R-N-*(제품) vs R-OPS-*(운영) 명시적 구분이 ADR-0023 R-ID 의도와 정합

### 대안 B — `R-OPS-*`를 별도 산출 문서 신설(예: `docs/planning/16-operations-spec/`) (기각)

- 장점: 04-srs 분량 가드 유지, 운영 비기능 전용 산출
- 단점: 1수준 15건 체계(ADR-0013/0015/0031) 외 16번째 산출 신설은 큰 정책 변경 — ADR-0031 재할당과 충돌 가능
- 기각 사유: 본 PR scope 초과. 향후 운영 비기능이 폭증하면 재검토

### 대안 C — ad-hoc 유지 + schema 완화(R-ID 없어도 OK로 변경) (기각)

- 장점: 04-srs 변경 0건
- 단점: ADR-0018 §0 Referenced-IDs BLOCK 정책 약화. 모든 PR의 R-ID 추적성 손상
- 기각 사유: schema-level BLOCK이 정확히 의도된 강제 — 우회는 결함 누적

### 채택안 — `R-OPS-*` prefix 신설 + 04-srs §3 등록 + 13/02-catalog fan-in

대안 A의 R-ID 추적성 + 대안 B의 의미 분리 + 본 PR scope 적정.

## 4. 결과 (Consequences)

### 긍정적

- 후속 PR(#48 등)에서 R-OPS-* 정본 참조 가능 — ad-hoc 우회 불필요
- ADR-0029/0037/0040/0047 대응 R-ID 명시로 추적성 회복
- 13/02-catalog §4 매트릭스에 R-OPS-* 행 추가 — ADR-0035 동기화 정합
- agent-toolkit upstream 다른 newProject에 R-OPS-* 체계 전파 시 참고 가능

### 부정 / 트레이드오프

- 04-srs §3 길이 증가 (7건 → 11건, +57%) — 분량 가드 300줄은 초과 가능 (현재 327줄, 본 PR 후 ~430줄 예상). 단 04-srs는 산출 문서이므로 가드 외 (CLAUDE.md §"분량 가드" — 운영 문서만 가드)
- R-OPS-* prefix 추가로 R-ID 학습 비용 +1 (R-F-*/R-N-*/R-OPS-* 3 prefix)
- 트레이드오프: 의미 분리(긍정) ↔ prefix 학습 비용(부정) — 의미 분리 우선 채택

### 영향 받는 문서

- `docs/planning/04-srs/04-srs.md` §3 비기능 + frontmatter + 변경 이력 (정본 갱신)
- `docs/planning/13-test-design/02-catalog.md` §2 통합 + §4 매트릭스 + frontmatter + 변경 이력 (fan-in)
- `docs/planning/adr/INDEX.md` (0002 등록)
- `docs/features/mod-r-ops-r-id-taxonomy/*.md` (신규 7건)
- (frozen, 갱신 안 함) `docs/features/bug-sync-issue-labels-workflow/*.md` + `docs/features/bug-workflow-global-zero-runs/*.md` — ad-hoc R-OPS-AUTO-LABEL 참조는 정본 등록 후 retroactive 정합
- (별도 후속 이슈) `agent-toolkit/manual-sync-guide.md` upstream — R-OPS-* 체계 권고 전파

### 후속 작업

- (선택) agent-toolkit upstream에 R-OPS-* 체계 전파 — 별도 이슈
- (선택) 운영 비기능 신규 발생 시 본 ADR의 명명 규칙 그대로 사용 — `R-OPS-<SUFFIX>` + ADR 출처 명시

## 5. 추적 / 재검토 시점

- **Sprint 5 retro (2026-06-10 마감)**: R-OPS-* 4건 사용 빈도 + 후속 PR(#48) 자연 채택 여부 평가
- **Sprint 6+ 운영 비기능 신규 발생 시**: 본 ADR 명명 규칙으로 신설 가능 여부 평가 (3 prefix R-F-*/R-N-*/R-OPS- 외 신규 prefix 필요한지)
- **agent-toolkit upstream 전파 결정 시점**: 본 newProject에서 R-OPS-* 체계가 2 sprint 이상 안정 사용된 후 (Sprint 7+)
