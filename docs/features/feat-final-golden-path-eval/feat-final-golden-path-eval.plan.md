---
doc_type: feature-plan
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

# feat-final-golden-path-eval — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 5 commits DAG + 테스트 매핑 + 빌드 검증 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| C1 | `test(docs): UC-06 fresh checkout 시도 결과 기록 (#24)` | `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.attempts.md` (신설) | N/A (docs only — 시도 절차·환경·결과 md 기록) | 0 (신설 파일, 코드 무변경) |
| C2 | `test(docs): RFP §10 평가 기준 7개 1:1 매핑 + 통과 결과 (#24)` | `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md` (신설) + `docs/features/feat-final-golden-path-eval/screenshots/uc06-*.png` (1~3장, gstack `/qa` 산출) | N/A (docs + 스크린샷 only) | 0 (신설 파일·이미지 only) |
| C3 | `docs(readme): §10 보강 — F-13 페이지네이션 + 평가 #4 백로그 명시 (#24)` | `README.md` §10 (기존 6항목 → 7항목으로 보강, F-13을 #1로 신규 + 마지막 줄 eval-matrix link 추가, ~5 라인 변경) | N/A (README 보강) | 0 (§1~§9 무변경, §10 #1 신규 + 마지막 줄 link만 추가, 기존 6항목 내용 무변경 — 번호만 shift) |
| C4 | `docs(docs): feat-final-golden-path-eval 산출 8 docs (#24)` | `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.{brief,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md` (8 산출) | N/A (docs only) | 0 (신설, 코드 무변경) |
| C5 | `docs(planning): CHANGELOG Sprint 6 P0 3건 완료 (#24)` | `docs/planning/CHANGELOG.md` §"Current Status" + History 1줄 | N/A (CHANGELOG only) | 0 |

> 참조 정본 인용 (contract §0 selective read 결과):
> - R-N-03: `docs/planning/04-srs/04-srs.md` §R-N-03 (README 재현성 — Acceptance "Given 새 PC + Node.js 20 LTS When README 따라 git clone → install → dev 명령 실행 Then dev 서버 부팅 + 시드 글 노출" / 테스트 3축 — E2E ✅ 수동 절차 gstack `/qa` 또는 UC-06)
> - R-N-04: `docs/planning/04-srs/04-srs.md` §R-N-04 (로컬 부팅 검증 3 profile — Acceptance "Given fresh checkout When 3 profile 부팅 명령 실행 Then 각 profile별 ready 신호 + 에러 0건")
> - F-09: `docs/planning/05-prd/05-prd.md` §F-09 (README 친화적 설명 — Acceptance "Given 새 PC + Node.js 20 LTS When README 따라 install → dev 실행 Then 서버 부팅 + 시드 글 노출 / Given 10명 시도 When 동일 절차 Then 10/10 성공 (KPI #1, 측정)")
> - UC-06: `docs/planning/03-user-scenarios/03-user-scenarios.md` §UC-06 (행위자 데모 평가자 Park / 정상 흐름 1~5 / 실패 흐름 1~3 — Node 버전 mismatch · 포트 충돌 · 시드 누락)
> - RFP §10: `RFP.md` (평가 기준 7개 원본)
> - README §6: `README.md` §6 (이미 매핑된 7행 표 — 본 PR이 `eval-matrix.md`에서 통과 결과 1:1 보강)

## 2. 의존성 그래프

```
C1 (attempts.md — UC-06 시도 결과 md)
 │
 ├─ depends on: 실제 fresh checkout 시도 1~3회 수행 (저자 1 + 외부 1~2)
 └─ enables: C2 평가 매핑이 시도 결과를 인용 / C4 ai-qa-report가 통과 시점 인용

C2 (eval-matrix.md + screenshots/)
 │
 ├─ depends on: C1 (시도 결과로 평가 #1·#2·#3·#5·#6·#7 통과 증거 확보), gstack `/qa` 또는 $B 호출 (screenshots)
 └─ enables: C4 ai-qa-report가 7/7 결과 인용

C3 (README.md §10)
 │
 ├─ depends on: RFP §3 Phase 2 백로그 (외부 정본 read-only)
 └─ independent of: C1·C2 (Phase 2 로드맵은 평가 결과와 분리)

C4 (8 docs 묶음)
 │
 ├─ depends on: C1·C2 (ai-qa-report가 attempts·matrix 결과 인용)
 └─ co-evolves with: P9 code-review + P10 ai-qa-report (같은 PR 내 단계)

C5 (CHANGELOG)
 │
 └─ depends on: C1~C4 모두 (Sprint 6 P0 3건 완료 1줄 보강)
```

- 순환 없음 (C1 → C2 → C4 → C5, C3는 독립)
- C3 (README §10)는 C1·C2와 병렬 가능 (Phase 2 로드맵은 평가 결과와 분리 작업)
- 추정 작업량: ~3h (C1 시도 1회 30m + 외부 1~2 비동기 wait + C2 matrix + screenshots 1h + C3 README §10 30m + C4 docs 1h + C5 CHANGELOG 10m) → WBS 0.5d 범위 내

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| C1 | N/A (docs only — UC-06 시도 절차·환경·결과 md 기록) | UC-06 정상 흐름 1~5 단계 수행 → md 기록 (시도자별 PC·OS·Node 버전·소요 시간·실패 단계·우회·최종 부팅 여부) |
| C2 | N/A (docs + 스크린샷 only) | RFP §10 평가 기준 7개 1:1 매핑 + 통과 결과 — #1·#2·#3·#5·#6·#7 PASS / #4 ⚠️ N/A (F-13 Phase 2) |
| C3 | N/A (README 보강) | README §10 신설 절 ~30 라인 — F-13 페이지네이션 / 세션 인증 / 즐겨찾기 / 검색 / Markdown / 이미지 / 알림 5~7건 매핑 |
| C4 | N/A (docs only) | 8 산출 docs 전수 schema validate-doc.sh PASS |
| C5 | N/A (CHANGELOG only) | 1줄 추가 — "Sprint 6: 3/N P0 완료" 진행도 |
| (전체 PR) | UC-06 fresh checkout 1~3회 + gstack `/qa` 1회 | 회귀 검증: 36 backend + 86 frontend + 5 e2e 모두 PASS (docs only 변경이므로 회귀 0) |
| (전체 PR) | 3 profile 부팅 smoke (AI 게이트 6번째 축) | dev/stg/prod 각 ready 신호 + 에러 0건 (docs only이므로 회귀 신호) |

> 신규 단위·통합·E2E 0건. `frontend/tests` / `backend/tests` / `e2e/specs` 무변경. UC-06 fresh checkout 시도는 R-N-03 §"테스트 3축: E2E ✅ 수동 절차 — gstack `/qa` 또는 UC-06" 결정 정합 (자동 E2E spec 추가 아닌 *수동 절차 기록*).

## 4. 빌드·실행 검증 단계

> 12-scaffolding/typescript.md §5 + LOCAL.md §3 native script 직호출 (ADR-0041).

```bash
# (1) 산출 docs schema 검증
for f in docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || exit 1
done

# (2) UC-06 fresh checkout 시도 (저자, 본 PC) — attempts.md C1 산출 근거
# 실제로는 별도 PC 또는 임시 폴더에서 git clone + pnpm install + pnpm dev 실행
# 본 PR에서는 attempts.md에 시도 시각·소요 시간·실패 단계·우회 절차 기록
cd /tmp/uc06-trial-$(date +%s) && git clone <repo-url> && cd board-app && pnpm install && pnpm dev:local

# (3) gstack /qa 또는 $B로 UC-06 정상 흐름 1~5 호출 + 스크린샷
# - 5단계: 브라우저 http://localhost:5173 → 시드 글 5건 노출 → 글 작성·댓글·태그·삭제 흐름
# - 스크린샷 1~3장 → docs/features/feat-final-golden-path-eval/screenshots/uc06-*.png

# (4) 회귀 — 코드 무변경 검증 (docs only이므로 build/tests 영향 0)
pnpm --filter @app/backend test       # backend 36 integration tests
pnpm --filter @app/frontend test      # frontend 86 unit tests
pnpm --filter @app/e2e test           # e2e 5 specs (Sprint 5 #21 산출)
pnpm --filter @app/backend build      # tsc 검증
pnpm --filter @app/frontend build     # vite 빌드

# (5) 3 profile 부팅 smoke (AI 게이트 6번째 축, ADR-0037 v1.1)
pnpm dev:local   # dev profile ready 신호 + 에러 0건
pnpm dev:stg     # stg profile ready 신호 + 에러 0건
pnpm dev:prod    # prod profile ready 신호 + 에러 0건

# (6) workflow 로컬 검증 (ADR-0047) — manual reproduction (workflow YAML 미변경 PR)
gh pr view <PR_N> --json body --jq '.body' | awk '/^### Manual verification/{f=1;next} /^### |^---/{f=0} f' | grep -cE '^[[:space:]]*-[[:space:]]*\[ \]'
# → 0 (모든 Manual checkbox 미체크) → pr-body-checkbox-gate.yml 시뮬레이션 PASS 예상

# (7) 한국어 주석 회귀 (Sprint 6 #23 도입 스크립트 — 본 PR이 backend/frontend 코드 무변경이므로 4 layer ≥ 80% 유지)
bash scripts/check-comment-coverage.sh
```

## 5. 점진 합의 / 결정 발생 항목

- **O-24-1 결정**: 외부 시도자 모집 = **(a) 저자 본인이 다른 PC 1대 + (b) 동료 1명에게 git clone 부탁** 혼합 채택. 사유 — Sprint 6 P0 완수 우선 + 외부 1명 확보로 *완전 외부* 시각 1건 확보. 동료 시도가 비동기 wait이면 본 PR은 (a) + 저자 본 PC 동시 fresh dir 시도 2회로 1차 머지 후 (b) 후속 코멘트 보강 허용.
- **O-24-2 결정**: 평가 기준 #4 (페이지네이션 F-13) ⚠️ 결과 표현 = **`6/7 PASS + 1 N/A (Phase 2 F-13)`** 표기 + 본 PR에서 *KPI 1차 완화 ADR 별 산출 안 함* (별 이슈 후속 가능). 사유 — RFP §10 평가 기준 7개 *재정의*는 외부 사양 변경이라 scope 과대. ⚠️ N/A 표기로 충분.
- **O-24-3 결정**: 스크린샷 위치 = **`docs/features/feat-final-golden-path-eval/screenshots/`에만 보관 + README §6 표는 무변경**. `eval-matrix.md`만 본 PR 산출 스크린샷을 참조. 사유 — README는 *외부 평가자가 첫 진입하는 정본*이라 안정성 우선 + 본 PR 산출은 *증거 묶음*으로 분리 보관.
- **mode=add 결정 트레이스 (ADR-0032 규칙 4)**: 부정 시그널 0건 (no `type:bug` 라벨 / no UI 키워드 / no breaking signal — UC-06 실증 + 평가 매핑 + README 신설 절 모두 *신규 산출*). `type:test` 라벨은 부정 시그널 매핑 안 됨. 자동 결정·질문 금지.
- 결정 자체는 모두 contract §0 selective read 단계에서 사용자 의도 명시(이슈 본문 DoD 5항 + Acceptance Criteria 3항)와 일치하여 추가 ADR 불필요.
