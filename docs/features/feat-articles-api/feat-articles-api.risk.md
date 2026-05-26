---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-05]
  F-ID: [F-01, F-03, F-04, F-06, F-07]
  supersedes: null
---

# feat-articles-api — Feature Risk

> Issue #4 · mode=add · P7 산출 (변경 리스크).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | tag 정규화 누락 → FE 페이지(#11)에서 중복 tag 표시 | 3 (UX 노이즈) | 2 (정규화 함수 단위 테스트 누락 시) | Medium |
| F-RISK-02 | PUT 시 기존 ArticleTag 미삭제 → 태그 누적 | 4 (데이터 정합성 위배) | 2 (relink 로직 누락 시) | Medium |
| F-RISK-03 | app.ts에서 articlesRouter 등록 위치 오류 (notFoundHandler 뒤) → 모든 요청 404 | 5 (전 endpoint 무력화) | 1 (P5 plan-eng-review 확인 + 통합 테스트가 즉시 발견) | Medium |
| F-RISK-04 | service NotFoundError throw 누락 → Prisma findUnique=null이 직접 응답 → 500 또는 빈 객체 | 3 (R-N-02 에러 schema 위배) | 2 (null 체크 명시 안 하면) | Medium |
| F-RISK-05 | 통합 테스트 SQLite lock 회귀 (vitest.integration.config.ts singleFork 미적용) | 3 (CI 빨강) | 1 (#3에서 이미 검증된 설정 재사용) | Low |
| F-RISK-06 | PrismaClientKnownRequestError 처리 누락 → 500 + 스택 노출 | 4 (R-N-02·보안 위배) | 1 (M10 errorHandler가 generic 500 + stack stderr 보장) | Medium |

## 2. 리스크 상세

### F-RISK-01 — tag 정규화 누락

- **시나리오**: service `normalizeTags()`에서 trim 또는 lower 또는 중복 제거 1개 이상 누락. POST 응답이 `tags: ["JS","ts","js"]` (중복) 또는 `["JS"," ts "]` (trim 안 됨).
- **영향**: FE #11에서 `<TagList>` 컴포넌트가 중복 tag 칩 렌더. 데이터 자체는 DB에 잘못 저장되어 후속 GET에도 영향.
- **완화책**:
  - 단위 테스트 `tests/unit/services/article.service.test.ts`에 `normalizeTags(["JS","ts","js"," ","TS"])` → `["js","ts"]` assert (AC-09).
  - 통합 테스트 AC-05가 POST 응답 tags=["js","ts"] 검증.
- **모니터링**: 매 PR CI에서 단위 + 통합 PASS 유지.

### F-RISK-02 — PUT 기존 ArticleTag 미삭제

- **시나리오**: PUT은 *전체 교체* semantic (09 spec). 기존 글의 tag = ["a","b"]였는데 PUT body tag = ["c"] 보내도, 구현이 단순 추가만 하면 결과 = ["a","b","c"] (예상=["c"]).
- **영향**: 데이터 정합성 위배. FE에서 의도와 다른 tag 표시.
- **완화책**:
  - service `update()`에서 `withTransaction` 안에 `unlinkByArticleId(id)` → `upsertTags(new tags)` → `linkMany(id, tagIds)` 3단계 명시.
  - 통합 테스트에 PUT 후 tags 비교 케이스 추가 권고 (AC-07 외 추가). 단, 본 PR AC는 PUT 404 케이스만 강제 — happy PUT은 P10 휴먼 게이트에서 manual 검증.
- **모니터링**: P13 docs-update에서 13/02-catalog §2 통합에 "PUT 전체 교체" 회귀 시나리오 등록 제안 (#7 또는 회귀 PR).

### F-RISK-03 — app.ts 라우터 등록 위치 오류

- **시나리오**: `app.use('/api/articles', articlesRouter)`를 `app.use(notFoundHandler)` *뒤*에 두면 모든 요청이 먼저 404를 만나 라우터에 도달 못 함.
- **영향**: 5 endpoint 전부 무력화. 통합 테스트 0 PASS.
- **완화책**:
  - plan §1 commit 5에 *등록 위치* 명시 ("notFoundHandler 직전").
  - 통합 테스트가 GET /api/articles 첫 케이스에서 즉시 발견 (200 expected → 404 actual로 FAIL).
  - 코드 리뷰 P9에서 reviewer agent가 app.ts 미들웨어 체인 순서 검증.
- **모니터링**: 본 PR 통합 테스트 PASS = F-RISK-03 회귀 안전망.

### F-RISK-04 — service NotFoundError throw 누락

- **시나리오**: `ArticleService.get(id)`에서 `repo.findById(id)` 결과 null인데 그대로 응답하면 `controller`는 `res.json(null)` → 200 + null body. 또는 service에서 throw 잊으면 controller `article.title` 접근 시 TypeError → 500 + 스택 노출.
- **영향**: R-N-02 위배 (errorHandler가 일반 500으로 받아서 stack은 stderr only 처리하긴 하지만, 404 의도가 200/500로 잘못 매핑).
- **완화책**:
  - service의 get·update·delete에서 `if (!article) throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다')` 명시.
  - 단위 테스트 (d) get(999) → NotFoundError + 통합 테스트 AC-04 검증.
- **모니터링**: 11 §2 PREFIX 컨벤션 — NotFoundError code prefix `NOT_FOUND_*` 준수.

### F-RISK-05 — 통합 테스트 SQLite lock 회귀

- **시나리오**: 본 PR이 새 vitest config 또는 기존 vitest.integration.config.ts를 무심코 수정 → singleFork/forks 무력화 → 두 통합 파일(cascade + articles)이 병렬 실행 → SQLITE_BUSY.
- **완화책**:
  - vitest.integration.config.ts 변경 금지 (#3 검증된 그대로). plan §5 결정 7에 명시.
  - 본 PR이 추가하는 통합 파일은 `articles.integration.test.ts` 1개만. 동일 config로 fileParallelism=false 강제.
- **모니터링**: 통합 테스트 11 passed 확인.

### F-RISK-06 — PrismaClientKnownRequestError 처리 누락

- **시나리오**: Prisma가 알려진 에러 (P2002 unique constraint, P2025 record not found 등) throw. 본 PR repository가 그대로 bubble up하면 errorHandler 기본 fallback (500 + 스택 stderr) — 사용자 응답은 안전("서버 오류가 발생했습니다") but stack에 schema 정보 노출 가능.
- **영향**: 사용자 응답은 R-N-02 안전 (M10이 generic 500 메시지). 단 stack에 schema 누설은 *학습용 dev 환경*에서는 허용, *stg/prod에는 부적합* (#5에서 처리 권고).
- **완화책**:
  - repository에서 P2025 (findUnique 결과 + delete failed missing record) → NotFoundError로 변환 시도. 본 PR은 service 레이어에서 null 체크 후 throw하므로 P2025는 거의 발생 안 함 (이중 안전망).
  - P2002 (unique constraint violation) — 본 PR Tag.name UNIQUE만 해당. Tag upsertMany 패턴 사용 시 P2002 미발생.
- **모니터링**: 단위 테스트에 Prisma 에러 mock 케이스는 본 PR 비목표 (P10 휴먼 게이트에서 발견 시 후속 이슈).

## 3. High 등급 단계적 롤아웃

해당 없음 — 본 PR은 Medium/Low 등급만 (영향×가능성 최대 = 5×1=5 또는 3×2=6). High 등급(영향 4+ × 가능성 4+) 부재.

본 PR 머지 전략:
- 사용자 squash merge (#26·#28·#29·#30·#31과 동일 패턴)
- 머지 후 Sprint 1 milestone 진행률 4/5 표시 (#1·#2·#3·#4 완료)
- 후속 #5 진입 시 본 PR baseline에서 3 profile 부팅 smoke 작성 — `.env.{stg,prod}.example` + `scripts/smoke.ts` 신설로 ADR-0037 v1.1 6번째 축 정식 충족

## 4. 데이터 영속성 변경

- **DB schema 변경**: 없음 — 본 PR은 HTTP/application layer만. #3 schema 재사용.
- **데이터 마이그레이션 스크립트**: N/A.
- **revert 시 데이터 보존**: 본 PR revert 시 dev.db 데이터 완전 잔존. 5 endpoint만 사라지고 `/healthz`만 남는 #3 baseline 상태.
- **stg/prod**: 본 PR은 endpoint 신설만. stg/prod 부팅 자산은 #5에서 별도 처리.
- **백업 권고**: dev — 불필요. stg/prod — #5 결정.

## 5. 15-risk.md 갱신 항목

- F-RISK-01·02·03·04·06 (5건) — 15-risk.md §"Backend API" 항목에 fan-in 등록 (P13 docs-update에서 처리).
- 본 PR이 R-F-01·R-F-02·R-F-03 endpoint-level 발현 완료 — 15-risk.md "R-F-01·02·03 endpoint 미신설" 행을 "Sprint 1 #4 PR #N으로 신설"로 갱신.
- normalizeTags + withTransaction 패턴 정착 — Sprint 2 #6 댓글 API에서 동일 패턴 채택 권고를 15-risk.md "기술 패턴" 항목에 등록.
