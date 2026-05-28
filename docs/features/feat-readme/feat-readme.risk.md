---
doc_type: feature-risk
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

# feat-readme — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 4 F-RISK Low 등급 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | README ↔ LOCAL.md 정합성 drift (양축 보존 위반) | 2 | 2 | Low |
| F-RISK-02 | 평가 기준 매핑 오류 (RFP §10 ↔ README §평가 기준 ↔ spec 경로 3방향 정합 깨짐) | 3 | 1 | Low |
| F-RISK-03 | §보안 한·영 병기 오역으로 운영 사용 오해 | 3 | 1 | Low |
| F-RISK-04 | yq 권고를 강제로 오해하여 학습자 진입 장벽 ↑ | 1 | 2 | Low |

> 모든 RISK Low — docs only PR, 코드 무변경, Rollback 단순(revert 1 commit). High 등급 0건이므로 §3 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: README ↔ LOCAL.md 정합성 drift

- **카테고리**: 호환성
- **트리거 신호**: README §설치·§실행이 LOCAL.md §2·§3의 명령과 한 글자라도 다름. 또는 LOCAL.md 갱신 시 README cross-ref 미동기.
- **완화 전략**: README §설치·§실행은 *명령 본문 인용 금지*, "LOCAL.md §2·§3 참조" 1줄 link만 유지. 부팅 자산 변경 PR은 ADR-0040 §2.4 동기 lint가 LOCAL.md 갱신을 강제 (AI 게이트 6번째 축이 schema-level BLOCK).
- **검증 방법**: P9 code-review 시 README의 명령 인용 0회 확인 + 1년 후 LOCAL.md 변경 PR이 README cross-ref도 갱신했는지 grep 점검.

### F-RISK-02: 평가 기준 매핑 오류

- **카테고리**: 호환성
- **트리거 신호**: RFP §10 7항 ↔ README §평가 기준 표 7행 ↔ 실제 spec/UC 경로 3방향 중 1방향 누락. 예: RFP에 있고 README 표에는 빠진 항목, README 표에 spec 경로가 잘못 적힌 항목 등.
- **완화 전략**: P9 code-review에서 RFP §10 7항 vs README §평가 기준 표 7행 vs e2e/specs 5건 + (페이지네이션 F-13 Phase 2 표기) 3방향 정합 체크리스트 강제. 본 PR brief §7 Open Questions O-22-1에서 #4 페이지네이션은 "⚠️ Phase 2 예정 (F-13)" 명시로 사전 차단.
- **검증 방법**: 수동 — P9 code-review 시 3방향 매핑 표 작성. P14 휴먼 게이트에서 사람이 1회 더 대조.

### F-RISK-03: §보안 한·영 병기 오역

- **카테고리**: 보안
- **트리거 신호**: 영문이 한국어 "운영 사용 금지" 의도를 약화 (예: "should not be used in production" → "may not be suitable" 같은 약한 표현).
- **완화 전략**: 영문은 표준 보안 문구 "Public demo only — NOT for production. Do not deploy to public internet without security hardening." 그대로 사용. P9 code-review 시 영문 문장이 한국어와 의미적으로 동등한지 확인.
- **검증 방법**: 자동 — P10 ai-qa-report grep `Public demo only` + `NOT for production` 두 패턴 모두 매치. 수동 — P14 휴먼 게이트.

### F-RISK-04: yq 권고를 강제로 오해

- **카테고리**: 외부 의존
- **트리거 신호**: 학습자가 yq 미설치 PC에서 "README가 yq 필수라 했다"고 오해하여 진입 포기.
- **완화 전략**: README §설치 §사전 요구사항에서 yq를 **"권고"** 명시 + 미설치 시 fallback (`.claude/runbook.md` §4) link 1줄. 본 PR contract §6 비목표에 "yq 강제 설치 금지" 명시.
- **검증 방법**: 자동 — grep `권고|recommended` + `fallback` 두 키워드 모두 README §설치에 노출.

## 3. High 등급 단계적 롤아웃

- N/A — High 등급 RISK 0건. 모두 Low.
- docs only PR이므로 부분 배포·feature flag·canary 등 단계적 롤아웃 메커니즘 부적용. revert는 단일 commit (Rollback 3단계 — contract §5).

## 4. 데이터 영속성 변경

- 없음. DB·파일시스템·세션 상태 무변경. docs only.

## 5. 15-risk.md 갱신 항목

- 없음. 본 변경의 4 RISK는 모두 Low + 본 feature 범위 내 한정. 15-risk 1수준 산출에 fan-in 불필요. P13 docs-update에서 docs/planning/CHANGELOG.md §"Current Status"에 "Sprint 6 #22 README 신설" 1줄만 추가.
