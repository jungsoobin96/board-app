---
doc_type: feature-contract
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

# bug-pre-existing-ts-errors-fix — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — frontend TS 에러 3건 정정 contract (이슈 #48) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-F-08 (라우팅), R-N-02 (에러 응답 — 간접) |
| F-ID (기능) | 05-prd | (none) |
| 영향 모듈 | 08-lld-module-spec | frontend/router (M1), frontend/api (M3) |
| 영향 엔드포인트 | 09-lld-api-spec | (none) |
| 적용 컨벤션 절 | 11-coding-conventions | §1 명명 (vite-env.d.ts ambient declaration 표준 명명) |

## 1. 변경 의도

frontend `pnpm typecheck` exit 0 baseline 확보를 위해 pre-existing TS 에러 3건(client.ts:18 `import.meta.env`, routes.tsx:39·46 `match[1]`)을 정정한다. 본 변경은 *type-only* — runtime 동작 변경 0건, R-ID 동작 회귀 0건.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `frontend/src/vite-env.d.ts` | 부재 | 신설 — `interface ImportMetaEnv { readonly VITE_API_URL: string }` + `interface ImportMeta { readonly env: ImportMetaEnv }` (Vite 표준 ambient declaration) |
| `frontend/src/api/client.ts:18` | `(import.meta.env.VITE_API_URL as string \| undefined) ?? 'http://localhost:3000/api'` — TS2339 `Property 'env' does not exist on type 'ImportMeta'` | 동일 코드 유지 (vite-env.d.ts 신설로 `ImportMeta.env` 타입 자동 인식 → 에러 사라짐). `as string \| undefined` cast는 fallback 의미 보존을 위해 유지 |
| `frontend/src/router/routes.tsx:39` | `return { name: 'article', params: { id: articleMatch[1] } };` — TS2322 `Type 'string \| undefined' is not assignable to type 'string'` | `return { name: 'article', params: { id: articleMatch[1]! } };` — non-null assertion 추가 (regex `[^/]+` quantifier로 group [1] 존재 보장) |
| `frontend/src/router/routes.tsx:46` | `return { name: 'editor', params: { id: editorIdMatch[1] } };` — TS2322 동일 | `return { name: 'editor', params: { id: editorIdMatch[1]! } };` — non-null assertion 추가 |
| `pnpm --filter @app/frontend typecheck` | 에러 3건 + exit 1 | 에러 0건 + exit 0 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/api/client.ts:18` (BASE_URL 정의) | `import.meta.env.VITE_API_URL` 타입 인식 변경 (any → string) — runtime 동작 동일 | 코드 변경 0건 (vite-env.d.ts 신설로 자동 해결) |
| `frontend/src/main.tsx` 등 client.ts import 사용자 | 영향 없음 (BASE_URL은 module-internal, exports 변경 0건) | 코드 변경 0건 |
| `frontend/src/router/routes.tsx:39` `matchRoute('/article/:id')` 호출자 | runtime 동작 동일 (`articleMatch[1]`은 regex 매칭 성공 시 항상 string) — `!` assertion은 *type-only* | 코드 변경 0건 |
| `frontend/src/router/routes.tsx:46` `matchRoute('/editor/:id')` 호출자 | 동일 (runtime 변경 0건) | 코드 변경 0건 |
| `frontend/tests/unit/router/routes.test.ts` (matchRoute 단위 테스트) | runtime 동작 변경 0건 → 기존 테스트 100% PASS | 코드 변경 0건 (회귀 검증으로만 사용) |
| `frontend/tests/unit/api/client.test.ts` (client 단위 테스트) | 동일 (vitest의 vite import.meta.env mock 자동 처리) | 코드 변경 0건 (회귀 검증으로만 사용) |

## 4. Backward Compatibility

- **Breaking**: **no** (type-only 변경, runtime 동작 변경 0건)
- **마이그레이션 필요**: no
- **deprecation 일정**: N/A (기능 제거 없음)

**근거**: vite-env.d.ts는 ambient declaration으로 runtime 코드 0줄 emit. `match[1]!` non-null assertion도 TS 컴파일 시 사라지는 type-only operator. 따라서 본 PR의 코드 변경은 *type 시스템* 차원에서만 의미를 가지며, JavaScript runtime 동작은 main `475cf2e` 시점과 100% 동일하다.

## 5. Rollback 전략

- **revert 가능**: yes (squash 단일 commit revert)
- **rollback 절차**:
  1. `gh pr revert <PR_N>` 또는 `git revert <squash-commit-sha>` (PR 머지 후 main 단일 commit)
  2. `pnpm install` 재실행 (lockfile 변경 없으므로 sync 자체 no-op)
  3. `pnpm --filter @app/frontend typecheck`로 rollback 후 baseline 복원 확인 (TS 에러 3건 재현 + exit 1)
- **데이터 손상 위험**: 없음 (코드 변경 — DB·migration 없음)

## 6. 비목표

- CI workflow에 typecheck step 추가 — 본 PR scope 밖, 별 이슈 후보 (이슈 DoD §6 선택 항목)
- 다른 frontend 모듈의 typing 보강 (예: store, hooks) — 본 PR은 명시된 3건만 정정
- backend·shared·e2e workspace typecheck 정정 — 본 PR 직접 영향 없음
- runtime 동작 변경 — 본 PR은 *type-only*
- tsconfig 옵션 변경 (예: `noUncheckedIndexedAccess: false` override) — strict mode 약화 → 거부 (investigation.md §6 대안 검토)
