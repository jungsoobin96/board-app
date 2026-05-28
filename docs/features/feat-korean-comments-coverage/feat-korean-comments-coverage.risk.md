---
doc_type: feature-risk
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-05]
  F-ID: [F-10]
  supersedes: null
---

# feat-korean-comments-coverage — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 4 F-RISK Low 등급 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | grep 룰 false positive — 영어 주석을 한국어로 오인식 | 2 | 2 | Low |
| F-RISK-02 | grep 룰 false negative — 한국어 주석을 누락 인식 | 2 | 2 | Low |
| F-RISK-03 | 80% 임계가 너무 빡빡해 PR 차단 빈도 ↑ (학습 마찰) | 2 | 1 | Low |
| F-RISK-04 | 측정 단위 합의 부재(헤더 vs 본문) — 후속 PR 갈등 | 2 | 1 | Low |

> 모든 RISK Low — 코드 동작 무변경 (주석만 추가), 스크립트 신설 (외부 의존 0). Rollback 단순(revert 1 commit). High 등급 0건이므로 §3 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: grep 룰 false positive

- **카테고리**: 호환성
- **트리거 신호**: 영문 주석 중 한국어 문자(가-힣) 포함 케이스(예: "// Article의 list 반환") → 한국어 주석으로 카운트되어 실제 한국어 의도 주석 비율보다 ↑로 측정
- **완화 전략**: grep 룰을 *연속 한국어 글자 2자 이상*으로 제한 (`[가-힣]{2,}` 패턴). 단일 한글(예: "Article의"의 "의") 1자 매칭은 false positive로 간주하여 미카운트. 또한 JSDoc 블록 외 라인주석(`//`)은 측정 대상 제외 (11-coding-conventions §4 정합).
- **검증 방법**: P9 code-review 시 스크립트 출력의 누락 함수 목록을 수동 5건 sampling — 모두 실제 한국어 주석 부재인지 확인. P14 휴먼 게이트에서 사람이 1회 더 sampling.

### F-RISK-02: grep 룰 false negative

- **카테고리**: 호환성
- **트리거 신호**: JSDoc 형식이 아닌 한국어 의도 주석(예: `// 글 목록 반환`) → 측정 대상 외로 미카운트되어 실제보다 ↓ 측정
- **완화 전략**: 11-coding-conventions §4가 JSDoc 단순화 형식만 인정하므로 *측정 대상 = JSDoc만*이 정책 정합. `//` 라인 한국어 주석은 측정 대상 외 명시 (스크립트 README + AC-03 기준 일치). 누락 함수가 JSDoc 미작성이면 보강 필요로 분류 (false negative 아님).
- **검증 방법**: P9 code-review에서 누락 함수 5건 sampling — 모두 JSDoc 부재인지 확인. JSDoc 있는데 누락 인식되면 grep 룰 정밀화 후 hotfix.

### F-RISK-03: 80% 임계가 너무 빡빡

- **카테고리**: 운영
- **트리거 신호**: 후속 PR에서 신규 함수 1~2건 추가만으로도 layer 커버리지가 < 80% 떨어져 PR 차단 → 학습자 진입 마찰 ↑
- **완화 전략**: R-N-05 정본이 80% 명시이므로 임계 변경은 ADR 필요 (본 PR scope 밖). 본 PR은 임계 80% 그대로 채택. 단, AC-01·02에 "스크립트가 누락 함수 목록을 출력"이 포함되어 학습자가 *어디를 보강해야 하는지* 즉시 확인 가능 — 마찰 ↓. CI 통합은 본 PR scope 밖 (O-23-3 결정)이므로 현 단계에서는 PR 차단 메커니즘 없음.
- **검증 방법**: 본 PR 머지 후 첫 2~3건 후속 PR에서 layer 커버리지 변화 관찰. 80% 근접 layer에서 잦은 < 80% 발생 시 ADR로 임계 조정 논의.

### F-RISK-04: 측정 단위 합의 부재

- **카테고리**: 운영
- **트리거 신호**: 후속 PR에서 "함수 본문 내 한국어 주석도 카운트해야 한다" 같은 의견 충돌
- **완화 전략**: 본 PR contract §6 비목표 + plan §5 O-23-1 결정으로 "함수 헤더 1줄 위 JSDoc만 측정" 명시. 11-coding-conventions §4 형식 정합. 변경 시 ADR 필요. 본 PR의 모든 산출 문서가 이 결정을 일관 인용.
- **검증 방법**: P9 code-review·P14 휴먼 게이트에서 측정 단위 정의가 4 문서(brief·contract·plan·acceptance)에 일관 명시되어 있는지 확인.

## 3. High 등급 단계적 롤아웃

- N/A — High 등급 RISK 0건. 모두 Low.
- 주석 + 스크립트 신설이므로 부분 배포·feature flag·canary 등 단계적 롤아웃 메커니즘 부적용. revert는 단일 commit (Rollback 3단계 — contract §5).

## 4. 데이터 영속성 변경

- 없음. DB·파일시스템·세션 상태 무변경. 주석은 컴파일 영향 0, 스크립트는 측정 도구 (정적 파일 읽기만).

## 5. 15-risk.md 갱신 항목

- 없음. 본 변경의 4 RISK는 모두 Low + 본 feature 범위 내 한정. 15-risk 1수준 산출에 fan-in 불필요. P13 docs-update에서 docs/planning/CHANGELOG.md §"Current Status"에 "Sprint 6 #23 한국어 주석 ≥80% + 스크립트" 1줄만 추가.
