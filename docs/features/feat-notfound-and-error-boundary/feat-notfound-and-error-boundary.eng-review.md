---
doc_type: feature-eng-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-08, R-N-02]
  F-ID: [F-04]
  supersedes: null
---

# NotFound + ErrorBoundary 폴리시 — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | Verdict PASS — Toast 신규 + 3종 단위 테스트 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 |

## 0. Verdict

**PASS** — `/implement` 진입 허가.

- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-27

근거: contract §0 5행 모두 명시 (ADR-0018 통과), Before/After 5행 합리적, plan 2 commit 단위·시간 추정 < 1d, 신규 파일만 — 회귀 위험 매우 낮음, Backward=no, Rollback revert 가능 yes.

## 1. Contract 검토

- §0 Referenced-IDs 5행 모두 채움 (R-F-08·R-N-02 / F-04 간접 / M5 모듈 / endpoint none / 컨벤션 §3·§4) — ADR-0018 PASS
- Before/After 5행: Toast 신규·테스트 3종 신규 모두 명시, 기존 NotFound/ErrorBoundary/App/routes는 "변경 없음" 명시 — 정확
- §3 Call Sites: 신규 Toast는 본 PR scope 밖 호출처 없음을 명시 — 정확 (후속 PR에서 hooks/페이지가 사용)
- §4 Backward=no, §5 Rollback revert 가능 yes — 신규 파일만이라 자연스러움
- §6 비목표 4건: queue/stacking·5xx HTTP catch·Sentry·E2E 명시 — scope creep 차단 적절

## 2. Plan 검토

- 2 commit 시퀀스: commit 1 Toast 컴포넌트+테스트, commit 2 기존 컴포넌트 회귀 테스트 — atomic·DAG 순환 없음
- 모든 변경 파일에 테스트 매핑 (Toast 4 case + NotFound 2 case + ErrorBoundary 3 case = 9 신규 테스트)
- 시간 추정: 컴포넌트 + 테스트 9 case = 1~2h 수준 (이슈 Estimated Effort 1d 범위 내)
- 빌드·실행 검증: `pnpm -r typecheck && build && --filter @app/frontend test` — Sprint 4 표준
- §5 결정 4건: ErrorBoundary `console.error` 유지, Toast portal 미사용, durationMs 기본 3000ms, message=string only (스택 미노출) — R-N-02 강제 명시 우수

## 3. UX 검토

- Toast: `role="alert"` (스크린리더 즉시 안내), 닫기 버튼 `aria-label="알림 닫기"` (a11y), success/error variant는 색상 + icon 텍스트로 구분
- NotFound: 기존 컴포넌트 그대로 — Link `to="/"` 한국어 "홈으로" CTA
- ErrorBoundary: 기존 컴포넌트 그대로 — `role="alert"` fallback + 새로고침 안내
- 화면 변경 없음 (Toast는 본 PR에서 호출처 없음 — 단위 테스트로만 검증)

## 4. 6단계 폴더링 충족

- `frontend/src/components/Toast.tsx` — `12-scaffolding §1` MVC + components/ 단계 충족
- `frontend/tests/unit/components/Toast.test.tsx` — `11-coding-conventions §4` 테스트 경로 일치
- 기타 모듈 신규 X — 폴더링 변경 없음

## 5. frontmatter / Manifest 검증

- brief / contract / plan 3종 모두 `validate-doc.sh` PASS (방금 실행)
- 변경 이력 정합 (ADR-0019): 표 첫 행 Version = frontmatter.version = v0.2 — PASS
- frontmatter 7필드 (doc_type/version/status/author/date/gate/related) 모두 충족

## 6. 발견 사항 (3축 OX)

| Q | 답 | 처리 |
| --- | --- | --- |
| Q1: in_scope == False (부모 acceptance/contract 미명시) | ❌ in_scope == True | scope 내, 발견 사항 등록 X |
| Q2: blocks_parent_merge == False | ✅ True (parent 머지 가능) | — |
| Q3: same_area == False | ❌ same_area == True (frontend/src/components) | scope 내 처리 |

> 본 PR은 신규 파일만 추가 — scope 내 정의된 작업. 같은 PR 보정·파생 이슈 모두 N/A.

## 7. NEEDS-WORK 항목

(없음 — PASS)
