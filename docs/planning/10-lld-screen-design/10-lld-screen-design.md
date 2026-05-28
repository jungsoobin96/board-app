---
doc_type: screen-design
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-28
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-06]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-11]
  supersedes: null
---

# Conduit Lite — Screen Design (LLD — UI)

> NEW_PROJECT Gate C. 05 PRD F-01~F-08·F-11을 화면 단위로 발현. ADR-0038 §3 디자인 토큰 4종(Color·Typography·Spacing·Component primitives) BLOCK 강제 — 12-scaffolding §8 styling 솔루션과 schema-level 매핑.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §5 Open Q O-20~O-24 ADR-0049 마커 (#25) |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 화면 인벤토리

| ID | 화면명 | 진입 트리거 | F-ID 매핑 |
|---|---|---|---|
| S-01 | Home (글 목록 + 사이드바) | `/` 진입 또는 헤더 로고 클릭 | F-01·F-02·F-08·F-11 |
| S-02 | Article 상세 | 글 카드 클릭 또는 `/article/:id` 직접 진입 | F-04·F-05·F-11 |
| S-03 | Editor (글 작성) | 헤더 "새 글" 버튼 또는 `/editor` 진입 | F-03·F-11 |
| S-04 | Editor (글 수정) | 상세에서 "수정" 버튼 또는 `/editor/:id` 진입 | F-06·F-11 |
| S-05 | NotFound | 미일치 경로 또는 미존재 article id | F-04 (간접) |

## 2. 화면 상세

### S-01: Home (글 목록 + 사이드바)

- **목적**: 학습자·방문자가 최신 글 목록을 탐색하고 태그 필터로 빠르게 좁힌다.
- **상태**: Active (MVP 필수)
- **F-ID 매핑**: F-01·F-02·F-08·F-11
- **레이아웃**
  ```
  ┌─ Header [로고]                     [새 글]   [GitHub] ┐
  ├──────────────────────────────────────────────────────┤
  │ ┌─ 글 목록 (left, 2/3 폭) ────┐  ┌─ 사이드바 (1/3) ─┐ │
  │ │ <ArticleCard × 10>          │  │ 인기 태그        │ │
  │ │ ┌─ Pagination ─┐            │  │ <TagList>       │ │
  │ │ │ < 1 [2] 3 >  │            │  │                 │ │
  │ │ └──────────────┘            │  └─────────────────┘ │
  │ └────────────────────────────┘                       │
  └──────────────────────────────────────────────────────┘
  ```
- **상호작용**
  - 카드 클릭 → `/article/:id` 이동
  - 페이지네이션 버튼 → `?page=N` URL 갱신 → 재호출
  - 태그 클릭 → `/?tag=:name` URL 갱신 → 재호출
- **반응형 (R-N-06)**: 768px 미만에서 사이드바를 하단으로 stack. 320~360px 모바일에서도 카드 가로 스크롤 없음.
- **데이터**: GET `/api/articles?page=&tag=` + GET `/api/tags`
- **에러 상태**: API 500 → `<ErrorBoundary>` 토스트 + 재시도 버튼. 빈 결과(`articles=[]`) → "결과 없음" 안내.

### S-02: Article 상세

- **목적**: 글 본문·작성자·태그·댓글을 한 화면에서 확인하고 본인 글이면 수정/삭제 진입.
- **상태**: Active
- **F-ID 매핑**: F-04·F-05·F-11
- **레이아웃**
  ```
  ┌─ Header ──────────────────────────────────────────┐
  ├──────────────────────────────────────────────────┤
  │  H1. <title>                                      │
  │  by <author>  ·  <createdAt>      [수정] [삭제]  │
  │  <TagList read-only>                              │
  │                                                   │
  │  <body — plain text>                              │
  │                                                   │
  │  ─── 댓글 (N개) ───                                │
  │  <CommentList>                                    │
  │  ┌─ 새 댓글 폼 ─┐                                  │
  │  │ author / body / [작성]                          │
  │  └──────────────┘                                  │
  └──────────────────────────────────────────────────┘
  ```
- **상호작용**
  - "수정" → `/editor/:id`
  - "삭제" → 확인 모달 → DELETE → 홈으로 navigate
  - 댓글 작성 → POST → 댓글 영역 갱신
  - 본인 댓글 옆 "삭제" → DELETE → 영역 갱신
- **반응형**: 모바일에서 "수정/삭제" 버튼을 하단으로 이동 또는 더보기 메뉴.
- **데이터**: GET `/api/articles/:id` + GET `/api/articles/:id/comments` (병렬)
- **에러 상태**: 404 → S-05 NotFound로 redirect. 검증 실패 → 인라인 에러.

### S-03: Editor (글 작성)

- **목적**: 학습자가 글을 발행한다.
- **상태**: Active
- **F-ID 매핑**: F-03·F-11
- **레이아웃**
  ```
  ┌─ Header ──────────────────────────────────────────┐
  ├──────────────────────────────────────────────────┤
  │  <Input title>     placeholder="제목"             │
  │  <Input author>    placeholder="작성자"           │
  │  <Textarea body>   placeholder="본문 (plain text)" │
  │  <Input tagList>   placeholder="태그 (쉼표 구분)" │
  │                                                   │
  │                                       [발행]      │
  └──────────────────────────────────────────────────┘
  ```
- **상호작용**: "발행" → POST → 성공 시 `/article/:id` navigate / 실패 시 인라인 에러 + 입력값 보존
- **반응형**: 360px에서 폼 전 폭, 1024px 이상에서 max-width 720px 중앙 정렬.
- **검증 (M9)**: title 1~200자, body ≥1자, author 1~50자, tagList trim·lower·중복 제거.

### S-04: Editor (글 수정)

- **목적**: 발행 글을 수정.
- **상태**: Active
- **F-ID 매핑**: F-06·F-11
- **레이아웃**: S-03과 동일. 진입 시 기존 값 사전 로드. 버튼 라벨 "저장".
- **상호작용**: GET `/api/articles/:id`로 사전 로드 → PUT → 성공 시 `/article/:id` navigate. 미존재 id → S-05.
- **반응형**: S-03과 동일.

### S-05: NotFound

- **목적**: 미일치 경로 또는 미존재 article·comment id 진입 시 안내.
- **상태**: Active
- **F-ID 매핑**: F-04 (간접)
- **레이아웃**
  ```
  ┌─ Header ──────────────────────────────────────────┐
  ├──────────────────────────────────────────────────┤
  │                                                   │
  │              404 — 페이지를 찾을 수 없어요         │
  │           [홈으로]                                 │
  │                                                   │
  └──────────────────────────────────────────────────┘
  ```
- **상호작용**: "홈으로" 클릭 → `/` navigate.
- **반응형**: 단일 컬럼.

## 3. 디자인 시스템 / 토큰

본 §은 ADR-0038 §3 BLOCK — 12-scaffolding §8 styling 솔루션(Tailwind)이 본 토큰을 `tailwind.config.ts` `theme.extend`에 인용한다.

### Color (primary·secondary·neutral 최소 3종)

| 토큰 | Hex | 용도 |
|---|---|---|
| `--color-primary-50` | `#eff6ff` | Primary 배경 hover |
| `--color-primary-500` | `#3b82f6` | Primary 강조 (버튼·링크) |
| `--color-primary-700` | `#1d4ed8` | Primary active |
| `--color-secondary-500` | `#10b981` | Secondary (성공·태그 칩) |
| `--color-secondary-700` | `#047857` | Secondary active |
| `--color-neutral-0` | `#ffffff` | 배경 base |
| `--color-neutral-100` | `#f3f4f6` | 카드 배경 |
| `--color-neutral-300` | `#d1d5db` | Border |
| `--color-neutral-700` | `#374151` | 본문 텍스트 |
| `--color-neutral-900` | `#111827` | 헤딩 |
| `--color-danger-500` | `#ef4444` | 삭제·에러 |
| `--color-danger-700` | `#b91c1c` | 삭제 active |

### Typography (font-family + scale 최소 3단)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--font-family-base` | `'Pretendard', -apple-system, system-ui, sans-serif` | 본문 (한국어 친화) |
| `--font-family-mono` | `ui-monospace, 'JetBrains Mono', monospace` | 코드·날짜 |
| `--text-xs` | `0.75rem / 1rem` | 캡션·메타 |
| `--text-sm` | `0.875rem / 1.25rem` | 부가 정보 |
| `--text-base` | `1rem / 1.5rem` | 본문 |
| `--text-lg` | `1.125rem / 1.75rem` | 카드 제목 |
| `--text-xl` | `1.25rem / 1.75rem` | 페이지 부제 |
| `--text-2xl` | `1.5rem / 2rem` | 글 상세 H1 |
| `--text-3xl` | `1.875rem / 2.25rem` | 페이지 H1 |
| `--font-weight-regular` | `400` | 본문 |
| `--font-weight-semibold` | `600` | 강조·버튼 |
| `--font-weight-bold` | `700` | H1·H2 |

### Spacing (scale 최소 4단)

| 토큰 | 값 (rem) | 용도 |
|---|---|---|
| `--space-1` | `0.25rem` (4px) | 미세 간격 (icon ↔ text) |
| `--space-2` | `0.5rem` (8px) | 폼 내 라벨↔input |
| `--space-3` | `0.75rem` (12px) | 컴포넌트 내부 padding |
| `--space-4` | `1rem` (16px) | 카드 padding |
| `--space-6` | `1.5rem` (24px) | 섹션 간격 |
| `--space-8` | `2rem` (32px) | 카드 간 간격 |
| `--space-12` | `3rem` (48px) | 페이지 상하단 padding |

### Component primitives (Button·Input·Card 등 최소 3종, 상태 variant 포함)

| Primitive | 변형 | 정의 |
|---|---|---|
| `<Button>` | primary / secondary / danger / ghost | padding `--space-3` `--space-4`, radius `0.5rem`, weight `--font-weight-semibold`. hover/active/disabled 상태 명시. |
| `<Input>` | default / error | border `--color-neutral-300`, focus `--color-primary-500`. error variant — border `--color-danger-500` + helper text 빨강. |
| `<Textarea>` | default / error | `<Input>`과 동일 규칙, min-height `8rem`. |
| `<Card>` | default / interactive | 배경 `--color-neutral-0`, border `--color-neutral-300`, padding `--space-4`. interactive variant — hover 시 border `--color-primary-500`. |
| `<Pagination>` | (단일) | 페이지 버튼 — Button ghost variant 재사용. 현재 페이지는 primary. |
| `<TagChip>` | default / clickable | 배경 `--color-secondary-500` (alpha 10%), text `--color-secondary-700`. clickable variant — hover 시 배경 alpha 20%. |
| `<Toast>` | success / error | 배경에 따라 secondary/danger. 3초 후 자동 dismiss. |
| `<Modal>` | confirm / dialog | overlay `rgba(0,0,0,0.5)` + max-width `28rem` + close button. |

## 4. 접근성

- **시맨틱 마크업**: `<main>`, `<nav>`, `<article>`, `<aside>` 적극 사용.
- **포커스 가능**: 모든 인터랙티브 요소 keyboard 진입 가능. focus ring `--color-primary-500`.
- **라벨**: 모든 `<Input>`에 `<label>` 또는 `aria-label`. placeholder 단독 금지.
- **컨트라스트**: 본문 텍스트는 WCAG AA 4.5:1 이상 (`--color-neutral-700` on `--color-neutral-0` 충족).
- **모바일 터치 영역**: 인터랙티브 요소 최소 44×44px.
- **에러 안내**: 검증 실패 시 `<input>` 옆 `<span role="alert">` 표시.
- **MVP 범위**: 스크린 리더 완전 지원은 Phase 2 후보. WCAG AA 컬러 컨트라스트와 기본 포커스 관리만 본 MVP에서 보장.

## 5. Open Questions

> [ADR-0049 Sprint 6 #25 일괄 해소] 본 §의 O-20~O-24 5건 결정 trace는 [`docs/planning/adr/0049-open-questions-resolution.md`](../adr/0049-open-questions-resolution.md) + [`bug-residual-and-open-questions-resolve.openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

- O-20: Pretendard 폰트 self-host vs CDN — README 재현성과 첫 페이지 LCP 영향 검토 (12-scaffolding §1·§7에서 확정). **✅ 해소완료** (CDN 채택, MVP 학습 우선)
- O-21: 다크 모드 토큰 제공 여부 — MVP 미적용, Phase 2 후보. **🔁 Phase 2 보류**
- O-22: 사이드바 "인기 태그" 상한 사용자 옵션화 — 본 MVP는 서버 고정 20개 (O-15). **🔁 중복** (O-15와 동일)
- O-23: 모바일에서 "수정/삭제" 버튼을 inline vs 더보기 메뉴 중 어느 쪽으로 둘지. **🆕 본 PR ADR-0049 결정** (inline 유지, §1.2 정합)
- O-24: gstack `/qa` 토큰 회귀 검증 — 토큰 변경 시 스크린샷 diff 자동화 여부 (13 Test Design 03-regression에서 결정). **🔁 Phase 2 보류** (다크모드 도입 시 함께, O-21 의존)
