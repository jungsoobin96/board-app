---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer-agent@anthropic.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-cascade-integration — Code Review

> Issue #8 -- mode=add -- P9 독립 코드 리뷰. Generator(developer) != Evaluator(reviewer). 1 commit, test 전용 PR (src 0 변경).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | claude-reviewer-agent | 초안 (P9 독립 리뷰) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: claude-reviewer-agent@anthropic.com
- **review_at**: 2026-05-26
- **note**: test 전용 PR (src 변경 0, 신규 it 1 블록). 컨트랙트 9 항목 충실, 보안 이슈 0, 코딩 컨벤션 준수, scope creep 0. Prisma 5.22 `$transaction` async fn throw 자동 rollback 표준 동작 정합. MAJOR/MINOR 발견 0.

## 1. 컨트랙트 충실도

### 1.1 Before/After 9 항목 대조

| # | 항목 | Contract Before/After | 실 변경 | 일치 |
| --- | --- | --- | --- | --- |
| 1 | cascade.integration.test.ts it 블록 | 2 -> 3 | +1 it (rollback throw 주입) = 3 총 | O |
| 2 | rollback 검증 방식 | 0 -> `$transaction` async throw | `prisma.$transaction(async (tx) => { ...create... throw })` | O |
| 3 | 회귀 매트릭스 R-F-07 | 명시만 -> 실 코드 검증 | it 블록이 13/02-catalog R-F-07 SS2 "Failure: rollback" 시나리오 구현 | O |
| 4 | 통합 테스트 합계 | 21 -> 22 | +1 (본 PR) | O |
| 5 | typecheck | PASS 유지 | 변경 없음 (test 전용) | O |
| 6 | build | PASS 유지 | 변경 없음 | O |
| 7 | smoke | 동일 | src/env/schema 변경 0 | O |
| 8 | 부팅 자산 | 무변경 | 무변경 | O |
| 9 | src 변경 | 0 | 0 (test 파일만) | O |

**9/9 일치. scope creep 0.**

### 1.2 Plan SS1 커밋 시퀀스

| 커밋 # | 계획 | 실제 | 일치 |
| --- | --- | --- | --- |
| 1 | `test(backend): cascade rollback 시나리오 추가 (#8)` | 3ac38fc `test(backend): cascade rollback 시나리오 추가 (#8)` | O |
| 2 | `docs(plan): feat-cascade-integration 산출 + CHANGELOG (#8)` | (P10 docs-update 예정) | N/A |

### 1.3 AC 매핑

| AC | 내용 | 코드 매핑 | 충족 |
| --- | --- | --- | --- |
| AC-01 | cascade happy (글 삭제) 회귀 | 기존 it 1번째 (line 25-63) - 변경 없음, 회귀 확인 | O |
| AC-02 | 트랜잭션 rollback throw 주입 | 신설 it 2번째 (line 65-92) - `$transaction` async throw -> 4 테이블 count=0 | O |
| AC-03 | 태그 삭제 cascade 회귀 | 기존 it 3번째 (line 94-112) - 변경 없음, 회귀 확인 | O |

## 2. 테스트 커버리지

### 2.1 신규 테스트 분석

**파일**: `backend/tests/integration/cascade.integration.test.ts` line 65-92

- **Given**: beforeEach로 4 테이블 정리 완료 (빈 DB 보장)
- **When**: `prisma.$transaction(async (tx) => { ... throw new Error('intentional rollback for cascade test') })`
  - tx.article.create (1건)
  - tx.comment.createMany (2건)
  - tx.tag.create (1건)
  - tx.articleTag.create (1건)
  - throw Error (rollback 트리거)
- **Then**:
  - `await expect(...).rejects.toThrow('intentional rollback for cascade test')` -- throw 검증
  - `prisma.article.count() === 0` -- article 0건
  - `prisma.comment.count() === 0` -- comment 0건
  - `prisma.tag.count() === 0` -- tag 0건
  - `prisma.articleTag.count() === 0` -- articleTag 0건

### 2.2 테스트 정합성 검증

| 점검 | 결과 | 비고 |
| --- | --- | --- |
| `await expect(...).rejects.toThrow(...)` vitest 표준 syntax | O | 기존 unit test에서 동일 패턴 사용 확인 (article.service.test.ts, comment.service.test.ts) |
| throw 후 count 검증이 transaction 외부에서 실행 | O | `prisma.article.count()` (tx 아닌 prisma 직접) -- rollback 이후 실 DB 상태 확인 |
| 4 테이블 모두 count=0 검증 | O | Article/Comment/Tag/ArticleTag 4종 완전 커버 |
| beforeEach 격리 | O | 기존 패턴 답습 -- `prisma.$transaction([articleTag.deleteMany, comment.deleteMany, article.deleteMany, tag.deleteMany])` |
| afterAll disconnect | O | 기존 패턴 답습 (line 21-23) |
| Prisma $transaction async fn throw -> 자동 rollback | O | Prisma 5.22 표준 동작 (interactive transaction callback throw = automatic rollback). package.json `@prisma/client: ^5.22.0` 확인 |

