# board-app — Planning / Sprint Changelog

> 본 파일은 `docs/planning/`의 운영 메타 — sprint 모드 정본 마커 (CLAUDE.md v6 Addendum §"Meta Routing" + `/context-loader` mode 감지 룰). 게이트 PASS·머지된 이슈·외부 쓰기 결과를 시간순 기록.

## Current Status

- **Mode**: sprint
- **Active Sprint**: **Sprint 5 — 마무리·반응형·E2E** (마일스톤 마감 2026-06-10, 마일스톤 #5)
- **Sprint 1 진행**: 5/5 완료 — 100% COMPLETE
- **Sprint 2 진행**: 4/4 완료 (#6·#7·#8·#9 모두 머지) — **Sprint 2 100% COMPLETE**
- **Sprint 3 진행**: 4/4 완료 (#10·#11·#12·#13 모두 머지) — **Sprint 3 100% COMPLETE**
- **Sprint 4 진행**: 4/4 완료 (#14 PR #42, #15 PR #43, #16 PR #44, #17 PR #45 모두 머지) — **Sprint 4 100% COMPLETE 🎉**
- **Sprint 5 진행**: 3/N (#47 PR #49 partial fix + #51 PR #53 FULL fix H6 확정 + **#52 PR #55 R-OPS-* 정식 등록 + ADR-0002**) / 등록 backlog: #48·#56 (P1, branch/title prefix 정책)
- **Gates**: A=PASS, B=PASS, C=PASS (2026-05-25)
- **Branch protection**: 미적용 (Sprint 1 follow-up 권고)
- **`pr-body-checkboxes` status check workflow**: 미등록 (Sprint 1 follow-up 권고)
- **`sync-issue-labels.yml` 자동 라벨 전이**: ✅ **FULL fix** (PR #53, merge_commit=39bcef1) — H6 가설(GitHub은 신규 personal account의 신규 repo에 대해 owner가 Actions 탭을 직접 방문할 때까지 dispatcher를 silent로 비활성화 = inactive enable) 자연 확정. 5일간 전역 0건 → PR #53 open 즉시 trigger 발생 + 머지 시 추가 trigger. ADR-0029 자동화 완전 회복 — 본 PR 머지 후 이슈 #51 `Closes #51` 자동 close + `status:in-review` 라벨 자동 제거 실측 완료. **issue-pr-title-lint.yml**도 동시 회복 (ADR-0021 정규식 강제). #47 PR #49 H4 fix는 보존(보안 강화 조치 유지)
- **Currently in review**: 없음
- **Sprint 4 Follow-up 이슈 후보** (#14·#15·#16·#17 발견, 미등록): (A) pre-existing TS 에러 3건 정정 (`client.ts:18 import.meta.env`, `routes.tsx:39·46 string|undefined`) / (B) dev/stg/prod profile script 신설 (`dev:stg`/`dev:prod` 부족) / (C) RISK-03 deps 문구 정정 (`[data, status]` 권고 vs `[data]` 실제) / (D) Toast portal·queue·stacking (Sprint 5+) / (E) ErrorBoundary Sentry 외부 송신 (별도 ADR)
- **Sprint 3 Follow-up 이슈 후보** (#10·#11·#12·#13 발견, 미등록): (1) Pretendard self-host / (2) frontend smoke 3 profile / (3) matchRoute trailing slash / (4) frontend/src/index.ts placeholder / (5) Component primitives (Sprint 4) / (6) vite-env.d.ts / (7) request() headers spread / (8) MSW 2.x + vitest jsdom 통합 디버깅 / (9) Home 에러 재시도 버튼 / (10) Pagination ellipsis truncation / (11) formatDate 유틸 분리 (#13 MINOR-01) / (12) seed:dev idempotent 보장 (id 매번 증가)
- **Sprint 2 Follow-up 이슈 후보** (미등록): (a) asyncHandler 유틸 분리 (3 controller 중복) / (b) tags integration 시드 Promise.all / (c) error-schema afterEach mock 단순화
- **Sprint 1 Follow-up 이슈 후보** (미등록): (i) CI smoke job 신설 / (ii) pollReady fetch body 명시 cancel / (iii) engines `>=20.11.0` 정정 / (iv) GitHub Actions workflows 0 runs + sync-issue-labels.yml / (v) 13/02-catalog F-12 fan-in (Sprint 6)

## History (시간 역순)

### 2026-05-27 (Sprint 5 — #52 PR #55 R-OPS-* 정식 등록 + ADR-0002)

- **PR #55 머지** — `docs(plan): 04-srs §비기능 R-OPS-* 4건 정식 등록 + ADR-0002 (#52)`. Sprint 5 **세 번째 PR (3/N)**. **mode=modify** (title `mod(docs):` modify 시그널 + 04-srs 기존 §3 정본 본문 갱신). #47/#51에서 ad-hoc 워크어라운드로 사용한 `R-OPS-AUTO-LABEL`을 04-srs 정본에 정식 등록 + **운영 비기능 R-ID 체계(R-OPS-* prefix)** 4건 통합 — R-OPS-AUTO-LABEL(ADR-0029, P0) / R-OPS-SMOKE(ADR-0037 v1.1, P0) / R-OPS-WORKFLOW(ADR-0047, P0) / R-OPS-DOCS-SYNC(ADR-0040, P1). **ADR-0002 신설** (mode=modify Strict Rule) — 대안 3건 검토(A: R-N 통합 / B: 16번째 산출 / C: schema 완화) 후 R-OPS-* prefix 채택 + 명명 규칙(`R-OPS-<SUFFIX>` + ADR 출처 명시) 명문화. 13/02-catalog §2 R-OPS-* 4건 fan-in + §4 매트릭스 4행 추가(단위 N/A / 통합 ✅ / E2E N/A 패턴), frontmatter v0.4 → v0.13 (기존 v0.5~v0.12와 충돌 회피), status Draft → Accepted. 04-srs frontmatter v0.1 (Draft) → v0.2 (Accepted) + related.R-ID에 R-OPS-* 4건 추가. ADR INDEX 0002 등록 + frontmatter v0.1 → v0.2. 7 feature docs(contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 mode=modify N/A). reviewer agent PASS (MAJOR 0/MINOR 2 — INDEX frontmatter version 누락 + 13-catalog v0.5 중복, 둘 다 같은 PR에서 보정 완료). 3 profile smoke PASS (dev ~70/stg 45/prod 57ms). **PR title은 `docs(plan):` 사용** (ADR-0021 정규식 정합 — branch `mod/` prefix와 불일치 발견은 별도 follow-up #56로 등록). 사용자 직접 머지 merge_commit=43e26a0. AC-01~04 모두 PASS (grep/awk/validate/check-test-catalog-sync). 후속 PR(#48 등)부터 R-OPS-* 정본 참조 가능 — ad-hoc 우회 불필요.
- **Issue #56 신규 등록** — `mod(infra): 이슈/PR title-lint 정규식에 mod|bug|design 추가 또는 branch prefix 정책 수정 (#51, #52에서 발견)`. P1, type:chore, area:infra. R-ID=R-OPS-WORKFLOW. **#51/#52에서 재확인된 정책 불일치** — branch prefix `(feat|mod|bug|design)/` vs title-lint 정규식 `(feat|fix|chore|docs|test|refactor)`. WBS 23 이슈 + 후속 PR 다수 영향. 옵션 3건(A: 정규식 확장 / B: branch prefix 변경 / C: 둘 다 ADR로 명문화) 검토 후 결정 필요.

### 2026-05-27 (Sprint 5 — #51 PR #53 FULL fix, H6 확정)

- **PR #53 머지** — `fix(infra): workflow 전역 0 runs — Actions dispatcher 첫 활성화 cycle 진단 (#51)`. Sprint 5 **두 번째 PR (2/N)**. **mode=bug** (type:bug 라벨 자동 감지). **코드 변경 0건 진단/관찰 PR** — 8 docs(investigation·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report) + 2 스크린샷(settings-actions-general + actions-page). **H6 가설 자연 확정** — #47 H4 fix(`default_workflow_permissions: write`) 후에도 runs 0건 지속 → P3a 단계 사용자 GitHub UI 협업(Settings → Actions → General 스크린샷 + Actions 페이지 상단 "Actions Enabled." 일회성 배너 관찰)으로 root cause 식별: *GitHub은 신규 personal account의 신규 repo에 대해 owner가 Actions 탭을 직접 방문할 때까지 dispatcher를 silent로 비활성화*. 사용자 P3a 단계 Actions 탭 방문(2026-05-27 21:37)으로 dispatcher 활성화 완료 → 본 PR push가 활성화 이후 첫 PR이므로 trigger 자연 발생으로 H6 확정. **검증 실측**: PR open 직후 sync-issue-labels.yml conclusion=success + issue-pr-title-lint.yml conclusion=success(title `bug(infra):` → `fix(infra):` 정정 후 edited 재 trigger) + 이슈 #51 라벨 `status:in-progress` → `status:in-review` 자동 전이 + 머지 후 sync runs total=2(open+close) + 이슈 #51 `Closes #51`로 자동 close + `status:in-review` 자동 제거. reviewer agent verdict=PASS, MAJOR 0/MINOR 2 (schema-level non-blocking). 3 profile smoke PASS (dev 69ms/stg 56ms/prod 58ms). 사용자 직접 머지 merge_commit=39bcef1. **ADR-0029 자동화 완전 회복**. 발견 사항: **branch prefix `bug/` vs PR/이슈 title 정규식 `(feat|fix|chore|docs|test|refactor)` 정책 불일치** (WBS 23 이슈 다수 `bug(...)` prefix 패턴, 이슈 lint 자체가 0 runs였으므로 미발견) — Sprint 5 별도 follow-up 후보.

### 2026-05-27 (Sprint 5 진입 — #47 partial fix)

- **PR #49 머지** — `bug(infra): sync-issue-labels.yml workflow 0 runs — FSM 라벨 자동 전이 회복 (#47)`. Sprint 5 **첫 PR (1/N)**. **mode=bug** (type:bug 라벨 자동 감지). H4 가설(`default_workflow_permissions: read`) Settings API로 `write` 적용 + workflow YAML에 concurrency PR-번호별 namespace + Issue #47 참조 주석 보강. 8 docs 산출 (investigation·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report). reviewer agent verdict=PASS (MAJOR 0/MINOR 1 doc-only — R-OPS-AUTO-LABEL ad-hoc R-ID는 04-srs §비기능 신설 후속 후보). 3 profile smoke PASS (dev 49ms / stg 62ms / prod 822ms). 단위 frontend 83 + backend 64 = 147 PASS 유지. 사용자 직접 머지 merge_commit=67ae9cc. ⚠️ **partial fix — H4 부분 충족**: Settings 변경 성공·workflow YAML 보강 완료지만 본 PR open/closed 이벤트에도 workflow runs *여전히 0건*. `gh api .../actions/runs` 전체도 0건 (Cache 0 bytes). 두 workflow 모두 state=active + Actions enabled=true + public repo + branch protection 부재인데 trigger 발생 안 함. GitHub UI Settings → Actions → General에서 추가 toggle 확인 필요. 이슈 #47은 `Closes #47`로 자동 close됐으나 라벨 자동 정리는 미동작 → 라벨 수동 제거(`status:in-progress`).

### 2026-05-27 (Sprint 4 — 100% COMPLETE)

- **PR #45 머지** — `feat(frontend): NotFound + ErrorBoundary 폴리시 (#17)`. Sprint 4 **마지막 PR (4/4)**. Toast 컴포넌트 신규 (~50 LOC, success/error variant + auto-dismiss 3000ms + role="alert" + 닫기 버튼 + `message: string` 타입 강제로 R-N-02 스택 노출 차단 + useEffect cleanup으로 setTimeout 누수 차단). NotFound·ErrorBoundary 기존 컴포넌트 회귀 보호 단위 테스트 추가 (9 case — Toast 4 / NotFound 2 / ErrorBoundary 3 with 스택 미노출 검증). 기존 `App.tsx`·`routes.tsx`·`NotFound.tsx`·`ErrorBoundary.tsx` 수정 0건. 3 commits / +931 lines (코드 145 + 문서 786). **ui_changed=true 7번째 발동** (사용자 캡처 위임). reviewer verdict=PASS, MAJOR 0/MINOR 1 (doc-only). MINOR-F1 acceptance AC-04 색상 토큰 secondary-500 정정 같은 PR 보정 완료 (acceptance v0.3). 단위 83/84 + 1 skip = 83 passed (74 baseline + 9 신규). **Sprint 4 100% COMPLETE 🎉**. 사용자 직접 머지 merge_commit=11467cd. 13/02-catalog v0.12 fan-in: R-F-08 §1 FE (NotFound 회귀 보호) + R-N-02 §1 FE (ErrorBoundary 스택 미노출 + Toast 타입 강제 layer).
- **PR #44 머지** — `feat(frontend): 댓글 작성·삭제 UI (#16)`. Sprint 4 **세 번째 PR**. CommentForm 신규 (controlled body·author + M9 정합 인라인 검증 + body reset/author 유지 + NormalizedError alert). CommentList onDelete optional prop 추가. Article 댓글 흐름 결합 — commentsLocal useState mirror + 응답 후 prepend(낙관적 갱신 X) + ConfirmModal 재사용(#15) + confirmTarget discriminated union으로 글/댓글 모달 단일 mount 분기. 4 commits / +500 lines. **ui_changed=true 6번째 발동** — 사용자 검증 + 검증 에러/추가/삭제 스크린샷 3장. reviewer verdict=PASS, MAJOR 0/MINOR 2/INFO 2. MINOR-01 useId / MINOR-02 textarea sm:min-h 같은 PR 보정 (ef775cb). 단위 74 + 1 skip = 75 passed. ConfirmModal 재사용 검증 완료 — 같은 컴포넌트로 두 시나리오 잘 분기. 사용자 직접 머지 merge_commit=a8800f4. 13/02-catalog v0.11: R-F-05·R-F-06 §1 FE 시나리오 fan-in.
- **PR #43 머지** — `feat(frontend): 글 삭제 UX + cascade 시각 확인 (#15)`. Sprint 4 **두 번째 PR**. ConfirmModal 컴포넌트 신설 (~125 line, role="dialog" + aria-modal + useId + ESC + 최소 focus trap + controlled error pattern). Article handleConfirmDelete + cascade 시각. 6 commits / +400 lines. ui_changed=true 5번째 발동. reviewer PASS (MAJOR 0/MINOR 2/INFO 2). MINOR-1·2 같은 PR 보정 (ac9c798). 단위 66/67 + 1 skip. 사용자 직접 머지 merge_commit=a3d31b7.
- **PR #42 머지** — `feat(frontend): Editor 페이지 (글 작성·수정) (#14)`. Sprint 4 **첫 PR**. Editor placeholder → 실 form (controlled 4 필드 + 인라인 검증 + createArticle/updateArticle + navigate). EditorForm 컴포넌트 신설 + Editor 신구 분기 + Article "수정" 버튼 결합. 4 commits / +600 lines. ui_changed=true 4번째 발동. reviewer PASS (MAJOR 0/MINOR 2/INFO 3). MINOR-01 같은 PR 보정 (9b62059). **Sprint 4 첫 LLM 직접 build+test PASS** baseline. 사용자 직접 머지 merge_commit=b432718.

### 2026-05-27 (Sprint 3 — 100% COMPLETE)

- **PR #41 머지** — `feat(frontend): Article 상세 페이지 + 댓글 목록 (#13)`. Sprint 3 **마지막** 이슈. Article placeholder → 실 상세 — useArticle/useComments hook (5상태 + AbortController signal forwarded) + CommentList 컴포넌트 + 404 → NotFound 직 렌더 + invalid id 가드. 수정/삭제 버튼 mount만 (Sprint 4 #14·#15에서 결합). 4 commits / +420 lines. **ui_changed=true 3번째 발동** — 사용자 검증 PASS + Article 스크린샷 첨부. reviewer verdict=PASS, MAJOR 0/MINOR 3/INFO 4. MINOR-02 같은 PR 보정 (b7fa398). 사용자 직접 머지 merge_commit=15ccfdf. **Sprint 3 100% COMPLETE**.
- **PR #40 머지** — `feat(frontend): Home 페이지 (#12)`. Sprint 3 세 번째. Home placeholder → 실 사용자 노출 페이지. **ui_changed=true 2번째 발동**. 사용자 직접 머지. merge_commit=85ab113.
- **PR #39 머지** — `feat(frontend): api-client + shared types + 에러 정규화 (#11)`. Sprint 3 두 번째. shared DTO 4종 + 9 endpoint wrap + NormalizedError. 사용자 직접 머지. merge_commit=8340fa4. 25/25 unit PASS.
- **PR #38 머지** — `feat(frontend): frontend 골격 + Vite + Tailwind + Router + 토큰 (#10)`. Sprint 3 첫 PR. ui_changed=true 첫 발동 — 사용자 PowerShell `pnpm install` + frontend dev + 5 path 브라우저 검증 + Home 스크린샷 첨부. 사용자 직접 머지. merge_commit=e87a781.

### 2026-05-26 (Sprint 2)

- **PR #37 머지** — `test(backend): 에러 schema 통일 통합 회귀 (#9)`. Sprint 2 마지막 이슈. error-schema.integration.test.ts 신설 — 12 it 케이스. R-N-02 매트릭스 완결. 사용자 직접 머지. merge_commit=56bf57f. **Sprint 2 100% COMPLETE**.
- **PR #36 머지** — `test(backend): cascade 무결성 통합 회귀 (#8)`. Sprint 2 세 번째 이슈. cascade rollback 시나리오 1건 추가. R-F-07 매트릭스 완결. 사용자 직접 머지. merge_commit=80024aa.
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
| v0.6 | 2026-05-26 | woosung.ahn@bespinglobal.com | Sprint 2 3/4 머지 + #9 PR OPEN 갱신. #8 PR #36 머지 (사용자 직접, merge_commit=80024aa). R-N-02 매트릭스 완결 (12 통합 it 추가). Sprint 2 마지막 이슈 — 머지 시 100% 완결. |
| v0.7 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Sprint 2 100% COMPLETE + Sprint 3 진입 (#10 PR OPEN). #9 PR #37 머지 (merge_commit=56bf57f). frontend 골격 실 도입 — ui_changed=true 첫 발동. Sprint 3 follow-up 5건 명시. |
| v0.8 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Sprint 3 1/4 머지 + #11 PR OPEN. #10 PR #38 머지 (merge_commit=e87a781). api-client + shared types 도입. reviewer 1차 NEEDS-WORK → 같은 PR 보정 → 재검수 PASS. Sprint 3 follow-up +2 (vite-env.d.ts / request headers spread). |
| v0.9 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Sprint 3 2/4 머지 + #12 PR OPEN. #11 PR #39 머지 (merge_commit=8340fa4). Home 페이지 실 구현. reviewer 1차 NEEDS-WORK (MAJOR-01 signal) → 보정 → 재검수 PASS. 39/40 unit + 1 skip (MSW 2.x + vitest jsdom). Sprint 3 follow-up +3 (MSW 디버깅 / 재시도 버튼 / Pagination truncation). |
| v0.10 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Sprint 3 3/4 머지 + #13 PR OPEN. #12 PR #40 머지 (merge_commit=85ab113). Article 상세 + 댓글 목록 실 구현. reviewer PASS (MAJOR 0). MINOR-02 같은 PR 보정. 48/49 unit + 1 skip. Sprint 3 follow-up +2 (formatDate 유틸 / seed:dev idempotent). 본 PR 머지 시 Sprint 3 100% 완결. |
| v0.11 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **Sprint 3 100% COMPLETE** (#13 PR #41 머지, merge_commit=15ccfdf) + Sprint 4 진입 (#14 PR OPEN). Editor 페이지 실 form 구현. EditorForm controlled + Editor 신구 분기. 09 API spec createArticle/updateArticle 첫 사용처. reviewer PASS (MAJOR 0/MINOR 2). MINOR-01 (React hook 순서) 같은 PR 보정. 59/60 unit + 1 skip. ui_changed=true 4번째 발동. |
| v0.12 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **Sprint 4 1/4 머지 (#14 PR #42 = b432718) + Sprint 4 #15 PR OPEN**. Article 삭제 흐름 결합 — ConfirmModal 신규 + Article handleConfirmDelete + cascade 시각. reviewer PASS (MAJOR 0/MINOR 2/INFO 2). MINOR-1·2 같은 PR 보정 (ac9c798). 66/67 unit + 1 skip. ui_changed=true 5번째 발동. 13/02-catalog v0.10: R-F-03·R-F-07 §1 FE 시나리오 추가. |
| v0.13 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **Sprint 4 2/4 머지 (#15 PR #43 = a3d31b7) + Sprint 4 #16 PR OPEN**. 댓글 작성·삭제 UI — CommentForm 신규 + CommentList onDelete + Article 댓글 흐름 결합 + ConfirmModal 재사용(#15) + confirmTarget discriminated union. 응답 후 추가(낙관적 갱신 X). reviewer PASS (MAJOR 0/MINOR 2/INFO 2). MINOR useId·textarea 반응형 같은 PR 보정 (ef775cb). 74/75 unit + 1 skip. ui_changed=true 6번째 발동. ConfirmModal 재사용 첫 검증. 13/02-catalog v0.11: R-F-05·R-F-06 §1 FE 시나리오 추가. |
| v0.14 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **Sprint 5 진입 + #47 PR #49 partial fix 머지** (merge_commit=67ae9cc). bug(infra) sync-issue-labels.yml workflow 0 runs — H4 가설(`default_workflow_permissions: read`) Settings API로 `write` 적용 + workflow YAML concurrency 보강 + Issue #47 주석. 8 docs 산출 (investigation/contract/plan/eng-review/acceptance/risk/code-review/ai-qa-report). reviewer PASS (MAJOR 0/MINOR 1 doc-only R-OPS-AUTO-LABEL ad-hoc). 3 profile smoke PASS (dev 49ms/stg 62ms/prod 822ms). ⚠️ **partial fix**: Settings 적용 성공·workflow YAML 보강 완료지만 전역 workflow runs 여전히 0건 — GitHub UI 추가 toggle/plan 확인 필요. 이슈 #47 `Closes #47`로 자동 close + 라벨 수동 정리(`status:in-progress` 제거). Sprint 4 retro §5 P0 항목에 partial fix 결과 반영. 본 PR 머지 후 누락된 PR #45·#46 history 행도 별도 docs PR 후보. |
| v0.15 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **#51 PR #53 FULL fix 머지** (merge_commit=39bcef1) — **ADR-0029 자동화 완전 회복**. fix(infra) workflow 전역 0 runs — H6 가설(Actions dispatcher 첫 활성화 cycle, neww personal account + new repo의 inactive enable 상태) 자연 확정. P3a 단계 사용자 GitHub UI 협업(Settings → Actions → General 스크린샷 + Actions 페이지 "Actions Enabled." 일회성 배너)으로 root cause 식별. 코드 변경 0건 진단/관찰 PR — 8 docs + 2 스크린샷 (815 +lines). reviewer agent PASS (MAJOR 0/MINOR 2 schema-level). 3 profile smoke PASS (dev 69/stg 56/prod 58ms). 실측 결과: sync-issue-labels.yml 5일 0건 → PR open 즉시 success + 머지 후 +1 (total=2) + 이슈 #51 `status:in-review` 자동 전이 + 머지 후 자동 close + 라벨 자동 제거. issue-pr-title-lint.yml 동시 회복(title prefix 정정 후 success). Sprint 5 진행 2/N. 발견 사항 — **branch `bug/` prefix vs title `(feat\|fix\|chore\|docs\|test\|refactor)` 정규식 정책 불일치** (Sprint 5 follow-up 후보, WBS 23 이슈 다수 영향). #47 H4 fix는 보존(보안 강화 조치). |
| v0.16 | 2026-05-27 | jungsoobin96@users.noreply.github.com | **#52 PR #55 R-OPS-* 정식 등록 + ADR-0002 머지** (merge_commit=43e26a0). docs(plan) 04-srs §3 비기능에 R-OPS-* 4건(AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC) 정식 등록 + ADR-0002 신설(mode=modify Strict Rule, 대안 3건 검토) + 13/02-catalog §2 fan-in + §4 매트릭스 4행 + ADR INDEX 0002 등록. 04-srs status Draft → Accepted, 13-catalog v0.4 → v0.13 + status Accepted, ADR INDEX v0.1 → v0.2. reviewer PASS (MAJOR 0/MINOR 2 — INDEX frontmatter + v0.5 중복, 둘 다 같은 PR 보정). 3 profile smoke PASS. PR title `docs(plan):` (ADR-0021 정합) + branch `mod/` (ADR-0044 정합) 불일치 발견은 #56 follow-up로 분리. Sprint 5 진행 3/N. 후속 PR부터 R-OPS-* 정본 참조 가능. **#56 신규 등록** (P1, type:chore, area:infra — title-lint 정규식 vs branch prefix 정책 불일치 fix). |
