---
doc_type: feature-risk
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 3 F-RISK 모두 Low |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | active 칩 재클릭 해제 동작이 일부 사용자에게 혼란 ("필터 해제 ×" 버튼과 redundancy) | 1 | 2 | Low |
| F-RISK-02 | TagList 단위 RTL 2건 신규로 기존 4 it 회귀 발생 | 3 | 1 | Low |
| F-RISK-03 | Home handleTagClick(null) 분기에 page reset 의도와 다른 동작 | 2 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — toggle UX 혼란

active 칩 재클릭 = 해제 패턴은 ConfirmModal(#15) confirmTarget toggle과 일관. 명시적 "필터 해제 ×" 버튼도 보존하여 양 진입점 제공. 사용자가 혼란을 느낄 가능성 매우 낮음. 만약 발견 시 `aria-pressed` 시각 강조(toggle 의도 명확)로 추가 보강.

**완화책**: redundancy 의도 보존 + ADR-0011 ui_changed=true 사용자 골든패스 실증 단계에서 실제 사용 경험 확인.

### F-RISK-02 — 기존 RTL 회귀

신규 it 2건 추가가 기존 4 it에 영향 줄 수 없음 (각각 독립 `cleanup`). 단 snapshot 변경 가능성 있으나 onClick handler만 변경되어 시각 동일 → snapshot 변동 없음 예상. 만약 snapshot 변동 시 `vitest -u` 후 review.

**완화책**: `pnpm --filter @app/frontend run test:unit` 사전 실행으로 85/86 passed 확인 (Build 단계에서 검증). 본 PR ai-qa-report §1 Automated tests 자동 확인.

### F-RISK-03 — Home handleTagClick(null) page reset 의도

Home handleTagClick(null) 분기 동작:
- `params.delete('tag')` ✅
- `params.delete('page')` ✅ (page 1로 reset 의도 — Sprint 3 #12부터 의도)

`onTagClick(null)`은 active 칩 재클릭 시에도 발화 — 따라서 page도 reset됨. **의도된 동작** (필터 해제 시 첫 페이지로 돌아감). 만약 사용자 의도가 "해제하되 page 유지"라면 추가 follow-up 필요. 본 PR scope에서는 기존 page reset 동작 유지 (의도된 단순화).

**완화책**: Sprint 5 retro에서 사용 경험 확인 후 page 유지 옵션 별 follow-up 후보 검토 (현재는 follow-up 등록 안 함).

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 본 PR은 작은 UX 마무리. 단계적 롤아웃 불필요.

## 4. 데이터 영속성 변경

없음 — 클라이언트 사이드 UI 변경, BE 무관, DB 무관.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. 본 PR의 3 F-RISK는 모두 본 PR scope 내 Low 등급으로 흡수.
