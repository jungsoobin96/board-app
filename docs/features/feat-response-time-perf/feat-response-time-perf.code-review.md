---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-01]
  F-ID: [F-01]
  supersedes: null
---

# 응답 시간 측정 통합 (Issue 20) — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 (reviewer agent) | 본문 -- 9항 리뷰 완료, verdict=PASS |
| v0.1 | 2026-05-28 | jungsoobin96 (reviewer agent) | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: @reviewer (reviewer agent, Generator != Evaluator)
- review_at: 2026-05-28
- MAJOR: 0
- MINOR: 1

perf.integration.test.ts 신설 (~169 line), 4 시나리오 x 100회 p95 측정 + WARN(BLOCK X) + 결과 JSON 출력 + sanity expect. 기존 24 통합 무변경, 25 passed 확인. feature docs 6건 contract 정합. 시크릿 0건. 머지 차단 사유 없음.

## 1. 컨트랙트 충실도

### 1-1. perf.integration.test.ts 구조 분석

**seed100Articles (line 50-79)**: 태그 8종 createMany + for loop 100회 article.create + ArticleTag 라운드로빈(글마다 1~2개) + 첫 글 댓글 3건. 반환값 `{ articleId, tagName }` -- 후속 시나리오에서 articleId를 상세/댓글 조회에 사용. sequential for loop ~253 prisma create, 로컬 SQLite ~1초. contract.md Before/After 행 "seed100Articles() -- 글 100 + 태그 8 + ArticleTag 라운드로빈 + 댓글 3" 정합.

**percentile (line 81-85)**: `[...samples].sort() + Math.ceil((p/100)*length) - 1 + Math.max(0, idx)`. nearest-rank 방법 정합. p=95, length=100일 때 `Math.ceil(0.95*100)-1 = 94` -> sorted[94] = 95번째 값(0-indexed). 정확.

**measureScenario (line 87-115)**: 100회 `performance.now()` 쌍 측정 + status 200 확인 + min/p50/p95/max/mean 통계. `Math.min(...samples)` / `Math.max(...samples)` 100 인자 spread -- V8 argument limit 256k 대비 안전(100 << 256k). `toFixed(2)` + `Number()` 변환으로 소수점 2자리 고정 -- JSON 출력 정돈.

**it (line 118-167)**: seed100Articles -> Promise.all 4 measureScenario -> report JSON -> WARN -> sanity expect. contract.md 10행 Before/After 모두 충족:
- 통합 카운트 24->25: 25 passed 확인
- R-N-01 추적성: 정량 측정 + JSON 출력
- p95 측정 함수: percentile helper
- WARN 형식: `[PERF WARN] <label> -- p95=<ms>ms >= 200ms threshold (BLOCK X, 추적만)`
- sanity: status=200 + iterations=100 + min <= p95 <= max

### 1-2. 시나리오 선택 (brief.md)

4 시나리오: GET /api/articles?page=1&limit=10 (목록) / GET /api/articles/:id (상세) / GET /api/tags (태그) / GET /api/articles/:id/comments (댓글). Home/Article/Tags/Comments 골든패스 망라. 09-lld-api-spec 4 GET endpoint 정합. mode=add 결정(type:test 라벨 + 부정 시그널 0건 -> ADR-0032 기본값 add) 정당 -- 기존 코드 0줄 변경.

### 1-3. contract.md 정합

- section 0 Referenced-IDs 5행: R-N-01 + F-01 + 영향 모듈 + 4 endpoint + 컨벤션(none) -- 모두 정확
- section 1 변경 의도: #20 본문 DoD 4항 충족 + R-N-01 추적성 명시
- section 2 Before/After 10행: 통합 카운트/p95 측정/WARN 형식/시드 함수/실측 결과 -- 정량 측정 가능
- section 3 호출자 7행: perf 신설 + read-only 의존 5건 + catalog 기존 + feature docs 8건
- section 4 Backward no + 사용자 노출 없음 (테스트만)
- section 5 Rollback yes (1단계 revert) + 데이터 손상 없음
- section 6 비목표 6건 명확

