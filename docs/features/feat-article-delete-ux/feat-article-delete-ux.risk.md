---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-article-delete-ux — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #15) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| RISK-01 | 더블 클릭으로 deleteArticle 2회 호출 → 두 번째 호출 404 | 2 | 4 | Med |
| RISK-02 | 모달 열린 상태에서 사용자가 뒤로 가기 → 모달 노출 잔존 가능성 | 2 | 2 | Low |
| RISK-03 | 네트워크 오류 시 NormalizedError.message 영문/sql 노출 → UX 깨짐 | 2 | 3 | Low |
| RISK-04 | cascade 미적용 backend (regression) — 댓글 살아남아 404 미발생 | 4 | 1 | Low |
| RISK-05 | 모달 ESC 처리에 keydown 리스너가 글로벌로 부착돼 모달 unmount 후도 잔존 | 3 | 2 | Low |
| RISK-06 | confirm 버튼 자동 focus가 모달 open 직후 transition 동안 작동 안 함 | 2 | 2 | Low |
| RISK-07 | navigate('/') 후 목록 useArticles가 캐시된 글 표시 (stale) | 2 | 2 | Low |
| RISK-08 | 모달 열린 상태에서 keyboard-only 사용자가 confirm/cancel 외부로 Tab 이탈 | 2 | 2 | Low |

High 등급 없음 — 본 PR은 신규 결합 위주 + cascade는 #8에서 검증 + Article 분기는 #13에서 검증.

## 2. 리스크 상세

### RISK-01 — 더블 클릭 deleteArticle 2회 호출
- **원인**: 사용자가 "삭제" 버튼을 빠르게 두 번 누르거나, 네트워크 지연 중 다시 클릭.
- **영향**: 두 번째 호출은 404 — UX 혼란. 데이터 영향은 backend가 idempotent (cascade 후 재 DELETE는 404).
- **완화**: ConfirmModal `isPending` prop으로 confirm 버튼 disabled. Article에서 `useState<boolean>` 로 pending 추적. AC-06가 본 시나리오 검증.
- **잔존 리스크**: React.StrictMode dev 환경 double effect는 useEffect/promise에 영향 없음 (event handler는 1회). 무시 가능.

### RISK-02 — 모달 + 뒤로가기
- **원인**: 사용자가 모달을 연 채 브라우저 뒤로가기 → React Router가 페이지 변경 → 모달은 페이지 내부 상태라 unmount.
- **영향**: 자연 unmount되므로 잔존 X. 다만 사용자가 뒤로 → 앞으로 다시 진입 시 모달 닫힌 상태로 재 mount (state 초기화).
- **완화**: 별도 처리 불필요 — React Router 기본 동작.

### RISK-03 — NormalizedError 영문 메시지 노출
- **원인**: BE가 일반 500 / 네트워크 fault 발생 시 NormalizedError 생성자가 fallback 메시지 사용.
- **영향**: "Internal Server Error" 등 영문 노출 → 한국어 UX 깨짐.
- **완화**: ConfirmModal alert에서 error.message를 그대로 노출하지 않고 한국어 wrap 처리 — 예: `삭제에 실패했습니다 (${error.message})`. 호출자(Article)에서 이미 NormalizedError 기준이라 frontend 일관성 유지.

### RISK-04 — cascade 미적용 (regression)
- **원인**: backend cascade 로직 회귀 — 댓글이 남아 글만 삭제된 상태.
- **영향**: AC-05 시각 확인이 깨질 수 있으나, R-F-07 backend cascade는 #8 PR #36에서 통합 테스트로 보장됨.
- **완화**: 본 PR scope 밖. AC-05는 frontend 분기(useArticle 404 → NotFound) 검증만 함. backend cascade가 깨지면 #8 회귀로 분리.

### RISK-05 — ESC keydown 글로벌 리스너 잔존
- **원인**: ConfirmModal이 `useEffect`로 `window.addEventListener('keydown', ...)` 부착 시 cleanup 누락.
- **영향**: 모달 닫힌 후도 ESC가 다른 곳에서 onCancel을 호출하려다 cancelled 참조 오류.
- **완화**: useEffect cleanup 함수에서 명시적 `removeEventListener`. ConfirmModal RTL 테스트 (b)가 ESC 동작을 검증하므로 cleanup 누락 시 다른 테스트에서 side-effect로 드러남.

### RISK-06 — confirm 버튼 자동 focus 실패
- **원인**: 모달 open 직후 React render flush 전에 ref.current가 null.
- **영향**: 키보드 사용자가 Enter로 즉시 확정 못 함 — Tab 1회 필요.
- **완화**: `useEffect(..., [open])`에서 setTimeout(0) 또는 그냥 ref.current?.focus() 호출. 본 PR에서는 단순 `useEffect(() => { if (open) confirmRef.current?.focus(); }, [open])` 사용. RTL 테스트 (a)가 검증.

### RISK-07 — 목록 stale 캐시
- **원인**: useArticles에 자체 캐시가 있으면 navigate 후 삭제된 글이 보임.
- **영향**: 사용자가 "응? 삭제 안 됐나?" 혼란.
- **완화**: 본 프로젝트 useArticles는 캐시 없이 매 mount fetch (Sprint 3 #11 PR #39에서 확인). React Query 미사용. 자연 해소.

### RISK-08 — Tab focus 이탈
- **원인**: focus trap을 구현 안 하면 Tab으로 모달 외부 link/button으로 이동 가능.
- **영향**: 키보드 사용자가 모달 안에 갇힌 듯한 UX X (오히려 자유). 단 a11y 가이드라인 위배.
- **완화**: 최소 trap — confirm/cancel 두 버튼만 순환 (onKeyDown으로 Tab/Shift+Tab 직 구현). 외부 라이브러리 미사용.

## 3. High 등급 단계적 롤아웃

High 등급 없음 — 단계적 롤아웃 N/A.

## 4. 데이터 영속성 변경

본 PR은 frontend-only — schema·migration·API 변경 없음. backend는 #8에서 검증된 cascade를 그대로 호출만 함.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음 — 본 PR은 기존 backend 동작을 frontend에 wire하는 작업이라 1수준 리스크 표(15-risk.md)에 등재할 새 카테고리 없음.
