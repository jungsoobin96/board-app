---
doc_type: feature-acceptance
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: []
  F-ID: [F-09]
  supersedes: null
---

# bug-residual-and-open-questions-resolve — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | AC-01~AC-04 + DoD 6 + 비기능 3 + 회귀 AC-R-01~R-04 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: Open Q 29건 분류 표 완비

- **Given** docs/planning/ 산출에 누적된 Open Q O-01~O-29 (29건)
- **When** `bug-*.openq-resolution.md` 작성
- **Then** 29건 모두 다음 4 카테고리 중 하나로 분류됨:
  - ✅ 해소완료 (이미 다른 산출에서 결정됨, 근거 인용 포함)
  - 🆕 본 PR ADR-0049로 결정 (결정 내용 명시)
  - 🔁 Phase 2 보류 (보류 사유 + 후속 이슈 후보 명시)
  - 🔁 중복 (다른 O-* 와 같은 결정, 매핑 명시)

### AC-02: ADR-0049 신설

- **Given** 본 PR scope의 결정 항목
- **When** `docs/planning/adr/0049-open-questions-resolution.md` 작성
- **Then** ADR 9 sections 표준 충족 + Open Q 29건 일괄 결정 표 (1행/O) + adr.schema.yaml validate-doc.sh PASS

### AC-03: 산출 inline 마커 추가

- **Given** O-* 가 있는 docs/planning/0X-* 산출 6건 (01·03·04·05·10·14)
- **When** 각 §Open Questions 행에 상태 마커 (✅/🆕/🔁) inline 추가
- **Then** 6 산출 모두 §Open Questions 행에 마커 부착 + 변경 이력 표에 v0.X 갱신 행 추가 + ADR-0049 참조 링크 명시

### AC-04: backend 결함 0건 baseline 박음

- **Given** backend 회귀 100건 (단위 64 + 통합 36) + frontend 단위 86 + e2e 5 + grep 0건
- **When** `bug-*.investigation.md` §"종합 결과 표" 작성
- **Then** "191 PASS + 0 FAIL + 결함 마커 0건 = 결함 0건 확정" baseline 명시 + 절차 7단계 누구나 재현 가능

## 2. Definition of Done (D-06)

- [ ] 단위 테스트 = N/A (결함 0건 PR, investigation §7 사유 명시) — 회귀 191건 PASS 유지
- [ ] AI 게이트 6축 PASS (1~6번 모두)
- [ ] Test Plan 4블록 (Build / Automated / Manual / DoD)
- [ ] `tested` 라벨 폐지 (ADR-0046 §3) — status check `pr-body-checkboxes` PASS
- [ ] Approve ≥ 1
- [ ] CI green

## 3. 비기능 인수

- **NF-01 분량 가드**: bug-*.md 10건 + ADR-0049 1건 = 11 docs 각 300줄 권고 미만 (운영 문서 가드는 운영 문서 한정이고 본 산출은 산출 문서 → WARN만, BLOCK 없음, ADR-0010 정합)
- **NF-02 schema 정합**: 11 docs 모두 `validate-doc.sh` PASS (frontmatter 7필드 + sections schema BLOCK 통과)
- **NF-03 회귀 baseline 유지**: 본 PR 머지 후 backend 회귀 100건 + frontend 86 + e2e 5 = 191 PASS 그대로 (회귀 0건 유지)

## 4. 회귀 인수

### AC-R-01: backend 단위 회귀 64 PASS

- **Given** `pnpm --filter @app/backend test`
- **When** 본 PR diff 적용 후
- **Then** 64 passed, 0 failed (= 진입 전 baseline 동일)

### AC-R-02: backend 통합 회귀 36 PASS

- **Given** `pnpm --filter @app/backend test:integration`
- **When** 본 PR diff 적용 후
- **Then** 36 passed, 0 failed + R-N-01 p95 < 200ms 유지

### AC-R-03: frontend 단위 회귀 86 PASS (+ 1 skip)

- **Given** `pnpm --filter @app/frontend run test:unit`
- **When** 본 PR diff 적용 후
- **Then** 86 passed, 1 skipped, 0 failed

### AC-R-04: e2e 회귀 5 PASS

- **Given** `pnpm --filter @app/e2e test`
- **When** 본 PR diff 적용 후 (외부 의존 brew 시동 가정)
- **Then** 5 passed, 0 failed

### AC-R-05: schema 전수 검증 11 docs PASS

- **Given** 본 PR 신설 11 docs (bug-* 10건 + ADR-0049)
- **When** `bash .claude/scripts/validate-doc.sh <each>`
- **Then** 11/11 OK

### AC-R-06: 3 profile 부팅 smoke

- **Given** dev / stg / prod profile별 부팅 명령 (LOCAL.md §3)
- **When** 각 profile 부팅 시도
- **Then** ready 신호 확인 + 에러 0건 (단일 환경 운영이 아닌 한 3 profile 모두; 외부 의존 장애 시 사용자 승인 후 skip 허용)
