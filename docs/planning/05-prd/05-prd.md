---
doc_type: prd
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-28
gate: B
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit Lite — PRD

> Gate B 입력. 04 SRS R-F-XX·R-N-XX를 사용자 가치 단위(F-XX)로 묶고 MVP Cut을 확정. ADR-0014·0023 강제 — F-XX 본문에 MVP·우선순위·사용자 스토리·Acceptance·R-ID 매핑·테스트 시나리오·3축(단위·통합·E2E) 결정.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §7 Open Q O-15~O-19 ADR-0049 마커 (#25) |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-init Phase 1, RFP §3·§4·§10 + 04 SRS 기반) |

## 1. 제품 개요

Conduit Lite는 RealWorld 스펙의 핵심(게시글·댓글·태그)만 발췌한 학습용 미니 블로그다. 풀스택 1주기를 입문자가 완주 가능한 범위로 의도적으로 축소했다. 인증·팔로우·피드 등 고난도 영역은 Phase 2 이후 단계적으로 확장한다.

핵심 가치 — **"DB ↔ API ↔ 화면" 풀스택 흐름을 끝까지 동작하는 형태로 학습한다.**

## 2. 사용자 가치

- **학습자(Hana)** — README 절차만으로 새 환경에서 부팅하고, 글 작성→삭제까지 한 사이클을 완주. 한국어 주석된 핵심 모듈로 패턴을 습득.
- **방문자(Min)** — 가입 없이 글을 읽고 댓글로 의견을 남기며 태그·페이지네이션으로 빠르게 탐색.
- **평가자(Park)** — README 100% 재현 + 평가 기준 7개 항목을 객관적으로 검증.

## 3. 기능

### F-01: 게시글 목록 + 페이지네이션

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 방문자 / 학습자, I want 글 목록을 최신순으로 페이지 단위 탐색 So that 한 번에 너무 많은 글이 노출되어 압도되지 않게.
- **Acceptance**:
  - Given 글이 25건 존재 When `/` 진입 Then 10건 노출 + "다음" 버튼으로 2페이지 이동
  - Given `?page=3` 직접 진입 When 페이지 로드 Then 21~25번째 글 노출 + "이전" 버튼만 활성
- **R-ID 매핑**: R-F-01, R-F-08, R-N-01
- **테스트 시나리오**:
  - Happy: 정상 페이지 이동 (1→2→3)
  - Failure: 잘못된 page=-1 → 400 + page=1로 fallback
- **테스트 결정 (3축)**:
  - 단위: ✅ (페이지 파라미터 파서)
  - 통합: ✅ (API + DB 페이지네이션 흐름)
  - E2E: ✅ (브라우저 페이지네이션 클릭)

### F-02: 태그 필터

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 방문자, I want 인기 태그를 클릭해 관련 글만 보기 So that 관심사를 빠르게 좁힐 수 있게.
- **Acceptance**:
  - Given 사이드바 "인기 태그" 영역 노출됨 When 태그 "javascript" 클릭 Then `/?tag=javascript`로 이동 + 해당 태그 글만 노출
  - Given 존재하지 않는 태그 When `/?tag=ghost` 진입 Then 빈 목록 + "결과 없음" 안내
- **R-ID 매핑**: R-F-01, R-F-04
- **테스트 시나리오**:
  - Happy: 태그 클릭 → 필터링 동작
  - Failure: 존재하지 않는 태그 → 빈 목록 안내 (에러 아님)
- **테스트 결정 (3축)**:
  - 단위: ✅ (태그 정규화 함수)
  - 통합: ✅ (필터 쿼리 검증)
  - E2E: ✅ (사이드바 클릭 시나리오)

### F-03: 글 작성

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 학습자, I want 제목·본문·작성자·태그를 입력해 글을 발행하기 So that 내 학습 메모를 공개 데모로 공유.
- **Acceptance**:
  - Given `/editor` 진입 When title/body/author/tagList 입력 → "발행" Then `/article/:id`로 이동 + 글 노출
  - Given title 빈 값 When "발행" Then 400 + 필드 highlight + 입력값 보존
- **R-ID 매핑**: R-F-02, R-F-05, R-F-08
- **테스트 시나리오**:
  - Happy: 정상 입력 → 발행 → 상세 페이지 노출
  - Failure: title 빈 값 → 에러 안내 + 입력값 보존
- **테스트 결정 (3축)**:
  - 단위: ✅ (form 검증 함수)
  - 통합: ✅ (POST → DB 저장 → 응답)
  - E2E: ✅ (editor → 발행 → 상세 진입)

### F-04: 글 상세

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 방문자, I want 글의 본문과 작성자·작성일·태그·댓글을 한 페이지에서 확인 So that 맥락을 끊지 않고 읽기.
- **Acceptance**:
  - Given 글 id=1 존재 When `/article/1` 진입 Then 본문 + 댓글 목록 + (학습자 본인이면) 수정/삭제 버튼 노출
  - Given 존재하지 않는 ID When `/article/999` 진입 Then 404 페이지 노출
- **R-ID 매핑**: R-F-03, R-F-06, R-F-08
- **테스트 시나리오**:
  - Happy: 존재 ID 정상 노출
  - Failure: 존재하지 않는 ID → 404 페이지
- **테스트 결정 (3축)**:
  - 단위: ✅ (id 파싱 + 404 분기)
  - 통합: ✅ (article + comments 병렬 조회)
  - E2E: ✅ (`/article/:id` 진입 시나리오)

### F-05: 댓글 작성·삭제

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 방문자, I want 글 상세에서 댓글을 남기고 본인 댓글을 삭제 So that 의견 교환과 정정이 가능하게. (수정 기능은 MVP에서 의도적 제외)
- **Acceptance**:
  - Given `/article/:id` 진입 When 댓글 폼에 body/author 입력 → "작성" Then 응답 후 댓글 영역에 즉시 추가
  - Given 본인 댓글 옆 "삭제" When 확인 → 응답 204 Then 댓글 영역에서 사라짐
  - Given body 빈 값 When "작성" Then 400 + 필드 안내
- **R-ID 매핑**: R-F-06, R-F-05
- **테스트 시나리오**:
  - Happy: 댓글 작성·삭제 정상
  - Failure: 빈 body → 400 안내 / 이미 삭제된 댓글 → 404 (idempotent 안내)
- **테스트 결정 (3축)**:
  - 단위: ✅ (검증·404 매핑)
  - 통합: ✅ (POST/DELETE → DB 반영)
  - E2E: ✅ (댓글 폼 시나리오)

### F-06: 글 수정

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 학습자, I want 발행한 글을 수정 So that 오타나 내용을 정정. (MVP는 인증 없음 — 모두 수정 가능, Phase 2에서 권한 체크 추가)
- **Acceptance**:
  - Given 글 상세에서 "수정" 클릭 When `/editor/:id` 진입 Then 기존 값 사전 로드
  - Given 필드 수정 → "저장" When PUT 응답 200 Then 글 상세로 리다이렉트 + 변경값 노출
  - Given title 빈 값으로 저장 When 검증 실패 Then 400 + 필드 highlight
- **R-ID 매핑**: R-F-02, R-F-05, R-F-08
- **테스트 시나리오**:
  - Happy: 수정 정상
  - Failure: 검증 실패 → 입력값 보존 + 안내
- **테스트 결정 (3축)**:
  - 단위: ✅ (form 검증)
  - 통합: ✅ (PUT → DB 반영)
  - E2E: ✅ (수정 시나리오)

### F-07: 글 삭제 (cascade)

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 학습자, I want 발행한 글과 그 댓글을 한 번에 삭제 So that 의도치 않은 고아 댓글이 남지 않게.
- **Acceptance**:
  - Given 글 상세 → "삭제" 클릭 → 확인 When DELETE 응답 204 Then 홈으로 리다이렉트 + 목록에서 사라짐
  - Given 글 + 댓글 3건 When 삭제 Then 댓글 3건도 함께 제거 (cascade)
- **R-ID 매핑**: R-F-03, R-F-07
- **테스트 시나리오**:
  - Happy: cascade 정상
  - Failure: 존재하지 않는 ID 삭제 → 404
- **테스트 결정 (3축)**:
  - 단위: ✅ (404 매핑)
  - 통합: ✅ (DB cascade)
  - E2E: ✅ (삭제 시나리오 + 홈 확인)

### F-08: 인기 태그 사이드바

- **MVP Cut**: 포함 ✅
- **우선순위**: P1
- **사용자 스토리**: As a 방문자, I want 글 목록 옆에 인기 태그를 한눈에 보고 클릭 So that 탐색의 진입점이 다양해지게.
- **Acceptance**:
  - Given 태그가 5종 이상 사용 중 When `/` 진입 Then 사이드바에 빈도순 상위 N개 노출 (기본 20)
  - Given 태그 클릭 When 클릭 Then `/?tag=:name`로 라우팅 (F-02 흐름)
- **R-ID 매핑**: R-F-04
- **테스트 시나리오**:
  - Happy: 정상 노출 + 클릭
  - Failure: 태그 0건 시 사이드바 빈 영역 + 안내 메시지
- **테스트 결정 (3축)**:
  - 단위: ✅ (정렬·상한 렌더링)
  - 통합: ✅ (API 응답 정합)
  - E2E: ✅ (사이드바 노출 확인)

### F-09: README 친화적 설명

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 평가자, I want README 절차만으로 새 PC에서 부팅 So that 학습 자산이 외부에 재현 가능.
- **Acceptance**:
  - Given 새 PC + Node.js 20 LTS When README 따라 install → dev 실행 Then 서버 부팅 + 시드 글 노출
  - Given 10명 시도 When 동일 절차 Then 10/10 성공 (KPI #1, 측정)
  - README는 폴더 구조·환경 변수·평가 기준을 명시
- **R-ID 매핑**: R-N-03, R-N-04
- **테스트 시나리오**:
  - Happy: 절차 그대로 성공
  - Failure: 누락된 단계 발견 시 ADR로 README 보강 + 재시도
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: ✅ (수동 절차 — UC-06)

### F-10: 한국어 주석된 학습 코드

- **MVP Cut**: 포함 ✅
- **우선순위**: P1
- **사용자 스토리**: As a 학습자, I want 핵심 모듈에 한국어 주석을 만나기 So that 패턴의 "왜"를 모국어로 학습.
- **Acceptance**:
  - Given 핵심 모듈(controllers, services, components, repositories) When 정적 측정 Then 한국어 주석 커버리지 ≥ 80%
- **R-ID 매핑**: R-N-05
- **테스트 시나리오**:
  - Happy: 모듈별 주석 충실
  - Failure: 누락된 모듈 발견 시 PR 코멘트 보강 요청
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: N/A (정적 분석)

### F-11: 반응형 UI

- **MVP Cut**: 포함 ✅
- **우선순위**: P1
- **사용자 스토리**: As a 방문자, I want 모바일/데스크톱 어느 viewport에서도 깨지지 않는 화면 So that 디바이스에 구애받지 않고 사용.
- **Acceptance**:
  - Given 360/768/1024/1440px viewport When 5개 페이지 진입 Then 레이아웃 정상, 가로 스크롤 없음
- **R-ID 매핑**: R-N-06
- **테스트 시나리오**:
  - Happy: 모든 viewport 정상
  - Failure: 특정 viewport에서 콘텐츠 잘림 — 디자인 보강
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: ✅ (gstack viewport 스위치)

### F-12: 보안 안내

- **MVP Cut**: 포함 ✅
- **우선순위**: P0
- **사용자 스토리**: As a 평가자, I want README에 "운영 환경 사용 금지" 경고와 시크릿 미사용 사실 확인 So that 학습 데모임을 명확히 인지.
- **Acceptance**:
  - Given README When 사용자 진입 Then "공개 데모용 — 운영 환경 사용 금지" 경고 노출
  - Given repo When grep으로 시크릿 패턴 검색 Then 0건
- **R-ID 매핑**: R-N-07
- **테스트 시나리오**:
  - Happy: 경고 노출 + 시크릿 0건 유지
  - Failure: 시크릿 PR → PreToolUse 훅 차단
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: N/A (정적 분석 + 훅)

## 4. MVP Cut 요약

| F-ID | MVP | 비고 |
|---|---|---|
| F-01 | ✅ 포함 | 글 목록 + 페이지네이션, P0 |
| F-02 | ✅ 포함 | 태그 필터, P0 |
| F-03 | ✅ 포함 | 글 작성, P0 |
| F-04 | ✅ 포함 | 글 상세, P0 |
| F-05 | ✅ 포함 | 댓글 작성·삭제(수정 제외), P0 |
| F-06 | ✅ 포함 | 글 수정, P0 |
| F-07 | ✅ 포함 | 글 삭제(cascade), P0 |
| F-08 | ✅ 포함 | 인기 태그 사이드바, P1 |
| F-09 | ✅ 포함 | README 친화적 설명, P0 |
| F-10 | ✅ 포함 | 한국어 주석 ≥80%, P1 |
| F-11 | ✅ 포함 | 반응형 UI, P1 |
| F-12 | ✅ 포함 | 보안 안내, P0 |
| (Phase 2) | ❌ 제외 | 세션 인증, 본인 권한 체크 |
| (Phase 2+) | ❌ 제외 | 팔로우/피드, 즐겨찾기, Markdown, 이미지 업로드, 알림, 검색, 프로필 |

## 5. UX 원칙 / 화면 구성 큰 그림

- **원칙**: 단순함 우선. 입문자가 한 페이지의 의도를 5초 안에 파악할 수 있도록 화면당 정보 밀도를 낮춤.
- **레이아웃**: 글 목록(좌측 컨텐츠 + 우측 사이드바 — 인기 태그), 글 상세(본문 → 댓글 영역), editor(폼 위주).
- **네비**: 상단 헤더에 로고 + "새 글" 버튼. 우상단에 GitHub 링크(학습 reference).
- **반응형**: 768px 미만에서 사이드바를 하단으로 stack. 모바일에서도 글 작성 폼이 유효.
- **컬러·타이포**: 디자인 토큰(Color·Typography·Spacing·Component primitives)은 10 LLD에서 확정 (ADR-0038).
- **스타일링 솔루션**: 12 Scaffolding §8에서 Tailwind/CSS Modules/styled-components 중 1개 채택 (ADR-0038 — plain HTML 머지 차단).

## 6. 의존성 / 외부 시스템

- **외부 시스템**: 없음. SQLite 파일 1개 + 로컬 dev 서버.
- **빌드 의존**: Node.js 20 LTS, pnpm, Prisma CLI.
- **런타임 의존**: better-sqlite3 또는 Prisma SQLite 드라이버.
- **CI 의존**: GitHub Actions(권장), 단 본 MVP는 로컬 검증 우선 — `act`로 로컬 reproduction (ADR-0047).
- **브라우저**: 최신 Chrome/Firefox/Safari/Edge.

## 7. Open Questions

> [ADR-0049 Sprint 6 #25 일괄 해소] 본 §의 O-15~O-19 5건 결정 trace는 [`docs/planning/adr/0049-open-questions-resolution.md`](../adr/0049-open-questions-resolution.md) + [`bug-residual-and-open-questions-resolve.openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

- O-15: F-08 인기 태그 노출 개수 기본값을 20개로 확정할지 사용자 옵션으로 노출할지 — 10 LLD에서 결정. **✅ 해소완료** (MVP 서버 고정 20개, 10 LLD §2.1)
- O-16: F-10 한국어 주석 커버리지 측정 도구 — grep 룰 기반 자동 측정 vs 수동 리뷰. **✅ 해소완료** (grep 자동, Sprint 6 #23)
- O-17: F-11 반응형 검증을 12 Test Design 카탈로그에 E2E 단일 시나리오로 묶을지 viewport별 분리할지. **🆕 본 PR ADR-0049 결정** (E2E 단일 시나리오 그룹화)
- O-18: F-12 README 경고 문구 — 영어/한국어 병기 여부. **✅ 해소완료** (한국어 단일)
- O-19: 평가 기준(RFP §10) 7개 항목을 12 Test Design의 E2E 카탈로그와 1:1 매핑할지 그룹화할지. **✅ 해소완료** (1:1 매핑, Sprint 6 #24 eval-matrix.md)
