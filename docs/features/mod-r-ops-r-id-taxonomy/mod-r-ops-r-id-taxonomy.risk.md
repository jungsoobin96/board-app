---
doc_type: feature-risk
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# R-OPS R-ID taxonomy (Issue 52) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 4 F-RISK 모두 Low (정합/PR title prefix/회귀/upstream 전파) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | 04-srs §3 분량 가드 (300줄) 초과 | 1 | 4 | Low |
| F-RISK-02 | PR title `mod(docs):` prefix가 ADR-0021 정규식 미정합 → lint fail | 2 | 4 | Low |
| F-RISK-03 | check-test-catalog-sync.sh WARN 발생 (R-OPS-* fan-in 부족) | 3 | 1 | Low |
| F-RISK-04 | 기존 #49/#53 PR의 R-OPS-AUTO-LABEL ad-hoc 참조 retroactive 정합 깨짐 | 2 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — 04-srs §3 분량 가드 초과

04-srs §3 현재 7건 R-N-*이 line 163~273 (~110줄). R-OPS-* 4건 추가로 ~+100줄 예상 → §3만 ~210줄, 전체 04-srs는 ~430줄. CLAUDE.md §"분량 가드" — *산출 문서는 가드 외* (운영 문서만 가드 대상). 04-srs는 산출 문서이므로 가드 미적용. settings.json hook이 WARN 출력해도 차단 없음. ADR-0002 §4 결과 negative에 명시.

**완화책**: 차단 없음. 분량 폭증 시(Sprint 6+) 04-srs 폴더 분할 정책 발동 (file-numbering §3.1 — sub 파일 분할 + INDEX.md).

### F-RISK-02 — PR title `mod(docs):` prefix lint fail

ADR-0021 정규식: `^(feat|fix|chore|docs|test|refactor)\([a-z][a-z0-9,_-]*\): .+$`. `mod`는 미포함. 본 PR title은 `mod(docs):`로 시작하면 lint fail 예상. #51 PR #53과 동일 발견 — branch prefix(`mod/`) vs title 정규식 정책 불일치 (이미 Sprint 5 follow-up 후보).

**완화책**: PR title을 `docs(plan):` 또는 `chore(plan):`으로 정정. 이슈 title은 `mod(docs):` 유지 (정책 follow-up에서 일괄 처리). 본 PR scope 안에서 PR title 정정으로 lint=success 회복.

### F-RISK-03 — check-test-catalog-sync.sh WARN

R-OPS-* 4건 04-srs 신설 후 13-catalog §2 fan-in이 누락되면 WARN. 본 PR plan §4 단계 B에서 사전 검증.

**완화책**: 본 PR P8 implement에서 13-catalog §2 R-OPS-* 4건 fan-in을 04-srs §3 R-OPS-* 신설과 *동일 commit*에 박음. check-test-catalog-sync.sh를 P10 ai-qa Build 절에서 자동 검증.

### F-RISK-04 — 기존 PR의 ad-hoc 참조 정합

#49/#53 acceptance.md/risk.md/ai-qa-report.md의 `related.R-ID: [R-OPS-AUTO-LABEL]`은 본 PR 머지로 정본 등록되므로 자연 정합 회복. 단 frozen된 docs이므로 별도 갱신 불필요 (retroactive 정합).

**완화책**: 사후 grep 확인 — `grep -rln 'R-OPS-AUTO-LABEL' docs/features/` 결과의 모든 PR 폴더가 정본 등록 시점 이후 자연 정합 (frozen 보존). 본 PR contract §3에 명시.

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 본 PR은 docs-only modify. 단계적 롤아웃 불필요. 단 ADR-0002에 alternative C(schema 완화)를 명시적으로 기각한 사실은 정책 일관성 유지 의도.

## 4. 데이터 영속성 변경

없음 — 본 PR은 docs/markdown만. DB 마이그레이션·schema 변경·migration script 모두 N/A.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. 본 PR의 4 F-RISK는 모두 본 PR scope 내 Low 등급으로 흡수. Sprint 5 retro에서 검토 후보:
- **RISK 신규**: "branch prefix `(feat|mod|bug|design)/` vs PR/이슈 title 정규식 `(feat|fix|chore|docs|test|refactor)` 정책 불일치 — WBS 23 이슈 다수 영향" (Sprint 5 follow-up, #51에서 발견 + 본 PR에서 재확인)
