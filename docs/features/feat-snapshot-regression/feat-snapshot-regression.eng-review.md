---
doc_type: feature-eng-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — brief·contract·plan·acceptance·risk 검토 PASS |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-27

다음 phase 진입 허가: `/implement` (1 commit으로 Toast.test.tsx + snap + 7 docs) → `/code-review` → `/qa-test --ai` → PR.

## 1. Contract 검토

- §0 Referenced-IDs 5행 모두 명시 (R-N-06 + F-11 / Toast 모듈 / 엔드포인트 (none) / 컨벤션 (none)) ✅
- §1 변경 의도 + #19 본문 DoD 5종 충족 + viewport #21 이관 명시 ✅
- §2 Before/After 8행 모두 정량 측정 가능 ✅
- §3 호출자 6행 + #21 이관 항목 분리 명시 ✅
- §4 Backward `no` + 마이그레이션 불필요 + 사용자 노출 없음 (테스트만) ✅
- §5 Rollback `yes` (1단계 revert) + 데이터 손상 없음 ✅
- §6 비목표 6건 (#21 이관 / Playwright 설치 / 5종 외 추가 / 토큰 변경 / CI gate) ✅

## 2. Plan 검토

- §1 커밋 시퀀스 1행 — Toast.test.tsx + snap + 8 docs 모두 1 commit ✅
- §2 ASCII로 P0 → P10까지 자세히 표현 ✅
- §3 테스트 매핑 2행 — snapshot 1 it + 기존 4 it 회귀 ✅
- §4 빌드·실행 검증 6단계 코드블록 — validate / vitest / snap 파일 / 5종 count / smoke / workflow 양축 ✅
- §5 결정 항목 — ADR 작성 필요: **no** + Toast 채택 사유 + viewport #21 이관 + BLOCKED 분기 + ui_changed=false 사유 ✅

## 3. UX 검토

본 PR은 UI 변경 없음 (테스트 코드만) — `ui_changed=false` (`frontend/tests/` 매칭, `frontend/src/` 매칭 없음). UX 검토 N/A.

## 4. 6단계 폴더링 충족

`docs/features/feat-snapshot-regression/` 폴더 신설. slug `feat-` 접두 + `<slug>.<type>.md` 명명 정합 (manifest §3.2). 7 feature docs 모두 schema-level filename_pattern PASS. investigation은 mode=add N/A.

## 5. frontmatter / Manifest 검증

- brief: doc_type=feature-brief, version=v0.2, status=Accepted, author=jungsoobin96, date=2026-05-27, gate=feature, R-ID=[R-N-06], F-ID=[F-11] ✅
- contract/plan/acceptance/risk/eng-review 동일 패턴 ✅
- 변경 이력 표 첫 데이터 행 version == frontmatter.version (ADR-0019 정합) — 5 docs 모두 v0.2 ✅
- `bash .claude/scripts/validate-doc.sh` 6 파일 모두 OK 응답 (P5 시점 검증 예정)

## 6. 발견 사항 (3축 OX)

| Q | 답 | 처리 |
| --- | --- | --- |
| (Q1) #19 본문 DoD 8항 중 viewport/Playwright/gstack qa/스크린샷 4항 #21 이관 — #21 본문에 이관 항목 명시 추가 | (Q1=No 부모 미명시 ✅) + (Q2=Yes 본 작업 없이 PR 머지 가능 ✅) + (Q3=Yes 별 이슈 ✅) → A.Derived 또는 자연 흡수 | 본 PR 머지 후 #21 진입 시점에 자연 흡수 (별도 등록 안 함) |
| (Q2) snapshot diff 폭증 시 운영 절차 명문화 — PR template에 "토큰 변경 PR은 snapshot 일괄 갱신 + 시각 review" | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 운영 정책 ✅) → A.Derived | Sprint 6+ 토큰 변경 PR 발생 시점에 등록 |
| (Q3) snapshot 5종 외 추가 컴포넌트(ConfirmModal/EditorForm/CommentForm 등) snapshot — coverage 확대 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 컴포넌트 ✅) → A.Derived | Sprint 6+ snapshot coverage 확대 후보 |
| (Q4) snapshot 신설 후 CI에서 snapshot diff gate (PR template 또는 GitHub Actions) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes CI 영역 ✅) → A.Derived | Sprint 1 follow-up (i) CI smoke job과 묶음 |

## 7. NEEDS-WORK 항목

(없음 — verdict=PASS)
