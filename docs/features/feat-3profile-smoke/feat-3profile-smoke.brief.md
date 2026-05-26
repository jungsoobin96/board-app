---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-04]
  F-ID: [F-09]
  supersedes: null
---

# feat-3profile-smoke — Feature Brief

> Issue #5 · mode=add · P1 산출 (의도 응축, 1장).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P1 intention-brief) |

## 1. 한 줄 의도

dev/stg/prod 3 profile 모두 fresh checkout에서 동일 명령 1개(`pnpm smoke:3profiles`)로 부팅·서비스 응답 검증이 자동화되어, ADR-0037 v1.1 6번째 AI 게이트 축(3 profile boot smoke)을 매 PR에서 정식 충족한다.

## 2. 사용자 가치

- **개발자**: PR 생성 전 로컬에서 한 명령으로 3 profile 부팅 회귀 가능 → 매 PR Manual verification 첫 줄 증거 자동 산출
- **리뷰어**: 6축 AI 게이트 6번째 축이 N/A 사유 위임 없이 실 실행 결과로 PASS → PR body 검증 부담 감소
- **유지보수자**: fresh checkout 사용자(예: 신규 합류자)가 LOCAL.md §3만 따라가도 3 profile 부팅 성공 → 온보딩 시간 단축
- **운영**: profile별 `.env.example` 3종이 정본화 → 시크릿 누설 위험 감소(실 `.env.*`은 .gitignore, example만 커밋)

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| .env example | 단수 (`.env.example` 하나, profile 구분 없음) | 3종 (`.env.dev.example`·`.env.stg.example`·`.env.prod.example`) |
| smoke 스크립트 | 미존재 — 수동 `pnpm dev` 후 별 터미널 curl | `scripts/smoke.ts` (Node tsx 부팅 + 5초 polling + GET `/api/articles` 200 검증) |
| 3 profile 검증 | dev만 실 부팅 + stg/prod N/A 사유 위임 (#4 PR #32 baseline) | dev·stg·prod 모두 실 부팅 + 응답 200 PASS (Issue #5 정식 충족) |
| package.json scripts | `dev`, `build`, `test`, `test:integration` 등 | + `smoke:3profiles` 추가 (dotenv-cli로 profile별 부팅) |
| LOCAL.md §3 | 단일 `pnpm dev` 명령만 안내 | profile별 3종 부팅 명령 + smoke 1줄 명령 안내 |
| LOCAL.md §4 부팅 자산 표 | `.env.example` 1행 | `.env.{dev,stg,prod}.example` + `scripts/smoke.ts` + `pnpm smoke:3profiles` 행 추가 |
| 12-scaffolding §5 | dev 명령 위주 | profile별 빌드·실행 코드블록 3종 (양축 SoT, ADR-0041) |
| AI 게이트 6번째 축 | dev PASS + stg/prod N/A 사유 위임 (#4·PR #32까지 모든 PR) | dev·stg·prod 모두 실 PASS 결과 첨부 가능 (Issue #5 PR부터) |

## 4. 모드 자동 감지 결과

- **결정**: `mode=add` (ADR-0032 기본값 규칙 4)
- **시그널 trace**:
  - `type:bug` 라벨: ❌ → bug 부정 시그널 0
  - UI/design 키워드: ❌ → design 부정 시그널 0
  - 기존 동작 변경 키워드: ❌ → modify 부정 시그널 0
  - 부정 시그널 합계 = 0 → **자동 add 결정, 질문 금지**
- **chore 라벨 정합**: `type:chore` + `area:infra` 라벨이지만 신규 자산(.env.example 3종 + scripts/smoke.ts + package.json scripts 1개) 추가 시맨틱이 정확히 add. 기존 동작 변경(modify) 시그널 없음.
- **slug 정정**: Issue body 참조 slug는 `chore-3profile-smoke`였으나 manifest filename_pattern + ADR-0044 브랜치 prefix 정합을 위해 **`feat-3profile-smoke`** + 브랜치 `feat/3profile-smoke-issue-5`로 정정.

## 5. 영향 범위

- **신설 파일** (5건):
  - `backend/.env.dev.example` — dev profile 기본값 + dev.db 경로
  - `backend/.env.stg.example` — stg profile 기본값 + stg.db 경로 + LOG_LEVEL=info 등
  - `backend/.env.prod.example` — prod profile 기본값 + prod.db 경로 + LOG_LEVEL=warn 등 + NODE_ENV=production
  - `scripts/smoke.ts` — Node tsx 실행. dotenv-cli로 profile 로드 → `pnpm --filter @app/backend dev` 자식 프로세스 spawn → 최대 5초 polling(`http://localhost:3000/api/articles`) → 200 받으면 PASS+kill, timeout 시 FAIL+kill
  - (선택) `.github/workflows/smoke.yml` — CI smoke job (DoD 선택 항목, push/PR 트리거)
- **갱신 파일** (4건):
  - `package.json` (root 또는 backend) — `scripts.smoke:3profiles`: `tsx scripts/smoke.ts dev && tsx scripts/smoke.ts stg && tsx scripts/smoke.ts prod` 추가, `tsx`·`dotenv-cli` devDeps 확인/추가
  - `LOCAL.md` §3 — profile별 부팅 명령 3블록 + smoke 1줄 명령 + 트러블슈팅 노트
  - `LOCAL.md` §4 — 부팅 자산 표에 .env.*.example 3종 + scripts/smoke.ts + smoke:3profiles 행 추가
  - `docs/planning/12-scaffolding/typescript.md` §5 — profile별 빌드·실행 코드블록 동기 갱신 (LOCAL.md §3과 양축 SoT, ADR-0041)
- **제거/이동**: 기존 `backend/.env.example` 1건 — 사용자 환경 동기 위해 그대로 유지 + `.env.dev.example`로 *복제* (제거 시 fresh checkout 회귀 위험, plan에서 결정).
- **불변**: backend 코드 (src/), DB schema (prisma/), 기존 테스트, app.ts, healthz·articlesRouter 등.
- **R-ID/F-ID 매핑**: R-N-04(3 profile 부팅) + F-09(LOCAL.md 정본). 신규 R/F-ID 없음 → P13에서 13/02-catalog 갱신 부담 적음.

## 6. 비목표

- 실 stg/prod DB 연결 — example만, 실 시크릿은 .gitignore 유지 (CLAUDE.md 보안 §1·§2)
- POST/PUT/DELETE smoke — GET `/api/articles` 200 1건만 ready 신호 (5초 ready 검증 목적, 도메인 로직 검증은 #4 articles.integration.test.ts 책임)
- Docker / docker-compose — 학습 범위 외 (RFP §2.3)
- CI smoke job 신설 — DoD 선택 항목, 본 PR 비목표(별도 follow-up 이슈 권고 — GitHub Actions 0 runs 이슈와 함께)
- 별도 cli 도구화 — `scripts/smoke.ts`는 본 repo 내부 스크립트 only
- 멀티 OS smoke matrix — Windows 11 Pro 단일 환경 가정 (사용자 환경)
- 비밀번호 강도·secret rotation 정책 — out-of-scope (.env.example에는 placeholder만)

## 7. Open Questions

- O-05-01: `scripts/smoke.ts`를 root 위치 vs `backend/scripts/` 위치? → P3 contract에서 결정. root 위치 leaning (monorepo 전역 도구).
- O-05-02: 기존 `backend/.env.example`를 삭제할지 vs `.env.dev.example`와 공존할지? → P3 contract에서 결정. 공존 leaning (fresh checkout 회귀 차단).
- O-05-03: smoke timeout 5초 vs 10초? → Issue AC-1 명시 "5초 이내 ready" 그대로 채택. P4 plan에서 polling interval = 250ms × 20회로 구체화.
- O-05-04: CI smoke job(.github/workflows/smoke.yml) 본 PR에 포함 vs 별 follow-up? → DoD "선택" 표기 + GitHub Actions 0 runs 미해결 이슈 존재 → **별 follow-up 이슈** 권고. P3 contract §6 비목표에 명시.

