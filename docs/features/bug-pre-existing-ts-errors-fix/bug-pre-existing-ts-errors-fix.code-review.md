---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: []
  supersedes: null
---

# bug-pre-existing-ts-errors-fix — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — verdict=PASS, 발견 사항 0건 (이슈 #48) |

## 0. Verdict

**PASS** — PR 생성 진입 허가.

- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-28

근거: 2 commit 모두 contract Before/After 정합 + plan §1 DAG 100% 매핑 + 회귀 정본 검증(typecheck 0 + frontend 86 + backend 64 + 통합 36) 전수 PASS. 보안 규칙 위반 0건. 시크릿 노출 0건. 가독성 단순 (3 line + 2 char 추가).

## 1. 컨트랙트 충실도

- [x] **§0 Referenced-IDs 정합**: R-F-08·R-N-02 (라우팅·에러 응답 간접) — 본 PR이 영향 모듈 frontend/router·frontend/api에만 변경 가함 (R-F-08 routes.tsx + R-N-02 client.ts BASE_URL fallback type 인식)
- [x] **§2 Before/After 5행 정합**:
  - vite-env.d.ts 신설 ✅ (`frontend/src/vite-env.d.ts:1-7` — `ImportMetaEnv` + `ImportMeta` interface)
  - client.ts:18 코드 그대로 ✅ (commit 0 line 변경, vite-env.d.ts로 자동 해결)
  - routes.tsx:39 `articleMatch[1]!` ✅ (commit `c36db17`)
  - routes.tsx:46 `editorIdMatch[1]!` ✅ (commit `c36db17`)
  - typecheck exit 0 ✅ (검증 PASS)
- [x] **§3 호출자·의존자 표 6행 정합**: 모든 호출자가 "코드 변경 0건" 명시 — 실제 diff에서도 client.ts·main.tsx 등 import 사용자 0건 변경 확인
- [x] **§4 Backward Compatibility**: Breaking=no, 마이그레이션 N/A, deprecation N/A — type-only 변경 정합 ✅

## 2. 테스트 커버리지

- [x] **AC-R-01 typecheck PASS** — `pnpm --filter @app/frontend typecheck` exit 0 + 에러 0건 (검증 완료)
- [x] **AC-R-02 frontend vitest** — 86 passed + 1 skipped (Sprint 6 baseline 동일, 회귀 0건)
- [x] **AC-R-03 vite build** — PASS, dist/ 생성 (3.27s)
- [x] **AC-R-04 backend** — 64 passed / 0 failed (회귀 0건 — 본 PR 영향 없음 확인)
- [x] **AC-R-05 통합** — 36 passed (회귀 0건)
- [x] **AC-R-06 matchRoute 단위 테스트** — frontend vitest 86 PASS에 포함, runtime 동작 변경 0건 확정 증거
- [x] **e2e 회귀**: 본 PR scope 밖 (e2e는 별 workspace), 변경 영향 없음 — Sprint 6 baseline 5 PASS 유지 가정 + P10 AI QA에서 검증

회귀 테스트 신설 N/A — investigation.md §7 + plan.md §3 명시 (type-only 결함, typecheck 자체가 정본).

## 3. 보안 / 시크릿

- [x] **시크릿 노출 0건** — vite-env.d.ts는 *type 선언만* (`readonly VITE_API_URL?: string`), 값 노출 0건. ENV 값은 dev 기본값 `http://localhost:3000/api` fallback 유지
- [x] **CLAUDE.md 보안 규칙 6건 모두 준수**:
  1. .env 커밋 0건 (frontend/.env* unchanged, 본 PR diff에 .env 0건)
  2. 시크릿 값 포함 0건 (코드·로그·commit msg·PR body 모두 점검)
  3. 환경변수 출력 명령 0건 (cat .env / echo / printenv 미사용)
  4. 보안 파일 경로 미수정 (vite-env.d.ts는 *.env 아님 — TypeScript ambient declaration 파일)
  5. settings.json PreToolUse 훅 미트리거 (Write/Edit 차단 0건)
  6. /cso 보안 점검 — 본 변경은 type-only로 보안 영향 0건, /cso skip 적절
- [x] **OWASP 점검 N/A** — runtime 동작 0건 변경

## 4. 가독성 / 단순성

- [x] **diff 크기**: 2 files changed, +9 -2 lines (vite-env.d.ts 신설 7 line + routes.tsx 2 line non-null assertion `!`)
- [x] **명명**: `ImportMetaEnv` / `ImportMeta` (Vite 공식 표준 명명, 11-coding-conventions §1 PascalCase interface 정합)
- [x] **단순성**: non-null assertion `!` 단일 char 추가 — dead code 없음, 가드 추가 시 dead branch 발생 → 단순성 우위
- [x] **죽은 코드/TODO/debug print 0건** (diff 전수 점검)

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| (사전 합의) | 본 PR 검토 중 신규 발견 후보 0건 | — | — | "## 같은 PR 보정 필요" 절·"## 발견 사항 — 파생 이슈 후보" 절 모두 N/A |

후속 작업 후보 1건 (eng-review §6에서 식별, 별 이슈 등록 권장):
- **CI workflow typecheck step 추가** (이슈 #48 DoD §6 선택 항목) — 본 PR 머지 후 typecheck 0 에러 baseline 확보. 별 PR로 `.github/workflows/`에 추가 가능. *3축 OX: scope 밖(✅) + 부모 PR 머지 가능(✅) + 다른 영역(✅) — A. Derived 후보. 사용자 결정 대기.*

## 6. NEEDS-WORK 항목

없음 — PR 생성 즉시 허가.
