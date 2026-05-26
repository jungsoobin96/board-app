---
doc_type: feature-contract
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

# feat-3profile-smoke — Change Contract

> Issue #5 · mode=add · P3 산출. 3 profile 부팅 smoke 자산 신설 + 양축 SoT(12-scaffolding §5 + LOCAL.md §3) 동기 갱신.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 본 contract가 건드리는 게이트 C 정본을 명시. 영향 없는 종류는 "(none)"으로 명시. 후속 `/implementation-planner`가 본 표를 파싱해 selective read.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-N-04 (3 profile 부팅) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-09 (LOCAL.md 정본) |
| 영향 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md | (none) — 본 PR은 부팅 자산만, 런타임 모듈 무변경 |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | GET /api/articles (ready 신호 only — readiness probe 용도, 구현 #4 PR #32 그대로 사용) |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md, docs/planning/12-scaffolding/typescript.md §5·§7 | 12 §5 빌드·실행 (smoke 3 profile 코드블록 정합 갱신), 12 §7 부팅 자산 표 (smoke 행 추가) |

## 1. 변경 의도

12-scaffolding §5 코드블록과 LOCAL.md §3에서 *prefigure*만 되어 있던 3 profile 부팅 smoke 자동화를 *실 동작*으로 보강한다. Issue #5 AC-1 ("`pnpm smoke:3profiles` 단일 명령으로 3 profile 모두 부팅 + GET `/api/articles` 200 + 5초 이내 ready") 충족. ADR-0037 v1.1 6번째 AI 게이트 축이 매 PR에서 *N/A 사유 위임 없이* 실 PASS 결과로 통과 가능.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `scripts/smoke.ts` (root) | 미존재 | 신설 — Node tsx 실행, 인자로 profile(dev/stg/prod) 받음. `pnpm --filter @app/backend start:<profile>` 또는 `dev` 자식 프로세스 spawn → 250ms × 20회 polling(`http://localhost:${PORT}/api/articles`) → 200 받으면 PASS+kill, timeout 시 FAIL+kill |
| `backend/package.json` scripts | `dev`·`dev:stg`·`start`·`test`·`test:integration`·`prisma:*`·`seed:dev` | + `start:stg`: `dotenv -e ../.env.stg -- node dist/server.js` (LOCAL.md §3 정합 보강)<br>+ `start:prod`: `dotenv -e ../.env.prod -- node dist/server.js` (현 `start` rename·이중화)<br>+ `smoke`: `dotenv -e ../.env.${NODE_ENV} -- tsx ../scripts/smoke.ts ${NODE_ENV}` (12-scaffolding §5 정합) |
| `package.json` (root) scripts | `build`·`dev`·`lint`·`lint:fix`·`typecheck`·`format`·`format:check` | + `smoke:3profiles`: `tsx scripts/smoke.ts dev && tsx scripts/smoke.ts stg && tsx scripts/smoke.ts prod` (Issue AC-1 단일 명령) |
| `package.json` (root) devDeps | `@eslint/js`·`@types/node`·`eslint`·`prettier`·`typescript`·`typescript-eslint` 외 | + `tsx@^4.19.0`·`dotenv-cli@^7.4.0`·`node-fetch@^3.3.0` 또는 `undici`(Node 20 내장 `fetch`로 대체 가능 → 외부 의존 0건 선호) |
| `.env.dev.example` | 존재 — `PORT=3000`·`NODE_ENV=dev`·`LOG_LEVEL=debug`·`DATABASE_URL=file:./backend/prisma/dev.db` | 무변경 (smoke가 본 example만 의존 — 변수 추가 없음) |
| `.env.stg.example` | 존재 — `PORT=3001`·`NODE_ENV=stg`·`LOG_LEVEL=info`·`DATABASE_URL=file:./backend/prisma/stg.db` | 무변경 |
| `.env.prod.example` | 존재 — `PORT=3002`·`NODE_ENV=prod`·`LOG_LEVEL=warn`·`DATABASE_URL=file:./backend/prisma/prod.db` | 무변경 |
| `LOCAL.md` §3.1·3.2·3.3 | `pnpm --filter @app/backend start:stg` 등 명령 prefigure (실 scripts 부재로 사용자 cp 시 실패 위험) | 보강 — backend scripts 추가됨 명시 + 각 profile 절 끝에 "smoke 검증: `pnpm smoke:3profiles` 단일 명령으로 3 profile 모두 자동 검증" 안내 1줄 추가 |
| `LOCAL.md` §4 부팅 자산 표 | 7행 (env 템플릿·schema 적용·migrations·lockfile·setup scripts·부팅 명령·컨테이너) | + 1행: `smoke 스크립트` — `scripts/smoke.ts` + `package.json scripts.smoke:3profiles` (변경 trigger: 부팅 검증 흐름 변경, 갱신 책임: 부팅 자산 이슈) |
| `LOCAL.md` 변경 이력 | v0.1·v0.2 | + v0.3: Issue #5 — 3 profile 부팅 smoke 자동화 도입 |
| `docs/planning/12-scaffolding/typescript.md` §5 | 242~245 line — `NODE_ENV=<p> pnpm --filter @app/backend smoke` 3 profile prefigure | 무변경 — 본 PR이 backend `smoke` script를 실 도입하면서 §5 명령이 정식 동작. (행 추가 없음, 기존 prefigure가 실 동작 baseline) |
| `docs/planning/12-scaffolding/typescript.md` §7 부팅 자산 표 | 7행 | + 1행: `smoke 자동화` — `scripts/smoke.ts` + root `scripts.smoke:3profiles` + backend `scripts.smoke` (변경 trigger: smoke 흐름 변경) |
| 단위 테스트 | 30+ passed (#4 PR #32 산출) | 무변경 — smoke 자체는 통합 검증 성격 (Issue body "단위: N/A · 통합: smoke 자체가 통합 검증") |
| 통합 테스트 | 11 passed (#3·#4 산출) | 무변경 — smoke는 별도 vitest 파일 아님. `pnpm smoke:3profiles`는 독립 명령 |
| `.github/workflows/smoke.yml` | 미존재 | 미존재 유지 — DoD "선택" + GitHub Actions 0 runs 미해결 follow-up 이슈로 분리 (§6 비목표) |
| 코드 라인 추가 | — | scripts/smoke.ts 약 +120 + package.json 3종 약 +10 + LOCAL.md 약 +20 + 12-scaffolding §7 약 +3 ≈ 약 +155 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `scripts/smoke.ts` (신설) | 신규 진입점 — CLI 인자로 profile 받음 | 본 PR 신설. 호출자: root `package.json scripts.smoke:3profiles` + backend `scripts.smoke` |
| `package.json` (root) `scripts.smoke:3profiles` | 사용자·CI/AI 게이트 6축 진입점 | 본 PR 1줄 추가 |
| `backend/package.json` `scripts.smoke` | 12-scaffolding §5 prefigure 정합 | 본 PR 1줄 추가 (단일 profile 호출용, root 명령이 이를 3회 호출하지는 않음 — 별 진입점) |
| `backend/package.json` `scripts.start:stg`·`start:prod` | LOCAL.md §3.2·3.3 prefigure 실 동작 | 본 PR 2줄 추가. `start` 기존 line(dotenv -e ../.env.prod -- node dist/server.js)은 `start:prod`로 rename, 별 `start`는 alias로 유지 또는 제거(plan 결정) |
| `LOCAL.md` §3 + §4 | 사용자 facing 정본 (ADR-0040) | smoke 명령 1줄 + 자산 표 1행 추가, 변경 이력 v0.3 추가 |
| `docs/planning/12-scaffolding/typescript.md` §7 | 자산 정본 SoT (양축 with LOCAL.md §4) | 자산 표 1행 추가 |
| AI 게이트 6번째 축 (`/qa-test --ai` 단계 6) | 본 PR부터 N/A 사유 위임 없이 실 PASS 가능 | gate 동작 변경 아님 — 본 PR scripts/smoke.ts 결과를 Manual verification 1줄로 첨부할 수 있게 됨 |
| Sprint 2+ 모든 PR | 본 PR 머지 후 매 PR에서 `pnpm smoke:3profiles` 결과를 PR body Manual verification에 1줄 첨부 가능 | 본 PR 머지 후 자연스럽게 전 PR에 적용 (별 마이그 불필요) |
| `backend/src/app.ts`·`server.ts` 등 런타임 코드 | 무변경 | 본 PR 영향 0 — smoke는 외부에서 부팅·HTTP 검증만 |
| `backend/prisma/schema.prisma` | 무변경 | 본 PR 영향 0 — DB schema 무변경 |

## 4. Backward Compatibility

- **Breaking**: no — 본 PR은 *신규 자산 추가*만. 기존 `dev`·`build`·`test`·`test:integration` 등 script 인터페이스 불변. 기존 `start` script는 `start:prod`로 *alias 추가* (기존 `start` 호출도 동작 유지 또는 명시적 사용 안내 — plan에서 결정).
- **마이그레이션**: no — 사용자는 `pnpm install` 후 `pnpm smoke:3profiles`만 추가 호출 가능 (cp `.env.{stg,prod}.example` 절차는 LOCAL.md §2 기존 절차 그대로).
- **버전 bump**: package.json `version: 0.0.0` 그대로. Sprint 1 종료 시점에 별도 결정.
- **profile별 `.env.example` 추가/제거**: 0건 — 3종 모두 이미 존재. 변수 추가도 0건.

## 5. Rollback 전략

- **Revert 가능**: yes — 본 PR을 git revert하면 `scripts/smoke.ts` 삭제 + `package.json` 3종 scripts diff 원복. `LOCAL.md` + `12-scaffolding §7` 표 diff 원복. 기존 `start:stg`·`start:prod`도 LOCAL.md §3 prefigure 상태로 회귀.
- **데이터 손상 위험**: 없음 — schema·migration·코드 영향 0. dev.db / stg.db / prod.db 파일 모두 영향 안 받음 (smoke가 GET 한 번만 호출, write 없음).
- **부분 롤백**: smoke만 disable 시 `package.json` `scripts.smoke:3profiles` 줄 주석 처리. 정식 롤백은 PR revert.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR 생성
  2. CI green 확인 (단위 30+ + 통합 11 회귀 확인)
  3. 머지 → 이슈 #5 재오픈 + 재작업 plan
- **부팅 자산 회귀 안전망**: 본 PR revert 후 LOCAL.md §3.2·3.3 명령은 다시 prefigure 상태 (실 scripts 부재) — Sprint 2+ PR이 stg/prod 부팅 실 검증 못 함. → revert 사유가 *smoke 로직 결함*이라면 별 후속 PR로 `start:stg`·`start:prod` 보강만 떼서 머지 권고.

## 6. 비목표

- 실 stg/prod DB 연결 — example만, 실 시크릿은 .gitignore 유지 (CLAUDE.md 보안 §1·§2)
- POST/PUT/DELETE smoke — GET `/api/articles` 200 1건만 ready 신호 (5초 ready 검증 목적, 도메인 로직 검증은 #4 articles.integration.test.ts 책임)
- Docker / docker-compose — 학습 범위 외 (RFP §2.3)
- **CI smoke job (`.github/workflows/smoke.yml`) 신설** — DoD "선택" + GitHub Actions 0 runs 미해결 이슈 존재 → **별 follow-up 이슈로 분리** (본 PR 비목표, P13 docs-update에서 follow-up 이슈 등록 권고)
- 멀티 OS smoke matrix — Windows 11 Pro 단일 환경 가정
- frontend smoke — Sprint 3 #10에서 frontend 도입 후 별 PR (현재 frontend는 placeholder, vite 미도입)
- POST seed before smoke — smoke 자체가 read-only GET 검증, seed 의존성 없음 (GET /api/articles는 빈 배열도 200 정상)
- timeout 길이 변경 (5초 → 10초 등) — Issue AC-1 명시 5초 그대로 채택
- smoke.ts cli framework 도입 (yargs 등) — 단일 인자(profile)만 받으므로 `process.argv[2]` 직접 사용
- secret rotation·강도 검증 — out-of-scope

