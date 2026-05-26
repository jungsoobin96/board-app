---
doc_type: feature-acceptance
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-cascade-integration — Acceptance Criteria

> Issue #8 · mode=add · P6.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P6) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: cascade happy (글 삭제) — 기존 케이스 회귀 확인

- **Given**: 글 1 + 댓글 3 + Tag 2 + ArticleTag 2 시드 (#4 PR #32 기존 케이스).
- **When**: `prisma.article.delete({where:{id}})`.
- **Then**: Comment·ArticleTag articleId=id 행 0건. Tag 자체 2건 잔존.
- **측정 방법**: 자동 테스트 — 기존 `cascade.integration.test.ts` it 1번째 (회귀 확인).
- **R-ID**: R-F-07.

### AC-02: 트랜잭션 rollback — throw 주입

- **Given**: 빈 DB. `prisma.$transaction(async tx => { tx.article.create + tx.comment.createMany + tx.tag.createMany + tx.articleTag.createMany; throw new Error('intentional rollback') })`.
- **When**: 트랜잭션 실행 — throw 발생 → 자동 rollback.
- **Then**: try/catch 후 `prisma.article.count() === 0 && prisma.comment.count() === 0 && prisma.tag.count() === 0 && prisma.articleTag.count() === 0`. 모든 row 보존(=생성 안 됨).
- **측정 방법**: 자동 테스트 — `cascade.integration.test.ts` it 3번째 (본 PR 신설).
- **R-ID**: R-F-07.

### AC-03: 태그 삭제 → ArticleTag만 cascade (기존 케이스 회귀)

- **Given**: 글 1 + 댓글 1 + Tag 1 + ArticleTag 1.
- **When**: `prisma.tag.delete`.
- **Then**: ArticleTag 0건, Article·Comment 잔존.
- **측정 방법**: 자동 테스트 — 기존 `cascade.integration.test.ts` it 2번째.
- **R-ID**: R-F-07.

## 2. Definition of Done (D-06)

- [ ] **단위 테스트** — 본 PR 단위 변경 0. 기존 49+ baseline 회귀 0 확인.
- [ ] **통합 테스트** — `pnpm --filter @app/backend test:integration` 22 passed (기존 21 + 신규 1).
- [ ] **AI 게이트** 6축 PASS (ADR-0011·0037·0038):
  - 1축 Build — 사용자 위임
  - 2축 코드 리뷰 — P9 reviewer agent
  - 3축 Test Plan 4블록 — P10
  - 4축 시크릿 스캔 — 본 PR env·schema 0
  - 5축 브라우저 — N/A (ui_changed=false)
  - 6축 로컬 부팅 — 사용자 위임 (부팅 자산 0)
- [ ] **Test Plan 4블록** — PR body 4 subsection.
- [ ] **tested 라벨** — 자리 라벨 (status check 자동).
- [ ] **Approve** ≥ 1.
- [ ] **CI green** — workflow 미구축 N/A 사유 명시.

## 3. 비기능 인수

- **성능**: rollback 시나리오 < 100ms (단순 시드 + throw + count). vitest 기본 5s timeout 충분.
- **로깅**: 본 PR 로깅 변경 0.
- **보안**: 시크릿 노출 0 — DATABASE_URL 미접근 (Prisma client만).

## 4. 회귀 인수

- **R-1**: 기존 cascade.integration 2 케이스 PASS 유지.
- **R-2**: articles 9 + comments 7 + tags 3 = 19 통합 PASS 유지.
- **R-3**: 모든 단위 테스트 PASS 유지.
- **R-4**: typecheck + build PASS 유지.
- **R-5**: smoke 3 profile 회귀 0 (부팅 자산 미변경).
- **R-6**: 13/02-catalog R-F-07 §2 명시된 시나리오 *실 코드 정합* 완결 — 매트릭스 ✅로 완전 충족.
