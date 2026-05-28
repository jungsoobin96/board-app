---
doc_type: feature-acceptance
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03, R-N-04, R-N-07]
  F-ID: [F-09, F-12]
  supersedes: null
---

# feat-readme — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | AC-01~05 GWT + DoD 6항 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 새 PC + Node 20 학습자가 README §설치·§실행 절차로 dev profile 부팅

- **Given**: 새 PC에 Node 20 설치 + git clone board-app + pnpm 9 설치
- **When**: README §설치 명령(`pnpm install`) + §실행 명령(`pnpm dev:local`) 순서대로 실행
- **Then**: backend `:3000` + frontend `:5173` 모두 ready 신호 출력 + 에러 0건 + 브라우저에서 시드 5건 노출
- **측정 방법**: 수동 확인 (UC-06 수동 시도 — `test-final-golden-path` 후속 이슈가 본 시도 결과 기록)
- **R-ID**: R-N-03 (학습자 진입성), R-N-04 (평가 기준 노출), R-N-07 (운영 격리)

### AC-02: §평가 기준 7항이 RFP §10과 1:1 매핑되고 통과 방법 명시

- **Given**: README §평가 기준 표 (7행 × {기준·통과 방법·구현 위치·상태})
- **When**: 검토자가 RFP §10 7항과 README §평가 기준을 대조
- **Then**: 7행 모두 RFP §10 ID(또는 본문) ↔ README 통과 방법 ↔ 구현 위치(spec 경로) 3방향 정합
- **측정 방법**: 수동 확인 (P9 code-review + P14 휴먼 게이트가 매핑 정합 점검)
- **R-ID**: R-N-04 (평가 기준 노출)

### AC-03: §보안 1단락이 한국어/영문 병기로 "공개 데모용 / 운영 사용 금지" 경계 명시

- **Given**: README §보안 1단락
- **When**: 사용자가 §보안 절을 읽음
- **Then**: 한국어 "공개 데모용, 운영 사용 금지" + 영문 "Public demo only — NOT for production" 두 문장 모두 노출
- **측정 방법**: 자동 테스트 (validate-doc.sh + grep 패턴 매칭) + 수동 확인 (P9 code-review)
- **R-ID**: R-N-07 (운영 격리)

### AC-04: §설치 §사전 요구사항에서 yq 권고 + fallback 명시

- **Given**: README §설치 §사전 요구사항
- **When**: 사용자가 사전 요구사항 절을 읽음
- **Then**: yq (mikefarah/yq v4+) 권고 1줄 + 미설치 시 `.claude/runbook.md` §4 fallback link 명시
- **측정 방법**: 자동 테스트 (grep 패턴 매칭)
- **R-ID**: R-N-03 (학습자 진입성)

### AC-05: §Phase 2 향후 확장 절이 RFP §11 4단계와 일관

- **Given**: README §Phase 2 향후 확장
- **When**: 검토자가 RFP §11 1~6단계와 README §Phase 2를 대조
- **Then**: 핵심 4단계(세션 로그인 / 권한 / 프로필 / JWT 전환) 모두 README에 명시 + RFP §11 link 제공
- **측정 방법**: 수동 확인 (P9 code-review)
- **R-ID**: R-N-03 (학습자 진입성)

## 2. Definition of Done (D-06)

| # | 항목 | 본 PR 적용 |
| --- | --- | --- |
| 1 | **단위 테스트** 통과 — docs only PR이므로 신규 단위 테스트 N/A. 기존 frontend 86 + backend 36 회귀 통과 (P10 자동 검증) | ✅ |
| 2 | **AI 게이트** 6축 PASS (자동 테스트 / 코드 리뷰 / Test Plan 4블록 / 시크릿 / 골든패스 5번째 축 N/A (ui_changed=false) / 6번째 축 3 profile 부팅) | ⏳ P10에서 |
| 3 | **Test Plan 4블록** PR body 작성 (Build / Automated / Manual verification / DoD coverage) | ⏳ P10에서 |
| 4 | **tested 라벨** 부착 (ADR-0046 v1.2로 사실상 폐기, status check `pr-body-checkboxes` 자동 발행으로 대체) | ⏳ P14에서 휴먼 |
| 5 | **Approve** ≥ 1 (사람 리뷰) | ⏳ P15에서 휴먼 |
| 6 | **CI green** + 모든 status checks PASS (workflow 양축 ADR-0047 통과) | ⏳ P11~P15에서 |
| + 이슈 본문 DoD 6항 | LOCAL.md cross-ref / 평가 기준 7 매핑 / §보안 한·영 / 학습 트랙 / yq 권고 / 1명 시도 PASS | 본 PR 머지 후 사람이 ✅ |

## 3. 비기능 인수

- **분량**: README ≤ 300줄 권고 (.claude/scripts/check-line-count.sh WARN-only). docs/features/feat-readme/ 산출은 가드 외 (운영 문서만 가드 대상)
- **한국어 친화**: §보안 한·영 병기 외 본문은 한국어 위주 (RFP §6.4 평가자 친화성 정합)
- **유지보수**: LOCAL.md를 흡수하지 않음 (양축 보존, ADR-0040 §2.4 동기 진화)
- **접근성**: 마크다운 표준만 사용 (이미지 alt 텍스트는 본 PR에 이미지 미포함이므로 N/A)

## 4. 회귀 인수

- ✅ 기존 LOCAL.md 본문 변경 없음 (read-only 참조만)
- ✅ frontend/backend/shared/e2e 모든 src 코드 변경 없음 (`git diff <base>...HEAD --stat`로 확인)
- ✅ 기존 회귀 36 backend integration + 86 frontend unit + 5 e2e spec 전수 통과 (P10 자동 검증)
- ✅ 3 profile (dev/stg/prod) 부팅 smoke 통과 (P10 6번째 축)
- ✅ 기존 docs 묶음(`docs/features/*` 외 23 폴더) 무변경
