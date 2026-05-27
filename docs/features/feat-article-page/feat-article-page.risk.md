---
doc_type: feature-risk
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-06, R-F-08]
  F-ID: [F-04, F-05]
  supersedes: null
---

# feat-article-page — Feature Risk

> Issue #13 · mode=add · P7. High 0, Medium 3.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| FE-AP-RISK-01 | useArticle 404 분기 누락 → NotFound 안 보임 (사용자 글 무한 로딩) | 4 | 2 | Medium |
| FE-AP-RISK-02 | useArticle/useComments 병렬 fetch 중 한쪽 실패 → 다른 쪽도 무효 표기 | 3 | 2 | Low |
| FE-AP-RISK-03 | AbortController signal forwarded — #12 MAJOR-01 패턴 답습 안 함 → 메모리 leak + race | 4 | 2 | Medium |
| FE-AP-RISK-04 | 시크릿 노출 0 | 5 | 1 | Medium |
| FE-AP-RISK-05 | a11y 누락 (시맨틱·aria) | 3 | 2 | Low |
| FE-AP-RISK-06 | 본문 XSS — React JSX auto-escape | 5 | 1 | Medium |
| FE-AP-RISK-07 | 수정/삭제 버튼 mount만 — 사용자 클릭 시 무반응 (UX 혼동) | 3 | 4 | Medium |

High 0. Medium 5 모두 mitigation 명시.

## 2. 리스크 상세

### FE-AP-RISK-01: 404 분기 누락

- **시나리오**: useArticle이 404 응답을 error 상태로 처리 안 함 → 무한 loading
- **완화**: useArticle catch → NormalizedError instanceof + status===404 → NotFound 직 렌더
- **검증**: useArticle.test 404 케이스

### FE-AP-RISK-03: AbortController signal

- **시나리오**: #12 MAJOR-01과 동일 패턴 — controller.abort() 호출만 + signal 미전달
- **완화**: #11 client.ts options.signal 2nd arg + useArticle/useComments에서 명시 전달
- **검증**: hook test에 signal forwarded assertion

### FE-AP-RISK-06: XSS

- **시나리오**: 사용자 본문에 `<script>` 등 → DOM injection
- **완화**: React JSX auto-escape 자동. dangerouslySetInnerHTML 절대 미사용
- **검증**: code-review grep

### FE-AP-RISK-07: 버튼 mount만

- **시나리오**: 사용자가 "수정"/"삭제" 클릭 → 무반응 → 혼동
- **완화**: PR description + commit message에 "Sprint 4에서 핸들러 결합" 명시. Sprint 4 #N가 본 버튼에 연결
- **검증**: 사용자 P14에서 인지

## 3. High 등급 단계적 롤아웃

High 0.

## 4. 데이터 영속성 변경

- schema 0
- migration 0

## 5. 15-risk.md 갱신 항목

본 PR scope 외.
