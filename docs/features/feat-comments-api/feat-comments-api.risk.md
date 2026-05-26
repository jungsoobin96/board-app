---
doc_type: feature-risk
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Feature Risk

> Issue #6 · mode=add · P7 산출. 7 카테고리 점검 + High 등급 0 (mode=add + articles 패턴 답습으로 회귀 위험 낮음).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| C-RISK-01 | mergeParams 미설정 시 articleId 추출 실패 → 모든 endpoint 500 | 4 | 2 | Medium |
| C-RISK-02 | app.ts 라우터 등록 순서 오류 (notFoundHandler 이후) → 모든 comments endpoint 404 | 5 | 1 | Medium |
| C-RISK-03 | comment.service article 존재 검사 누락 → 미존재 article에 댓글 작성 가능 → FK 위반 500 | 4 | 2 | Medium |
| C-RISK-04 | DELETE articleId mismatch 검사 누락 → 다른 article의 댓글 삭제 가능 (데이터 무결성 위협) | 5 | 2 | Medium |
| C-RISK-05 | comment.repo의 findById가 article join 누락 → mismatch 검사 불가 | 3 | 2 | Low |
| C-RISK-06 | NotFoundError 에러 메시지 article vs comment 혼선 (사용자 혼동) | 2 | 3 | Low |
| C-RISK-07 | 통합 테스트 격리 실패 (beforeEach deleteMany 누락) → 테스트 flaky | 3 | 2 | Low |
| C-RISK-08 | 시크릿 노출 (DATABASE_URL 로그 leak) | 5 | 1 | Medium |
| C-RISK-09 | smoke 3 profile 회귀 (본 PR이 backend 부팅 영향 0이지만 라우터 등록 오류 시 startup crash) | 4 | 1 | Low |

High 등급 0 (가장 높은 등급은 Medium). mode=add + articles 패턴 답습 + schema 영향 0이라 회귀 위험 낮음.

## 2. 리스크 상세

### C-RISK-01: mergeParams 미설정 시 articleId 추출 실패

- **시나리오**: `Router({ mergeParams: true })` 옵션 누락 → `req.params.articleId`가 `undefined` → `parsePathId(undefined)` → VAL_PATH_ID_INVALID throw → 모든 endpoint 400 (실제로는 articleId 미확보로 service 호출 불가)
- **카테고리**: 회귀
- **완화**: routes/comments.ts에 `Router({ mergeParams: true })` 명시 + integration test AC-01 happy path가 자연 검출
- **검증**: integration test 7+ 케이스로 자동 검출 (AC-01 200 응답 = articleId 정상 추출 증거)

### C-RISK-02: app.ts 라우터 등록 순서 오류

- **시나리오**: `app.use(notFoundHandler)` 이후에 comments 라우터 등록 → 모든 `/api/articles/:id/comments` 요청이 notFoundHandler에서 가로채짐 → 404
- **카테고리**: 회귀
- **완화**: contract §3 + plan §1 commit 5에 등록 위치 명시 (articles 직후 / notFoundHandler 직전). articles 패턴 그대로 답습. integration test가 200 응답으로 자연 검출
- **검증**: integration test AC-01 (POST 201) 통과 = 라우터 등록 정상

### C-RISK-03: article 존재 검사 누락 → FK 위반 500

- **시나리오**: comment.service.create가 article 존재 검사 없이 바로 commentRepo.insertComment 호출 → Prisma가 FK 위반(articleId references Article.id) → P2003 throw → errorHandler 500
- **카테고리**: 회귀 + 사용자 경험
- **완화**: comment.service.create 진입 시 `await articleRepo.findById(articleId)` 후 null이면 NotFoundError throw. integration test AC-03b로 자동 검출
- **검증**: integration AC-03b: POST 미존재 article → 404 (500 아님 — 검사 정상 작동 증거)

### C-RISK-04: DELETE articleId mismatch 검사 누락

- **시나리오**: `DELETE /api/articles/1/comments/5`에서 commentId=5가 articleId=2의 댓글일 때, mismatch 검사 없이 바로 삭제 → 다른 article의 댓글이 의도치 않게 삭제됨 → 데이터 무결성 위협
- **카테고리**: 데이터 + 보안 (권한 우회 유사)
- **완화**: comment.service.remove에서 `commentRepo.findById(commentId)` 후 `comment.articleId !== articleId`면 NotFoundError throw. integration test AC-03c로 자동 검출
- **검증**: integration AC-03c: 다른 article의 commentId DELETE → 404 + DB 미삭제 확인

