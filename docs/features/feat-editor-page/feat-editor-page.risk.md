---
doc_type: feature-risk
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-02, R-F-05, R-F-08]
  F-ID: [F-03, F-06, F-11]
  supersedes: null
---

# feat-editor-page — Feature Risk

> Issue #14 · mode=add · P7. High 0, Medium 4.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| FE-EP-RISK-01 | 빈 title submit 검증 누락 → backend 400 응답 시점에야 에러 발견 (UX 손상) | 3 | 2 | Low |
| FE-EP-RISK-02 | 수정 모드 미존재 id → 무한 loading (404 분기 누락) | 4 | 2 | Medium |
| FE-EP-RISK-03 | submit 중 중복 클릭 → POST 다중 발사 + 글 중복 생성 | 4 | 3 | Medium |
| FE-EP-RISK-04 | tagList input 정규화 누락 → 중복/공백 토큰이 backend로 그대로 (정규화 backend가 흡수하지만 표시 일관성 손상) | 2 | 3 | Low |
| FE-EP-RISK-05 | 시크릿 노출 0 | 5 | 1 | Medium |
| FE-EP-RISK-06 | XSS — React JSX auto-escape | 5 | 1 | Medium |
| FE-EP-RISK-07 | submit 실패 시 입력값 소실 (controlled state 미보존) | 4 | 2 | Medium |
| FE-EP-RISK-08 | a11y 누락 (label htmlFor / aria-describedby) | 3 | 2 | Low |
| FE-EP-RISK-09 | navigate 후 unmount race — AbortController로 흡수 | 3 | 2 | Low |

High 0. Medium 5 모두 mitigation 명시.

## 2. 리스크 상세

### FE-EP-RISK-02: 수정 모드 404 분기 누락

- **시나리오**: `/editor/99999` 진입 → useArticle loading 상태 영원
- **완화**: Editor가 useArticle 5상태 분기. status='error' + err.status===404 시 NotFound 직 렌더 (Article #13 동일 패턴)
- **검증**: Editor.test 수정 모드 케이스에 404 분기 추가

### FE-EP-RISK-03: submit 중복 클릭

- **시나리오**: 사용자가 "발행" 빠르게 2~3회 클릭 → POST 다중 발사 → 글 2~3개 중복 생성
- **완화**: submit 중 isSubmitting state → 버튼 disabled + aria-busy
- **검증**: EditorForm.test (d) submit disabled 케이스

### FE-EP-RISK-06: XSS

- **시나리오**: 사용자 본문에 `<script>` → DOM injection
- **완화**: React JSX auto-escape 자동. dangerouslySetInnerHTML 절대 미사용
- **검증**: code-review grep

### FE-EP-RISK-07: 입력값 소실

- **시나리오**: submit 실패 → form re-render → 입력 사라짐
- **완화**: controlled state는 useState. submit 실패 = setError만 호출, state 유지
- **검증**: EditorForm.test 검증 실패 케이스에 입력 보존 assert

### FE-EP-RISK-05: 시크릿 노출

- **시나리오**: 환경변수 / API key가 form payload에 섞임
- **완화**: payload는 4 필드만 명시 JSON.stringify. import.meta.env는 BASE_URL만 사용
- **검증**: code-review

## 3. High 등급 단계적 롤아웃

High 0.

## 4. 데이터 영속성 변경

- schema 0
- migration 0

## 5. 15-risk.md 갱신 항목

본 PR scope 외.
