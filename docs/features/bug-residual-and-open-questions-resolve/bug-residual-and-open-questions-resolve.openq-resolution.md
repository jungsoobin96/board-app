---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: []
  F-ID: [F-09]
  supersedes: null
---

# bug-residual-and-open-questions-resolve — Feature Brief (Open Q 29건 분류 부속 문서)

> docs/planning/ 01·03·04·05·10·14 산출에 누적된 Open Q O-01~O-29 (29건)를 일괄 점검·분류. 본 문서는 *분류 묶음*을 brief schema에 맞춰 직렬화한 부속 산출이다 (정본 brief는 `bug-residual-and-open-questions-resolve.brief.md`, 일괄 결정 ADR은 `docs/planning/adr/0049-open-questions-resolution.md`).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 29건 분류 + 17✅ + 2🆕 + 8🔁 Phase 2 + 2🔁 중복 |

## 1. 한 줄 의도

O-01~O-29 29건을 ✅(이미 해소) · 🆕(본 PR ADR-0049 결정) · 🔁 Phase 2(보류) · 🔁(중복) 4 카테고리로 분류해 외부 평가자가 결정 trace를 한곳에서 검토 가능하게 한다.

## 2. 사용자 가치

- **외부 평가자**: docs/planning/ 산출 어떤 §Open Questions 절을 펴도 마커가 박혀 미결정 보이지 않음
- **저자 본인**: 향후 Phase 2 진입 시 *8건 🔁 보류* 항목이 한 표에 정리 — 후속 이슈 등록 시점에 즉시 인용 가능
- **다음 학습 사이클 협업자**: 본 PR 머지 후 Open Q 결정 trace 단일 SoT(ADR-0049 + 본 부속 문서) → 협업 진입 비용 ↓

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (본 PR 진입 전) | 변경 후 (본 PR 산출) |
| --- | --- | --- |
| O-* 분류 표 | 0건 (산재) | 29건 분류 표 본 §8 |
| 카테고리 통계 | 미파악 | ✅ 17건 + 🆕 2건 + 🔁 Phase 2 8건 + 🔁 중복 2건 = 29건 |

## 4. 모드 자동 감지 결과

- **mode**: `bug` (부모 brief 상속)
- **트레이스**: 부정 시그널 0건 — 분류 표는 *신규 산출* + 부모 mode 상속

## 5. 영향 범위

본 md만 영향 — 코드·테스트·DB 무변경. 본 부속 문서는 부모 brief와 함께 C1 commit. ADR-0049 + 6 산출 inline 마커는 별 commit (C2 + C3).

## 6. 비목표

- **결정 본문 작성** — ADR-0049가 결정 본문 정본. 본 문서는 *분류*만 (✅ 행은 기존 결정 인용, 🆕 행은 ADR-0049 §"Decision" 참조)
- **Open Q 추가 식별** — 본 PR scope는 *기존 29건만*. 새 Open Q 발견 시 별 PR
- **Phase 2 백로그 이슈 등록** — 🔁 Phase 2 8건은 본 PR scope에서 *보류*만, 별 이슈 등록은 후속

## 7. Open Questions

본 부속 문서 자체의 Open Q: 없음. 모든 결정 trace는 §8 표 행에 자족.

## 8. Open Q O-01~O-29 29건 분류 표

