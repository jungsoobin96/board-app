---
doc_type: api-spec
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit Lite — API Spec (LLD — 외부 인터페이스)

> NEW_PROJECT Gate C. RFP §5 + 04 SRS R-F-01~08 + 05 PRD F-01~F-08을 fan-in해 REST API 9개 엔드포인트를 확정. 응답 schema는 RFP §5의 flat 구조(RealWorld 원본 wrapping 미사용).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |

## 1. 개요

- **Base URL**: `/api` (FE는 환경 변수 `VITE_API_URL`로 주입)
- **콘텐츠 타입**: `application/json` (request·response 모두)
- **인증**: 없음 (R-N-07 — MVP). 모든 엔드포인트 public.
- **CORS**: dev only — `http://localhost:5173` 허용. stg/prod는 same-origin.
- **에러 schema**: `{ "error": string }` (R-N-02). 모든 4xx/5xx 동일.
- **시간 표기**: ISO 8601 UTC (예: `2026-05-22T12:34:56.789Z`).
- **R-/F- 매핑**: 본 doc은 04 SRS R-F-01~08 + 05 PRD F-01~F-08의 외부 인터페이스 발현. 본 §3에 엔드포인트별 매핑.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 목적 | F-ID | R-ID |
|---|---|---|---|---|
| GET | `/api/articles` | 글 목록 (최신순, 태그·페이지 필터) | F-01·F-02 | R-F-01·R-F-04·R-N-01 |
| GET | `/api/articles/:id` | 글 상세 (단일) | F-04 | R-F-03 |
| POST | `/api/articles` | 글 작성 | F-03 | R-F-02·R-F-05 |
| PUT | `/api/articles/:id` | 글 수정 | F-06 | R-F-02·R-F-05 |
| DELETE | `/api/articles/:id` | 글 삭제 (cascade 댓글) | F-07 | R-F-03·R-F-07 |
| GET | `/api/articles/:id/comments` | 댓글 목록 | F-04·F-05 | R-F-06 |
| POST | `/api/articles/:id/comments` | 댓글 작성 | F-05 | R-F-06·R-F-05 |
| DELETE | `/api/articles/:id/comments/:commentId` | 댓글 삭제 | F-05 | R-F-06 |
| GET | `/api/tags` | 전체 태그 (사용 빈도순) | F-02·F-08 | R-F-04 |

## 3. 엔드포인트 상세

### GET /api/articles

**Request**

- Query parameters:
  - `page` (선택, integer, default 1, ≥ 1)
  - `limit` (선택, integer, default 10, 1 ≤ limit ≤ 50)
  - `tag` (선택, string — 태그 이름; trim + lower)
- Body: 없음
- 예: `GET /api/articles?page=1&limit=10&tag=javascript`

**Response 200**

