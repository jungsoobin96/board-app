---
doc_type: feature-brief
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# feat-tags-api — Feature Brief

> Sprint 2 두 번째 이슈 — Issue #7. 09 API spec §3 마지막 endpoint(GET /api/tags) 신설. 빈도 desc 정렬 + 상한 20개. 09 §2 9 endpoint 완결.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (Sprint 2 두 번째 진입) |

## 1. 한 줄 의도

태그 목록 1 엔드포인트 신설 — 빈도 desc 정렬 + 상한 20개. 09 §2 9 endpoint 마지막 완결 + F-02 태그 필터·F-08 인기 태그 사이드바 FE 차단 해소.

## 2. 사용자 가치

- **독자**: 인기 태그를 빈도순으로 확인 → 클릭 시 글 목록 필터 (FE는 Sprint 3 #11 + Sprint 5 `feat-tag-filter-ux-polish`에서 결합)
- **작성자**: 자신이 사용한 태그가 인기 태그 사이드바에 노출되는 시점 추정 가능
- **운영**: 태그 클라우드 데이터 — 콘텐츠 트렌드 모니터링

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| 태그 API 엔드포인트 | 0 (미작성) | 1 (GET /api/tags) |
| `backend/src/routes/tags.ts` | 부재 | 신설 (단일 라우터, 1 method) |
| `backend/src/controllers/tags.controller.ts` | 부재 | 신설 (1 handler) |
| `backend/src/services/tag.service.ts` | 부재 | 신설 (list — 정렬·상한 로직) |
| `backend/src/repositories/tag.repo.ts` | 부재 | 신설 (findManyByFrequency — count desc, take 20) |
| `backend/src/app.ts` | articles + comments 2 라우터 마운트 | + tags 1 라우터 추가 마운트 (`/api/tags`) |
| 통합 테스트 | articles 9 + cascade 2 + comments 7 = 18 | + tags 2 (happy + empty) = 20 |
| 단위 테스트 | 46+ (articles + comments) | + tag.service 3+ = 49+ |
| 09 API spec 정합 | 글 5 + 댓글 3 = 8/9 | **9/9 완결** |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0) / modify(0) — 0건
- **라벨**: `type:feature` + `area:backend` + `priority:P0`
- **자연어**: "태그 API + 정렬·상한 + 통합" — 신규 동작
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add** (질문 없이 진행)

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 신규 코드 | `backend/src/{routes,controllers,services,repositories}/` | 4 신규 파일 (validator는 불필요 — GET 단일, body 없음) |
| 변경 코드 | `backend/src/app.ts` | 1줄 추가 (라우터 마운트) |
| 신규 테스트 | `backend/tests/integration/tags.integration.test.ts` | AC 2건 + 추가 case 1+ = 3+ |
| 신규 테스트 | `backend/tests/unit/services/tag.service.test.ts` | 정렬·상한·빈 케이스 3+ |
| 시드 데이터 | `backend/prisma/seed.ts` 검토 (통합 테스트 자체 시드 권장) | 시드 변경 없음 (테스트 격리 유지) |
| 부팅 자산 | 변경 없음 | 6번째 axis: 부팅 코드 변경만 (라우터 1 라인) |
| 09 API spec | 영향 없음 (이미 §3 명시) | docs sync 불필요 |
| 13/02-catalog | F-02·F-08 fan-in 후속 | docs-update에서 ADR-0035 check |

## 6. 비목표

- **태그 작성·삭제 API** — 09 spec 외 (태그는 글 작성 시 자동 upsert, 별 API 불필요)
- **태그 검색·페이지네이션** — 09 §3 "상한 20개 서버 고정"
- **태그 트렌드 분석** (시계열) — MVP 범위 외
- **다국어 태그** — 정규화는 normalizeTags(lower+trim) #4 산출 그대로
- **태그 자동완성·suggestion** — Sprint 5+ UX 영역
- **고아 태그 정리** — 글-태그 cascade에서 Tag 자체는 잔존 (#3 schema 결정)

## 7. Open Questions

- **O-T1**: 30종 시드 데이터 위치 — `seed.ts`에 추가 vs 통합 테스트 자체 시드. → 답: 통합 테스트 자체 시드 (격리 + 재현성). seed.ts는 #3 산출 그대로.
- **O-T2**: 빈 결과 응답 — 200 + `{tags: []}` vs 404. → 답: 09 §3 명시 없으나 articles list 패턴 답습 + REST 표준 → 200 + 빈 배열.
- **O-T3**: count 컬럼 타입 — number vs string. → 답: Prisma `_count`는 number 반환. 09 §3 example `"count": 12` integer.