### C-RISK-05: comment.repo.findById가 article join 누락

- **시나리오**: findById가 articleId 컬럼 반환 안 함 → service에서 mismatch 검사 불가
- **카테고리**: 회귀
- **완화**: prisma.comment.findUnique는 기본적으로 모든 컬럼 반환 (select 명시 안 하면) — articleId 자동 포함. type-level로 보장됨
- **검증**: TypeScript typecheck로 자동 검출 (`comment.articleId` 접근 시 type 검증)

### C-RISK-06: NotFoundError 에러 메시지 혼선

- **시나리오**: article 미존재 시 "댓글을 찾을 수 없습니다" 또는 그 반대로 출력 → 사용자 혼동
- **카테고리**: UX
- **완화**: plan §5 결정 2 PREFIX 분리 + 09 §3 명시 메시지 (article 미존재 → "글을 찾을 수 없습니다", commentId 미존재/mismatch → "댓글을 찾을 수 없습니다"). 통합 test가 메시지 정확성 자동 검증
- **검증**: integration AC-03a/3b ("글을 찾을 수 없습니다") + AC-03c ("댓글을 찾을 수 없습니다") `expect(res.body).toEqual({ error: '...' })`

### C-RISK-07: 통합 테스트 격리 실패

- **시나리오**: beforeEach deleteMany 누락 또는 순서 오류 → 이전 테스트의 댓글 row가 남아 다음 테스트 expect에 영향 → flaky
- **카테고리**: 회귀
- **완화**: articles(#4) 답습 — `prisma.$transaction([articleTag·comment·article·tag deleteMany])` cascade-friendly 순서. vitest.integration.config.ts `singleFork: true` (#4 산출)
- **검증**: integration test 5회 연속 실행으로 안정성 확인 (manual)

### C-RISK-08: 시크릿 노출

- **시나리오**: DATABASE_URL이 console.error 또는 response에 leak → 보안 위반
- **카테고리**: 보안
- **완화**: 본 PR은 env·schema 미수정. requestLogger(#2)는 method + path + status만 출력. errorHandler(#2)는 message만 출력 (stack/env 미포함, dev profile만 stack 추가). 신규 코드에 process.env.DATABASE_URL 접근 0
- **검증**: code-review에서 grep으로 DATABASE_URL 접근 0건 자동 검출

### C-RISK-09: smoke 3 profile 회귀

- **시나리오**: 라우터 등록 오류 또는 import 순환으로 backend startup crash → smoke timeout 5초 + FAIL → CI/AI 게이트 차단
- **카테고리**: 운영
- **완화**: integration test가 buildApp(env)을 호출 → typecheck + integration PASS = startup 정상. smoke는 부수 검증
- **검증**: P10 ai-qa-report.md에 `pnpm smoke:3profiles` 결과 명시 (Sprint 1 #5 baseline 유지)

## 3. High 등급 단계적 롤아웃

High 등급 0 — 단계적 롤아웃 불필요. 본 PR 단일 머지로 처리.

대안 (검토만):
- 만약 mergeParams 또는 등록 순서 회귀 발생 시 → `git revert <merge>` → CI green 확인 후 재PR (rollback 절차 contract §5)

## 4. 데이터 영속성 변경

- **schema 변경**: 0 — Comment 모델은 #3 산출 그대로
- **migration**: 0 — `npx prisma migrate dev` 호출 불필요
- **dev.db / stg.db / prod.db**: 본 PR 영향 0. 기존 시드 그대로
- **신규 시드 데이터**: 0 — comments 시드는 통합 테스트가 beforeEach에서 생성 후 다음 테스트에서 deleteMany로 정리. seed.ts 변경 없음

## 5. 15-risk.md 갱신 항목

본 PR이 끝난 후 (P13 docs-update) 다음 1건을 `docs/planning/15-risk/15-risk.md` §1 후보로 추가:

- **RISK-16 (신규)**: 다중 nested router 마운트 패턴 시 mergeParams 누락 회귀 (mitigation: routes/<domain>.ts 신설 시 mergeParams 옵션 명시 + integration test 자동 검출)

또는 본 PR 범위에서 누락된 issue를 retro에서 처리. v0.2 단순 갱신 — 신규 RISK 추가 + 본 PR PR #N MERGED 흔적.
