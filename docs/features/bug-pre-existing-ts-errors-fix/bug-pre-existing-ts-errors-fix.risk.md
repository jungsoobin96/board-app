---
doc_type: feature-risk
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

# bug-pre-existing-ts-errors-fix — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — type-only 변경 리스크 4건 Low (이슈 #48) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | vite-env.d.ts 신설로 인한 ImportMeta interface 충돌 (다른 ambient declaration과 merge 실패) | 2 | 1 | Low |
| F-RISK-02 | `match[1]!` non-null assertion이 *런타임에 null인 경우* TypeError 유발 (regex 매칭 실패 시) | 3 | 1 | Low |
| F-RISK-03 | 다른 frontend 모듈에 `import.meta.env.*` 추가 사용 시 vite-env.d.ts에 키 누락 → 재발 위험 | 1 | 2 | Low |
| F-RISK-04 | tsconfig 정합성 — 본 PR 머지 후 typecheck step CI 추가 시 회귀 detection 동작 안 함 | 2 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — ImportMeta interface 충돌 (Low)
- **시나리오**: 본 PR이 신설하는 `interface ImportMeta { readonly env: ImportMetaEnv }`가 TS의 다른 ambient declaration(예: Node `@types/node`의 ImportMeta 정의)과 충돌해 빌드 FAIL
- **완화**: 본 PR 진행 시 typecheck PASS 확인 + `tsconfig.json`이 `lib: [ES2022, DOM, DOM.Iterable]`만 포함 (Node types 미참조)로 충돌 가능성 0건. Vite 5.x 공식 패턴 그대로 채택
- **검증**: AC-R-01 typecheck exit 0로 자동 검증

### F-RISK-02 — `match[1]!` non-null assertion 런타임 위험 (Low)
- **시나리오**: regex 매칭 자체가 실패하면 `articleMatch === null` 분기로 빠져 `match[1]!` 접근 안 함. 하지만 외부 코드가 `matchRoute('/article/')` (group [1] empty) 호출 시 `[^/]+` quantifier가 1+ char 요구하므로 매칭 실패 → null 반환 → 본 분기 진입 안 함. 즉 런타임 위험 0건
- **완화**: 기존 `frontend/tests/unit/router/routes.test.ts` matchRoute 단위 테스트가 edge case(`/article/`, `/article/abc`, `/article/123`)를 모두 cover (Sprint 3·4 baseline 100% PASS 유지)
- **검증**: AC-R-06 matchRoute 단위 테스트 회귀 0건

### F-RISK-03 — vite-env.d.ts 키 누락 재발 (Low)
- **시나리오**: 향후 frontend 모듈이 `import.meta.env.VITE_NEW_KEY` 추가 시 vite-env.d.ts에 명시 안 하면 동일 TS2339 재발
- **완화**: 본 PR의 vite-env.d.ts는 *명시적 interface 선언* 패턴이라 신규 키 추가 시 즉시 typecheck FAIL → 개발자가 인지. CI에 typecheck step 추가 시(후속 작업) 자동 차단
- **검증**: 본 PR 머지 후 *typecheck 0 에러 baseline* 확보 → 향후 신규 회귀를 PR 단위로 detection 가능

### F-RISK-04 — CI typecheck step 후속 작업 누락 (Low)
- **시나리오**: 본 PR 머지 후 CI workflow에 typecheck step 추가 안 하면, 다른 PR에서 신규 TS 에러가 다시 누적 → 본 PR의 baseline 청결화 효과 무력화
- **완화**: 본 PR 비목표 §6 명시 + 후속 작업 별 이슈 후보 (eng-review §6 명시). 사용자 후속 결정으로 별 PR 등록
- **검증**: 본 PR scope 밖, 후속 작업으로 위임

## 3. High 등급 단계적 롤아웃

해당 없음 — 모든 리스크 Low 등급 (영향 1~3 + 가능성 1~2 조합). 본 PR은 type-only 변경 + 회귀 검증 정본(typecheck + 기존 86 vitest) 충분 → 단계적 롤아웃 불필요. 단일 PR로 일괄 머지 적절.

## 4. 데이터 영속성 변경

해당 없음 — 본 PR은 type-only 코드 변경. DB·migration·로컬 storage·세션 모두 영향 0건.

## 5. 15-risk.md 갱신 항목

해당 없음 — 본 PR이 신설하는 리스크는 모두 Local scope (frontend type-only). 프로젝트 전역 리스크 표(15-risk)에 누적할 필요 없음. 별 이슈 등록 시 해당 이슈 risk.md에 별도 기록.
