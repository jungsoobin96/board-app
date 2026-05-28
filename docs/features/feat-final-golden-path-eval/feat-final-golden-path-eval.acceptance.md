---
doc_type: feature-acceptance
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03, R-N-04]
  F-ID: [F-09]
  supersedes: null
---

# feat-final-golden-path-eval — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | AC-01~04 + DoD 6항 + 비기능 + 회귀 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: UC-06 fresh checkout 시도 결과 기록 (R-N-03, F-09)

- **Given** 저자 본인 + 외부 1~2명이 새 PC 또는 fresh dir에서 git clone부터 dev 부팅까지 UC-06 정상 흐름 1~5 단계 수행
- **When** `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.attempts.md` 작성
- **Then**:
  - 시도자별 행 1개 이상 (시도자명·PC·OS·Node 버전·시도 시각·소요 시간·실패 단계·우회 절차·최종 부팅 여부)
  - 시도 횟수 ≥ 2 (저자 1 + 외부 1 최소)
  - 저자 시도는 본 PR 머지 전에 완료. 외부 시도는 본 PR 머지 후 코멘트 보강 허용 (별 PR로 안 미룸)

### AC-02: RFP §10 평가 기준 7개 1:1 매핑 + 통과 결과 (R-N-03, F-09)

- **Given** RFP §10 평가 기준 7개 원본 + README §6 기존 매핑 표
- **When** `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md` 작성
- **Then**:
  - 7행 표 컬럼 = [#, RFP §10 기준 원문, 통과 방법, 구현 위치, 검증 시점, 증거(스크린샷/스펙 경로), 결과]
  - 결과 컬럼 = #1·#2·#3·#5·#6·#7 → `✅ PASS` (Sprint 5 #21 E2E spec + 본 PR UC-06 시도) / #4 → `⚠️ N/A (Phase 2 F-13)`
  - 종합: `6/7 PASS + 1 N/A (Phase 2)` 표기
  - 증거 컬럼은 `e2e/specs/*.spec.ts` 또는 `docs/features/feat-final-golden-path-eval/screenshots/uc06-*.png` 실파일 인용

### AC-03: KPI #1 1차 측정 + 미달분 사유 (R-N-03, F-09)

- **Given** F-09 Acceptance "Given 10명 시도 When 동일 절차 Then 10/10 성공 (KPI #1, 측정)"
- **When** 본 PR 시도자 N명 (N=1~3) 결과를 `attempts.md`에 기록 후 종합
- **Then**:
  - N/10 통과 명시 (예: `2/10 PASS — 저자 1 + 외부 1`, 미달 8건)
  - 미달분 사유 명시: "외부 시도자 모집 *완전* 10명은 본 PR scope 밖. KPI 완화 ADR은 별 이슈 후속 가능 — 본 PR은 1차 측정"
  - 명시는 `attempts.md` §"종합" 또는 `eval-matrix.md` §"KPI #1 측정 1차" 1개 절에 박음

### AC-04: README §10 Phase 2 향후 확장 절 보강 (F-13 + 평가 #4 백로그 명시)

- **Given** README §10 기존 6개 항목 (Sprint 6 #22 산출 — 세션 인증·프로필·JWT·팔로우·즐겨찾기) + 평가 기준 #4 (F-13 페이지네이션) 백로그 부재
- **When** `README.md` §10 보강 — F-13 항목을 #1로 신규 추가 + 기존 6개를 #2~#7로 후순위
- **Then**:
  - §10 #1 = "글 목록 페이지네이션 (F-13)" 1줄 — `?page=N&limit=M` 쿼리 + UI 페이지 칩 + **평가 기준 §6 #4 백로그** 명시
  - §10 마지막 줄에 `eval-matrix.md` 본 PR 산출 link 추가 (`6/7 PASS + 1 N/A` 결과 참조)
  - 기존 6개 항목 내용 무변경 (번호만 shift) — 1~6 → 2~7
  - README §1~§9 무변경 (§10만 보강)
  - 표기 일관성: H2 `## 10. Phase 2 — 향후 확장 (RFP §11)` 기존 헤딩 유지

## 2. Definition of Done (D-06)

- [ ] 1. 본 PR `<slug>.code-review.md` verdict=PASS — Generator≠Evaluator 위임 (P9)
- [ ] 2. AI 게이트 6축 모두 PASS (`<slug>.ai-qa-report.md`):
  - 자동 테스트 (기존 36+86+5 회귀 0건)
  - 코드 리뷰 (자체 평가 금지 — P9 산출 verdict 참조)
  - Test Plan 4블록 (Build / Automated tests / Manual verification / DoD coverage)
  - 시크릿 스캔 (`grep -E '[A-Za-z0-9+/=]{40,}' docs/features/feat-final-golden-path-eval/` → 0)
  - 5번째 축 (브라우저 골든패스) — `ui_changed=false` 명시 N/A 허용
  - 6번째 축 (3 profile 부팅) — dev/stg/prod 각 ready 신호 + 에러 0건
- [ ] 3. PR body Test Plan 4블록 완성 + Closes #24 + Flow Mode=add + Mode Decision Trace (ADR-0032)
- [ ] 4. PR body `### Manual verification` + `### DoD coverage` 모두 *미체크* (`- [ ]`) — ADR-0046 §2.3 + validate-doc.sh §5f BLOCK
- [ ] 5. 머지 게이트 — status check `pr-body-checkboxes` PASS (사람이 Manual ✅ + DoD ✅ + Approve + 머지)
- [ ] 6. 머지 후 `Closes #24` → 이슈 자동 close + `status:*` 라벨 자동 정리 (sync-issue-labels.yml ADR-0029)

## 3. 비기능 인수

- **재현성 (R-N-03)**: AC-01 attempts.md의 시도 1~3건 모두 README 절차만으로 부팅 성공 (실패 단계는 README 보강 후 우회로 종결). 부팅 실패 1건이라도 종결 안 되면 BLOCKED → README 보강 commit 추가.
- **로컬 부팅 (R-N-04)**: AI 게이트 6번째 축 PASS — dev/stg/prod 3 profile 각 ready 신호 + 에러 0건. docs only PR이므로 회귀 신호.
- **README 친화성 (F-09)**: AC-04 README §10 신설 절은 입문자 5초 안에 Phase 2 백로그 진입점 파악 가능 (표 1개 + 출처 1줄). 분량 ~30 라인 ≤ §1~§9 평균 분량.

## 4. 회귀 인수

| AC-R-ID | 회귀 시나리오 | 검증 명령 | 기대 결과 |
| --- | --- | --- | --- |
| AC-R-01 | backend 36 integration tests 전수 통과 | `pnpm --filter @app/backend test` | 36 passed, 0 failed |
| AC-R-02 | frontend 86 unit tests 전수 통과 | `pnpm --filter @app/frontend test` | 86 passed, 0 failed |
| AC-R-03 | e2e 5 specs 전수 통과 (Sprint 5 #21 산출) | `pnpm --filter @app/e2e test` | 5 passed, 0 failed |
| AC-R-04 | 한국어 주석 4 layer ≥ 80% 유지 (Sprint 6 #23 도입) | `bash scripts/check-comment-coverage.sh` | 4 layer 모두 ≥ 80%, exit 0 |
| AC-R-05 | 신설 산출 docs 8건 schema validate-doc.sh PASS | `for f in docs/features/feat-final-golden-path-eval/*.md; do bash .claude/scripts/validate-doc.sh "$f"; done` | 8건 모두 OK |
| AC-R-06 | 3 profile 부팅 smoke (AI 게이트 6번째 축) | `pnpm dev:local`·`pnpm dev:stg`·`pnpm dev:prod` | 각 ready 신호 + 에러 0건 |
