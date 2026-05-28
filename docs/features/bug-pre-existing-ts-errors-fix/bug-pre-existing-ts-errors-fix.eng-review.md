---
doc_type: feature-eng-review
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

# bug-pre-existing-ts-errors-fix — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — eng-review verdict=PASS (이슈 #48) |

## 0. Verdict

**PASS** — `/implement` 진입 허가.

- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-28

근거: contract §0 Referenced-IDs 5행 모두 명시, Before/After 5행 명료 (type-only 변경 / runtime 동작 변경 0건 / Breaking=no), plan 2 commit DAG 단순·독립, 회귀 검증 정본 수단(typecheck + 기존 86 vitest test)이 schema 강제 적합. 모든 산출(brief·investigation·contract·plan) `validate-doc.sh` PASS.

## 1. Contract 검토

- [x] §0 Referenced-IDs 5행 모두 명시 — R-ID(R-F-08, R-N-02), F-ID(none), 영향 모듈(frontend/router M1·frontend/api M3), 영향 엔드포인트(none), 적용 컨벤션(§1 명명)
- [x] Before/After 5행 명료 — vite-env.d.ts 신설 + client.ts:18 코드 그대로 유지(타입만 인식) + routes.tsx:39·46 `!` non-null assertion + typecheck exit 0
- [x] 호출자·의존자 표 6행 — 모두 "코드 변경 0건" (type-only 변경의 정합)
- [x] Backward Compatibility: Breaking=no, 마이그레이션 N/A, deprecation N/A (근거: ambient declaration runtime emit 0줄 + `!` operator type-only)
- [x] Rollback 3단계 명료 (squash 단일 commit revert)
- [x] 비목표 5건 명시 (CI typecheck step·타 모듈 typing·workspace 전수·runtime 변경·tsconfig override)

## 2. Plan 검토

- [x] 2 commit DAG — C1 vite-env / C2 routes 가드 (독립, 순서 무관, 가독성으로 C1 → C2)
- [x] 회귀 검증 전수 (AC-R-01~06) — typecheck + vitest + vite build + backend + 통합 + e2e baseline 동일
- [x] 회귀 테스트 추가 N/A 명시 — type-only 결함 + 기존 86 vitest test suite + typecheck 자체가 회귀 검증 정본. mode=bug "회귀 테스트 추가 강제" 규칙은 *결함 수정 시 동일 결함 재발 방지* 의도이며, 본 PR은 typecheck 0 에러 baseline이 그 역할을 수행 (investigation.md §7 명시)
- [x] 빌드·실행 검증 단계 6 Phase 코드블록 (사전 환경 → 의존성 → schema → 회귀 → 3 profile → workflow)
- [x] 결정 2건 명시 (`vite-env.d.ts` 명시적 interface / `match[1]!` non-null assertion 채택 근거 + ADR 불필요 판정)
- [x] 작업량 추정 — 0.5d (이슈 body Estimated Effort 정합, 1~3 working days 범위 내)

## 3. UX 검토

N/A — 본 PR은 type-only 결함 정정으로 UI/UX 변경 0건 (ui_changed=false 예정). `frontend/src/router/routes.tsx` 수정은 runtime 동작 0건 변경 → 사용자 노출 변화 0건.

## 4. 6단계 폴더링 충족

- [x] `docs/features/bug-pre-existing-ts-errors-fix/` 폴더 — slug에 `bug-` 접두 (feature-*.schema.yaml filename_pattern 정합)
- [x] 4 산출(brief·investigation·contract·plan) 모두 `<slug>.<type>.md` 평면 명명 (document-manifest §3.2)
- [x] 본 eng-review.md도 동일 위치

## 5. frontmatter / Manifest 검증

본 게이트 진입 시 모든 산출에 `validate-doc.sh`를 자동 호출 — 결과:

```bash
$ for f in docs/features/bug-pre-existing-ts-errors-fix/*.md; do bash .claude/scripts/validate-doc.sh "$f"; done
OK [feature-brief] docs/features/bug-pre-existing-ts-errors-fix/bug-pre-existing-ts-errors-fix.brief.md
OK [feature-investigation] docs/features/bug-pre-existing-ts-errors-fix/bug-pre-existing-ts-errors-fix.investigation.md
OK [feature-contract] docs/features/bug-pre-existing-ts-errors-fix/bug-pre-existing-ts-errors-fix.contract.md
OK [feature-plan] docs/features/bug-pre-existing-ts-errors-fix/bug-pre-existing-ts-errors-fix.plan.md
```

전수 PASS — frontmatter 7필드(doc_type·version·status·author·date·gate·related) + 본문 BLOCK 모두 충족.

## 6. 발견 사항 (3축 OX)

본 PR 검토 중 발견 사항 0건 — type-only 결함 정정 단순 PR로 인접 영역 결함·미커버 시나리오 발견 없음.

| Q | 답 | 처리 |
| --- | --- | --- |
| (사전 합의) | 본 PR 검토 중 신규 발견 후보 0건 | "## 같은 PR 보정 필요" 절·"## 발견 사항" 절 모두 N/A |

후속 작업 후보 1건 (별 이슈 등록 권장, 본 PR scope 밖):
- **CI workflow typecheck step 추가** (이슈 #48 DoD §6 선택 항목) — 본 PR 머지 후 typecheck 0 에러 baseline 확보됐으므로 CI strict mode 진입 가능 baseline. 별 PR로 `.github/workflows/`에 typecheck step 추가 가능. *3축 OX 사전 합의: scope 밖(✅) + 부모 PR 머지 가능(✅) + 다른 영역(✅) — A. Derived 후보. 사용자 결정 대기.*

## 7. NEEDS-WORK 항목

없음 — `/implement` 진입 즉시 허가.
