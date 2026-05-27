---
doc_type: feature-ai-qa
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
ui_changed: false
golden_path_verified: false
screenshots: []
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — AI QA Report

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 6축 PASS (5번째 사용자 override N/A), 3 profile smoke PASS, RTL 85 passed |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- **verdict: PASS**
- reviewer_at: 2026-05-27
- ui_changed: **false** (**사용자 명시 override** — 자동 판정은 `.tsx` 매칭으로 true이지만, **시각 변화 없음 + onClick handler 1줄 + 단위 RTL 2건으로 동작 충분 검증** 사유로 사용자 명시 false 채택. ADR-0011 §"감지 규칙" frontmatter 명시 override 허용)
- golden_path_verified: false (ui_changed=false override N/A)
- Flow Mode: **add** (ADR-0032 규칙 4 기본값 — type:feature 라벨 + "마무리" modify 시그널 1건 충돌이라 무질문 add 진행)
- Mode Decision Trace: type:feature 라벨 우선 → 부정 시그널 1건만 (modify "마무리") → 충돌 없음 → mode=add 자동 결정
- Touched Areas: 2개 (`frontend/src/components/` + `frontend/tests/unit/components/` + `docs/features/feat-tag-filter-url-state/`) — 3 카운트하면 ≥ 3, PR body Touched Areas 절 포함 가능

## 1. Test Plan 4블록

### Build

