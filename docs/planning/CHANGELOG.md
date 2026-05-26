# board-app — Planning / Sprint Changelog

> 본 파일은 `docs/planning/`의 운영 메타 — sprint 모드 정본 마커 (CLAUDE.md v6 Addendum §"Meta Routing" + `/context-loader` mode 감지 룰). 게이트 PASS·머지된 이슈·외부 쓰기 결과를 시간순 기록.

## Current Status

- **Mode**: sprint
- **Active Sprint**: Sprint 1 — 환경 세팅 + 글 API (마감 2026-05-28)
- **Sprint 1 진행**: 4/5 머지 + 1 in-review (#1·#2·#3·#4 완료, #5 PR #33 OPEN) → 본 PR 머지 시 Sprint 1 100%
- **Gates**: A=PASS, B=PASS, C=PASS (2026-05-25)
- **Branch protection**: 미적용 (별 이슈 등록 권고)
- **`pr-body-checkboxes` status check workflow**: 미등록 (별 이슈 등록 권고)
- **Currently in review**: PR #33 (이슈 #5, 3 profile 부팅 smoke 자동화)
- **Follow-up 이슈 후보** (Issue #5 PR #33 검토 중 발견, P15 머지 후 등록): (1) CI smoke job 신설 / (2) pollReady fetch body 명시 cancel / (3) engines `>=20.11.0` 정정 / (4) GitHub Actions workflows 0 runs 진단 + sync-issue-labels.yml 복구

## History (시간 역순)

### 2026-05-26

- **PR #33 OPEN** — `feat(infra): 3 profile 부팅 smoke 자동화 (#5)`. Sprint 1 마지막 이슈. `scripts/smoke.ts` 신설 + backend/root `package.json` scripts 보강 + `LOCAL.md` §2/§3/§4 + v0.3 + `12-scaffolding/typescript.md` §5/§7 + v0.2 동기. ADR-0037 v1.1 6번째 AI 게이트 축(3 profile boot smoke) **정식 충족 baseline** 도입. 8 commits / +1203 -8. AI 게이트 4축 PASS + 5축 N/A(ui_changed=false) + 1·2·6축 사용자 P14 위임(node PATH 부재 외부 의존 장애 승인). 같은 PR 보정: validate-doc.sh `ui_changed=false` falsy 처리 결함 수정 (`yq '// ""'` → 직접 null 체크). reviewer agent verdict=PASS, MAJOR 0건.
- **PR #32 머지** — `feat(api): articles 5 엔드포인트 신설 + cascade HTTP 발현 (#4)`. Sprint 1 4/5 진입.
- **PR #31 머지** — Sprint 1 회귀 보완 (이전 PR 흔적).
- **PR #30 머지** — Sprint 1 환경 보완 (이전 PR 흔적).

### 2026-05-25

- **PR #29 머지** — `chore(infra): monorepo 스캐폴딩 및 빌드·lint 골격` (Issue #1 close). board-app 첫 코드 도입 — pnpm workspaces 4종(@app/frontend·backend·shared·e2e) + tsconfig composite + ESLint flat + Prettier + EditorConfig + .gitignore Node 패턴.
- **PR #28 머지** — `chore(plan): fix 0001 ADR schema 정합` — 0001 ADR을 adr.schema.yaml 정합(gate=C·한국어 번호 헤딩·Consequences 3 sub·검토된 대안 채택안+대안 N)으로 재구조.
- **PR #27 머지** — `chore(plan): bootstrap adr/ folder + 0001 toolkit-adoption` — `docs/planning/adr/` 신설(ADR-0013·0015·0031 1수준 16건 충족) + INDEX.md(toolkit 측 참조 ADR 13건 reference index) + 0001 toolkit 도입 결정 ADR.
- **PR #26 머지** — `docs(plan): bootstrap planning artifacts (01~15) + WBS` — NEW_PROJECT Phase 1~3 산출 일괄(brief·feasibility·user-scenarios·SRS·PRD·architecture·HLD·LLD-module/api/screen·conventions·scaffolding·test-design·WBS·risk) + policies/(branch·PR).
- **Gate C PASS** — `/plan-eng-review` VERDICT=PASS. 1수준 16/16 폴더 + 정합 12/12 + Schema 20/22(policies/* 2건은 toolkit 카피 인공물로 분리).
- **sprint-bootstrap 완료** — GitHub repo `jungsoobin96/board-app` + 25 issue (#1~#25) + 6 milestone (M1~M6, Sprint 1~6) + 라벨 schema (status:·priority:·type:·area:).
- **Gate A·B PASS** — `/flow-init` 산출 (brief·feasibility·user-scenarios·SRS·PRD) 모두 schema PASS.

### 2026-05-22

- **agent-toolkit 도입** — `chore(toolkit): initial agent-toolkit import (install.sh)` (commit 5d59039). newProject board-app 부트스트랩. CLAUDE.md·.claude/·docs/planning/policies/·LOCAL.md 카피.

## 다음 마일스톤 (예정)

- **Sprint 1 마감 (2026-05-28)**: PR #33 (이슈 #5) 머지 시 Sprint 1 100% 완료 → Sprint 2 진입
- **Sprint 2 (2026-05-30)**: 댓글 API + 태그 API + cascade·에러 schema 통합 회귀
- **Sprint 3~6**: FE 골격 → 작성·수정·삭제 UX → 마무리·E2E → README·평가 기준
- **운영 메타 보강**: branch protection 9개 + `pr-body-checkboxes` workflow + CI workflow (pnpm lint·typecheck·test) + CI smoke job (#5 follow-up)
- **PR #33 머지 후 효력**: Sprint 2+ 모든 PR이 `pnpm smoke:3profiles` 결과를 Manual verification 1줄로 첨부 가능 — ADR-0037 v1.1 6번째 축 N/A 위임 baseline 종결.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 — sprint 모드 정본 마커 신설 (Issue #2 PR에 포함, /context-loader mode 감지 정상화) |
| v0.2 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #5 PR #33 — Sprint 1 진행 4/5 + #5 OPEN 갱신 + History 2026-05-26 추가 + Follow-up 이슈 후보 4건 명시. ADR-0037 v1.1 6번째 축 정식 충족 baseline 진입 안내. |
