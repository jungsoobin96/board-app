---
doc_type: feature-brief
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

# bug-pre-existing-ts-errors-fix — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — pre-existing TS 에러 3건 정정 (이슈 #48) |

## 1. 한 줄 의도

frontend `pnpm --filter @app/frontend typecheck` 시 Sprint 3 이후 지속 발생한 pre-existing TS 에러 3건(client.ts:18 `import.meta.env`, routes.tsx:39·46 `string | undefined`)을 정정하여 typecheck exit 0를 달성, CI strict mode 진입의 직접 차단 요인을 제거한다.

## 2. 사용자 가치

- **개발자**: typecheck 실행 시 0 에러 → IDE 빨간 줄/잘못된 inference 사라짐, 개발 경험 개선
- **CI/운영**: 향후 typecheck step을 CI 게이트에 추가할 수 있는 baseline 확보 (#26 sync-issue-labels.yml 디버그 후 CI 견고화 가능 — DoD §의존성)
- **외부 평가자**: "main 동일 — 본 PR 신규 0건" 흡수 패턴 종료, 골든패스 baseline 청결화 (Sprint 4·5·6 4 PR baseline에서 동일 재현된 3건이 마침내 해소)

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `pnpm --filter @app/frontend typecheck` | 에러 3건 (TS2339 × 1 + TS2322 × 2) + exit 1 | 에러 0건 + exit 0 |
| `frontend/src/api/client.ts:18` | `(import.meta.env.VITE_API_URL as string \| undefined)` — `env` 속성 미인식 | `import.meta.env.VITE_API_URL` 정상 인식 (vite-env.d.ts 신설로 `ImportMetaEnv` 타입 보강) |
| `frontend/src/router/routes.tsx:39,46` | `articleMatch[1]` / `editorIdMatch[1]`이 `string \| undefined`로 추론 → `params: { id: string }` 할당 불가 | non-null assertion(`[1]!`) 또는 가드 추가로 `string` 타입 확정 |
| `frontend/src/vite-env.d.ts` | 부재 | 신설 — `ImportMetaEnv` + `ImportMeta` interface 선언 (Vite 표준) |
| `vite build` / `vitest run` | PASS 유지 (Sprint 4 baseline) | PASS 유지 (회귀 0건) |

## 4. 모드 자동 감지 결과

**mode=bug** (자동 결정, ADR-0032 규칙 1).

- 부정 시그널: `type:bug` 라벨 명시 → mode=bug 강제 (단일 시그널, 충돌 없음)
- 자연어 시그널: 이슈 제목 `bug(frontend): pre-existing TS 에러 3건 정정` + 이슈 body "에러" 키워드 + 에러 로그 첨부 모두 mode=bug 신호
- 모드별 강제: `debug-investigator` 선행(P3a) + `change-contract` Before/After 작성 + 회귀 테스트 추가 (typecheck 자체가 회귀 검증 — 이슈 body §테스트 시나리오 정합)

## 5. 영향 범위

| 영역 | 변경 파일 | 비고 |
| --- | --- | --- |
| frontend | `frontend/src/vite-env.d.ts` (신설) | `ImportMetaEnv` + `ImportMeta` 타입 선언 (Vite 표준 ambient declaration) |
| frontend | `frontend/src/router/routes.tsx` (수정) | line 39·46 non-null assertion 추가 (regex 매칭 성공 시 group [1]은 항상 존재 보장 — 코드 로직상 안전) |
| frontend | `frontend/src/api/client.ts` (수정 0건 가능) | vite-env.d.ts 신설로 자동 해결 — line 18 코드 그대로 유지 가능. 검증 후 `as string | undefined` cast 제거 여부 결정 |
| 영향 모듈 | `frontend api`, `frontend router` (LLD M3·M1) | 08-lld-module-spec §M1·M3 참조 |
| 영향 R-ID | R-F-08 (라우팅), R-N-02 (에러 응답 — 간접) | 본 PR 직접 변경 없음, 회귀 0건 확인만 |

## 6. 비목표

- CI workflow에 typecheck step 추가 — 본 PR scope 밖 (issue DoD §6 선택 항목, 후속 작업 후보). 본 PR은 typecheck 0 에러 baseline만 확보
- 다른 frontend 모듈의 typing 보강 — 본 PR은 명시된 3건만 정정
- backend·shared·e2e workspace typecheck — 본 PR 직접 영향 없음 (회귀 0건 확인만)
- 통합 테스트·E2E 시나리오 추가 — 본 PR은 typecheck 회귀가 정본 검증 수단

## 7. Open Questions

없음 (이슈 body §Contract에 해결 후보 명시 — `vite-env.d.ts` 신설 또는 cast 유지, `[1]!` non-null assertion 또는 가드. P3a 재현 분석 + P3 contract에서 confirm).
