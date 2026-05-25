---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-prisma-schema — Feature Risk

> Issue #3 · mode=add · P7 산출 (변경 리스크 + 데이터 영속성).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | SQLite FK CASCADE 미동작 (PRAGMA foreign_keys=OFF 가정) | 5 (R-F-07 무력화) | 1 (Prisma client가 자동 ON) | Medium |
| F-RISK-02 | postinstall hook `prisma generate` 실패 → @prisma/client stub만 export | 4 (typecheck FAIL) | 2 (네트워크 의존 binary download 1회) | Medium |
| F-RISK-03 | dev hot-reload (tsx watch) 시 PrismaClient 중복 인스턴스 → SQLite lock | 3 (dev 부팅 실패) | 2 (global hoisting 미적용 시 빈번) | Medium |
| F-RISK-04 | seed 비-idempotent → 2회 실행 시 unique constraint FAIL (Tag.name) | 2 (dev 한정) | 1 (deleteMany 선행 패턴 표준) | Low |
| F-RISK-05 | `.gitignore` `*.db` root 패턴이 sub-dir 미매칭 → dev.db commit 위험 | 5 (보안 R-N-07 위배) | 1 (commit 1에서 명시 추가 + git status 확인) | Medium |
| F-RISK-06 | Prisma 5.22 vs Node 20 Windows에서 binary 호환 문제 | 4 (사용자 환경 차단) | 1 (Prisma 공식 Windows 지원 + #2에서 이미 pnpm 동작 확인) | Low |

## 2. 리스크 상세

### F-RISK-01 — SQLite FK CASCADE 미동작

- **시나리오**: SQLite는 기본 `PRAGMA foreign_keys=OFF`. ON DELETE CASCADE 선언만으로는 동작 안 함. Prisma client가 매 connection마다 `PRAGMA foreign_keys=ON`을 자동 실행해야 안전.
- **영향**: R-F-07 무력화 — 글 삭제해도 댓글 잔존 → 고아 댓글 발생. cascade 통합 테스트가 실패하면 즉시 발견.
- **완화책**:
  - Prisma v5+는 SQLite connection 시 자동 `PRAGMA foreign_keys=ON` 적용. 본 PR이 5.22 채택으로 자동 보장.
  - cascade.integration.test.ts가 *실 cascade 동작*을 assert — 회귀 안전망.
  - 만약 raw SQL 직 호출 시 `prisma.$executeRawUnsafe('PRAGMA foreign_keys=ON')` 명시 (본 PR 비대상, #4 권고).
- **모니터링**: cascade.integration.test.ts가 매 PR CI에서 PASS 유지. schema.prisma 변경 PR은 본 테스트 재실행 (13/03-regression.md 트리거).

### F-RISK-02 — postinstall hook 실패

- **시나리오**: `pnpm install` 후 `prisma generate`가 네트워크 차단 환경 / Windows 권한 문제 / binary download 실패로 exit !=0. → `@prisma/client`이 stub만 export → typecheck FAIL.
- **영향**: 사용자가 본 PR 머지 후 `pnpm install` 실행 시 즉시 차단. 학습자 입문 경험 손상.
- **완화책**:
  - LOCAL.md §3에 fallback 명령 명시: `pnpm install` 실패 시 `pnpm --filter @app/backend prisma:generate` 별도 실행.
  - postinstall은 *informational fail*로 처리하는 옵션 검토 (단, 본 PR은 strict 채택 — 사용자가 즉시 인지 필요).
- **모니터링**: 본 PR Manual verification에서 fresh checkout `pnpm install` 1회 통과 확인.

### F-RISK-03 — PrismaClient 중복 인스턴스 (dev hot-reload)

- **시나리오**: `tsx watch`가 파일 변경 시 module 재실행. lib/prisma.ts가 매번 새 PrismaClient를 new하면 SQLite는 단일 writer라 lock 충돌.
- **영향**: dev 부팅 후 1~2회 reload 후 SQLITE_BUSY 에러 빈발. 사용자 학습 흐름 단절.
- **완화책**:
  - lib/prisma.ts가 `globalThis.__prisma` 패턴으로 singleton hoisting — Prisma 공식 권장 패턴.
  - cascade.integration.test.ts `afterAll`에서 `await prisma.$disconnect()` 명시.
- **모니터링**: dev 환경에서 hot-reload 5회 시도 후 부팅 정상 확인 (Manual).

### F-RISK-04 — seed 비-idempotent

- **시나리오**: `seed.ts`가 createMany만 호출하면 2회 실행 시 Tag.name UNIQUE 위배.
- **완화책**: `prisma.$transaction`으로 `articleTag.deleteMany() → comment.deleteMany() → article.deleteMany() → tag.deleteMany()` 후 createMany — 표준 idempotent 패턴.
- **모니터링**: AC-03 (seed 2회 실행 후 count 동일).

### F-RISK-05 — `.gitignore` sub-dir 미매칭

- **시나리오**: `.gitignore`에 `*.db`만 있고 git이 `backend/prisma/dev.db`를 추적해버리는 경우. (실제로는 `.gitignore` `*.db`는 모든 sub-dir 매칭하나, 사용자가 이미 git add한 후 발견 시 위험)
- **영향**: dev.db가 commit되면 보안(R-N-07) + 용량 부담. 후속 PR 회수 비용 큼.
- **완화책**:
  - commit 1에서 명시적 `backend/prisma/*.db` + `backend/prisma/*.db-journal` 추가 — 안전 보강.
  - 본 PR Manual verification 단계 5(`seed:dev`) 후 `git status`로 dev.db 부재 확인.
- **모니터링**: PR diff에 `.db` 파일 0건 확인 (자동 — gh pr view files).

### F-RISK-06 — Prisma 5.22 Windows 호환

- **시나리오**: Prisma engine binary가 Windows 환경에서 다운로드 / 실행 실패.
- **완화책**:
  - Prisma 공식 Windows 지원 (engineType=binary 기본). 5.x 안정 검증.
  - #2 PR에서 이미 pnpm + Node 20 Windows 환경 검증 완료. Prisma binary는 first install 시 1회만.
- **모니터링**: 본 PR fresh checkout fresh install 시 binary 다운로드 성공 확인 (Manual).

## 3. High 등급 단계적 롤아웃

해당 없음 — 본 PR은 Medium/Low 등급만 (영향×가능성 최대 = 5). High 등급(영향 4+ × 가능성 4+) 부재.

본 PR 머지 전략:
- branch protection 미적용 트랜지션이라 사용자 squash merge (#2와 동일 패턴)
- 머지 후 Sprint 1 milestone 진행률 3/5 표시
- 후속 #4 진입 시 본 PR baseline에서 PrismaClient 사용 — interface 안정성 검증 (issue-level)

## 4. 데이터 영속성 변경

- **DB schema 변경**: 4 테이블 신설 (Article·Comment·Tag·ArticleTag) — *init migration*이라 기존 데이터 0
- **데이터 마이그레이션 스크립트**: N/A (init만)
- **revert 시 데이터 보존**: dev.db는 `.gitignore` 적용 + 로컬에만 존재. revert 시 사용자 로컬 dev.db는 잔존하나 schema가 사라지므로 사용 불가 → 재도입 시 `prisma:push`로 재초기화 (학습자 환경이라 데이터 손실 가정 허용)
- **stg/prod**: 본 PR은 dev migration만. stg/prod 실 적용은 #5에서 `prisma:deploy` 명령으로 별도 검증
- **백업 권고**: dev 환경 — N/A (재초기화 가능). stg/prod — #5에서 결정

## 5. 15-risk.md 갱신 항목

- F-RISK-01·02·03·05·06 (5건) — 15-risk.md §"Backend Infra" 항목에 fan-in 등록 (P13 docs-update에서 처리)
- 본 PR이 R-F-07 schema-level 보장 — 15-risk.md `R-F-07 위반 가능성` 행을 "schema-level 보장 (PR #N)"으로 갱신
- Prisma 채택 결정 — 15-risk.md "기술 선택" 항목에 Prisma 5.22 + SQLite + cascade DB-level 정합 명시
