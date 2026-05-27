---
doc_type: feature-eng-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — brief·contract·plan·acceptance·risk 검토 PASS |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-27

다음 phase 진입 허가: `/implement` (1 commit으로 TagList 1줄 + RTL 2건 + 7 feature docs) → `/code-review` → `/qa-test --ai` (ui_changed=true → gstack /qa 사용자 위임) → PR.

## 1. Contract 검토

- §0 Referenced-IDs 5행 모두 명시 (R-F-01·R-F-04 / F-02·F-08 / 영향 모듈 TagList+Home / 엔드포인트 (none) / 컨벤션 (none)) ✅
- §1 변경 의도 1문장 + URL state는 Sprint 3 #12에서 이미 구현됨 + 본 PR은 active toggle 마무리 명시 ✅
- §2 Before/After 9행 — onClick handler·사용자 경험·필터 해제 버튼·aria-pressed·테스트 it·Home handleTagClick·URL sync·단위 카운트 모두 정량 측정 가능 ✅
- §3 호출자 표 7행 — TagList(1줄) + test(+2 it) + Home(영향 없음) + integration(skipped) + snapshot(영향 없음) + 13-catalog(기존 fan-in) + feature docs(8건) ✅
- §4 Backward `no` + prop 시그니처 유지 + 시각 변화 없음 ✅
- §5 Rollback `yes` (1단계 revert) + 데이터 손상 없음 ✅
- §6 비목표 6건 (multi-select / token 변경 / a11y / E2E / 필터 해제 버튼 유지) ✅

## 2. Plan 검토

- §1 커밋 시퀀스 1행 — TagList 1줄 + RTL 2건 + 8 feature docs 모두 1 commit. 명확 ✅
- §2 ASCII로 P0 → P1 brief → P3 contract → P10 ai-qa까지 자세히 표현. ui_changed=true 흐름 명시 ✅
- §3 테스트 매핑 4행 — it 5(해제) + it 6(선택 회귀) + 기존 4 it 회귀 + integration skip 명시 ✅
- §4 빌드·실행 검증 6단계 코드블록 (A validate / B typecheck / C frontend test / D smoke / E workflow / F gstack qa) — 실행 가능 ✅
- §5 결정 항목 — ADR 작성 필요: **no** + PR title `feat(frontend):` 정합 + gstack /qa 사용자 위임 + BLOCKED 분기 ✅

## 3. UX 검토

본 PR은 UI 영역 — `ui_changed=true` (TagList.tsx 매칭). 5번째 축 BLOCK. gstack /qa 호출 의무 → 사용자 위임 (Sprint 5 인프라 follow-up 후보 그대로). 스크린샷 3장 (before/active/after-toggle) 사용자 첨부 권고.

active 칩 재클릭 = 해제 toggle UX 패턴 — ConfirmModal(#15) confirmTarget 패턴 답습. ARIA `aria-pressed` 시각 강조로 toggle 의도 명확. 명시적 "필터 해제 ×" 버튼 보존 (redundancy 의도).

## 4. 6단계 폴더링 충족

`docs/features/feat-tag-filter-url-state/` 폴더 신설. slug `feat-` 접두 + `<slug>.<type>.md` 명명 정합 (manifest §3.2). 7 feature docs 모두 schema-level filename_pattern PASS. investigation은 mode=add N/A로 누락 의도.

## 5. frontmatter / Manifest 검증

- brief: doc_type=feature-brief, version=v0.2, status=Accepted, author=jungsoobin96, date=2026-05-27, gate=feature, R-ID=[R-F-01, R-F-04], F-ID=[F-02, F-08] ✅
- contract: 동일 패턴 ✅
- plan: 동일 ✅
- acceptance: 동일 ✅
- risk: 동일 ✅
- eng-review: 본 문서 ✅
- 변경 이력 표 첫 데이터 행 version == frontmatter.version (ADR-0019 정합) — 5 docs 모두 v0.2 ✅
- `bash .claude/scripts/validate-doc.sh` 6 파일 모두 OK 응답 (P5 시점 검증 예정)

## 6. 발견 사항 (3축 OX)

| Q | 답 | 처리 |
| --- | --- | --- |
| (Q1) Home handleTagClick(null)에서 page 유지 옵션 — 사용자 선호 검토 | (Q1=No 부모 미명시 ✅) + (Q2=Yes 본 작업 없이 PR 머지 가능 ✅) + (Q3=Yes 별 UX 결정 ✅) → A.Derived | Sprint 5 retro에서 사용 경험 확인 후 follow-up 후보 (현재 page reset 유지) |
| (Q2) TagList 키보드 navigation Tab/Enter 보강 (a11y) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes a11y 별 영역 ✅) → A.Derived | Sprint 6+ a11y 보강 |
| (Q3) home.integration.test.tsx skipped 해소 (MSW + vitest jsdom 통합 #11 follow-up) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 인프라 영역 ✅) → A.Derived | Sprint 5 인프라 이슈 후보 (기존 backlog) |
| (Q4) gstack /qa LLM 직접 환경 셋업 — 사용자 위임 패턴 해소 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 인프라 ✅) → A.Derived | Sprint 5 인프라 이슈 (Sprint 4 retro 명시 기존 backlog) |

## 7. NEEDS-WORK 항목

(없음 — verdict=PASS)
