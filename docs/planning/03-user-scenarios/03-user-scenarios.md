---
doc_type: user-scenarios
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

# Conduit Lite — 사용자 시나리오

> Gate B 입력. 01 Brief·02 Feasibility 위에 페르소나·여정·Use Case를 매핑. UC-ID는 04 SRS·05 PRD의 R-/F-ID와 fan-in되어 12 Test Design의 출처가 된다.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §5 Open Q O-06~O-09 ADR-0049 마커 (#25) |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-init Phase 1, RFP §3·§4·§10 기반) |

## 1. 페르소나

| 페르소나 | 역할 | 환경 / 컨텍스트 | 주요 목표 |
|---|---|---|---|
| 입문 학습자 (Hana) | 풀스택 학습자 | 노트북 1대, Node.js 처음 설치, 한국어 README를 따라가며 학습 | README 절차만으로 글 작성→댓글→삭제까지 완주, 코드 주석에서 패턴 학습 |
| 블로그 방문자 (Min) | 익명 독자 | 데스크톱/모바일 브라우저, 가입 없이 접근 | 글 목록·태그 필터·페이지네이션으로 관심 글 빠르게 탐색, 댓글 작성 |
| 데모 평가자 (Park) | 부트캠프 강사/리뷰어 | 새 컴퓨터에서 README만 보고 실행 | README 재현 100% 검증, 평가 기준 7개 항목 통과 확인 |

## 2. 사용자 여정 (큰 그림)

```
[학습 시작]
  ├─ Hana: git clone → README 따라 npm install → npm run dev
  │         └─ 로컬 SQLite 자동 생성, dev 서버 부팅
  │
[1차 사용 — 글 작성]
  ├─ Hana: /editor 진입 → title/body/author/tagList 입력 → 저장
  │         └─ POST /api/articles → 홈으로 리다이렉트 → 목록 최상단 노출
  │
[탐색 — 방문자 시나리오]
  ├─ Min: / 진입 → 페이지네이션 1→2 이동 → 인기 태그 클릭
  │         └─ /?tag=javascript → 필터링 목록 노출
  │
[상호작용 — 댓글]
  ├─ Min: /article/:id 진입 → 본문 + 댓글 목록 확인 → 댓글 작성
  │         └─ POST /api/articles/:id/comments → 즉시 댓글 영역에 노출
  │
[관리 — 수정/삭제]
  ├─ Hana: /article/:id → 수정 버튼 → /editor/:id → 변경 저장
  │     │   └─ PUT /api/articles/:id
  │     └─ 삭제 버튼 → 확인 → DELETE /api/articles/:id (cascade 댓글)
  │         └─ 홈 목록에서 사라짐
  │
[평가 — 재현성]
  └─ Park: 새 PC에서 README 따라 실행 → 동일 동작 확인 → 평가 기준 7/7 통과
```

## 3. Use Case

### UC-01: 게시글 목록 조회 및 페이지네이션

- **행위자**: 방문자(Min) 또는 학습자(Hana)
- **선결 조건**: dev 서버 부팅됨, 글이 0건 이상 존재
- **트리거**: 사용자가 `/` 또는 `/?page=N`에 진입
- **정상 흐름 (Happy)**
  1. 브라우저가 GET `/api/articles?page=1&limit=10` 호출
  2. 서버가 최신순 10건 + 전체 카운트 반환
  3. UI가 글 카드 10개 + 페이지네이션 컨트롤 렌더
  4. 사용자가 "다음" 클릭 → `?page=2` 이동 → 동일 패턴
- **실패 흐름 (Failure)**
  1. 잘못된 `page=-1` 입력 → 서버 400 + 에러 메시지 → UI가 안내 + page=1로 fallback
  2. 서버 오류 500 → UI가 일반 에러 메시지 노출 (스택 트레이스 미노출)
- **연관**: F-01 (글 목록), R-F-01 (글 목록 API), R-N-01 (페이지네이션 NFR)

### UC-02: 태그 필터링

- **행위자**: 방문자(Min) 또는 학습자(Hana)
- **선결 조건**: 태그가 1개 이상 부여된 글이 존재
- **트리거**: 인기 태그 영역에서 태그 클릭 또는 `/?tag=:name` 직접 진입
- **정상 흐름 (Happy)**
  1. UI가 `GET /api/articles?tag=javascript&page=1` 호출
  2. 서버가 해당 태그가 부착된 글만 최신순 반환
  3. UI가 필터 상태 표시 + 페이지네이션 동시 동작
  4. 사용자가 다른 태그 클릭 시 즉시 갱신
- **실패 흐름 (Failure)**
  1. 존재하지 않는 태그 → 빈 목록 + "결과 없음" 안내
  2. 태그명에 공백/특수문자 포함 — URL 인코딩 처리. 실패 시 400 + 에러 메시지
- **연관**: F-02 (태그 필터), R-F-04 (태그 API), R-F-01 (글 목록 API)

### UC-03: 글 작성

- **행위자**: 학습자(Hana)
- **선결 조건**: dev 서버 부팅됨
- **트리거**: 홈 또는 글 상세에서 "새 글" 버튼 클릭 → `/editor` 진입
- **정상 흐름 (Happy)**
  1. 사용자가 title / body / author / tagList(쉼표 구분) 입력
  2. "발행" 클릭 → POST `/api/articles` 호출
  3. 서버가 article 레코드 생성 + 태그 정규화(중복 제거, trim, 소문자) + 응답
  4. UI가 글 상세 `/article/:id`로 리다이렉트
- **실패 흐름 (Failure)**
  1. title 빈 값 → 400 + "제목은 필수입니다" → UI가 해당 필드 highlight
  2. body 빈 값 → 400 + "본문은 필수입니다"
  3. tagList에 빈 토큰만 → 서버가 무시(0개 태그)
  4. 서버 오류 → 500 + 일반 에러, 입력값 보존 (재시도 가능)
- **연관**: F-03 (글 작성), R-F-02 (글 작성 API), R-F-05 (입력 검증)

### UC-04: 글 상세 + 댓글 작성/삭제

- **행위자**: 방문자(Min) 또는 학습자(Hana)
- **선결 조건**: 해당 ID의 글이 존재
- **트리거**: 목록에서 글 카드 클릭 또는 `/article/:id` 직접 진입
- **정상 흐름 (Happy)**
  1. UI가 GET `/api/articles/:id` + GET `/api/articles/:id/comments` 병렬 호출
  2. 본문 + 댓글 목록 렌더 (작성자명·작성일 포함)
  3. 댓글 폼에 body/author 입력 → POST `/api/articles/:id/comments`
  4. 응답 후 댓글 영역 즉시 갱신
  5. 본인 댓글 옆 "삭제" 클릭 → DELETE `/api/articles/:id/comments/:commentId` → 영역 갱신
- **실패 흐름 (Failure)**
  1. 존재하지 않는 글 → 404 + "글을 찾을 수 없습니다" 페이지
  2. 댓글 body 빈 값 → 400 + 필드 안내
  3. 이미 삭제된 댓글에 DELETE → 404 (idempotent 안내)
- **연관**: F-04 (글 상세), F-05 (댓글), R-F-03 (글 상세 API), R-F-06 (댓글 API), R-N-02 (에러 응답)

### UC-05: 글 수정 / 삭제 (cascade)

- **행위자**: 학습자(Hana)
- **선결 조건**: 본인이 작성한 글이 존재 (MVP는 인증 없음 — 모든 사용자가 수정 가능)
- **트리거**: 글 상세에서 "수정" 또는 "삭제" 버튼 클릭
- **정상 흐름 (Happy) — 수정**
  1. "수정" → `/editor/:id` 진입 → 기존 값 사전 로드
  2. 필드 변경 → PUT `/api/articles/:id`
  3. 응답 후 글 상세로 리다이렉트 → 변경값 노출
- **정상 흐름 (Happy) — 삭제**
  1. "삭제" → 확인 모달 → DELETE `/api/articles/:id`
  2. 서버가 article + 종속 comments cascade 삭제
  3. 응답 후 홈으로 리다이렉트 → 목록에서 사라짐
- **실패 흐름 (Failure)**
  1. 존재하지 않는 글 수정/삭제 → 404
  2. 수정 입력값 검증 실패 → 400 (UC-03과 동일 규칙)
  3. cascade 실패(DB 무결성 오류) → 500 + 일반 에러 (스택 미노출)
- **연관**: F-06 (글 수정), F-07 (글 삭제), R-F-02 (수정 API), R-F-07 (삭제 cascade), R-F-05 (입력 검증)

### UC-06: 새 PC에서 README 재현

- **행위자**: 데모 평가자(Park)
- **선결 조건**: Node.js 20 LTS·Git 설치된 새 PC
- **트리거**: GitHub repo URL 받음
- **정상 흐름 (Happy)**
  1. `git clone` → `cd board-app` → README §설치 절차 따라 `pnpm install`
  2. README §실행 → `pnpm dev` (또는 명시된 native 스크립트)
  3. dev 서버 부팅, SQLite 초기 시드 자동 적용
  4. 브라우저에서 `http://localhost:5173` 진입 → 시드 글 노출
  5. RFP §10 평가 기준 7개 항목 수동 체크 → 7/7 통과
- **실패 흐름 (Failure)**
  1. Node.js 버전 mismatch → README가 명시한 LTS 안내 → 사용자가 nvm 등으로 정정
  2. 포트 충돌 (5173/3000) → README가 .env 또는 옵션으로 우회 안내
  3. 시드 데이터 누락 → README가 `pnpm seed` 명시
- **연관**: R-N-03 (README 재현성), R-N-04 (로컬 부팅 검증, ADR-0037)

## 4. 비기능 시나리오

- **응답 시간** — 로컬 SQLite 기준 글 목록 응답 < 200ms (LCP 영향 최소화).
- **반응형** — 모바일 360px ~ 데스크톱 1440px 사이 레이아웃 무너짐 없음.
- **에러 처리** — 모든 4xx/5xx 응답에 에러 메시지 포함, 스택 트레이스는 stderr만(브라우저 노출 금지).
- **학습 친화** — 핵심 모듈(controllers, services, components) 한국어 주석 커버리지 ≥ 80%.
- **재현성** — README의 절차만으로 새 PC에서 동일 동작 (KPI #1, 측정 — 10명 시도 100% 성공).
- **부팅 안정성** — dev/stg/prod 3 profile 모두 로컬 부팅 가능 (ADR-0037 v1.1). MVP는 동일 SQLite 파일 분리(`dev.db`/`stg.db`/`prod.db`) 또는 단일 환경 운영 + N/A 명시.

## 5. Open Questions

> [ADR-0049 Sprint 6 #25 일괄 해소] 본 §의 O-06~O-09 4건 결정 trace는 [`docs/planning/adr/0049-open-questions-resolution.md`](../adr/0049-open-questions-resolution.md) + [`bug-residual-and-open-questions-resolve.openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

- O-06: 댓글 수정 기능을 *완전 제외*할 것인가, Phase 2 후보로 둘 것인가? (RFP §3.2: "수정 기능은 없음" — 본 MVP 확정) **✅ 해소완료** (MVP 완전 제외, 04 SRS 정합)
- O-07: 인기 태그 영역 노출 개수 상한 — 기본 20개 권장. 04 SRS R-F-04에서 확정. **✅ 해소완료** (20개 고정, 04 SRS R-F-04)
- O-08: 본인 글 수정/삭제 권한 체크(Phase 2)와 MVP의 "모두 수정 가능" 사이 UX 안내 문구. **🔁 Phase 2 보류** (MVP "모두 수정 가능" + README §10 #2 백로그)
- O-09: gstack `/qa` 골든 패스 시나리오를 본 문서의 UC-01~UC-06 어디까지 자동화할지 — 12 Test Design에서 결정. **✅ 해소완료** (UC-01~UC-06 전수, 13-test-design + e2e/specs 5건)
