---
doc_type: feature-code-review
version: v0.1
status: Draft
author: reviewer@board-app
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-prisma-schema — Code Review

> Issue #3 -- mode=add -- P9 독립 코드 리뷰 (Generator!=Evaluator). Reviewer: reviewer agent.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | reviewer@board-app | 초안 (P9 code-review, commit 261eb45) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: reviewer@board-app
- **review_at**: 2026-05-25
- **note**: R-F-07 cascade 무결성이 schema-level로 정확히 강제됨. 통합 테스트 2/2 양방향 cascade 검증 충족. INFO 2건(DATABASE_URL 경로 + 문서 용어 불일치) 존재하나 모두 non-blocking -- 본 PR 범위 외(#2 유산) 또는 기능 무관 용어 차이. P10 qa-test --ai 진입 가능.

## 1. 컨트랙트 충실도

**contract.md Before/After 22항 vs 실 diff 18 파일 정합 검증:**

| contract 항목 | 코드 정합 | 비고 |
|---|---|---|
| schema.prisma 4 모델 + onDelete:Cascade 3개소 + 인덱스 3종 | O | Article(createdAt DESC), Tag(name UNIQUE), Comment(articleId+createdAt DESC) + ArticleTag @@id 복합 PK |
| migrations/init/migration.sql -- CASCADE FK + 인덱스 SQL | O | SQL 4 CREATE TABLE + 3 CREATE INDEX, FK CASCADE 3 일치 |
| migration_lock.toml provider="sqlite" | O | 정확 |
| seed.ts -- idempotent + NODE_ENV=dev 가드 + 한국어 console.log | O | $transaction deleteMany 4종 + createMany, 글 5/댓글 10/태그 8/ArticleTag 10 |
| lib/prisma.ts -- singleton + globalThis hoisting + LOG_LEVEL 분기 | O | debug=query/error/warn, else=error/warn |
| cascade.integration.test.ts -- R-F-07 핵심 검증 | O | 2 시나리오(글 삭제 cascade + 태그 삭제 cascade), contract는 "통합 1건"이라 했으나 실 2건으로 초과 충족 |
| vitest.integration.config.ts -- pool:forks + singleFork + fileParallelism:false | O | SQLite 단일 writer 회피 정합 |
| package.json scripts 7종 + deps 2종 | O | prisma:generate/push/migrate/deploy + seed:dev + test:integration + postinstall |
| .gitignore backend/prisma/*.db + *.db-journal | O | 명시 추가 확인 |
| LOCAL.md v0.2 dev profile DB 초기화 reminder | O | 3.1 절에 prisma:push + seed:dev 명령 추가 |
| pnpm-lock.yaml 갱신 | O | 66 insertions |

**contract 비목표 6항 준수**: controllers/services/repositories/validators/E2E/production deploy 모두 본 PR 범위 외 -- 위배 없음.

**07 HLD 3 인덱스 정합**: HLD에 명시된 3종(Article.createdAt DESC, Tag.name UNIQUE, ArticleTag PK)은 모두 반영. schema.prisma에 추가된 Comment(articleId+createdAt DESC) 인덱스는 HLD 미명시이나 합리적 선제 대응(댓글 목록 쿼리 최적화) -- 비목표 위배 아님.

**08 LLD M11 정합**: schema.prisma + migrations + seed + singleton client 4 산출 매핑 정확. $disconnect SIGTERM 핸들러는 contract 3절에서 "#4 권고"로 명시 위임 -- 본 PR이 server.ts import 0이므로 수용.

## 2. 테스트 커버리지

**통합 테스트 (cascade.integration.test.ts):**
- 시나리오 1: 글 1 + 댓글 3 + 태그 2 + ArticleTag 2 생성 -> 글 삭제 -> Comment 0건 + ArticleTag 0건 + Tag 잔존 2건. R-F-07 핵심 cascade 정방향 충족.
- 시나리오 2: 글 1 + 댓글 1 + 태그 1 + ArticleTag 1 생성 -> 태그 삭제 -> ArticleTag 0건 + Article 잔존 + Comment 잔존. R-F-07 역방향(Tag->ArticleTag) 충족.
- beforeEach deleteMany 4종으로 테스트 간 격리 보장.
- afterAll $disconnect 호출로 connection 정리.

**단위 테스트 회귀**: vitest.config.ts가 `tests/unit/**`로 좁혀져 기존 13/13 단위 테스트에 영향 없음. `tests/integration/**` exclude 명시.

**seed idempotency**: seed.ts가 $transaction 내에서 deleteMany 4종(역순: ArticleTag->Comment->Article->Tag) 후 createMany. 2회 실행 시 unique constraint 위배 없음 (deleteMany가 선행). AC-03 충족.

**NODE_ENV 가드**: seed.ts line 12-14에서 `if (env !== 'dev') throw`. AC-05 충족.

## 3. 보안 / 시크릿

- `.gitignore`에 `backend/prisma/*.db` + `backend/prisma/*.db-journal` 명시 추가 (R-N-07 정합). root-level `*.db` 패턴도 재귀 매칭하므로 이중 보호.
- seed.ts 더미 데이터: 작성자 'hana'/'minsu'/'jiwoo'/'tester' -- 실 이메일/비밀번호/API key 0건.
- .env 파일 커밋 없음 (diff 확인 완료). .env.dev.example의 DATABASE_URL은 로컬 파일 경로뿐.
- Prisma client가 query log를 stdout에 출력 (LOG_LEVEL=debug 시) -- 운영 환경에서는 LOG_LEVEL!=debug이므로 query 노출 없음. R-N-02 스택 미노출 정합.

**발견**: 실 dev.db가 `backend/prisma/backend/prisma/dev.db`(중첩 경로)에 생성됨. 이는 DATABASE_URL `file:./backend/prisma/dev.db`가 schema.prisma 위치(`backend/prisma/`) 기준으로 해석되기 때문. `git check-ignore` 확인 결과 root `*.db` 패턴이 커버하므로 보안 위험은 없음. 그러나 사용자 혼란 가능 -- INFO 등급으로 후속 #5 에서 수정 권고.

## 4. 가독성 / 단순성

- **한국어 주석**: schema.prisma(4 모델 각각 의도 주석), seed.ts(파일 헤더 4줄 + 인라인 console.log), lib/prisma.ts(파일 헤더 4줄 + 인라인 2줄), cascade.integration.test.ts(파일 헤더 3줄 + Given/When/Then 패턴 한국어). 모두 한국어 우세 -- R-N-05 측정 범위 외이나 관행 준수.
- **파일 명명**: schema.prisma(Prisma 관례), seed.ts/prisma.ts(단일 단어 소문자), cascade.integration.test.ts(kebab-case + vitest 관례). 11 1절 정합.
- **PascalCase 모델**: Article/Comment/Tag/ArticleTag -- 11 1절 정합.
- **코드 구조 단순성**: seed.ts 112줄, lib/prisma.ts 24줄, cascade.integration.test.ts 84줄 -- 각각 단일 책임. 과도 추상화 없음.
- **vitest config 분리**: 단위(vitest.config.ts)와 통합(vitest.integration.config.ts)의 명확 분리는 08 7절 SQLite 단일 writer 한계에 대한 적절한 설계 결정.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| F1. DATABASE_URL `file:./backend/prisma/dev.db`가 schema.prisma 기준 해석되어 `backend/prisma/backend/prisma/dev.db`에 DB 생성. 기능 동작하나 경로 중첩 혼란. | X (#2 .env.example 유산) | X (기능 정상 + gitignore 커버) | O (prisma 영역) | INFO -- #5 3-profile-boot-smoke에서 DATABASE_URL을 `file:./dev.db`로 수정 권고 |
| F2. 문서(contract/plan/acceptance)에서 vitest 설정을 "singleThread"로 기술하나 실 코드는 `singleFork: true`. 용어 불일치. | O | X (기능 무관, 의도 동일) | O | INFO -- 후속 문서 정합 시 용어 통일 |
| F3. cascade.integration.test.ts 2 시나리오 -- contract "통합 1건" 기술 대비 초과 충족 (글 삭제 + 태그 삭제 양방향). | O | X (초과는 긍정적) | O | OK -- 문서가 보수적이었으나 코드가 더 완전 |
| F4. Comment(articleId+createdAt DESC) 인덱스가 07 HLD 3에 미명시이나 schema에 추가됨. | O | X (합리적 선제 대응, 비목표 위배 아님) | O | OK -- 댓글 목록 쿼리 최적화에 필수. HLD 갱신은 docs-update에서 처리 |

## 6. NEEDS-WORK 항목

없음. 발견 4건 모두 non-blocking (INFO 또는 OK).

- F1 (DATABASE_URL 중첩 경로): 본 PR 범위 외(#2 유산). 기능 정상. #5에서 수정 권고.
- F2 (singleThread vs singleFork 용어): 기능 무관. docs-update에서 통일.
- F3, F4: 긍정적 초과 충족. 조치 불필요.

**P10 qa-test --ai 진입 판정**: 가능. 본 PR은 backend infrastructure only (ui_changed=false)이므로 gstack /qa 및 브라우저 골든패스는 N/A. AI 게이트 6축 중 5번째 축(브라우저 실증)은 적용 외.
