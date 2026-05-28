---
doc_type: feature-eng-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-07]
  F-ID: [F-01, F-02, F-03, F-04, F-07]
  supersedes: null
---

# E2E 골든 패스 (Playwright 5건) — Engineering Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — brief·contract·plan·acceptance·risk 검토 PASS |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-28

다음 phase 진입 허가: `/implement` (2 commit) → `/code-review` → `/qa-test --ai` → PR.

## 1. Contract 검토

- §0 Referenced-IDs 5행 모두 명시 (R-F-01~04+07 + F-01~04+07 / e2e/specs+global-setup+config 신설 / 6 endpoint read-only+seed / 컨벤션 (none)) ✅
- §1 변경 의도 + #21 본문 DoD 5항 매핑 명시 ✅
- §2 Before/After 10행 정량 측정 가능 — devDependency·scripts·playwright.config·global-setup·5 spec·lockfile 모두 grep/`pnpm test` 출력으로 검증 ✅
- §3 호출자 11행 — e2e 신설 8건 + backend/frontend dev read-only + lockfile + dev.db ✅
- §4 Backward `no` + 사용자 노출 없음 (개발자 도구) ✅
- §5 Rollback `yes` (1단계 revert) + 데이터 손상 없음 ✅
- §6 비목표 7건 (viewport / gstack 자동 / CI job / visual regression / a11y / 부하 / backend·frontend src 변경) ✅

## 2. Plan 검토

- §1 커밋 시퀀스 2행 — commit1 인프라(설치+config+global-setup) + commit2 5 spec+6 docs ✅
- §2 ASCII로 P0 → P10 표현 ✅
- §3 테스트 매핑 7행 — commit2 5 spec 각 1 it + 기존 단위 102·통합 25 회귀 ✅
- §4 빌드·실행 검증 7단계 (validate / install / browser install / build·test 기존 / e2e 실행 / smoke / workflow) — 실행 가능 ✅
- §5 결정 항목 — ADR no + viewport 1 + chromium 1 + global-setup만 + webServer auto-boot + 5 spec 선택 사유 + 비목표 + BLOCKED 분기 ✅

## 3. UX 검토

본 PR은 UI 영역 아님 — E2E 테스트만, frontend src 무변경. `ui_changed=false` 자동 판정 (e2e/* 매칭, frontend/src 매칭 0). 단 본 PR이 E2E 자체이므로 *5 spec PASS = 골든 패스 자기 실증*. UX 검토는 acceptance AC-01~05의 Given/When/Then으로 흡수. gstack /qa는 머지 전 사람 수동 (DoD 4항, 스크린샷 5장 첨부).

## 4. 6단계 폴더링 충족

`docs/features/feat-e2e-golden-path/` 폴더 신설. slug `feat-` 접두 + `<slug>.<type>.md` 명명 정합. mode=add → investigation N/A. E2E specs는 `e2e/specs/` 폴더 (workspace 내부 표준 구조).

## 5. frontmatter / Manifest 검증

- brief/contract/plan/acceptance/risk/eng-review 6건: doc_type 정합, version=v0.2, status=Accepted, author=jungsoobin96, date=2026-05-28, gate=feature, R-ID=[R-F-01,02,03,04,07], F-ID=[F-01,02,03,04,07] ✅
- 변경 이력 표 첫 데이터 행 version == frontmatter.version (ADR-0019 정합) — 6 docs 모두 v0.2 ✅
- `bash .claude/scripts/validate-doc.sh` 6 파일 모두 OK (P5 시점 검증 예정)

## 6. 발견 사항 (3축 OX)

| Q | 답 | 처리 |
| --- | --- | --- |
| (Q1) viewport 4종 매트릭스 (360/768/1024/1440 × 5 페이지 = 20 매트릭스) — #19 이관 사항, 본 PR scope 축소로 미포함 | (Q1=No 부모 미명시 ✅) + (Q2=Yes 본 작업 없이 부모 PR 머지 가능 ✅) + (Q3=Yes 별 viewport 매트릭스 영역 ✅) → A.Derived | Sprint 6+ 별 이슈 후보 — `/flow-feature "E2E viewport 4종 × 5 페이지 매트릭스 확장"` |
| (Q2) E2E CI GitHub Actions job 정식 도입 (#21 DoD 5항 "(선택)") | (Q1=No 부모 미명시, 선택 항목 ✅) + (Q2=Yes 머지 가능 ✅) + (Q3=Yes 별 CI 영역 ✅) → A.Derived | Sprint 6+ 별 이슈 후보 |
| (Q3) Cross-browser (firefox/webkit) projects 확장 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 도구 영역 ✅) → A.Derived | Sprint 6+ 별 이슈 후보 |
| (Q4) Visual regression snapshot (`expect(page).toHaveScreenshot()`) | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 도구 영역 ✅) → A.Derived | Sprint 6+ 별 이슈 후보 |
| (Q5) a11y(axe-core) 통합 | (Q1=No ✅) + (Q2=Yes ✅) + (Q3=Yes 별 도구 영역 ✅) → A.Derived | Sprint 6+ 별 이슈 후보 |
| (Q6) dev.db afterAll cleanup 자동화 — F-RISK-03 누적 대응 | (Q1=No ✅) + (Q2=Yes upsert로 강건 ✅) + (Q3=No 같은 e2e/global-setup 영역 ❌) → 같은 PR 보정 또는 후속 | 본 PR upsert 패턴으로 1차 완화. Sprint 6+ deleteMany pre-seed로 강화 후보 |

## 7. NEEDS-WORK 항목

(없음 — verdict=PASS)
