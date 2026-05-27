---
doc_type: retro
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: operations
related:
  R-ID: [R-F-02, R-F-03, R-F-05, R-F-06, R-F-07, R-F-08, R-N-02]
  F-ID: [F-03, F-04, F-05, F-06]
  supersedes: null
---

# Sprint 4 Retrospective

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — Sprint 4 4/4 머지 후 회고 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 |

## 0. 메타

- Sprint: **4**
- 기간: 2026-05-27 ~ 2026-05-27 (하루 — 사용자 집중 작업으로 마일스톤 마감 2026-06-08보다 12일 조기 완료)
- 이슈 결과: **4/4 완료 (100%)** — #14 Editor / #15 글 삭제 UX / #16 댓글 UI / #17 NotFound + ErrorBoundary 폴리시
- 머지 PR: #42 (b432718) / #43 (a3d31b7) / #44 (a8800f4) / #45 (11467cd)
- 라인 수 누적: 코드 ~700 + 테스트 ~600 + 문서 ~2500 = ~3800 LOC
- 단위 테스트: 25 (Sprint 3 baseline) → 83 passed (+58, Sprint 4 신규)
- ui_changed=true 발동: 4·5·6·7번째 (모두 PR #42·#43·#44·#45)

## 1. 잘 된 점 (Keep)

- **LLM 직접 build+test PASS baseline 확립** — PR #42부터 `export PATH="/c/Program Files/nodejs:$PATH"` git-bash PATH override로 typecheck·build·vitest 1·2·3·4 축 LLM 직접 PASS. Sprint 3까지 사용자 PowerShell 위임에서 진화. 5번째 축(브라우저 골든패스)만 사용자 위임.
- **ConfirmModal 신규(#15) → 재사용(#16) 패턴 검증** — `discriminated union ConfirmTarget = {type:'article'} | {type:'comment', commentId}` 으로 글/댓글 모달 단일 mount 분기. 컴포넌트 1개로 두 시나리오 깔끔 분리.
- **reviewer agent NEEDS-WORK 패턴 일관** — 4 PR 모두 PASS, MAJOR 0. MINOR는 같은 PR 보정 (1~2 commit 추가)으로 흡수. 별 follow-up PR 안 만듦.
  - PR #42: MINOR-01 React hook 순서 / MINOR-02 CommentList snapshot
  - PR #43: MINOR-1 useId / MINOR-2 onCancel ref pattern
  - PR #44: MINOR-01 useId / MINOR-02 textarea sm:min-h
  - PR #45: MINOR-F1 acceptance AC-04 색상 토큰 doc-only
- **R-N-02 보안 강제 진화** — PR #45에서 Toast `message: string` 타입 강제 + ErrorBoundary fallback 고정 한국어로 스택 미노출. backend errorHandler(#2 #9) + FE client(#11) 위에 FE 컴포넌트 보안 layer 추가.
- **8 docs 산출 패턴 확립** — brief/contract/plan/eng-review/acceptance/risk/code-review/ai-qa-report 한 PR당 일관 산출. schema validate-doc.sh BLOCK 매번 통과.
- **사용자 직접 머지 일관** — ADR-0046 §3 사용자 책임 3단(Manual ✅ + Approve + 머지 클릭) 사용자 직접 수행, LLM 대행 0건.

## 2. 아쉬운 점 (Problem)

- **P13 docs-update 누락** — PR #45 본체에 CHANGELOG + 13/02-catalog fan-in을 같이 박았어야 했는데 빠뜨림. 별도 PR #46으로 보정. **재발 방지**: AI 게이트 6축 다음 체크리스트에 "P13 docs-update가 같은 PR commit에 포함됐는가" 추가 검토.
- **pre-existing TS 에러 3건 미해소** — `client.ts:18 import.meta.env`, `routes.tsx:39·46 string|undefined` Sprint 3 #10·#11에서 발생, Sprint 4 내내 follow-up backlog로 미루기. typecheck를 strict CI 게이트로 못 박지 못함. **재발 방지**: Sprint 5 첫 follow-up 이슈로 등록 후 해결.
- **dev/stg/prod 3 profile script 부족** — frontend는 `dev`/`dev:stg`만 존재, `dev:prod` 없음. ADR-0037 v1.1 6번째 축이 schema-level BLOCK인데 N/A 사유로 흡수 중. **재발 방지**: Sprint 5 follow-up 이슈로 frontend `dev:prod` + backend 정합 추가.
- **gstack `/qa` LLM 직접 호출 환경 미구성** — Sprint 3·4 모두 사용자 browse 바이너리 + 사용자 캡처 패턴. 자동 스크린샷·콘솔 에러 grep 불가. **재발 방지**: Sprint 5 별도 인프라 이슈로 gstack 환경 셋업.
- **GitHub Actions sync-issue-labels.yml workflow 0 runs** — PR open 시 `status:in-progress` → `status:in-review` 자동 전이 실패 지속. Sprint 1 follow-up 4건 중 (iv) 미해소. 라벨 수동 정리 누적. **재발 방지**: Sprint 5 첫 이슈로 workflow 디버그.
- **컨텍스트 위생 임계 도달** — Sprint 4 마지막 #17 진입 시 7317줄 / 147k 토큰 누적, `/compact` 1회 강제. 4 PR 연속 작업이 단일 세션에서 가능했지만 LLM 비용·응답 속도 부담. **재발 방지**: 매 PR 머지 후 `/compact` 권장 휴리스틱 강화.

## 3. 시도할 것 (Try)

- **P13 docs-update를 PR template에 BLOCK으로** — `feature-ai-qa.schema.yaml`에 `p13_docs_update_included: {required: true}` 추가 검토. 단, 작은 변경에 과도할 수 있어 ADR로 결정 필요.
- **`ui_changed=true`인데 호출처 0건 케이스 정책** — Toast(#17)처럼 신규 컴포넌트가 본 PR에서 호출되지 않을 때 골든패스를 무엇으로 잡을지 정책 명문화. 현 패턴은 "회귀 보호 화면(NotFound)으로 대체" — 재사용 가능한 패턴이라면 ADR화.
- **Sprint 5 회고 시점에 follow-up backlog 일괄 등록** — Sprint 1·2·3·4 누적 22건이 백로그에 묶여 있음. Sprint 5 진입 전 GitHub 이슈로 일괄 등록 + 우선순위 배정.
- **reviewer agent 캐시 활용** — 매 PR reviewer agent 호출 시 trans 200k+ 토큰. 같은 codebase context 재사용 패턴 모색 (prompt cache 시간 활용).
- **테스트 카운트 모니터링 진입** — Sprint 4 종료 83 passed. Sprint 5는 E2E 추가 예정 → 100+ 도달 시 vitest split 또는 병렬화 검토.

## 4. carryover 이슈

| Issue | 사유 | 다음 스프린트 우선순위 |
| --- | --- | --- |
| (없음) | Sprint 4 마일스톤 4/4 완료, 미완 이슈 0건. carryover 없음. | N/A |

## 5. 신규 발견 이슈

| 패턴 | Issue | 처리 |
| --- | --- | --- |
| A. Derived | pre-existing TS 에러 3건 정정 (`client.ts:18`, `routes.tsx:39·46`) | Sprint 5 follow-up 이슈 신규 등록 권고 |
| A. Derived | branch prefix `(feat\|mod\|bug\|design)/` vs PR/이슈 title 정규식 `(feat\|fix\|chore\|docs\|test\|refactor)` 정책 불일치 — #51 발견 + #52에서 재확인 | **Sprint 5 #56 등록** (P1, type:chore, area:infra). WBS 23 이슈 + 후속 PR 다수 영향. 옵션 3건(정규식 확장 / branch prefix 변경 / 둘 다 ADR 명문화) 검토 |
| A. Derived | R-OPS-* 운영 비기능 R-ID 체계 신설 + 04-srs §3 정식 등록 | **Sprint 5 #52 PR #55 머지 완료** (merge_commit=43e26a0). ADR-0002 + 4건(AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC) + 13/02-catalog fan-in. #47/#51 ad-hoc 우회 정합 회복 |
| (정규) Sprint 5 | #18 태그 필터 UX 마무리 + URL state | **Sprint 5 #18 PR #58 머지 완료** (merge_commit=1f27461). TagList active 재클릭 해제 toggle 1줄 + RTL +2 (85 passed). URL state는 Sprint 3 #12에서 이미 구현, 본 PR은 toggle UX 마무리. ui_changed=false 사용자 override. #51/#52 회복 후 자연 회귀 확정 |
| A. Derived | frontend `dev:prod` script 신설 + backend 정합 (ADR-0037 N/A 해소) | Sprint 5 follow-up |
| A. Derived | RISK-03 deps 문구 정정 (`[data, status]` 권고 vs `[data]` 실제) | Sprint 5 follow-up (minor doc fix) |
| A. Derived | Toast portal·queue·stacking (Sprint 5+) | Sprint 5 또는 Sprint 6 backlog |
| A. Derived | ErrorBoundary Sentry 외부 송신 wiring | 별도 ADR + Sprint 6 후보 |
| C. Bug | GitHub Actions sync-issue-labels.yml workflow 0 runs 디버그 | **Sprint 5 #47 PR #49 (partial fix, merge_commit=67ae9cc) + #51 PR #53 (FULL fix, merge_commit=39bcef1, 2026-05-27) — ADR-0029 자동화 완전 회복**. #47 H4 가설(`default_workflow_permissions: read`)을 Settings API로 `write` 적용했으나 runs 0건 지속. #51에서 P3a 사용자 UI 협업(Settings → Actions → General 스크린샷 + Actions 페이지 "Actions Enabled." 일회성 배너 관찰)으로 **H6 가설 자연 확정**: GitHub은 신규 personal account의 신규 repo에 대해 owner가 Actions 탭을 직접 방문할 때까지 dispatcher를 silent로 비활성화 (inactive enable). 사용자 P3a 단계 Actions 탭 방문으로 활성화 완료 → 본 PR이 활성화 이후 첫 PR이므로 trigger 자연 발생으로 H6 확정 (실측: sync-issue-labels.yml open success + 머지 후 +1 = total 2 + 이슈 #51 라벨 자동 전이/close/제거 완료). issue-pr-title-lint.yml 동시 회복. 발견 사항 — branch `bug/` vs title 정규식 정책 불일치 (별도 follow-up 후보). |
| A. Derived | gstack `/qa` LLM 환경 셋업 (자동 스크린샷·콘솔 grep) | Sprint 5 인프라 이슈 |

## 6. 우선순위·일정 보정

- Sprint 4 마감(2026-06-08) 대비 12일 조기 완료 — Sprint 5 진입 가능 (마일스톤 마감 확인 필요)
- Sprint 5 마일스톤 진입 전 follow-up backlog 일괄 등록(22+건) 후 우선순위 배정 권고
- pre-existing TS 에러 3건은 P1로 격상 (CI strict mode 진입 차단 요인)

## 7. ADR / PLAN 갱신 항목

- (선택) ADR 신설 후보 — "ui_changed=true인데 호출처 0건 케이스의 골든패스 정책" (Toast #17 패턴 명문화)
- (선택) ADR 신설 후보 — "P13 docs-update 누락 방지 schema-level BLOCK" (현 ad-hoc → 정책화 여부 검토)
- `docs/planning/CHANGELOG.md` Current Status는 PR #46에서 갱신 완료
- `docs/planning/13-test-design/02-catalog.md` v0.12는 PR #46에서 fan-in 완료
- 15-risk.md 신규 추가 항목 없음 (Sprint 4 RISK 모두 Low + 본 PR 내 해소)