```json
{
  "articles": [
    {
      "id": 1,
      "title": "Hello",
      "body": "world",
      "author": "hana",
      "createdAt": "2026-05-22T12:34:56.789Z",
      "updatedAt": "2026-05-22T12:34:56.789Z",
      "tags": ["javascript", "intro"]
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | `page < 1` 또는 `limit > 50` 등 검증 실패 | `{ "error": "잘못된 페이지/리미트 값입니다" }` |
| 500 | DB 오류 등 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: page=1·limit=10 정상 응답 (단위 + 통합 + E2E)
- Failure: page=-1 → 400 (단위 + 통합)
- Failure: 존재하지 않는 tag → `articles: []` + `total: 0` (통합)

---

### GET /api/articles/:id

**Request**

- Path: `id` (integer)
- Body: 없음

**Response 200**

```json
{
  "id": 1,
  "title": "Hello",
  "body": "world",
  "author": "hana",
  "createdAt": "2026-05-22T12:34:56.789Z",
  "updatedAt": "2026-05-22T12:34:56.789Z",
  "tags": ["javascript", "intro"]
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | `:id`가 integer 아님 | `{ "error": "잘못된 ID 형식입니다" }` |
| 404 | 존재 X | `{ "error": "글을 찾을 수 없습니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 존재 ID → 200 (단위 + 통합 + E2E)
- Failure: 999 → 404 (단위 + 통합)
- Failure: `/api/articles/abc` → 400

---

### POST /api/articles

**Request**

- Body:
  ```json
  {
    "title": "Hello",
    "body": "world",
    "author": "hana",
    "tagList": ["javascript", "intro"]
  }
  ```
- 검증 (R-F-05):
  - title: trim 후 1~200자
  - body: trim 후 비어 있지 않음
  - author: trim 후 1~50자
  - tagList: 배열, 각 요소 trim·lower·중복 제거. 빈 토큰은 무시.

**Response 200**

(생성 시 201 사용 — 본 헤딩은 schema 강제 라벨)

```json
{
  "id": 42,
  "title": "Hello",
  "body": "world",
  "author": "hana",
  "createdAt": "2026-05-22T12:34:56.789Z",
  "updatedAt": "2026-05-22T12:34:56.789Z",
  "tags": ["javascript", "intro"]
}
```

응답 status는 **201 Created**.

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | title 빈 값 | `{ "error": "제목은 필수입니다" }` |
| 400 | body 빈 값 | `{ "error": "본문은 필수입니다" }` |
| 400 | author 빈 값 | `{ "error": "작성자는 필수입니다" }` |
| 400 | title 길이 > 200 | `{ "error": "제목은 200자 이하여야 합니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 입력 → 201 + tag 정규화 (단위 + 통합 + E2E)
- Failure: title 빈 값 → 400 (단위 + 통합)
- Failure: tagList 중복 → 정규화로 단일 (단위)

---

### PUT /api/articles/:id

**Request**

- Path: `id` (integer)
- Body: POST와 동일 schema (모든 필드 수정 가능)

**Response 200**

```json
{
  "id": 42,
  "title": "Hello (updated)",
  "body": "...",
  "author": "hana",
  "createdAt": "2026-05-22T12:34:56.789Z",
  "updatedAt": "2026-05-22T13:00:00.000Z",
  "tags": ["javascript"]
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | 검증 실패 (POST와 동일) | (POST와 동일) |
| 404 | id 존재 X | `{ "error": "글을 찾을 수 없습니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 수정 → 200 (단위 + 통합 + E2E)
- Failure: 미존재 id → 404 (통합)
- Failure: title 빈 값 → 400 (단위 + 통합)

---

### DELETE /api/articles/:id

**Request**

- Path: `id` (integer)
- Body: 없음

**Response 200**

(삭제 성공은 **204 No Content** — body 없음)

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | id 형식 오류 | `{ "error": "잘못된 ID 형식입니다" }` |
| 404 | 미존재 | `{ "error": "글을 찾을 수 없습니다" }` |
| 500 | DB cascade 실패 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 삭제 → 204 + 댓글 cascade (단위 + 통합 + E2E)
- Failure: 미존재 → 404 (통합)
- 통합: 댓글 3건 있는 글 삭제 → Comment 테이블 articleId=:id 행 0건 확인 (R-F-07)

---

### GET /api/articles/:id/comments

**Request**

- Path: `id` (integer — articleId)
- Query: 없음 (MVP는 페이지네이션 없음 — 댓글 수가 적다고 가정)
- Body: 없음

**Response 200**

```json
{
  "comments": [
    {
      "id": 10,
      "articleId": 1,
      "body": "재밌네요",
      "author": "min",
      "createdAt": "2026-05-22T12:35:00.000Z"
    }
  ]
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 404 | articleId 미존재 | `{ "error": "글을 찾을 수 없습니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 응답 (단위 + 통합 + E2E)
- Failure: 미존재 article → 404 (통합)

---

### POST /api/articles/:id/comments

**Request**

- Path: `id` (integer — articleId)
- Body:
  ```json
  { "body": "재밌네요", "author": "min" }
  ```
- 검증: body 1자 이상, author 1~50자.

**Response 200**

(생성은 **201 Created**)

```json
{
  "id": 11,
  "articleId": 1,
  "body": "재밌네요",
  "author": "min",
  "createdAt": "2026-05-22T12:36:00.000Z"
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 400 | body 빈 값 | `{ "error": "본문은 필수입니다" }` |
| 400 | author 빈 값 | `{ "error": "작성자는 필수입니다" }` |
| 404 | articleId 미존재 | `{ "error": "글을 찾을 수 없습니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 작성 → 201 (단위 + 통합 + E2E)
- Failure: 빈 body → 400 (단위 + 통합)
- Failure: 미존재 article → 404 (통합)

---

### DELETE /api/articles/:id/comments/:commentId

**Request**

- Path: `id` (articleId, integer) + `commentId` (integer)
- Body: 없음

**Response 200**

(삭제 성공은 **204 No Content**)

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 404 | commentId 미존재 또는 articleId mismatch | `{ "error": "댓글을 찾을 수 없습니다" }` |
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 정상 삭제 → 204 (단위 + 통합 + E2E)
- Failure: 이미 삭제된 댓글 → 404 idempotent 안내 (통합)

---

### GET /api/tags

**Request**

- Query: 없음 (MVP는 상한 기본 20개 서버 고정)
- Body: 없음

**Response 200**

```json
{
  "tags": [
    { "name": "javascript", "count": 12 },
    { "name": "typescript", "count": 7 }
  ]
}
```

**Response 4xx/5xx**

| Status | 발생 조건 | 응답 본문 |
|---|---|---|
| 500 | DB 오류 | `{ "error": "서버 오류가 발생했습니다" }` |

**테스트 시나리오**

- Happy: 빈도순 정렬, 상위 20개 (단위 + 통합 + E2E)
- Failure: DB 오류 mock → 500, 스택 미노출 (단위 + 통합)

## 4. Webhook / 콜백

본 MVP는 외부 콜백 없음 (RFP §2.3 out-of-scope).

## 5. Rate Limit / Quota

- **MVP는 rate limit 미적용** — 단일 인스턴스 로컬 데모 가정.
- **Phase 2 후보**: Express middleware `express-rate-limit`로 POST 엔드포인트에 분당 60회 제한 (스팸 방지). 단, 인증 도입 후에야 의미가 있으므로 본 Phase 1에선 적용 안 함.
- **클라이언트 부하**: FE M4 api-client는 `AbortController`로 페이지 빠른 클릭 시 이전 요청 취소(09 spec과는 독립). FE 측 throttle은 UX 단에서.