### 1-4. plan.md 정합

- section 1 커밋 시퀀스 1행: perf.integration.test.ts + 8 docs 원자 1 commit. diff 규모 소형이므로 분할 불필요
- section 2 의존성 그래프: P0->P10 ASCII 명확
- section 3 테스트 매핑: perf 1 it (4 시나리오 x 100회) + 기존 24 회귀
- section 4 빌드/실행 6단계: validate/typecheck/test:integration/sanity/smoke/workflow 양축
- section 5 BLOCKED 분기: 25 미달 또는 sanity FAIL 시 BLOCKED -- 명확

### 1-5. acceptance.md AC-01/02/03/04 + DoD 7항

- AC-01: 100건 시드 + GET /api/articles 100회 -> p95 < 200ms. 측정: vitest JSON 출력. 실측 ~28ms
- AC-02: 4 시나리오 모두 p95 < 200ms (WARN if 초과, BLOCK X). 측정: summary.all_p95_under_threshold
- AC-03: 결과 JSON 콘솔 출력. 측정: stdout `[PERF] R-N-01` grep
- AC-04: 통합 카운트 24->25. 측정: vitest 출력 last line
- DoD 7항: 모두 측정 가능 (vitest count/review/console grep/AI 게이트/Manual)
- 회귀-01: 기존 5파일 24 it PASS 유지. singleFork + beforeEach deleteMany 격리

### 1-6. risk.md 3 F-RISK 모두 Low

- F-RISK-01 CI WARN 폭증 (Low 2x2): BLOCK 없이 WARN만 -- 환경 변동 안전 흡수. 완화책 적절
- F-RISK-02 시드 시간 초과 (Low 3x1): 실측 ~4초 < testTimeout 15s. 완화책(사전 실측) 정당
- F-RISK-03 singleFork 격리 (Low 2x2): pool=forks singleFork + fileParallelism=false + beforeEach deleteMany. 완화책(25 passed 사전 확인) 정당

### 1-7. eng-review.md verdict=PASS + 4 발견 사항

OX 4건 모두 A.Derived (Sprint 6+ 후보): CI 임계/JSON 영속화/추가 시나리오/Math.min spread 확장. 부모 미명시 + 머지 가능 + 별 영역 -> Derived 분류 정당. verdict=PASS 정합.

## 2. 테스트 커버리지

### 2-1. 신규 perf it (line 118-167)

단일 `it('4 시나리오 x 100회 -- p95 측정 + WARN 출력 + 결과 JSON')` 내부 구조:

1. `seed100Articles()` -- 100 article + 8 tag + ~150 ArticleTag + 3 comment
2. `Promise.all([...4 measureScenario...])` -- 4 시나리오 병렬 측정
3. report JSON 구성 (issue/r_id/threshold_ms/iterations/scenarios/summary)
4. `console.log` JSON 출력
5. WARN if p95 >= 200ms (BLOCK X)
6. sanity expect: statusAllOk=true + iterations=100 + p95>0 + min<=p95<=max

**Promise.all 병렬 측정 안전성**: supertest는 Express app을 in-process로 호출. SQLite 단일 writer이지만 4 시나리오 모두 GET(read-only)이므로 write contention 없음. singleFork 환경에서 Node event loop 내 비동기 겹침이나, read-only 쿼리 간 동시성 문제 없음. 만약 측정값 분산이 우려되면 sequential로 전환할 수 있으나, 실측 p95 모두 < 50ms로 안정적.

### 2-2. 기존 24 통합 회귀

beforeEach에서 `prisma.$transaction([deleteMany x4])` 전체 초기화. singleFork + fileParallelism=false로 순차 실행. perf 테스트가 기존 테스트와 데이터 격리. 25 passed 사전 확인으로 회귀 0건.

### 2-3. 측정 정확성

