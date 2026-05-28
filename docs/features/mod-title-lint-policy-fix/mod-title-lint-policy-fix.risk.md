---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-OPS-WORKFLOW]
  F-ID: []
  supersedes: null
---

# mod-title-lint-policy-fix — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — workflow regex 확장 리스크 4건 Low (이슈 #56) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | POSIX ERE 정규식 escape 오타 (workflow YAML에서 `|` escape 실수) | 4 | 1 | Low |
| F-RISK-02 | `bug(...)`·`design(...)` title이 여전히 lint FAIL — 사용자가 의도된 분리를 이해 못 함 | 2 | 2 | Low |
| F-RISK-03 | ADR-0003 신설 후 후속 amend가 ADR INDEX 동기 누락 | 2 | 1 | Low |
| F-RISK-04 | workflow MSG 본문(line 52) type 목록 갱신 누락으로 사용자가 lint FAIL 시 6 type 오안내 받음 | 1 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — POSIX ERE 정규식 escape 오타 (Low)
- **시나리오**: workflow YAML single-quote 안 `\(...\)`·`|` escape 실수로 모든 PR title이 lint FAIL — `mod` 미인식이 아니라 *전부* 미인식
- **완화**: 본 PR 머지 *전* plan.md §4 Phase 5 옵션 B `grep -qE` 명령으로 본 PR title + 6 기존 type 전수 PASS 확인 (workflow self-test). 정규식이 PR open 직후 자기 검증되므로 머지 전 발견 가능
- **검증**: AC-01 (본 PR self-test) + AC-02 (6 기존 type 회귀 검증)

### F-RISK-02 — `bug/design` title 사용자 혼란 (Low)
- **시나리오**: 사용자가 `bug/login-redirect-issue-58` branch에서 PR title `bug(login): ...`로 작성 → lint FAIL → 의도된 분리(branch=작업 분류 / title=변경 분류)를 모르고 incorrect bug report
- **완화**: ADR-0003 §Rationale + §Examples에 정확한 mapping 표 명시 (`bug/` branch → `fix(login): ...` title). workflow MSG 본문(line 52)에 9 type 목록 동기 — 사용자가 lint FAIL 시 즉시 올바른 type 발견
- **검증**: AC-03 (ADR-0003 신설) + 후속 PR 자연 회귀 관찰 (eng-review §6 follow-up)

### F-RISK-03 — ADR INDEX 동기 누락 (Low)
- **시나리오**: 본 PR에서 0003 entry 추가 후, 후속 ADR 0004 등 신설 시 INDEX entry 누락 패턴 재발
- **완화**: 본 PR이 INDEX 갱신 자체를 plan.md C2에 명시 — 모범 case. 추가 자동화는 over-engineering, 별 후속 작업 N/A
- **검증**: AC-03 (INDEX entry 형식 정합 확인) + code-review에서 cross-ref

### F-RISK-04 — workflow MSG line 52 갱신 누락 (Low)
- **시나리오**: 정규식만 갱신하고 MSG line 52~54 type 목록 동기 갱신 누락 → 사용자가 lint FAIL 시 안내 코멘트에서 6 type만 봄
- **완화**: contract §2 Before/After에 line 2·29·52 3 line 동기 갱신 명시. P8 implement 단계에서 grep으로 type 목록 일치 확인
- **검증**: AC-01 (workflow 자기 검증) — MSG 본문 자체는 lint conclusion에 영향 없으나, code-review 단계에서 3 line 동기 cross-check

## 3. High 등급 단계적 롤아웃

해당 없음 — 모든 리스크 Low 등급 (영향 1~4 + 가능성 1~2 조합). 본 PR은 workflow YAML 1줄 + 신설 ADR 변경, 단일 PR 일괄 머지 적절. 단계적 롤아웃 불필요.

## 4. 데이터 영속성 변경

해당 없음 — 본 PR은 workflow YAML + 신설 ADR. DB·migration·로컬 storage·세션 모두 영향 0건.

## 5. 15-risk.md 갱신 항목

해당 없음 — 본 PR 리스크는 Local scope (workflow infra). 프로젝트 전역 리스크 표(15-risk)에 누적할 필요 없음. 본 프로젝트 15-risk 산출 부재로 갱신 대상 자체 없음.