### 2.3 기존 테스트 회귀 영향

- 기존 it 1 (글 삭제 cascade): 변경 0 -- line 25-63 untouched
- 기존 it 3 (태그 삭제 cascade): 변경 0 -- line 94-112 untouched (기존 it 2 -> it 3으로 순서 이동)
- 신규 it은 beforeEach에 의존하므로 다른 케이스 격리 보장

## 3. 보안 / 시크릿

| 점검 | 결과 |
| --- | --- |
| `console.log(process.env)` / `DATABASE_URL` 직접 참조 | 0건 (grep 확인) |
| `.env*` 파일 변경 | 0 |
| schema.prisma 변경 | 0 |
| 하드코딩 시크릿 / API key | 0 -- test data는 임시값 (`'rollback'`, `'b'`, `'a'`, `'rollback-tag'`) |
| TODO/FIXME/HACK/XXX | 0건 |
| Prisma debug log 노출 위험 | 낮음 -- PrismaClient() 기본 생성 (log level 미설정 = error만). Ca-RISK-04 완화 충족 |

**보안 이슈 0.**

## 4. 가독성 / 단순성

### 4.1 코딩 컨벤션 준수

| 규칙 | 준수 | 비고 |
| --- | --- | --- |
| 파일명 kebab-case + `.integration.test.ts` (11-conventions SS1) | O | `cascade.integration.test.ts` 기존 파일 |
| `import` ESM 사용, `require` 0 | O | line 5-6 |
| `async/await` 일관 (promise chain 0) | O | 모든 DB 호출이 await |
| 한국어 주석 (R-N-05) | O | `// Given:`, `// When/Then:`, `// Then:` 의도 주석 |
| `any` 사용 | 0 | TypeScript strict 준수 |
| `no-console` | 0건 | console.log/debug/warn/error 미사용 |

### 4.2 패턴 일관성

- describe/it/beforeEach/afterAll 구조: 기존 3 integration test 파일과 동일 패턴
- `await expect(...).rejects.toThrow(...)`: 기존 unit test 패턴과 동일 (article.service.test.ts line 64-65)
- Given/When/Then 주석: 기존 cascade test의 it 1/3과 동일 스타일

### 4.3 코드 간결성

- +29 lines, 1 it 블록. 불필요한 헬퍼/추상화 0.
- throw message `'intentional rollback for cascade test'`가 명시적 의도 표현 -- plan SS5 결정 8 준수.
- 죽은 코드 0, debug 코드 0.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| INFO-01: tag.create 대신 tag.createMany 사용 가능 (plan SS3 명세와 미세 차이 -- `tx.tag.createMany` 명시 vs 실제 `tx.tag.create` 단건) | O | X | O | plan SS3 테스트 매핑에서 `tx.tag.createMany` 언급이나 실 코드는 `tx.tag.create` 1건. 기능 동등하며 1건 시드이므로 create가 더 적절. 실 동작 차이 0. 무시 가능. |
| INFO-02: rollback count 검증이 global count (where 조건 없음) | O | X | O | beforeEach가 전체 정리하므로 global count=0이 정확한 검증. where 조건 불필요. 오히려 더 엄격한 검증. |

**MAJOR: 0 / MINOR: 0 / INFO: 2**

## 6. NEEDS-WORK 항목

없음. PASS 판정.

### Ca-RISK 5건 mitigation 확인

| RISK | 완화 확인 |
| --- | --- |
| Ca-RISK-01 (Prisma $transaction throw rollback 미동작) | Prisma 5.22 확인. test 자체가 count=0으로 자동 검출 |
| Ca-RISK-02 (beforeEach 격리 실패) | beforeEach 4 deleteMany 기존 패턴 답습. 신규 throw는 transaction 내부 -- rollback 후 잔존 0 |
| Ca-RISK-03 (try/catch 누락) | `await expect(...).rejects.toThrow(...)` vitest 표준 사용 |
| Ca-RISK-04 (시크릿 노출) | console.log/process.env/DATABASE_URL grep 0건. 임시 데이터만 사용 |
| Ca-RISK-05 (SQLite isolation) | vitest.integration.config.ts `singleFork: true + fileParallelism: false` 확인 -- concurrent 0 |