| # | O-ID | 원문 요약 | 카테고리 | 결정·근거 | 출처 file:line |
| --- | --- | --- | --- | --- | --- |
| 1 | O-01 | React+Vite vs HTML/JS | ✅ 해소완료 | React+Vite 채택 (학습 + 모던 SPA 표준) | docs/planning/02-feasibility/02-feasibility.md §"Decision" + 12-scaffolding/typescript.md §1 |
| 2 | O-02 | JS vs TS | ✅ 해소완료 | TypeScript 채택 (타입 안전 + 학습 친화 균형) | docs/planning/11-coding-conventions/11-coding-conventions.md §1 |
| 3 | O-03 | Prisma vs better-sqlite3 | ✅ 해소완료 | Prisma 채택 (스키마 정의·migration 학습 가치) | docs/planning/08-lld-module-spec/08-lld-module-spec.md + backend/prisma/schema.prisma |
| 4 | O-04 | SQLite WAL 모드 vs 단일 인스턴스 가이드 | 🔁 Phase 2 | 본 MVP 단일 인스턴스. 동시 데모는 Phase 2 후보 (WAL 도입 시 vacuum 정책 별 검토) | (보류 — 후속 이슈 후보) |
| 5 | O-05 | 한국어 주석 KPI 측정 도구 | ✅ 해소완료 | grep 자동 측정 채택 (#23) | scripts/measure-korean-comment-coverage.* (Sprint 6 #23) |
| 6 | O-06 | 댓글 수정 기능 제외 vs Phase 2 후보 | ✅ 해소완료 | MVP 완전 제외 (RFP §3.2 정합) | docs/planning/03-user-scenarios/03-user-scenarios.md §"비목표" + docs/planning/04-srs/04-srs.md |
| 7 | O-07 | 인기 태그 영역 노출 개수 상한 | ✅ 해소완료 | 20개 고정 (R-F-04) | docs/planning/04-srs/04-srs.md R-F-04 |
| 8 | O-08 | 본인 글 수정/삭제 권한 체크 UX | 🔁 Phase 2 | MVP "모두 수정 가능" + README §10 백로그 명시 | (보류 — README §10 #2 정합) |
| 9 | O-09 | gstack /qa UC-01~UC-06 자동화 범위 | ✅ 해소완료 | 13-test-design 결정 (UC-01~UC-06 전수 E2E) | docs/planning/13-test-design/02-catalog.md §3 + e2e/specs/ (5건) |
| 10 | O-10 | 페이지네이션 limit 상한 | 🔁 Phase 2 | F-13 페이지네이션 자체가 Phase 2 (RFP §3 + README §10 #1) | README.md §10 #1 |
| 11 | O-11 | 정렬 옵션 (인기순) | 🔁 Phase 2 | MVP 최신순 고정. 인기순은 후속 후보 | (보류 — Phase 2) |
| 12 | O-12 | 인기 태그 상한 (R-F-04) | 🔁 중복 | O-07 + O-15와 동일 결정 (20개 고정) | (중복 — O-07 결정 정합) |
| 13 | O-13 | TypeScript strict 모드 범위 | ✅ 해소완료 | strict: true 전수 적용 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 + tsconfig.base.json |
| 14 | O-14 | Vitest + Supertest + Playwright 후보 | ✅ 해소완료 | 3종 모두 채택 | backend/package.json devDependencies + e2e/package.json + 12-scaffolding §3 |
| 15 | O-15 | 인기 태그 노출 사용자 옵션 vs 서버 고정 | ✅ 해소완료 | MVP 서버 고정 20개 | docs/planning/10-lld-screen-design/10-lld-screen-design.md §2.1 |
| 16 | O-16 | 한국어 주석 측정 도구 grep vs 수동 | ✅ 해소완료 | grep 자동 (#23) | (O-05 결정 정합) |
| 17 | O-17 | 반응형 검증 — E2E 단일 시나리오 vs viewport별 분리 | 🆕 본 PR ADR-0049 | 단일 E2E 시나리오로 그룹화 결정 (viewport별 분리 시 시나리오 폭증 + 본 MVP 학습 부담) | ADR-0049 §"Decision" |
| 18 | O-18 | README 경고 문구 한/영 병기 | ✅ 해소완료 | 한국어 단일 (사용자 코호트 한국어 학습자) | README.md (한국어 본문 정합) |
| 19 | O-19 | RFP §10 평가 기준 매핑 1:1 vs 그룹화 | ✅ 해소완료 | 1:1 매핑 (#24) | docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md §8 |
| 20 | O-20 | Pretendard self-host vs CDN | ✅ 해소완료 | CDN 채택 (MVP 학습 우선, LCP 영향은 Phase 2 자체 호스팅 검토) | docs/planning/12-scaffolding/typescript.md §1 frontend (또는 동등 위치) |
| 21 | O-21 | 다크 모드 토큰 | 🔁 Phase 2 | MVP 미적용 (RFP §3 외) | (보류 — Phase 2) |
| 22 | O-22 | 인기 태그 사용자 옵션화 | 🔁 중복 | O-15와 동일 (MVP 서버 고정) | (중복 — O-15 결정 정합) |
| 23 | O-23 | 모바일 수정/삭제 inline vs 더보기 메뉴 | 🆕 본 PR ADR-0049 | inline 유지 (10 LLD §1.2 정합, 더보기 메뉴는 token 추가 비용 + 학습 부담) | ADR-0049 §"Decision" |
| 24 | O-24 | 토큰 회귀 스크린샷 diff 자동화 | 🔁 Phase 2 | 다크모드 도입 시 함께 (O-21 의존) | (보류 — Phase 2, O-21 의존) |
| 25 | O-25 | Sprint 5 Playwright vs gstack 단독 | ✅ 해소완료 | Playwright 채택 (Sprint 5 #21) | e2e/specs/ 5건 (Sprint 5 #21) |
| 26 | O-26 | 평가 매핑 1:1 vs 그룹화 | ✅ 해소완료 | 1:1 (#24) | (O-19 결정 정합) |
| 27 | O-27 | 3profile smoke GitHub Actions 포함 | 🔁 Phase 2 | CI 시간 부담 vs 회귀 가치 trade-off → Phase 2 검토 | (보류 — Phase 2) |
| 28 | O-28 | KPI 완화 ADR (10명 → 3명) | 🔁 Phase 2 | 본 PR scope 밖. 별 이슈 후속 (#24 attempts.md §8 N=2/10 baseline) | (보류 — 후속 이슈 후보) |
| 29 | O-29 | 본 #25에서 묶음 vs 분산 ADR | ✅ 해소완료 | 묶음 결정 (본 PR ADR-0049) | docs/planning/adr/0049-open-questions-resolution.md |

### 카테고리 통계

| 카테고리 | 건수 | O-ID |
| --- | --- | --- |
| ✅ 해소완료 | 17 | O-01, O-02, O-03, O-05, O-06, O-07, O-09, O-13, O-14, O-15, O-16, O-18, O-19, O-20, O-25, O-26, O-29 |
| 🆕 본 PR ADR-0049 결정 | 2 | O-17, O-23 |
| 🔁 Phase 2 보류 | 8 | O-04, O-08, O-10, O-11, O-21, O-24, O-27, O-28 |
| 🔁 중복 | 2 | O-12 (= O-07/O-15), O-22 (= O-15) |
| **합계** | **29** | |
