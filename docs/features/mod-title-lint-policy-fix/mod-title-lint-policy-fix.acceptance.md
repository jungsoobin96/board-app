---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-OPS-WORKFLOW]
  F-ID: []
  supersedes: null
---

# mod-title-lint-policy-fix — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — AC 3건 + DoD 6 + 회귀 AC-R-05 (이슈 #56) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: workflow regex 9 type 확장 + 본 PR 자기 검증

- **Given** 본 PR title `mod(infra): expand title-lint regex to 9 commit types (#56)` (또는 동치 `mod(infra):` 접두 title), R-ID: R-OPS-WORKFLOW
- **When** PR open 또는 edit 이벤트로 `.github/workflows/issue-pr-title-lint.yml`이 트리거됨
- **Then** lint conclusion=success (본 PR title이 신규 9 type 정규식에 정합)
- **측정 방법**: 자동 테스트 — GitHub Actions UI에서 `issue-pr-title-lint` job conclusion=success 확인

### AC-02: 기존 6 type lint PASS 유지 (superset 회귀 없음)

- **Given** 신규 정규식 적용 후 임의의 기존 type title (예: `feat(auth): X`, `fix(ui): Y`, `chore(ci): Z`, `docs(plan): W`, `test(api): V`, `refactor(svc): U`), R-ID: R-OPS-WORKFLOW
- **When** Phase 5 manual reproduction 명령 `echo "<title>" | grep -qE '<new-regex>'` 실행
- **Then** 6 type 모두 grep exit 0 (PASS) — 기존 회귀 0건
- **측정 방법**: 수동 확인 — plan.md §4 Phase 5 옵션 B `grep -qE` 실행 후 6 type 전수 PASS 확인

### AC-03: ADR-0003 신설 + INDEX 동기

- **Given** 본 PR diff에 `docs/planning/adr/0003-title-lint-and-branch-prefix-separation.md` 신설 + `docs/planning/adr/INDEX.md` 1줄 entry 추가, R-ID: R-OPS-WORKFLOW
- **When** `bash .claude/scripts/validate-doc.sh docs/planning/adr/0003-*.md` 실행
- **Then** validate OK + INDEX entry 형식이 기존 ADR 0001/0002와 정합
- **측정 방법**: 자동 테스트 — validate-doc.sh exit 0

## 2. Definition of Done (D-06)

본 PR 머지 가능 조건 6 게이트 (CLAUDE.md / sprint-cycle.md §2 D-06):

- [ ] **단위 테스트**: N/A 명시 — 본 PR은 workflow YAML + 신설 ADR 변경, 코드 0줄. 회귀 정본 = baseline 인용 + manual reproduction (plan.md §4 Phase 5 옵션 B)
- [ ] **AI 게이트**: D-06 1단 — `/qa-test --ai` 6축 PASS (ui_changed=false / golden_path N/A / stylesheet N/A / 3 profile baseline 인용 / workflow YAML 양축 검증 act 또는 manual)
- [ ] **Test Plan 4블록**: PR body Build / Automated tests / Manual verification / DoD coverage 모두 작성. Manual verification + DoD coverage는 미체크 (ADR-0046)
- [ ] **tested 라벨**: ADR-0046 v1.2 폐지 — 머지 게이트는 `pr-body-checkboxes` status check가 자동 발행 (사람이 Manual + DoD 체크박스 ✅ 완료 시 PASS). 라벨 자체 N/A
- [ ] **Approve**: 사람 리뷰어 ≥ 1 (branch protection §5.1)
- [ ] **CI green**: GitHub Actions 전 job conclusion=success (issue-pr-title-lint 본 PR title 자기 검증 PASS 포함)

## 3. 비기능 인수

- **성능**: workflow regex 변경 1줄, GitHub Actions runner 성능 영향 0건 (POSIX ERE grep 1회 호출 — 미세)
- **보안**: workflow GITHUB_TOKEN 사용 변경 없음 (permissions block 그대로). 신설 ADR 산출에 시크릿 노출 0건
- **운영성**: ADR-0003 명문화로 후속 PR 작성 시 사용자 혼란 ↓ (workflow MSG 본문 9 type 안내 동기 갱신)

## 4. 회귀 인수

- **AC-R-01**: frontend typecheck — `pnpm --filter @app/frontend typecheck` exit 0 (baseline 인용 가능 — 코드 0 변경)
- **AC-R-02**: frontend vitest 86+ PASS (baseline 인용)
- **AC-R-03**: backend test 64 PASS + integration 36 PASS (baseline 인용)
- **AC-R-04**: 3 profile 부팅 (dev/stg/prod) baseline 인용 — 부팅 자산 0 변경 (.env / docker-compose / migrations / package.json / LOCAL.md 모두 영향 없음)
- **AC-R-05**: workflow self-test — `grep -qE '<new-regex>'` 명령으로 본 PR title `mod(infra): ...` + 6 기존 type 전수 PASS 확인 (plan.md §4 Phase 5 옵션 B)
