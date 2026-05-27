---
doc_type: feature-contract
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# R-OPS R-ID taxonomy (Issue 52) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 04-srs §3 비기능에 R-OPS-* 4건 정식 등록 + 13/02-catalog fan-in + ADR-0002 작성 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC (모두 신설) |
| F-ID (기능) | 05-prd | (none — 운영 비기능 영역) |
| 영향 모듈 | 08-lld-module-spec | (none — 운영 비기능 영역) |
| 영향 엔드포인트 | 09-lld-api-spec | (none) |
| 적용 컨벤션 절 | 11-coding-conventions | (none) |

## 1. 변경 의도

#47/#51에서 schema BLOCK 회피 워크어라운드로 도입한 `R-OPS-AUTO-LABEL` ad-hoc R-ID를 04-srs 정본에 정식 등록하고, 운영 비기능 R-ID 체계(`R-OPS-*` prefix)로 4건(`AUTO-LABEL`·`SMOKE`·`WORKFLOW`·`DOCS-SYNC`)을 묶어 관리한다. 13/02-catalog fan-in으로 ADR-0035 동기화 정합 충족.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| 04-srs §3 비기능 R-ID 개수 | 7건 (R-N-01~R-N-07) | 11건 (R-N-01~R-N-07 + R-OPS-AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC) |
| 04-srs frontmatter version | v0.1 (Draft) | v0.2 (Accepted) |
| 04-srs related.R-ID | R-F-*+R-N-* | + R-OPS-AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC |
| R-OPS-AUTO-LABEL 정본 정의 | 부재 (ad-hoc) | 04-srs §3 정식 정의 (출처 ADR-0029, 우선순위 P0, Acceptance G/W/T, 3축) |
| R-OPS-SMOKE 정본 정의 | 부재 (R-N-04에 부분 포함, ADR-0037 v1.1) | 04-srs §3 정식 정의 (출처 ADR-0037 v1.1, P0). R-N-04와 별도 axis로 분리 — R-N-04는 fresh checkout 부팅 결과 기준, R-OPS-SMOKE는 매 PR 운영 자동화 신뢰성 기준 |
| R-OPS-WORKFLOW 정본 정의 | 부재 | 04-srs §3 정식 정의 (출처 ADR-0047, P0) |
| R-OPS-DOCS-SYNC 정본 정의 | 부재 | 04-srs §3 정식 정의 (출처 ADR-0040, P1) |
| 13/02-catalog R-OPS-* fan-in | 0건 | 4건 (§1 단위 N/A + §2 통합 4건 명시) |
| ADR | 부재 | ADR-0002 신설 (mod-r-ops-r-id-taxonomy) |
| ad-hoc R-OPS-AUTO-LABEL 사용 PR | #47 PR #49, #51 PR #53 (정본 부재) | 후속 PR(#48 등)부터 정본 참조 가능 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `docs/planning/04-srs/04-srs.md` §3 비기능 | R-OPS-* 4건 subsection 추가 (R-N-07 뒤) | 본 PR diff에 포함 |
| `docs/planning/04-srs/04-srs.md` frontmatter | version v0.1 → v0.2, status Draft → Accepted, related.R-ID에 R-OPS-* 추가 | 본 PR diff |
| `docs/planning/04-srs/04-srs.md` 변경 이력 | v0.2 row 추가 | 본 PR diff |
| `docs/planning/13-test-design/02-catalog.md` §1 단위 | R-OPS-* — 운영 인프라 N/A 명시 (단위 테스트 부적합) | 본 PR diff |
| `docs/planning/13-test-design/02-catalog.md` §2 통합 | R-OPS-AUTO-LABEL/WORKFLOW 통합 fan-in (workflow 양축 검증 + label 자동 전이 실측) | 본 PR diff |
| `docs/planning/13-test-design/02-catalog.md` §4 매트릭스 | R-OPS-* 행 추가 (단위 N/A / 통합 ✅ / E2E N/A) | 본 PR diff |
| `docs/planning/13-test-design/02-catalog.md` frontmatter | related.R-ID에 R-OPS-* 추가, version v0.4 → v0.5 | 본 PR diff |
| `docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md` | 신설 — mode=modify Strict Rule | 본 PR diff |
| `docs/planning/adr/INDEX.md` | 0002 등록 | 본 PR diff |
| `docs/features/mod-r-ops-r-id-taxonomy/` | 7 docs 신설 (contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 mode=modify N/A) | 본 PR diff |
| #47 PR #49 `docs/features/bug-sync-issue-labels-workflow/*.md` R-OPS-AUTO-LABEL 참조 | 정본 등록 후에도 retroactive 참조 정합 (frozen, 본 PR에서 갱신 안 함) | 변경 없음 |
| #51 PR #53 `docs/features/bug-workflow-global-zero-runs/*.md` R-OPS-AUTO-LABEL 참조 | 동일 frozen | 변경 없음 |
| 후속 PR (#48·#18~#21 등) | R-OPS-* 정본 참조 가능 (ad-hoc 우회 불필요) | 다음 작업부터 자연 적용 |
| `check-test-catalog-sync.sh` | R-OPS-* 신설 후 OK 응답 필요 | 본 PR에서 단계 검증 |

## 4. Backward Compatibility

- Breaking: **no** — 기존 R-N-01~R-N-07 무변경, R-OPS-* 추가만. 기존 PR(#49·#53)의 ad-hoc 참조는 retroactive로 정합 (frozen 보존)
- 마이그레이션 필요: **no** — 기존 docs 갱신 없음 (후속 PR부터 정본 참조 자연 채택)
- deprecation 일정: 없음. R-OPS-* prefix는 신규 운영 비기능 R-ID 체계로 정착, 향후 추가도 같은 prefix 사용
- 영향 사용자: agent-toolkit 도입 newProject들 — R-OPS-* 체계 채택 권고는 별도 upstream 이슈 (본 PR scope 밖)

## 5. Rollback 전략

- revert 가능: **yes** — `git revert <merge-sha>`로 04-srs §3 R-OPS-* 4건 + 13/02-catalog fan-in + ADR-0002 일괄 제거 가능
- rollback 절차 (3단계):
  1. `git revert <PR-#-merge-sha>` → 04-srs §3 / 13-catalog §2 / ADR-0002 모두 원상복귀
  2. ad-hoc `R-OPS-AUTO-LABEL` 재 도입 — 후속 PR에서 schema BLOCK 워크어라운드 그대로 사용
  3. Sprint 5/6 retro에서 본 PR 결정 재검토
- 데이터 손상 위험: **없음** — 모두 docs/markdown 변경

## 6. 비목표

- 다른 newProject(agent-toolkit upstream)에 R-OPS-* 체계 전파 — 별도 upstream 이슈 후보
- R-OPS-* 추가 4건 외 다른 운영 비기능 R-ID 신설 — 본 PR scope 한정 (정확히 #47/#51에서 사용된 영역 + 인접 운영 자동화 4건만)
- ADR-0029/0037/0040/0047 자체 갱신 (R-OPS-* prefix는 ADR 참조 정합으로 충분, ADR 본문 갱신 불필요)
- #48 TS 3건 수정 — 별도 Sprint 5 이슈
- branch `bug/` vs title prefix 정책 불일치 fix — 별도 Sprint 5 follow-up 이슈 (#51에서 발견)
- 13/02-catalog §3 E2E fan-in — R-OPS-*는 운영 자동화이므로 E2E 부적합 (§2 통합으로 충분)
