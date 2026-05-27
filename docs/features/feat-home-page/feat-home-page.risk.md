---
doc_type: feature-risk
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04, R-N-06]
  F-ID: [F-01, F-02, F-08, F-11]
  supersedes: null
---

# feat-home-page — Feature Risk

> Issue #12 · mode=add · P7. High 0, Medium 7.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| FE-HP-RISK-01 | URL state 양방향 동기 깨짐 (URL 진입 vs 버튼 클릭 차이) | 4 | 2 | Medium |
| FE-HP-RISK-02 | AbortController cleanup 누락 → 메모리 leak + race condition | 4 | 2 | Medium |
| FE-HP-RISK-03 | MSW handler 누수 (afterEach reset 누락) → flaky | 3 | 2 | Low |
| FE-HP-RISK-04 | RTL snapshot에 createdAt 등 timestamp 포함 → 불안정 | 3 | 3 | Medium |
| FE-HP-RISK-05 | msw devDeps 추가 → lock 갱신 실패 시 install 차단 | 4 | 2 | Medium |
| FE-HP-RISK-06 | 768px stack 깨짐 (Tailwind class 오타) | 3 | 2 | Low |
| FE-HP-RISK-07 | listArticles + listTags 병렬 fetch — backend 동시 부하 | 2 | 2 | Low |
| FE-HP-RISK-08 | 시크릿 노출 0 | 5 | 1 | Medium |
| FE-HP-RISK-09 | a11y 누락 (`<nav aria-label>` 등) | 3 | 2 | Low |
| FE-HP-RISK-10 | empty 상태 UI 누락 → 사용자 혼동 ("아무것도 없는데 로딩?") | 3 | 2 | Low |

High 0. Medium 4 모두 mitigation 명시.

## 2. 리스크 상세

### FE-HP-RISK-01: URL state 양방향

- **시나리오**: URL `?page=2` 진입 시 fetch 안 함 또는 버튼 클릭 시 URL 갱신 안 함 → state 불일치
- **완화**: useSearchParams → useEffect dependency에 `[searchParams.get('page'), searchParams.get('tag')]`. 양방향 자동 정합
- **검증**: MSW 통합 + 수동 브라우저 history.back

### FE-HP-RISK-02: AbortController

- **시나리오**: useEffect cleanup 누락 → unmount 후 setState → React warning + 메모리 leak
- **완화**: cleanup 함수에서 `controller.abort()` 명시. AbortError catch → ignore
- **검증**: useArticles.test.ts AC

### FE-HP-RISK-04: snapshot timestamp

- **시나리오**: ArticleCard snapshot에 `createdAt: new Date()` 직 노출 → 매 실행마다 diff
- **완화**: snapshot용 props에 fixed timestamp (`new Date('2026-01-01')`) 사용
- **검증**: 5회 연속 vitest 실행 안정성

### FE-HP-RISK-05: msw devDeps lock

- **시나리오**: 사용자 `pnpm install` 누락 → lock stale → CI/사후 install 실패
- **완화**: PR body Manual에 명시 (사용자 lock commit 절차)
- **검증**: 사용자 PowerShell 후 git status clean

### FE-HP-RISK-08: 시크릿 노출

- **시나리오**: useArticles에 token 등 leak
- **완화**: 본 PR은 read-only fetch — token/secret 0
- **검증**: reviewer grep

## 3. High 등급 단계적 롤아웃

High 0 — 불필요.

## 4. 데이터 영속성 변경

- schema 0
- migration 0

## 5. 15-risk.md 갱신 항목

본 PR scope 외.
