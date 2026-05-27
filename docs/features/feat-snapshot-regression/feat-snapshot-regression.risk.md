---
doc_type: feature-risk
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 3 F-RISK 모두 Low |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | snapshot 신설로 다른 PR(태블/색상 토큰 변경) 시 snapshot diff 폭증 | 2 | 3 | Low |
| F-RISK-02 | viewport 4×5 페이지 + Playwright #21 이관 의사 결정으로 #19 본문 일부 미충족 | 2 | 2 | Low |
| F-RISK-03 | Toast snapshot이 fake timer/cleanup 영향 받아 비일관성 | 3 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — snapshot diff 폭증

5종 도달로 차후 PR에서 Tailwind class 변경 시 snapshot diff 자연 감지 의도. 단 디자인 토큰 일괄 변경(ADR-0038 §10 LLD) PR 시 5종 모두 diff 발생 → `vitest -u`로 일괄 갱신 + review.

**완화책**: 본 의도 자체가 "토큰 회귀 감지"이므로 diff 자체는 기능 정상 작동. 운영 절차상 "토큰 변경 PR은 snapshot 일괄 갱신 + 시각 review 필수"를 PR template에 명시 (별도 운영 이슈 후보).

### F-RISK-02 — viewport 이관

#19 본문 DoD 8항 중:
- ✅ snapshot 5 컴포넌트 (본 PR 충족)
- ❌ Playwright viewport 4 × 5 페이지 (**#21 이관**)
- ❌ gstack /qa 수동 (**#21 이관**)
- ❌ 스크린샷 보관 (**#21 이관**)

사용자 (C) 결정으로 scope 축소. 본 PR contract §6 비목표 명시. #21 이슈 본문 갱신 또는 별도 코멘트 권고.

**완화책**: #21 작업 진입 시 #19 DoD 미충족 항목 자연 흡수. 본 PR ai-qa-report §3 시나리오 인용에 #21 이관 명시.

### F-RISK-03 — fake timer 영향

기존 Toast.test.tsx의 it-3/it-4는 `vi.useFakeTimers()` 사용. afterEach에 `vi.useRealTimers()` cleanup. 신규 snapshot it는 fake timer 미사용 (vi.fn() only).

각 it 격리 시점에 모듈 수준 `afterEach(() => { cleanup(); vi.useRealTimers(); })` 작동 → 상호 영향 없음.

**완화책**: 신규 it 안에서 `cleanup()` 호출 (success → cleanup → error) — 이미 적용됨. 사전 검증 `pnpm test:unit` 86 passed로 확인.

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 본 PR은 단위 테스트 1 it 추가.

## 4. 데이터 영속성 변경

없음 — 테스트 코드 + 자동 생성 snapshot 파일.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. 본 PR의 3 F-RISK 모두 Low로 흡수.
