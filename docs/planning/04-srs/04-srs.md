---
doc_type: srs
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: B
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07, R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# Conduit Lite — SRS

> Gate B 입력. 03 User Scenarios의 UC-XX를 R-F-XX (기능)·R-N-XX (비기능) 요구사항으로 카탈로그. 각 R-ID는 ADR-0014·0023 강제 — 우선순위 P0~P3, Acceptance(Given/When/Then), 테스트 시나리오(Happy + Failure), 3축(단위·통합·E2E) 결정. **운영 비기능은 R-OPS-* prefix 별도 체계** (ADR-0002, #52 PR).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Issue #52 — §3 비기능에 **R-OPS-* 운영 비기능 R-ID 체계 신설** (4건: R-OPS-AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC). #47·#51에서 ad-hoc 워크어라운드로 사용한 `R-OPS-AUTO-LABEL`을 정본 등록 + 인접 3건(SMOKE/WORKFLOW/DOCS-SYNC) 동시 도입. ADR-0029/0037 v1.1/0040/0047 매핑. frontmatter status Draft → Accepted, related.R-ID에 R-F-*/R-N-* + R-OPS-* 일괄 등록. ADR-0002 mod-r-ops-r-id-taxonomy 신설. |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-init Phase 1, RFP §3·§5·§6 기반) |

## 1. 범위 / 가정

- **In-Scope**: RFP §2.1 MVP — 글 CRUD, 댓글 CRD(수정 없음), 태그 표시·필터, 페이지네이션.
- **가정**:
  - 인증 없음 (Phase 2 확장 시 추가). 모든 사용자가 동일 권한.
  - 단일 인스턴스 데모 (SQLite 동시 쓰기 락은 Phase 2 검토).
  - Frontend·Backend는 같은 호스트에서 dev 시 분리 포트, 운영 시 reverse-proxy 단일 origin 가정.
- **표기**: R-F-XX = 기능 요구사항, R-N-XX = 비기능 요구사항. 우선순위 P0(MVP 필수) / P1(MVP 권장) / P2(Phase 2 후보) / P3(향후).

## 2. 기능 요구사항

### R-F-01: 게시글 목록 API

- **출처**: UC-01, UC-02, RFP §3.1, §5.1
- **우선순위**: P0
- **설명**: 글 목록을 최신순으로 페이지네이션·태그 필터와 함께 반환한다.
- **Acceptance**:
  - Given 글이 25건 존재 When GET `/api/articles?page=1&limit=10` Then 응답 200 + 최신 10건 + 전체 카운트 25
  - Given `?tag=javascript`가 부여된 글 5건 When GET `/api/articles?tag=javascript` Then 해당 5건만 반환
- **테스트 시나리오**:
  - Happy: 정상 페이지·태그 조합 응답
  - Failure: page=-1 등 잘못된 값 → 400 에러
- **테스트 결정 (3축)**:
  - 단위: ✅ (controller 함수의 쿼리 파라미터 정규화 로직)
  - 통합: ✅ (SQLite 실 DB로 controller→service→repository 흐름)
  - E2E: ✅ (브라우저에서 `/` 진입 → 페이지네이션 클릭)

### R-F-02: 게시글 작성·수정 API

- **출처**: UC-03, UC-05, RFP §3.1, §5.1
- **우선순위**: P0
- **설명**: title/body/author/tagList 입력으로 글을 생성·수정한다. 태그는 정규화(trim, lower, 중복 제거)된다.
- **Acceptance**:
  - Given title="hi", body="world", author="hana", tagList="js, ts, js" When POST `/api/articles` Then 응답 201 + 글 ID 반환 + tags=["js","ts"]
  - Given 기존 글 id=1 When PUT `/api/articles/1` body 변경 Then 응답 200 + 변경값 반영
- **테스트 시나리오**:
  - Happy: 정상 입력 → 정상 생성·수정
  - Failure: title 빈 값 → 400 + 에러 메시지 "제목은 필수입니다"
- **테스트 결정 (3축)**:
  - 단위: ✅ (tag 정규화 함수, 입력 검증 함수)
  - 통합: ✅ (POST/PUT → DB 반영 확인)
  - E2E: ✅ (`/editor` 입력 → 저장 → 상세 페이지 노출)

### R-F-03: 게시글 상세·삭제 API

- **출처**: UC-04, UC-05, RFP §3.1, §5.1
- **우선순위**: P0
- **설명**: ID 기반 단일 글 조회 및 삭제. 삭제 시 종속 댓글을 cascade 처리.
- **Acceptance**:
  - Given id=1 존재 When GET `/api/articles/1` Then 응답 200 + 본문/태그/작성자/작성일
  - Given id=1 + 댓글 3건 When DELETE `/api/articles/1` Then 응답 204 + 댓글 3건도 함께 삭제
- **테스트 시나리오**:
  - Happy: 존재 ID 조회·삭제 정상
  - Failure: 존재하지 않는 ID → 404 + "글을 찾을 수 없습니다"
- **테스트 결정 (3축)**:
  - 단위: ✅ (cascade 로직, 404 매핑)
  - 통합: ✅ (DB cascade 실측 — 댓글 0건 검증)
  - E2E: ✅ (글 상세 → 삭제 버튼 → 홈 리다이렉트)

### R-F-04: 태그 API

- **출처**: UC-02, RFP §3.3, §5.3
- **우선순위**: P0
- **설명**: 전체 태그를 사용 빈도순으로 반환. 상한 기본 20개.
- **Acceptance**:
  - Given 태그 30종 사용 중 When GET `/api/tags` Then 응답 200 + 빈도순 상위 20개 (name, count 포함)
- **테스트 시나리오**:
  - Happy: 정상 정렬·상한 적용
  - Failure: DB 오류 → 500 + 일반 메시지 (스택 미노출)
- **테스트 결정 (3축)**:
  - 단위: ✅ (정렬·상한 로직)
  - 통합: ✅ (실 DB 빈도 집계)
  - E2E: ✅ (사이드바 "인기 태그" 영역 노출 확인)

### R-F-05: 입력 검증 공통 규칙

- **출처**: UC-03, UC-04, UC-05, RFP §6.3
- **우선순위**: P0
- **설명**: 글·댓글 모든 입력에 대해 빈 값·길이 제한·문자열 trim을 적용. 실패 시 400 + 에러 메시지.
- **Acceptance**:
  - Given title 빈 값 When POST `/api/articles` Then 400 + `{ error: "제목은 필수입니다" }`
  - Given body 길이 0 When POST 댓글 Then 400 + `{ error: "본문은 필수입니다" }`
  - Given title 길이 > 200자 When POST Then 400 + 길이 제한 메시지
- **테스트 시나리오**:
  - Happy: 정상 입력 통과
  - Failure: 빈 값·과길이 → 400 + 정확한 에러 메시지 노출
- **테스트 결정 (3축)**:
  - 단위: ✅ (검증 함수 단독)
  - 통합: ✅ (controller→검증 미들웨어 흐름)
  - E2E: ✅ (`/editor` 빈 값 저장 시 UI 필드 highlight)

### R-F-06: 댓글 API (CRD, 수정 없음)

- **출처**: UC-04, RFP §3.2, §5.2
- **우선순위**: P0
- **설명**: 글 ID 하위에서 댓글 목록·생성·삭제만 제공. 수정 기능은 본 MVP에서 의도적으로 제외 (RFP §3.2).
- **Acceptance**:
  - Given 글 id=1 + 댓글 0건 When POST `/api/articles/1/comments` body/author 입력 Then 응답 201 + 댓글 ID
  - Given 댓글 cid=5 When DELETE `/api/articles/1/comments/5` Then 응답 204 + 다음 GET에서 미노출
- **테스트 시나리오**:
  - Happy: 정상 작성·조회·삭제
  - Failure: 존재하지 않는 articleId → 404, 빈 body → 400
- **테스트 결정 (3축)**:
  - 단위: ✅ (검증·404 매핑)
  - 통합: ✅ (DB 작성→조회 흐름)
  - E2E: ✅ (글 상세에서 댓글 작성·삭제 시나리오)

### R-F-07: cascade 삭제 무결성

- **출처**: UC-05, RFP §3.1
- **우선순위**: P0
- **설명**: 글 삭제 시 종속 댓글을 동일 트랜잭션에서 함께 삭제. 고아 댓글 생성 금지.
- **Acceptance**:
  - Given 글 id=1 + 댓글 3건 When DELETE `/api/articles/1` Then 댓글 테이블에서 articleId=1 행 0건
  - Given DB 무결성 제약(ON DELETE CASCADE) 적용됨 When 글 삭제 Then 댓글 동시 삭제 (서비스 레이어 의존 X)
- **테스트 시나리오**:
  - Happy: cascade 정상 동작
  - Failure: 트랜잭션 rollback (예: 권한 오류 가정) → 댓글·글 모두 보존, 부분 삭제 금지
- **테스트 결정 (3축)**:
  - 단위: ✅ (트랜잭션 wrapper 함수)
  - 통합: ✅ (실 DB cascade 검증 — Prisma migration 또는 raw SQL)
  - E2E: ✅ (글 삭제 후 댓글 영역 빈 상태 확인 — UC-05)

### R-F-08: 라우팅 (Frontend SPA)

- **출처**: UC-01~UC-05, RFP §4
- **우선순위**: P0
- **설명**: path 라우팅 — `/`, `/?tag=:name`, `/article/:id`, `/editor`, `/editor/:id`. hash 라우팅 금지.
- **Acceptance**:
  - Given 사용자가 `/article/123` 직접 진입 When 페이지 로드 Then 해당 글 상세 정상 렌더
  - Given 라우팅 미일치 경로 When 진입 Then 404 페이지 또는 홈 리다이렉트
- **테스트 시나리오**:
  - Happy: 정상 라우팅 5종 모두 동작
  - Failure: 존재 X 경로 → 404 페이지 노출
- **테스트 결정 (3축)**:
  - 단위: ✅ (라우터 매칭 함수)
  - 통합: N/A (단위·E2E로 충분)
  - E2E: ✅ (브라우저 직접 진입 시나리오)

## 3. 비기능 요구사항

### R-N-01: 성능 — 응답 시간

- **출처**: 03 §4 비기능 시나리오
- **우선순위**: P1
- **설명**: 로컬 SQLite 기준 글 목록 응답 < 200ms (p95).
- **Acceptance**:
  - Given 글 100건 시드 When GET `/api/articles?page=1` Then 응답 시간 < 200ms (p95, 로컬 측정)
- **테스트 시나리오**:
  - Happy: 정상 응답 < 200ms
  - Failure: 1000건 이상 시 200ms 초과 가능 — Phase 2에서 인덱스 검토, MVP는 측정만
- **테스트 결정 (3축)**:
  - 단위: N/A (성능 측정은 통합/E2E)
  - 통합: ✅ (Supertest로 응답 시간 측정)
  - E2E: ✅ (Playwright 응답 측정, 선택)

### R-N-02: 에러 응답 일관성

- **출처**: RFP §6.3, 03 §4
- **우선순위**: P0
- **설명**: 4xx/5xx 응답은 `{ error: string }` 형식 통일. 5xx는 일반 메시지만(스택 미노출).
- **Acceptance**:
  - Given 어느 엔드포인트의 4xx/5xx When 응답 Then body는 `{ error: "..." }` 형식
  - Given 500 응답 When 브라우저 수신 Then 스택 트레이스 미포함, 일반 메시지만
- **테스트 시나리오**:
  - Happy: 모든 에러 응답이 동일 schema
  - Failure: 우발적 throw → 글로벌 핸들러가 500 + 일반 메시지로 정규화 (스택은 stderr만)
- **테스트 결정 (3축)**:
  - 단위: ✅ (에러 핸들러 미들웨어)
  - 통합: ✅ (전 엔드포인트의 에러 응답 schema 검증)
  - E2E: ✅ (브라우저 콘솔에 스택 미노출 확인)

### R-N-03: README 재현성

- **출처**: KPI #1, RFP §6.4, §10
- **우선순위**: P0
- **설명**: 새 환경에서 README 절차만으로 로컬 실행 100% 성공. Node 버전·포트·시드 데이터 안내 포함.
- **Acceptance**:
  - Given 새 PC + Node.js 20 LTS When README 따라 `git clone` → install → dev 명령 실행 Then dev 서버 부팅 + 시드 글 노출
  - Given 10명 시도 When 동일 절차 Then 10/10 성공
- **테스트 시나리오**:
  - Happy: README 절차 그대로 성공
  - Failure: 누락된 단계 발견 시 ADR로 README 보강
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: ✅ (수동 절차 — gstack `/qa` 또는 UC-06)

### R-N-04: 로컬 부팅 검증 (3 profile)

- **출처**: CLAUDE.md 필수 규칙 #10 (ADR-0037 v1.1 + ADR-0040)
- **우선순위**: P0
- **설명**: 매 PR에서 dev/stg/prod 3 profile 모두 fresh checkout 기준 로컬 부팅 가능. 부팅 자산(`.env.{dev,stg,prod}.example`·migrations·lockfile·LOCAL.md) profile별 동기 갱신.
- **Acceptance**:
  - Given fresh checkout When 3 profile 부팅 명령 실행 Then 각 profile별 ready 신호 + 에러 0건
  - Given 부팅 자산 변경 PR When 검토 Then profile 동기 누락 시 BLOCK
  - 단일 환경 운영(stg=prod 공유) 가정 시 N/A + 사유 명시 허용 — 12 Scaffolding에서 확정
- **테스트 시나리오**:
  - Happy: 3 profile 모두 부팅 성공
  - Failure: 한 profile만 부팅 실패 시 PR 머지 BLOCK (CLAUDE.md 필수 규칙 #10)
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: ✅ (CI에서 profile별 부팅 smoke)
  - E2E: ✅ (LOCAL.md 절차 수동 검증, ADR-0040)

### R-N-05: 학습 친화성 — 한국어 주석 커버리지

- **출처**: RFP §6.5, 01 Brief KPI #5
- **우선순위**: P1
- **설명**: 핵심 모듈(controllers, services, components, repositories) 한국어 주석 커버리지 ≥ 80%.
- **Acceptance**:
  - Given 핵심 모듈 디렉토리 When grep으로 한국어 주석/전체 함수 비율 측정 Then ≥ 80%
- **테스트 시나리오**:
  - Happy: 핵심 모듈에 주석 충실
  - Failure: 누락된 모듈 발견 시 PR 코멘트로 보강 요청
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: N/A (정적 분석)

### R-N-06: 반응형 레이아웃

- **출처**: RFP §6.1, 03 §4
- **우선순위**: P1
- **설명**: 모바일 360px ~ 데스크톱 1440px 사이 레이아웃 깨짐 없음.
- **Acceptance**:
  - Given 360/768/1024/1440px viewport When 5개 페이지 진입 Then 레이아웃 무너짐 없음, 가로 스크롤 없음
- **테스트 시나리오**:
  - Happy: 모든 viewport에서 정상 노출
  - Failure: 특정 viewport에서 콘텐츠 잘림 — UI 검토 필요
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: ✅ (gstack `/qa` viewport 스위치 시나리오)

### R-N-07: 보안 — 시크릿·인증 안내

- **출처**: CLAUDE.md 보안 절대 규칙, RFP §11
- **우선순위**: P0
- **설명**: 본 MVP는 인증 없음. README에 "공개 데모용, 운영 환경 사용 금지" 명시. 시크릿(API key 등) 미사용·미커밋.
- **Acceptance**:
  - Given repo When grep으로 .env*, *.key, *.pem 등 검색 Then 0건
  - Given README When 사용자 진입 Then "운영 환경 사용 금지" 경고 명시
- **테스트 시나리오**:
  - Happy: 시크릿 미커밋 상태 유지
  - Failure: PR에 .env 포함 시 PreToolUse 훅이 차단 (CLAUDE.md 보안 #5)
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: N/A
  - E2E: N/A (정적 분석 + 훅)

---

> **운영 비기능 (R-OPS-*) — Issue #52, ADR-0002로 신설**: agent-toolkit 자동화 신뢰성을 위한 별도 prefix 체계. R-N-*(제품 비기능)와 의미 분리. 4건 모두 ADR 출처 명시.

### R-OPS-AUTO-LABEL: FSM 라벨 자동 전이 (ADR-0029)

- **출처**: ADR-0029 (PR 이벤트 기반 status:* 자동 전이/청소), #47 PR #49 + #51 PR #53 검증 완료
- **우선순위**: P0
- **설명**: PR `opened`/`ready_for_review` 시 linked issue 라벨 `status:in-progress` → `status:in-review` 자동 전이. PR `closed && merged==true` 시 `status:*` 일괄 제거(이전 v1.2에서 `tested` 라벨 폐지로 보존 대상 없음). `.github/workflows/sync-issue-labels.yml`이 책임.
- **Acceptance**:
  - Given PR open + PR body에 `Closes #N` When 30초 대기 Then `gh issue view N --json labels` 결과에 `status:in-review` 포함, `status:in-progress` 부재
  - Given PR 머지(closed && merged==true) When 30초 대기 Then `gh issue view N --json state,labels` → state=CLOSED + `status:*` 라벨 0건
- **테스트 시나리오**:
  - Happy: 매 PR open/머지에서 라벨 자동 전이 (#51 이후 회복, #52~ 자연 회귀 관찰)
  - Failure: dispatcher 비활성(#51 H6 가설) / `Closes #N` 누락 / workflow YAML 권한 부족 → 라벨 미전이
- **테스트 결정 (3축)**:
  - 단위: N/A (GitHub Actions runtime에서만 실행)
  - 통합: ✅ (PR open/머지 시 `gh api .../actions/workflows/sync-issue-labels.yml/runs` + `gh issue view` 검증)
  - E2E: N/A (운영 자동화는 E2E 부적합)

### R-OPS-SMOKE: 3 profile 부팅 smoke 자동화 (ADR-0037 v1.1)

- **출처**: ADR-0037 v1.1 (AI 게이트 6축 6번 — 매 PR dev/stg/prod 3 profile 로컬 부팅 검증), Sprint 1 #5 PR #33 baseline
- **우선순위**: P0
- **설명**: 매 PR에서 `pnpm run smoke:3profiles` 실행 시 dev/stg/prod 모두 ready 신호(`backend ready in Xms → GET /api/articles → 200 → PASS`) + 에러 0건. 부팅 자산(`.env.{dev,stg,prod}.example`·migrations·lockfile) profile별 동기 갱신.
- **Acceptance**:
  - Given fresh checkout + `.env.{dev,stg,prod}` cp + prisma db push When `pnpm run smoke:3profiles` 실행 Then 3/3 PASS + 각 profile ready < 5000ms
  - Given 부팅 자산 변경 PR When AI 게이트 6번째 축 검증 Then profile 동기 누락 시 BLOCK
- **테스트 시나리오**:
  - Happy: 매 PR smoke 3/3 PASS (R-N-04와 별도 axis — R-N-04는 fresh checkout 검증, R-OPS-SMOKE는 매 PR 자동화 신뢰성)
  - Failure: 한 profile만 부팅 실패 → PR 머지 BLOCK (CLAUDE.md 필수 규칙 #10)
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: ✅ (CI smoke job 신설 시 또는 LLM 직접 실행 — `pnpm run smoke:3profiles`)
  - E2E: N/A

### R-OPS-WORKFLOW: GitHub Actions workflow 양축 검증 (ADR-0047)

- **출처**: ADR-0047 (매 PR workflow YAML 로컬 + GitHub 양축 검증), CLAUDE.md 필수 규칙 #13
- **우선순위**: P0
- **설명**: 매 PR Manual verification 절에 workflow 로컬 검증 증거(act / manual reproduction / dev fork 실 실행 중 1택의 명령 + 결과) 통합 1줄 명시. workflow YAML 변경 여부 무관 전 PR 적용. PR title 정규식(ADR-0021) PASS 강제.
- **Acceptance**:
  - Given PR body의 Manual verification 절 When grep `- \[ \] GitHub Actions 워크플로 로컬 검증` Then 1건 존재 + 명령 + 결과(PASS/FAIL/skip 사유) 명시
  - Given PR title When ADR-0021 정규식 `^(feat|fix|chore|docs|test|refactor)\([a-z][a-z0-9,_-]*\): .+$` 매칭 Then issue-pr-title-lint.yml conclusion=success
- **테스트 시나리오**:
  - Happy: 매 PR Manual verification에 양축 검증 1줄 명시 + title 정규식 PASS
  - Failure: workflows/ 디렉토리 부재 또는 PR 트리거 워크플로 0개 → N/A + 사유 명시 허용. title prefix `bug/mod/design` 등 정규식 미정합 → fail (Sprint 5 follow-up — branch prefix vs title prefix 정책 불일치 fix)
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: ✅ (manual reproduction — `printf 'Closes #N' | grep -oiE '...'` 실행 + workflow runs trigger 자연 관찰)
  - E2E: N/A

### R-OPS-DOCS-SYNC: LOCAL.md ↔ 12-scaffolding 동기 (ADR-0040)

- **출처**: ADR-0040 (LOCAL.md 부팅 사용자 가이드 정본 + §3 양축 동기), CLAUDE.md 필수 규칙 #10
- **우선순위**: P1
- **설명**: 부팅 자산 변경 시 LOCAL.md §2 셋업·§3 profile별 부팅 명령·§4 자산 표를 같은 PR diff에 동기 갱신. 12-scaffolding/typescript.md §7(SoT) ↔ LOCAL.md(유저 facing) 양축 정합.
- **Acceptance**:
  - Given 부팅 자산 변경 PR (`.env.{dev,stg,prod}.example`·migrations·lockfile·setup scripts) When PR diff에 LOCAL.md 갱신 포함 여부 검증 Then LOCAL.md 동기 갱신 PR diff 포함
  - Given 부팅 자산 변경 없는 PR When LOCAL.md 동기 체크 Then `LOCAL.md 동기 = N/A 부팅 자산 변경 없음` 명시 허용
- **테스트 시나리오**:
  - Happy: 부팅 자산 변경 PR에서 LOCAL.md 동기 갱신 + 12-scaffolding §7 동기 (양축)
  - Failure: 부팅 자산은 변했는데 LOCAL.md 미갱신 → AI 게이트 6번째 축 BLOCK
- **테스트 결정 (3축)**:
  - 단위: N/A
  - 통합: ✅ (`git diff main...HEAD --name-only`로 부팅 자산 + LOCAL.md 동시 포함 여부 검증)
  - E2E: N/A (LOCAL.md 절차 사람 수동 검증은 R-N-03 README 재현성에서 흡수)

## 4. 인터페이스 요구사항

- **REST API**: Base URL `/api`, JSON 응답. RealWorld 원본의 wrapping 대신 flat 응답(`{ id, title, ... }`).
- **HTTP 상태 코드**: 200(조회·수정), 201(생성), 204(삭제), 400(검증 실패), 404(없음), 500(서버 오류).
- **콘텐츠 협상**: `Content-Type: application/json` 일관. multipart 미사용 (이미지 업로드 out-of-scope).
- **CORS**: dev 환경에서 FE(5173) → BE(3000) 허용. 운영 환경은 동일 origin 가정으로 비활성.
- **DB 마이그레이션**: Prisma migrate. 초기 시드 스크립트 `pnpm seed`로 노출.

## 5. 도메인 모델

```
Article {
  id          INTEGER  PK
  title       TEXT     NOT NULL  (≤ 200자)
  body        TEXT     NOT NULL
  author      TEXT     NOT NULL  (≤ 50자, 이름 텍스트)
  createdAt   DATETIME NOT NULL  DEFAULT now
  updatedAt   DATETIME NOT NULL  DEFAULT now
  tags        ArticleTag[]  (N:M via ArticleTag)
  comments    Comment[]     (1:N, ON DELETE CASCADE)
}

Comment {
  id          INTEGER  PK
  articleId   INTEGER  FK → Article.id  ON DELETE CASCADE
  body        TEXT     NOT NULL
  author      TEXT     NOT NULL
  createdAt   DATETIME NOT NULL  DEFAULT now
}

Tag {
  id          INTEGER  PK
  name        TEXT     UNIQUE  NOT NULL  (lower, trim)
  articles    ArticleTag[]
}

ArticleTag {
  articleId   INTEGER  FK → Article.id  ON DELETE CASCADE
  tagId       INTEGER  FK → Tag.id      ON DELETE RESTRICT
  PRIMARY KEY (articleId, tagId)
}
```

응답 직렬화 시 `tags` 필드는 `string[]` (tag name 배열)로 flatten — RFP §5.4 정합.

## 6. Open Questions

- O-10: 페이지네이션 limit의 상한 (기본 10, 최대 50?) — 12 Test Design에서 확정.
- O-11: 글 정렬 옵션 (최신순 외 인기순?) — MVP 미포함, Phase 2 후보.
- O-12: 인기 태그 영역 상한(R-F-04) — 20개 권장 + 옵션 노출.
- O-13: TypeScript strict 모드 적용 범위 — 09 Coding Conventions에서 확정.
- O-14: 12 Test Design에서 단위/통합/E2E 도구 — Vitest + Supertest + Playwright 후보.