- [x] `bash .claude/scripts/validate-doc.sh` — 7 feature docs(brief·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report) 모두 OK
- [x] `pnpm typecheck` — 0 신규 errors (pre-existing TS 3건 #48 분리)

### Automated tests

- [x] `pnpm --filter @app/frontend run test:unit` — **85 passed + 1 skipped** (Sprint 4 baseline 83 + 2 신규 #18: it-5 active 재클릭 해제 / it-6 비-active 선택 회귀)
- [x] `pnpm run smoke:3profiles` — 3/3 PASS (dev 55ms / stg 42ms / prod 45ms) — R-OPS-SMOKE 자기 검증
- [x] manual reproduction (workflow 양축 ADR-0047) — R-OPS-WORKFLOW: `printf 'Closes #18' | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#'` → `18` PASS

### Manual verification

- [ ] AC-01 — `?tag=javascript` 진입 시 javascript 칩 active 시각 + 글 필터링 (사용자 시각 확인)
- [ ] AC-02 — active 태그 재클릭 → `?tag` 제거 + 전체 목록 (사용자 시각 확인, **본 PR 핵심**) — 단위 RTL it-5로 자동 검증 완료
- [ ] AC-03 — `?tag=js&page=2` 직접 진입 시 둘 다 적용 (사용자 시각 확인, Sprint 3 #12 회귀)
- [ ] 회귀-02 — 명시적 "필터 해제 ×" 버튼 동작 보존 (양 진입점)
- [ ] GitHub Actions 워크플로 로컬 검증 (manual reproduction): `printf 'Closes #18' | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#'` → `18` → PASS (workflow YAML 미변경 PR 양축, ADR-0047)

### DoD coverage

| Acceptance | PR diff | 검증 |
| --- | --- | --- |
| AC-01 (?tag=javascript active) | TagList.tsx active 분기 (line 33, 39) | 사람 + 기존 RTL it-2 |
| AC-02 (재클릭 → ?tag 제거) | TagList.tsx line 38 (`active ? null : tag.name`) | 사람 + 신규 RTL it-5 |
| AC-03 (?tag+?page 동시) | Home handleTagClick/handlePageChange (변경 없음) | 사람 (Sprint 3 #12 회귀) |
| DoD 1~8 | acceptance.md §2 | 자동 + 사람 |

## 2. AI 게이트 6축

| # | 축 | 결과 | 근거 |
| --- | --- | --- | --- |
| 1 | 자동 테스트 (단위/통합) | **PASS** | `pnpm --filter @app/frontend run test:unit` 85 passed + 1 skipped (+2 신규 RTL, 기존 83 회귀 0건). integration은 skipped 그대로(#11 follow-up) |
| 2 | 코드 리뷰 (Generator≠Evaluator) | **PASS** | reviewer subagent → `code-review.md` verdict=PASS, MAJOR 0, MINOR 0 (발견 사항 4건 모두 머지 비차단) |
| 3 | Test Plan 4블록 | **PASS** | §1 Build/Automated/Manual/DoD 4블록 모두 채움 |
| 4 | 시크릿 스캔 | **PASS** | TagList.tsx + test.tsx + 7 docs 검토 — DATABASE_URL/GITHUB_TOKEN 등 시크릿 노출 0건 (CLAUDE.md 보안 6 규칙 준수) |
| 5 | 브라우저 골든패스 실증 (ADR-0011) | **N/A (사용자 override)** | 자동 판정은 ui_changed=true(.tsx 매칭)이지만, **시각 변화 없음(onClick handler 1줄, 시각 동일) + 단위 RTL 2건으로 동작 충분 검증** 사유로 사용자 명시 false override. ADR-0011 §"감지 규칙" frontmatter 명시 override 허용. stylesheet 적용 확인 하위 체크도 N/A (Tailwind 기존 적용 변경 없음) |
| 6 | 로컬 부팅 가능성 (ADR-0037 v1.1) | **PASS** | §7 표 dev/stg/prod 3 profile 모두 ready + 에러 0건. 부팅 자산 변경 0건 → LOCAL.md 동기 N/A — R-OPS-DOCS-SYNC 자기 검증 |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| AC-01 ?tag=javascript active 시각 | acceptance.md §1 AC-01 | ⏳ Manual verification (단, 기존 RTL it-2가 aria-pressed 자동 검증 완료) |
| AC-02 active 재클릭 → ?tag 제거 | acceptance.md §1 AC-02 | **PASS** (신규 RTL it-5 `expect(onTagClick).toHaveBeenCalledWith(null)` 통과) + ⏳ Manual verification |
| AC-03 ?tag+?page 동시 | acceptance.md §1 AC-03 | ⏳ Manual verification (Sprint 3 #12 회귀 무영향) |
| 회귀-01 비-active 선택 | acceptance.md §4 | **PASS** (신규 RTL it-6 회귀 보호 통과) |
| 회귀-02 "필터 해제 ×" 버튼 보존 | acceptance.md §4 | **PASS** (기존 RTL it-2 통과) |
| 비기능 R-OPS-AUTO-LABEL 회귀 | acceptance.md §3 | P11 자동 + P14 머지 후 자연 관찰 (#51 회복 + #52 정본 등록 후 정상 동작) |

## 4. FAIL 항목

(없음 — verdict=PASS, MAJOR 0, MINOR 0)

## 5. 발견 사항 (Found Issues) — 파생 이슈 후보

| 후보 | 3축 OX | 권장 Command |
| --- | --- | --- |
| Home handleTagClick(null)에서 page 유지 옵션 — 사용자 선호 검토 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes UX 결정 ✅) → A.Derived | Sprint 5 retro에서 사용 경험 확인 후 follow-up |
| TagList 키보드 navigation Tab/Enter 보강 (a11y) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes a11y 영역 ✅) → A.Derived | Sprint 6+ a11y 보강 |
| home.integration.test.tsx skipped 해소 (MSW + vitest jsdom #11 follow-up) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 인프라 ✅) → A.Derived | Sprint 5 인프라 이슈 (기존 backlog) |
| gstack /qa LLM 환경 셋업 — 본 PR도 ui_changed override 패턴 사용 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 인프라 ✅) → A.Derived | Sprint 5 인프라 이슈 (Sprint 4 retro 기존 backlog) |

## 같은 PR 보정 필요

(없음 — reviewer MAJOR 0/MINOR 0)

## 6. UI/FE 변경 검증

ui_changed=false (**사용자 명시 override**). 자동 판정은 .tsx 매칭으로 true이지만 시각 변화 없음(onClick handler 1줄) + 단위 RTL 2건으로 동작 충분 검증 사유로 사용자 false 채택. ADR-0011 §"감지 규칙" frontmatter 명시 override 허용. gstack /qa·browse 바이너리·playwright 호출 사유 없음. 콘솔 에러 N/A 사전 합의 (시각/렌더 변화 없음, 0개). stylesheet 적용 0개, none (Tailwind 기존 적용 변경 없음).

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| N/A | N/A — ui_changed=false 사용자 override (시각 동일), gstack /qa·browse 바이너리·playwright 호출 사유 없음 | N/A | N/A — 0개, none (Tailwind 기존 변경 없음) |

## 7. 로컬 부팅 가능성

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 |
| --- | --- | --- | --- | --- |
| dev | `pnpm run smoke:dev` | `[smoke] backend ready in 55ms → GET /api/articles → 200 → PASS` | 0건 (DEP0190 dotenv-cli child_process 호출 Node 24 표준 경고 무관) | 없음 |
| stg | `pnpm run smoke:stg` | `[smoke] backend ready in 42ms → GET /api/articles → 200 → PASS` | 0건 | 없음 |
| prod | `pnpm run smoke:prod` | `[smoke] backend ready in 45ms → GET /api/articles → 200 → PASS` | 0건 | 없음 |

### 부팅 자산 변경 영향

| 자산 | 본 PR diff | 갱신 여부 |
| --- | --- | --- |
| `.env.dev.example` | 미포함 | 변경 없음 |
| `.env.stg.example` | 미포함 | 변경 없음 |
| `.env.prod.example` | 미포함 | 변경 없음 |
| `prisma/migrations/` | 미포함 | 변경 없음 |
| `pnpm-lock.yaml` | 미포함 | 변경 없음 |
| `package.json` (root + workspace) | 미포함 | 변경 없음 |
| `scripts/setup*.sh` | 미포함 | 변경 없음 |
| `LOCAL.md` | 미포함 | 변경 없음 → **LOCAL.md 동기 = N/A 부팅 자산 변경 없음** (ADR-0040 BLOCK 자연 통과, R-OPS-DOCS-SYNC 자기 검증) |

### LOCAL.md 동기 확인 (ADR-0040 / R-OPS-DOCS-SYNC)

부팅 자산 변경 0건 → LOCAL.md 갱신 불필요. N/A 사유: "본 PR은 frontend TagList.tsx onClick handler 1줄 + RTL 2건 + 6 feature docs. .env / migrations / lockfile / setup scripts / 부팅 명령 모두 무변경. LOCAL.md 동기 갱신 사유 없음."
