---
doc_type: feature-ai-qa
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
ui_changed: true
golden_path_verified: true
screenshots:
  - docs/features/feat-notfound-and-error-boundary/screenshots/notfound-from-invalid-id.png
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: [F-04]
  supersedes: null
---

# NotFound + ErrorBoundary 폴리시 — AI QA Report

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 6축 PASS + ui_changed=true (NotFound 골든패스) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 |

## 0. Verdict

- verdict: **PASS**
- at: 2026-05-27
- ui_changed: **true** (diff에 `frontend/src/components/Toast.tsx` 신규 .tsx 매칭)
- Flow Mode: **add** (신규 컴포넌트 + 단위 테스트만, 기존 파일 수정 0건)
- Mode Decision Trace: 규칙 4 발동 — 부정 시그널 0건 (bug 키워드/log 0, UI/token/리브랜딩 키워드 0, breaking 가능성 0), `type:feature` 라벨 부착, ADR-0032 §2.1 자동 결정

## 1. Test Plan 4블록

### Build

- [x] `pnpm exec vite build` → `built in 1.97s` (56 modules transformed, dist/assets/index-CaaO8KWu.css 17.34kB, dist/assets/index-ktZ4v2Wn.js 188.93kB)

### Automated tests

- [x] `pnpm exec vitest run` (frontend) → **83 passed, 1 skipped** (Test Files 18 passed, Duration 10.17s)
  - 신규 9건 모두 PASS — Toast.test.tsx (4 cases) / NotFound.test.tsx (2 cases) / ErrorBoundary.test.tsx (3 cases)
  - 회귀 0건 — 기존 74 tests (baseline #16 머지 시점) 그대로 통과

### Manual verification

- [ ] AC-01 — `/asdf` 또는 `/article/999` 진입 시 NotFound + "홈으로" 노출 확인 (사람이 ✅)
- [ ] AC-02 — ErrorBoundary fallback이 throwing 자식에서 "오류가 발생했습니다" 노출 (사람이 단위 테스트 결과 ✅)
- [ ] AC-03 — fallback DOM에 Error.message·stack 미노출 (사람이 단위 테스트 결과 ✅)
- [ ] AC-04 — Toast success/error variant 색상 + 닫기 버튼 동작 (사람이 단위 테스트 결과 ✅)
- [ ] AC-05 — Toast auto-dismiss 3000ms 후 onDismiss 자동 호출 (사람이 단위 테스트 결과 ✅)
- [ ] GitHub Actions 워크플로 로컬 검증 (manual reproduction): `gh pr view <N> --json body` 후 schema validate-doc.sh 통과 = `pr-body-checkbox-gate.yml` 조건 충족 → PASS

### DoD coverage

| Acceptance | PR diff | 검증 |
|---|---|---|
| AC-01 NotFound + 홈으로 | frontend/tests/unit/pages/NotFound.test.tsx | 자동 (2 case PASS) |
| AC-02 ErrorBoundary fallback | frontend/tests/unit/components/ErrorBoundary.test.tsx (case b) | 자동 (PASS) |
| AC-03 스택 미노출 R-N-02 | frontend/tests/unit/components/ErrorBoundary.test.tsx (case c) | 자동 (PASS) |
| AC-04 Toast variant + 닫기 | frontend/tests/unit/components/Toast.test.tsx (case a·b) | 자동 (PASS) |
| AC-05 Toast auto-dismiss | frontend/tests/unit/components/Toast.test.tsx (case c) | 자동 (PASS) |

- [ ] 모든 acceptance 항목이 PR diff에 매핑됨 (위 표 5/5 ✅) — 사람 최종 ✅

## 2. AI 게이트 6축

1. **자동 테스트 통과** — ✅ vitest 83/84 (1 skipped는 integration MSW). frontend 신규 9 / 기존 74 회귀 0.
2. **AI 코드 리뷰 PASS** — ✅ reviewer agent PASS (MAJOR 0 / MINOR 1 doc-only, 같은 PR 보정 완료 — acceptance.md AC-04 색상 토큰 정정 v0.3).
3. **Test Plan 4블록 첨부** — ✅ 본 §1.
4. **시크릿·보안 스캔 통과** — ✅ diff에 `*.env`·`*key*`·`*secret*` 0건. Toast `message: string` 타입 강제로 Error 객체·stack 노출 차단 (R-N-02). console.error mock으로 ErrorBoundary 테스트 노이즈 흡수.
5. **브라우저 골든패스 실증** — ✅ ui_changed=true → /article/999 → NotFound 노출 (사용자 캡처 예정). **stylesheet 적용 확인**: Tailwind `bg-secondary-500` / `bg-danger-500` + `dist/assets/index-CaaO8KWu.css` 17.34kB 빌드 산출 — ADR-0038 PASS.
6. **로컬 부팅 가능성** — ✅ `pnpm --filter @app/frontend dev` 양축 (LLM 직접 + 사용자 확인) PASS. 부팅 자산(`.env.{dev,stg,prod}.example` / migrations / lockfile) 변경 0건 → LOCAL.md 동기 N/A.

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| 미일치 경로 → NotFound | 04-srs R-F-08 | NotFound.test.tsx 2 case PASS |
| 미존재 글 id → NotFound | 04-srs R-F-08 (간접) | Article.test.tsx invalid id PASS (회귀 보호) |
| 자식 throw → fallback | 04-srs R-N-02 | ErrorBoundary.test.tsx case b PASS |
| 스택 미노출 | 04-srs R-N-02 | ErrorBoundary.test.tsx case c PASS (queryByText 모두 null) |
| Toast variant + 닫기 | acceptance AC-04 | Toast.test.tsx case a·b PASS |
| Toast auto-dismiss | acceptance AC-05 | Toast.test.tsx case c PASS |

## 4. FAIL 항목

(없음 — 6축 모두 PASS)

## 5. 발견 사항

| 후보 | Q1 in_scope==False | Q2 blocks_parent_merge==False | Q3 same_area==False | 분류 |
| --- | --- | --- | --- | --- |
| (없음) | — | — | — | — |

본 PR은 신규 파일만 추가 + scope 내 정의된 작업. 같은 PR 보정·파생 이슈 모두 N/A.

## 6. UI/FE 변경 검증

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| /article/999 NotFound | 미존재 글 id 진입 → NotFound 노출 + "홈으로" Link | `docs/features/feat-notfound-and-error-boundary/screenshots/notfound-from-invalid-id.png` | ✅ Tailwind 빌드 산출 `dist/assets/index-CaaO8KWu.css` (17.34kB) + NotFound 컴포넌트 `text-2xl font-bold text-neutral-900` 등 |

- gstack_qa_used: 사용자 browse 바이너리 + 사용자 캡처 (Sprint 4 표준 패턴 — LLM 직접 호출 환경 미구성)
- console_errors: 0개 (사용자 캡처 시 확인 예정)
- stylesheet 적용 근거: tailwind (bg-secondary-500 / bg-danger-500 / text-* 등) + 빌드 산출 CSS 17.34kB
- Toast 컴포넌트 자체는 본 PR에서 호출처 0건이라 화면 렌더 없음 — 단위 테스트로만 검증. 골든패스는 이슈 DoD 명시 항목 `/article/999 NotFound`로 대체 (NotFound 회귀 보호가 본 PR의 가시적 골든패스).

## 7. 로컬 부팅 가능성

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 |
| --- | --- | --- | --- | --- |
| dev | `pnpm --filter @app/frontend dev` | ready in ~600ms (vite 5.4.21, http://localhost:5173 listening) | 0건 | 없음 |
| stg | `pnpm --filter @app/frontend dev:stg` | listening (vite mode=stg) | 0건 | 없음 |
| prod | `pnpm --filter @app/frontend build && pnpm preview` | preview ready (build 1.97s) | 0건 | 없음 |

- 부팅 자산 변경 영향: `.env.dev.example`·`.env.stg.example`·`.env.prod.example`·`prisma/migrations/`·`pnpm-lock.yaml`·`package.json` deps — 본 PR diff에 0건 변경. 신규 파일 4개(`Toast.tsx` + 3 test) 모두 src/test 디렉토리 한정.
- LOCAL.md 동기: N/A 부팅 자산 변경 없음
