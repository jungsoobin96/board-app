# board-app — Planning / Sprint Changelog

> 본 파일은 `docs/planning/`의 운영 메타 — sprint 모드 정본 마커 (CLAUDE.md v6 Addendum §"Meta Routing" + `/context-loader` mode 감지 룰). 게이트 PASS·머지된 이슈·외부 쓰기 결과를 시간순 기록.

## Current Status

- **Mode**: sprint
- **Active Sprint**: Sprint 2 — 댓글 + 태그 API + 통합 회귀 (마감 2026-05-30)
- **Sprint 1 진행**: 5/5 완료 (#1·#2·#3·#4·#5 모두 머지) — Sprint 1 100% COMPLETE
- **Sprint 2 진행**: 2/4 머지 + 1 in-review (#6 PR #34 + #7 PR #35 머지, #8 PR OPEN 본 PR) — Sprint 2 75%
- **Gates**: A=PASS, B=PASS, C=PASS (2026-05-25)
- **Branch protection**: 미적용 (Sprint 1 follow-up 권고)
- **`pr-body-checkboxes` status check workflow**: 미등록 (Sprint 1 follow-up 권고)
- **Currently in review**: PR #N (이슈 #8, cascade rollback 시나리오 추가 — R-F-07 매트릭스 완결)
- **Sprint 2 Follow-up 이슈 후보**: (1) asyncHandler 유틸 분리 (3 controller 중복 확정) / (2) tags integration 시드 Promise.all 최적화 (60+ await)
- **Sprint 1 Follow-up 이슈 후보** (미등록, 별 진행): (a) CI smoke job 신설 / (b) pollReady fetch body 명시 cancel / (c) engines `>=20.11.0` 정정 / (d) GitHub Actions workflows 0 runs 진단 + sync-issue-labels.yml 복구 / (e) 13/02-catalog F-12 fan-in (Sprint 6)

## History (시간 역순)

### 2026-05-26 (Sprint 2 진입)

- **PR #N OPEN** — `test(backend): cascade 무결성 통합 회귀 (#8)`. Sprint 2 세 번째 이슈. cascade.integration.test.ts에 rollback 시나리오 1건 추가 (기존 2 + 신규 1 = 3 케이스). `prisma.$transaction async fn throw → 자동 rollback → 4 테이블 모두 0건` 검증. R-F-07 검증 매트릭스 완결 (schema-level CASCADE + 트랜잭션 wrapper 양축). 1 commit / +29 lines (test only, src 0). reviewer agent verdict=PASS, MAJOR 0/MINOR 0/INFO 2.
- **PR #35 머지** — `feat(backend): 태그 API + 정렬·상한 + 통합 (#7)`. Sprint 2 두 번째 이슈. 09 §3 GET /api/tags 1 endpoint 신설 — `routes/tags.ts` + `controllers/tags.controller.ts` + `services/tag.service.ts` + `repositories/tag.repo.ts` 신설. **09 API spec 9/9 endpoint 완결**. 6 commits / +1111 -6. Prisma `_count.articleTags` orderBy + take 20 native. articles·comments 패턴 답습. AI 게이트 3·4·5(N/A) PASS + 1·2·6 사용자 위임. reviewer agent verdict=PASS, MAJOR 0/MINOR 2/INFO 3. 13/02-catalog v0.3: F-02·F-08 §1·§2 fan-in. 사용자 직접 머지 (ADR-0046 §3). merge_commit=1dbb642.
- **PR #34 머지** — `feat(backend): 댓글 API (CRD, 수정 없음) + 통합 (#6)`. Sprint 2 첫 이슈. backend HTTP layer 3 endpoint 신설 (GET 200 / POST 201 / DELETE 204). 7 commits / +553 -0. 09 API spec 8/9 충족. articles(#4) 패턴 답습 — `Router({ mergeParams: true })` + article.repo.findById 재사용 + asyncHandler 패턴. AI 게이트 3·4·5(N/A)축 PASS + 1·2·6축 사용자 P14 위임. reviewer agent verdict=PASS, MAJOR 0건. 13/02-catalog v0.2: F-05 fan-in. 15-risk v0.3: RISK-16 신설 (mergeParams 누락 회귀 패턴). 사용자 직접 머지 (ADR-0046 §3 정상). merge_commit=e49e20a.
- **PR #33 머지** — `feat(infra): 3 profile 부팅 smoke 자동화 (#5)`. Sprint 1 마지막 이슈. ADR-0037 v1.1 6번째 AI 게이트 축 정식 충족 baseline 도입. merge_commit=3e96b5a. Sprint 1 100% COMPLETE.
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

- **Sprint 1 마감 (2026-05-28)**: ✅ 완료 (2026-05-26 PR #33 머지 — 100%)
- **Sprint 2 마감 (2026-05-30)**: 댓글 API (#6, 본 PR) + 태그 API (#7) + cascade·에러 schema 통합 회귀 (#8·#9·#10)
- **Sprint 3~6**: FE 골격 → 작성·수정·삭제 UX → 마무리·E2E → README·평가 기준
- **운영 메타 보강**: branch protection 9개 + `pr-body-checkboxes` workflow + CI workflow (pnpm lint·typecheck·test) + CI smoke job (Sprint 1 follow-up)
- **Sprint 2+ 모든 PR**: `pnpm smoke:3profiles` 결과를 Manual verification 1줄로 첨부 가능 — Sprint 1 #5 baseline 확보. 단 LLM 세션 node PATH 부재 케이스는 사용자 P14 위임 그대로 사용 가능.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 — sprint 모드 정본 마커 신설 (Issue #2 PR에 포함, /context-loader mode 감지 정상화) |
| v0.2 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #5 PR #33 — Sprint 1 진행 4/5 + #5 OPEN 갱신 + History 2026-05-26 추가 + Follow-up 이슈 후보 4건 명시. ADR-0037 v1.1 6번째 축 정식 충족 baseline 진입 안내. |
| v0.3 | 2026-05-26 | woosung.ahn@bespinglobal.com | Sprint 1 100% COMPLETE + Sprint 2 진입 (#6 PR OPEN) 갱신. Sprint 1 5/5 머지 확정 (#1~#5). 다음 마일스톤 표 갱신. Sprint 2 follow-up 1건(asyncHandler 분리) 명시. |
| v0.4 | 2026-05-26 | woosung.ahn@bespinglobal.com | Sprint 2 1/4 머지 + #7 PR OPEN 갱신. #6 PR #34 머지 (사용자 직접). 09 API spec 9/9 완결. Sprint 2 follow-up +1 (tags integration 시드 Promise.all 최적화). |
| v0.5 | 2026-05-26 | woosung.ahn@bespinglobal.com | Sprint 2 2/4 머지 + #8 PR OPEN 갱신. #7 PR #35 머지 (사용자 직접, merge_commit=1dbb642). R-F-07 매트릭스 완결 (rollback 시나리오 추가). |
