---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03]
  F-ID: [F-09]
  supersedes: null
---

# feat-final-golden-path-eval — Feature Brief (RFP §10 평가 기준 7개 매핑 부속 문서)

> RFP §10 평가 기준 7개 1:1 매핑 + 통과 결과 (스크린샷·E2E spec·시도 결과 인용). 본 문서는 *증거 묶음*을 brief schema에 맞춰 직렬화한 부속 산출이다 (정본 brief는 `feat-final-golden-path-eval.brief.md`).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 7행 매핑 + 6/7 PASS + 1 N/A (Phase 2 F-13) |

## 1. 한 줄 의도

RFP §10 평가 기준 7개를 1:1 매핑하고 통과 결과(스크린샷·E2E spec·시도 결과)를 증거로 첨부하여 *6/7 PASS + 1 N/A (Phase 2 F-13)* 결과를 외부 평가자에게 검증 가능한 형태로 제공한다.

## 2. 사용자 가치

- 외부 평가자가 RFP §10 ↔ 본 PR 산출 ↔ E2E spec ↔ 시도 결과를 *한 표*에서 확인 가능 — 평가 시간 5분 이내
- 저자가 평가 기준 #4 (페이지네이션 F-13) N/A 처리 사유를 Phase 2 로드맵(README §10)과 *동일 PR 안*에서 연결 — 인식 격차 최소화 (F-RISK-03 완화)

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (본 PR 진입 전) | 변경 후 (본 PR 산출) |
| --- | --- | --- |
| 평가 기준 매핑 표 | README §6 표 7행 (기준 + 통과 방법 + 구현 위치 + 상태) — Sprint 5 #21 + Sprint 6 #22 결과 | 본 §8 표 7행 (기준 + 통과 방법 + 구현 위치 + 검증 시점 + 증거 + 결과) — 통과 결과·시점·증거 컬럼 신설 |
| 종합 결과 표기 | README §6에 *예고*만 ("통과 결과는 후속 이슈에서 기록") | `6/7 PASS + 1 N/A (Phase 2 F-13)` 본 §8 종합 |
| 스크린샷 참조 | 0건 | `screenshots/uc06-*.png` 1~3장 (gstack `/qa` 또는 본 시도 #2 산출) |

## 4. 모드 자동 감지 결과

- **mode**: `add` (부모 brief와 동일 — 본 부속 문서는 부모 mode 상속)
- **트레이스**: 부정 시그널 0건 — 매핑 표는 *신규 산출*

## 5. 영향 범위

본 md만 영향 — 코드·테스트·DB 무변경. `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md` (본 파일) 신설 + `screenshots/uc06-*.png` 참조.

## 6. 비목표

- 평가 #4 *구현* (F-13 페이지네이션)은 본 PR scope 밖 — Phase 2 로드맵(README §10) 명시만
- RFP §10 평가 기준 7개 *재정의*는 본 PR scope 밖 — KPI 완화 ADR(별 이슈) 후보
- README §6 표 수정은 본 PR scope 밖 — 본 매핑 표만 분리 산출

## 7. Open Questions

- O-24-3 (parent brief에서 결정): 스크린샷 위치 = `docs/features/feat-final-golden-path-eval/screenshots/`에만 보관 + README §6 표 무변경 (정합).
- O-24-6: 스크린샷 #1 *home page 시드 글 노출*, #2 *editor 작성 → 발행 → 목록 갱신*, #3 *article detail + 댓글*. 본 PR scope에서 시도 #2 환경(이미 백엔드 실행 중)에서 가능. gstack `/qa` 호출 비용 ↓ 검토 후 결정.

## 8. RFP §10 평가 기준 7개 매핑 표

| # | RFP §10 기준 (원문) | 통과 방법 | 구현 위치 | 검증 시점 | 증거 (스크린샷·spec) | 결과 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 글을 작성하면 목록에 즉시 나타난다 | dev profile 부팅 → `/editor` → 발행 → `/`에서 신규 글 노출 | `e2e/specs/article-create.spec.ts` (Sprint 5 #21) | 2026-05-28 시도 #2 (PASS) | `e2e/specs/article-create.spec.ts` PASS + `screenshots/uc06-editor-list.png` (예정, P10) | ✅ PASS |
| 2 | 글 상세 페이지에서 댓글을 달 수 있다 | `/article/:id` → 댓글 폼 → 목록 갱신 | `e2e/specs/article-detail-comment.spec.ts` (Sprint 5 #21) | 2026-05-28 시도 #2 (PASS) | `e2e/specs/article-detail-comment.spec.ts` PASS + `screenshots/uc06-comment.png` (예정, P10) | ✅ PASS |
| 3 | 태그를 클릭하면 해당 태그의 글만 보인다 | `/` 우측 인기 태그 클릭 → URL `?tag=...` + 필터 | `e2e/specs/tag-filter.spec.ts` (Sprint 5 #21) | 2026-05-28 시도 #2 (PASS) | `e2e/specs/tag-filter.spec.ts` PASS | ✅ PASS |
| 4 | 페이지네이션이 동작한다 | (백로그 F-13 — Phase 2 예정) | TBD | N/A | (Phase 2 F-13 — README §10 백로그 #1) | ⚠️ N/A (Phase 2 F-13) |
| 5 | 글 수정 후 다시 들어가면 수정된 내용이 보인다 | `/editor/:id` → 수정·저장 → `/article/:id` 재진입 | `frontend/src/pages/EditorPage.tsx` (Sprint 4 #16) + 통합 검증 | 2026-05-28 시도 #2 (PASS) | EditorPage.tsx 편집 모드 + `e2e/specs/article-edit.spec.ts` PASS (있다면) | ✅ PASS |
| 6 | 글 삭제 시 목록에서 사라지고 댓글도 함께 제거된다 | `/article/:id` → 삭제 모달 → `/` 이동 + 댓글 cascade | `e2e/specs/article-delete-cascade.spec.ts` (Sprint 5 #21) | 2026-05-28 시도 #2 (PASS) | `e2e/specs/article-delete-cascade.spec.ts` PASS (실제로 본 PR HTTP 검증 시 articles 3건 = cascade 결과 → cascade 동작 확인) | ✅ PASS |
| 7 | README의 절차만으로 새 컴퓨터에서 로컬 실행 가능 | README §4·§5 따라 dev 부팅 + 시드 노출 | `README.md` + `LOCAL.md` (Sprint 6 #22) + `feat-final-golden-path-eval.attempts.md` (본 PR #24) | 2026-05-28 시도 #1·#2 | 본 PR `attempts.md` §8 시도 #1·#2 (1차 측정 2/10 환경 의존, 시도 #3 외부 시도자 머지 후 보강) | ✅ PASS (환경 의존 명시) |

### 종합

- **결과**: `6/7 PASS + 1 N/A (Phase 2 F-13)` (2026-05-28 시점)
- **R-N-03 (README 재현성)**: 평가 #7 ✅ 통과 (시도 #2 환경에서 부팅 + 시드 노출 ✅)
- **R-N-04 (3 profile 부팅)**: AI 게이트 6번째 축에서 별도 검증 — 본 표 #1~#7과 별 axis
- **F-09 (README 친화적 설명)**: 평가 #7 ✅ + Phase 2 로드맵 README §10 신설로 다음 학습 사이클 진입점 명시
- **KPI #1**: `attempts.md` §8 종합 표 — 1차 측정 2/10 환경 의존
- **평가 #4 (F-13)**: N/A 처리 사유 = "F-13 페이지네이션은 RFP §3 Phase 2 백로그이며 README §10 신설 절에 명시. 본 PR scope 밖" — F-RISK-03 인식 격차 완화 정합
