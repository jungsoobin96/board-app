---
doc_type: feature-investigation
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

# bug-pre-existing-ts-errors-fix — Bug Investigation

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — Sprint 3 이후 pre-existing TS 에러 3건 원인 분석 (이슈 #48 mode=bug 강제) |

## 1. 현상 / 보고

`pnpm --filter @app/frontend typecheck` 실행 시 다음 3건 TS 에러가 Sprint 3 PR #38·#39(frontend 골격 + api-client 통합) 머지 이후 Sprint 4·5·6 4 PR(#14·#15·#16·#17·#18·#19·#20·#22·#23·#24·#25 baseline에서 동일 재현)에서 지속 관찰됨. 모든 PR이 "main 동일 — 본 PR 신규 0건"으로 흡수해 머지함. CI strict mode(typecheck FAIL 시 머지 차단)를 못 박지 못한 직접적 원인.

```
src/api/client.ts(18,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
src/router/routes.tsx(39,41): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/router/routes.tsx(46,40): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

## 2. 재현 절차

1. main 최신 (`475cf2e`, 2026-05-28 #25 PR #68 머지 직후) checkout
2. `pnpm install` (의존성 동기 — frozen lockfile)
3. `cd frontend && pnpm typecheck` 또는 루트에서 `pnpm --filter @app/frontend typecheck`
4. **재현 결과**: 위 §1 인용 3건 에러 + exit 1
5. **회귀 검증 (Sprint 4 baseline)**:
   - `pnpm --filter @app/frontend test:unit` → 86 PASS / 0 FAIL (회귀 0)
   - `pnpm --filter @app/frontend exec vite build` → PASS (vite는 typecheck 무관, esbuild가 transpile만 수행)
6. **3건 에러가 모두 동일 commit에서 재현됨** — fresh checkout으로 신호 일관성 검증 완료

## 3. 환경 / 컨텍스트

| 항목 | 값 |
| --- | --- |
| Node | v22.20.0 (root `package.json` `engines.node >=20`) |
| pnpm | 9.x (root `package.json` `packageManager` 명시) |
| TypeScript | 5.x (root `package.json` deps) |
| tsconfig (frontend) | `extends: ../tsconfig.base.json` + `lib: [ES2022, DOM, DOM.Iterable]` + `jsx: react-jsx` |
| tsconfig.base | `strict: true`, **`noUncheckedIndexedAccess: true`**, `noImplicitAny: true`, `moduleResolution: Bundler` |
| Vite | 5.x (frontend deps) — `import.meta.env` 표준 사용 |
| `frontend/src/vite-env.d.ts` | **부재** (Vite 표준 ambient declaration 미설정) |
| `frontend/src/router/routes.tsx` | line 39·46 regex `match[1]` 직접 사용 (가드 없음) |

## 4. 로그·증적

본 §1·§2의 typecheck 출력이 직접적 증적. 추가:

- **회귀 baseline (2026-05-28 main `475cf2e`)**:
  - `pnpm --filter @app/frontend test:unit` → 86 tests passed (+1 skip) / 0 failed
  - `pnpm --filter @app/frontend exec vite build` → PASS, dist/ 생성됨
  - `pnpm --filter @app/backend test` → 64 PASS / 0 FAIL
  - 통합 36 + e2e 5 = 191 PASS baseline (Sprint 5·6 동일 유지)
- **Sprint 4·5·6 PR 회귀 흔적**: 11개 PR(#14·15·16·17·18·19·20·22·23·24·25) 모두 ai-qa-report.md에 "main 동일 — 본 PR 신규 0건" 명시 (정확히 3건만)

## 5. 가설 + 근거

| 가설 | 근거 | 검증 방법 | 결과 |
| --- | --- | --- | --- |
| H1: vite-env.d.ts 부재로 `ImportMetaEnv` 타입 미선언 | `frontend/src/*.d.ts` glob 결과 부재 (`ls frontend/src/*.d.ts` → No such file). Vite 공식 docs는 `vite-env.d.ts` 신설 + `/// <reference types="vite/client" />` 또는 동등 interface 선언 권장 | vite-env.d.ts 신설 후 typecheck 재실행 → client.ts:18 에러 사라지는지 확인 | **채택** — 원인 1 확정 |
| H2: tsconfig.base `noUncheckedIndexedAccess: true`가 regex match group을 `string \| undefined`로 추론 | tsconfig.base.json line 11 `"noUncheckedIndexedAccess": true` 확인. TS 4.1+에서 본 옵션은 모든 인덱스 접근(`array[i]`, `regex.exec()[1]`)을 `T \| undefined`로 추론 | `routes.tsx:39,46`에서 `match[1]!` non-null assertion 또는 가드 추가 후 typecheck 재실행 → 에러 사라지는지 확인 | **채택** — 원인 2 확정 |
| H3: TypeScript 버전 차이로 인한 inference 변화 | TS 5.x 일관 사용, 버전 회귀 흔적 없음. Sprint 3 이후 동일 재현 | TS 버전 downgrade 시도 시 신규 회귀 위험 — 검증 비용 ↑ 채택 거부 | **기각** |
| H4: 빌드 도구(vite)가 typecheck를 수행해 에러를 흡수 | `vite build`는 esbuild transpile만 수행, typecheck 안 함. `pnpm typecheck`는 별개 script `tsc --noEmit` | `vite build` PASS + `pnpm typecheck` FAIL 동시 관찰 → 두 도구는 독립 | **기각** (별개 도구 — 본 PR은 typecheck 0 에러 baseline만 확보, vite build는 회귀 0건 검증으로만 사용) |

## 6. 근본 원인 (Root Cause)

두 독립 원인의 조합:

1. **vite-env.d.ts 부재** — Sprint 3 PR #38·#39 frontend 골격 구성 시 Vite 표준 ambient declaration 파일을 신설하지 않음 → `ImportMeta` interface가 `env` 속성을 알지 못함 → `import.meta.env.VITE_API_URL` 접근 시 TS2339 발생
2. **`noUncheckedIndexedAccess: true` + regex match group 직접 접근** — tsconfig.base에 strict typing 옵션 enable + `routes.tsx:39,46`에서 `articleMatch[1]` / `editorIdMatch[1]`을 가드 없이 `params: { id: string }`에 할당 → TS2322 발생. regex `/^\/article\/([^/]+)$/.exec(pathname)`이 match 객체를 반환했다는 것은 group [1]이 존재함을 보장하지만(`[^/]+` quantifier), TypeScript의 inference는 이를 알지 못함

해결 후보 2개 (이슈 body §Contract 명시):
- **(a) vite-env.d.ts 신설** — `interface ImportMetaEnv { readonly VITE_API_URL: string }` + `interface ImportMeta { readonly env: ImportMetaEnv }`. **채택** (Vite 공식 권장, ADR 불필요)
- **(b) `match[1]!` non-null assertion** — regex 매칭 성공 + `[^/]+` quantifier로 group [1] 존재 보장이 명백. **채택** (단순·안전, 가드 추가는 dead code 유발)

대안 (검토 후 거부):
- tsconfig `noUncheckedIndexedAccess: false` override — strict mode 약화 + 다른 모듈에도 영향 → 거부
- `if (!match[1]) throw` 가드 — dead code (regex 매칭 성공 시 [1] 항상 존재), 코드 noise ↑ → 거부

## 7. 회귀 테스트 추가 항목

본 PR은 typecheck 자체가 회귀 검증의 정본 수단 (이슈 body §테스트 시나리오 정합 — "단위: typecheck 자체가 검증, 테스트 코드 추가 불필요"). 따라서:

| 회귀 검증 | 도구 | 기준 |
| --- | --- | --- |
| AC-R-01 — `pnpm --filter @app/frontend typecheck` | tsc --noEmit | exit 0 + 에러 0건 (본 PR 정본 검증 수단) |
| AC-R-02 — `pnpm --filter @app/frontend test:unit` | vitest | 86+ PASS / 0 FAIL (Sprint 6 baseline 유지) |
| AC-R-03 — `pnpm --filter @app/frontend exec vite build` | vite build | PASS + dist/ 생성 (회귀 0건) |
| AC-R-04 — `pnpm --filter @app/backend test` | vitest | 64 PASS / 0 FAIL (회귀 0건 — backend 영향 없음 확인) |
| AC-R-05 — 통합 + e2e | vitest + playwright | 36 + 5 PASS (회귀 0건) |
| AC-R-06 (보조) — `matchRoute` 단위 테스트 | vitest | 기존 테스트 케이스 회귀 0건 (frontend/tests/unit/router/routes.test.ts 기존 cases 100% PASS) |

추가 회귀 테스트 코드 신설은 N/A — 본 결함은 *type-only* 결함이며 runtime 동작에 영향 없음 (`as string | undefined` cast가 runtime에서는 동일 동작). 기존 86 vitest test suite + typecheck 0 에러가 회귀 검증의 완전 커버리지.

## 8. 영향 받는 다른 영역

- **backend·shared·e2e workspace**: 영향 없음 — TypeScript composite project references 통해 검증. `pnpm -r typecheck`은 본 PR scope 밖이나, 검증으로 회귀 0건 확인
- **CI workflow**: 본 PR 머지 후 typecheck step 추가 가능 baseline 확보 (issue DoD §6 선택, 후속 작업 후보 — 별 이슈 등록 권장)
- **routes.tsx 단위 테스트 (`frontend/tests/unit/router/routes.test.ts`)**: regex match group의 runtime 동작은 본 PR로 변경되지 않음 → 기존 테스트 100% PASS 유지
- **api/client.ts 단위 테스트 (`frontend/tests/unit/api/client.test.ts`)**: `import.meta.env.VITE_API_URL`이 type-only로 정상화됨 → 기존 테스트 100% PASS 유지 (vitest는 vite의 import.meta.env mock 자동 처리)