- `performance.now()` -- Node.js high-resolution timer. supertest request 전후로 쌍으로 호출. 네트워크 I/O 제외(in-process), Express 처리 + Prisma 쿼리 + JSON 직렬화 시간 측정. 로컬 SQLite 기준이므로 실환경 DB 대비 편차 있으나 R-N-01 추적 목적으로 적절
- 100회 반복: 통계적 안정성 확보. p95 = sorted[94] (0-indexed) -- 표본 크기 100에서 nearest-rank 정합
- `toFixed(2)` -- ms 소수점 2자리로 JSON 출력 정돈

## 3. 보안 / 시크릿

### 시크릿 스캔 결과

- `backend/tests/integration/perf.integration.test.ts`: API Key / secret / token / credential / password / Bearer / ANTHROPIC 패턴 0건. 환경변수 참조 `process.env.DATABASE_URL` 1건 -- vitest dotenv-cli 설정 연동 용도, 값 미노출(fallback `file:./dev.db`만). 외부 URL 0건. **CLEAN**
- `docs/features/feat-response-time-perf/*.md` 6건: 프로젝트 내부 경로 참조만. API Key / secret 패턴 0건. **CLEAN**
- 시드 데이터: `글 N` / `본문 N` / `작성자N` / `댓글 N` / `commenterN` -- 한국어 + 영문 숫자 패턴만. 실 사용자 데이터 없음

시크릿 노출 총 **0건**.

## 4. 가독성 / 단순성

### 4-1. 전체 구조

169줄 단일 파일. describe 1 + it 1 + helper 3 (seed100Articles / percentile / measureScenario). 모듈 수준 beforeAll(buildApp) + beforeEach(deleteMany) + afterAll(disconnect). 기존 통합 테스트 패턴(articles/comments/tags)과 일관된 진입점 구조.

### 4-2. seed100Articles

sequential for loop 100회 -- createMany 가능하나 ArticleTag 라운드로빈을 인라인으로 처리하기 위해 개별 create. 가독성과 명확성 우선. ~1초 수행 시간으로 testTimeout 내 충분.

### 4-3. measureScenario

generic 함수 -- label + async fn -> 통계 객체 반환. 재사용 가능. 통계 필드(min/p50/p95/max/mean/statusAllOk/iterations)가 report JSON 구조와 1:1 대응. 의도 명확.

### 4-4. WARN 형식

`[PERF WARN] <label> -- p95=<ms>ms >= <threshold>ms threshold (BLOCK X, 추적만)` -- grep 가능한 prefix + 시나리오 라벨 + 실측값 + 정책(BLOCK X) 모두 포함. CI 로그 검색 용이.

### 4-5. author 일관성

author = `jungsoobin96@users.noreply.github.com` -- feature docs 6건 + 코드 commit 모두 동일. 이전 #18/#19 패턴과 일관.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| `Math.min(...samples)` / `Math.max(...samples)` 100 인자 spread -- V8 256k argument limit 대비 안전(100 << 256k)이나, ITERATIONS를 1000+ 확장 시 `samples.reduce((a,b) => Math.min(a,b))` 전환 필요 | Yes | No | Yes | A.Now-Minor: 현재 100으로 안전. eng-review Q4에서 식별 완료. 확장 시 별 PR |
| Promise.all 4 시나리오 병렬 측정 -- read-only GET이므로 SQLite write contention 없음. 그러나 4 시나리오 동시 실행으로 Node event loop 경합이 측정값에 미세 영향 가능 | Yes | No | Yes | A.Now-Minor: 실측 p95 모두 < 50ms로 안정적. sequential 전환 시 테스트 시간 증가(~12초). 현재 수준에서 병렬 유지 적절 |
| seed100Articles 내 for loop sequential create 100회 -- Prisma createMany + createManyAndReturn 활용 시 ~3x 빠를 수 있으나, ArticleTag 라운드로빈 인라인 로직 때문에 개별 create 사용 | No | No | Yes | A.Derived: 현재 ~1초로 testTimeout 내 충분. 성능 최적화는 시드 규모 확장 시 별 후보 |

## 6. NEEDS-WORK 항목

(없음 -- verdict=PASS, MAJOR 0건, MINOR 1건. 발견 사항 3건 모두 머지 비차단.)
