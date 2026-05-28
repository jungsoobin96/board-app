---
doc_type: feature-contract
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

# feat-final-golden-path-eval — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §0~§6 채움 + Rollback 3단계 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 본 contract가 건드리는 게이트 C 정본을 명시. 영향 없는 종류는 "(none)"으로 명시.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-N-03, R-N-04 |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-09 |
| 영향 모듈 | docs/planning/08-lld-module-spec | (none) — docs only |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec | (none) — docs only |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | (none) — 코드 무변경 |

> 추가 read-only 참조 (selective): `docs/planning/03-user-scenarios/03-user-scenarios.md` §UC-06 (시나리오 정본), `RFP.md` §10 (평가 기준 7개 원본), `README.md` §6 (이미 매핑된 7행 표 — 본 PR이 통과 결과 1:1 보강).

## 1. 변경 의도

UC-06 (새 PC에서 README 재현) 흐름을 저자 1회 + 외부 1~2명으로 fresh checkout 시도하고, RFP §10 평가 기준 7개를 1:1로 통과 검증한 결과를 `docs/features/feat-final-golden-path-eval/`에 증거(스크린샷·시도 로그·매핑 표)로 박는다. 동시에 README §10에 Phase 2 향후 확장 로드맵을 신설하여 다음 학습 사이클의 시작점을 명시한다.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| UC-06 실제 fresh checkout 시도 결과 | 0건 — README는 Sprint 6 #22로 작성됐으나 실제 시도 기록 0 | `feat-final-golden-path-eval.attempts.md`에 저자 1회 + 외부 1~2명 시도 결과 (각 시도자별: PC·OS·Node 버전·실행 명령·소요 시간·실패 단계·우회 절차·최종 부팅 여부) |
| RFP §10 평가 기준 7개 통과 결과 | README §6 표가 7행 매핑만 명시 (구현 위치 + 기존 E2E spec 인용). 통과 결과·시점·검증 증거 0건 | `feat-final-golden-path-eval.eval-matrix.md`에 7행 × [기준·통과 방법·구현 위치·검증 시점·증거(스크린샷/스펙)·결과(PASS/N/A)] 표. 평가 #4 (페이지네이션 F-13)는 `⚠️ N/A (Phase 2)` 명시 + KPI 1차 완화 ADR 후보 |
| gstack `/qa` 최종 골든패스 호출 | Sprint 5 #21에서 E2E 5건 호출 (`docs/features/feat-e2e-golden-path/`). UC-06 흐름 전체 호출 0건 | UC-06 정상 흐름 1~5단계를 gstack `/qa` 또는 `$B`(browse)로 1회 최종 호출 + 스크린샷 1~3장 (`screenshots/uc06-{home,article,editor}.png`) |
| README §10 Phase 2 향후 확장 절 | 이미 §10 존재 (Sprint 6 #22 산출) — 세션 인증·프로필·JWT·팔로우·즐겨찾기 6개 항목. 평가 기준 #4 (페이지네이션 F-13) 항목 부재 | §10 보강 — F-13 페이지네이션을 #1로 신규 추가 + 평가 기준 §6 #4 백로그 명시 + `eval-matrix.md` 본 PR 산출 link. 기존 6개 항목 #2~#7로 1행씩 후순위 이동 (내용 무변경, 번호만 shift) |
| KPI #1 측정 진행도 | 0/10 시도 (Sprint 5까지 *예고*만, 실측 0) | 1~3/10 시도 (저자 1 + 외부 1~2) — 1차 측정. 미달분 7~9건은 KPI 완화 ADR 후보 (Acceptance §3) |
| Sprint 6 P0 누적 진행 | #22 (README) + #23 (한국어 주석) 머지 완료. #24 본 작업 진행 중 | Sprint 6 P0 3건 모두 완료 — 잔여는 #25 (P1, 잔여 버그 + Open Questions) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `docs/features/feat-final-golden-path-eval/` (신설 폴더) | 8 + 2 신설 파일 (산출 8 docs + attempts + eval-matrix) + screenshots/ | C2~C4 신설 커밋으로 일괄 도입 |
| `README.md` §10 (신설 절) | ~30 라인 추가 — §9 "외부 참고" 뒤·`### 종합 평가` 등 동급 H2 직전 | C5 커밋으로 §10 단독 추가 |
| `README.md` §6 표의 `상태` 컬럼 (read-only 참조) | 변경 0 — 평가 매핑은 본 PR이 `eval-matrix.md`로 분리 보강 (O-24-3 결정 정합 — 중복 인용 회피) | 무변경. 본 PR `eval-matrix.md`에서 "README §6 표 read-only 참조"로 인용만 |
| RFP.md §10 평가 기준 7개 (정본) | read-only 참조만. RFP 무변경 (외부 사양 정본) | 인용만 — `eval-matrix.md`의 "기준" 컬럼은 RFP §10 원문 그대로 |
| `docs/planning/03-user-scenarios/03-user-scenarios.md` §UC-06 (정본) | read-only 참조만 | 인용만 — `attempts.md`의 "시도 절차" 컬럼은 UC-06 정상 흐름 1~5단계 그대로 |
| `docs/planning/CHANGELOG.md` §"Current Status" | P13 docs-update에서 Sprint 6 P0 3건 완료 1줄 추가 | P13 커밋으로 갱신 |

## 4. Backward Compatibility

- **Breaking**: no — 신설 폴더 + README §10 신설 절 + CHANGELOG 1줄만. 기존 코드·테스트·API·DB·UX 동작 영향 0.
- **마이그레이션 필요**: no
- **deprecation 일정**: N/A — 무삭제·무수정 (README §10은 신설 절이므로 기존 §1~§9 안 건드림)
- **외부 의존 변경**: 0 — gstack `/qa` / `$B` 둘 다 이미 도입(Sprint 5 #21에서 동일 도구 사용)

## 5. Rollback 전략

- **revert 가능**: yes — 단일 squash commit revert만으로 신설 폴더 + README §10 신설 절 + CHANGELOG 1줄 모두 회수
- **rollback 절차 (3단계 이내)**:
  1. `gh pr view <PR_N> --json mergeCommit --jq '.mergeCommit.oid'` → squash 머지 commit hash 확인
  2. `git revert <hash> --no-edit` → revert commit 생성 → `git push origin main` (또는 별도 revert PR 후 머지)
  3. 검증: `git log -1`로 revert 확인 + `ls docs/features/feat-final-golden-path-eval/` 부재 확인 + README §10 절 부재 확인 (`grep -n "Phase 2 향후 확장" README.md` → 0 line)
- **데이터 손상 위험**: 없음 — DB·캐시·세션·파일시스템 영속 상태 무변경

## 6. 비목표

- KPI #1 "10명 시도 100% 성공" *완전 달성*은 본 PR scope 밖 — 1~3명 표본으로 1차 측정만. 미달분 KPI 완화 ADR은 후속 이슈로 분리 가능 (Acceptance §3 통해 본 PR에서 ADR 1건 작성도 허용하나 *별 PR도 허용*).
- 평가 기준 #4 (페이지네이션 F-13) *구현*은 본 PR scope 밖 — Phase 2 로드맵 명시만.
- gstack `/qa` 자동화 스크립트 추가는 본 PR scope 밖 (O-09 → 12 Test Design 결정 사항).
- README §1~§9 기존 절 수정은 본 PR scope 밖 — §10 신설만.
- README §6 표의 `상태` 컬럼 수정 (예: 평가 #4를 `⚠️ Phase 2 예정 (F-13)` → `❌ Phase 2 (F-13)` 등 표현 변경)은 본 PR scope 밖 — `eval-matrix.md`에서 별도 검증 결과만 추가.
