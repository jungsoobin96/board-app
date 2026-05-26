---
doc_type: feature-risk
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

# feat-3profile-smoke — Feature Risk

> Issue #5 · mode=add · P7 산출 (변경 리스크). P4 plan §5 회귀 시나리오 6건 + 7 카테고리 점검.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P7 risk-check) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | smoke 5초 timeout이 느린 머신(WSL2·CI runner)에서 false-negative | 3 (CI 빨강·사용자 혼란) | 2 (warmup 500ms + Express+Prisma init < 2초 정합) | Medium |
| F-RISK-02 | chain `&&` fail-fast가 stg-only 일시 결함 시 prod 검증 skip | 2 (의도된 동작, 우회 가능) | 3 (네트워크/디스크 일시 결함) | Medium |
| F-RISK-03 | child process(SIGTERM) 미수신 → zombie backend 잔존 → 후속 EADDRINUSE | 4 (개발 흐름 중단·수동 kill 필요) | 2 (SIGKILL fallback 1초 후 명시) | Medium |
| F-RISK-04 | stg/prod DB 파일(stg.db·prod.db) 미존재 시 prisma error → smoke FAIL | 3 (사용자 진단 어려움) | 3 (LOCAL.md §2 stg/prod prisma push 안내 누락 위험) | Medium |
| F-RISK-05 | smoke 실행 시 PORT(3000/3001/3002) 점유 상태에서 EADDRINUSE → false-positive | 3 (사용자 혼란) | 2 (smoke.ts 사전 PORT 점유 검사 명시) | Medium |
| F-RISK-06 | backend dev(tsx watch)와 start:prod(node) 부팅 시간 편차 → 5초 timeout 분기 | 2 (false-negative만) | 2 (Express+Prisma init < 2초) | Low |
| F-RISK-07 | smoke 콘솔 로그에 DATABASE_URL 등 시크릿 의도치 않게 노출 | 5 (CLAUDE.md 보안 §2 위배) | 1 (smoke.ts에서 명시적 process.env 출력 0건 + child stderr만 pipe) | Medium |
| F-RISK-08 | 기존 `pnpm --filter @app/backend start` 호출자 회귀 (alias 처리 누락) | 3 (Sprint 2+ 잠재 사용자) | 1 (contract §4 backward compat 명시, 기존 `start` 유지) | Low |
| F-RISK-09 | `.env.dev`·`.env.stg`·`.env.prod` 실파일이 의도치 않게 commit 됨 | 5 (CLAUDE.md 보안 §1 절대 규칙 위배) | 1 (.gitignore 기존 검증 + settings.json PreToolUse 훅 자동 차단) | Medium |

## 2. 리스크 상세

### F-RISK-01 — 5초 timeout false-negative (느린 머신)

- **시나리오**: WSL2 / CI runner / 저사양 머신에서 Express + Prisma client init이 5초 초과. smoke가 timeout으로 FAIL 처리하지만 backend 자체는 정상 부팅 중.
- **영향**: AI 게이트 6번째 축 false-positive BLOCK. 사용자 PR 머지 지연.
- **완화책**:
  - smoke.ts에 warmup 500ms (첫 polling 전 backend init 여유) + polling 250ms × 20회 = 총 5.5초
  - timeout configurable env: `SMOKE_TIMEOUT_MS=5000` (default), 사용자 환경별 override 가능
  - child stderr 첫 5줄 첨부 (Express listening 신호 vs Prisma error 구분)
  - README/LOCAL.md §5.x troubleshooting에 timeout 시 SMOKE_TIMEOUT_MS=10000 우회 안내
- **모니터링**: P14 휴먼 게이트 시 부팅 시간 (ms) 로그 첨부. 평균 1500ms 미만 정합 확인.

### F-RISK-02 — fail-fast cascading skip

- **시나리오**: dev PASS → stg 일시 결함(예: stg.db 권한·디스크 일시 lock) FAIL → prod 검증 미실행. 사용자가 prod도 정상인지 모름.
- **영향**: 의도된 동작 (false-positive cascading 회피) but 사용자 디버깅 시간 일부 증가.
- **완화책**:
  - plan §5 결정 10 명시 (fail-fast 의도 결정)
  - 사용자 우회: 개별 `tsx scripts/smoke.ts <profile>` 직호출 가능 (README/LOCAL.md 안내)
  - smoke.ts 로그에 "stopped at <profile> — re-run individual profile with `tsx scripts/smoke.ts <profile>`" 명시
- **모니터링**: P14 휴먼 게이트 시 의도된 fail-fast 동작 확인 (AC-03 충족).

### F-RISK-03 — Zombie backend 잔존

- **시나리오**: smoke.ts가 child process kill 못 시키고 exit. PORT 3000/3001/3002 점유 잔존 → 다음 smoke 또는 dev 실행 시 EADDRINUSE.
- **영향**: 개발 흐름 중단. 수동 `lsof -i :3000 | kill` 필요. Windows에서 더 까다로움.
- **완화책**:
  - smoke.ts: spawn된 child에 SIGTERM → 1초 후 살아있으면 SIGKILL fallback (Node `process.kill(pid, 'SIGKILL')`)
  - process.on('SIGINT', cleanup) + process.on('exit', cleanup) 양쪽 등록 (사용자 Ctrl+C 대비)
  - try/finally로 fail path에도 cleanup 보장
- **모니터링**: AC-04 (smoke 후 PORT 점유 0건) 매 smoke 실행 시 자동 검증 (smoke.ts 자체가 cleanup 검사).

### F-RISK-04 — stg/prod DB 미존재 prisma error

- **시나리오**: fresh checkout 사용자가 `cp .env.stg.example .env.stg` 후 `pnpm smoke:3profiles` 실행. dev.db는 prisma:push로 생성됐지만 stg.db·prod.db는 미존재 → backend 부팅 시 prisma `P1003` (DB not found) error.
- **영향**: 사용자 진단 어려움. "왜 stg부터 실패하지?" 혼란.
- **완화책**:
  - LOCAL.md §2 "5)" 단계에 stg/prod DB 초기화 1줄 추가:
    ```
    # (선택) stg/prod profile도 smoke로 검증할 경우 DB schema 적용
    dotenv -e .env.stg  -- pnpm --filter @app/backend prisma db push
    dotenv -e .env.prod -- pnpm --filter @app/backend prisma db push
    ```
  - smoke.ts 실패 시 stderr 첫 5줄 첨부 → "Environment variable not found" 또는 "Unable to open database" 메시지 노출 → 사용자가 LOCAL.md §2 5) 참조 가능
  - LOCAL.md §5.3 (DB 연결 실패) 트러블슈팅 절에 stg/prod DB push 안내 보강
- **모니터링**: P14 휴먼 게이트 시 fresh checkout 시뮬레이션으로 검증 (AC-02).

### F-RISK-05 — PORT 점유 EADDRINUSE

- **시나리오**: 사용자가 다른 터미널에서 `pnpm --filter @app/backend dev` 실행 중. `pnpm smoke:3profiles` 호출 → PORT 3000 점유 → smoke가 spawn한 child도 부팅 실패.
- **영향**: smoke false-FAIL. 사용자가 점유 프로세스 찾아야 함.
- **완화책**:
  - smoke.ts spawn 전 PORT 점유 사전 검사 — `net.createServer().listen(PORT)` 시도 → EADDRINUSE 시 명확한 에러: `[smoke] PORT ${PORT} already in use — kill existing process and retry`
  - child stderr "EADDRINUSE" 키워드 감지 → 동일 메시지 첨부
  - LOCAL.md §5.1 (포트 충돌) 트러블슈팅 절 기존 안내 그대로 활용
- **모니터링**: P10 AI 게이트 시 사전 PORT 검사 PASS 확인.

### F-RISK-06 — 부팅 시간 편차

- **시나리오**: backend dev (tsx watch)는 첫 부팅 800~1200ms, start:prod (node dist/server.js)는 200~400ms로 더 빠름. 5초 timeout 분기는 충분하지만 측정 일관성 관점에서 노이즈.
- **영향**: false-FAIL 가능성 매우 낮음 (모두 < 2초). 단 P14 사용자 검증 시 dev가 stg/prod보다 느리게 보임.
- **완화책**:
  - smoke.ts에 부팅 시간 (ms) 로그 명시 — 사용자가 편차 인지
  - dev profile 시 tsx watch 사용 (hot reload 유지) — 단발 부팅이라 watch overhead 적음
  - 추가 완화 불필요 (등급 Low)
- **모니터링**: 평균 1500ms 미만 정합 PR body 첨부.

### F-RISK-07 — 시크릿 노출 (CLAUDE.md 보안 §2 위배 위험)

- **시나리오**: smoke.ts가 디버깅용으로 `console.log(process.env)` 또는 `console.log(\`DATABASE_URL=${process.env.DATABASE_URL}\`)` 같은 출력 추가. PR diff에 시크릿 값 leak.
- **영향**: CLAUDE.md 보안 §1·§2 절대 규칙 위배. 잠재 데이터 유출.
- **완화책**:
  - smoke.ts 출력 화이트리스트: profile 이름 + PORT + ready 시간 (ms) + HTTP status code만 (DATABASE_URL·기타 env 값 절대 출력 금지)
  - child stderr/stdout pipe는 raw 전달이지만 backend가 정상이라면 시크릿 출력 자체 안 함 (Express log = method/path/status, Prisma log = query만 — `.env.{stg,prod}` LOG_LEVEL=info/warn으로 query log 억제)
  - P9 code-review reviewer agent가 smoke.ts 본문 grep `console.log(process.env\|DATABASE_URL\|JWT_SECRET)` 검증
  - settings.json PreToolUse 훅이 .env* 파일 직접 Write/Edit 차단 (기존 가드)
- **모니터링**: P9 code-review 시 명시적 grep. P10 git diff에서 시크릿 패턴 0건 확인.

### F-RISK-08 — 기존 `start` script 회귀

- **시나리오**: Sprint 2+ 작업자가 `pnpm --filter @app/backend start`를 호출하는데 본 PR이 `start`를 `start:prod`로 rename하면 호환성 깨짐.
- **영향**: 잠재 회귀.
- **완화책**:
  - contract §4 명시: 기존 `start` 그대로 유지 (alias) + 신규 `start:prod` 추가 (이중화). 단순 추가 only.
  - LOCAL.md §3.3는 explicit `start:prod` 안내로 변경 (사용자 가독성)
  - P9 code-review에서 backend/package.json diff 확인
- **모니터링**: P10 PR diff에서 backend/package.json scripts.start 행 변경 0 확인.

### F-RISK-09 — `.env.*` 실파일 commit (보안 §1 절대 규칙)

- **시나리오**: 사용자가 `.env.dev`·`.env.stg`·`.env.prod` 실파일 생성 후 `git add .` 같은 wildcard로 의도치 않게 commit.
- **영향**: CLAUDE.md 보안 §1 절대 규칙 위배. (MVP는 시크릿 없지만 운영 환경에서 치명적)
- **완화책**:
  - .gitignore에 `.env`·`.env.dev`·`.env.stg`·`.env.prod` 기존 등록 확인 (commit 차단)
  - settings.json PreToolUse 훅이 `.env*` Write/Edit 자동 차단 (LLM 우회 0)
  - P10 git diff 검증 — `.env.{dev,stg,prod}` 파일이 staged 되어 있으면 PR 생성 BLOCK
  - P9 code-review reviewer agent가 PR diff 파일 목록에서 `.env\.(dev|stg|prod)$` 패턴 0건 검증
- **모니터링**: 매 commit 전 `git status` + .gitignore 검증. P9 reviewer agent 명시.

## 3. High 등급 단계적 롤아웃

해당 없음 — 본 PR은 Medium/Low 등급만 (영향×가능성 최대 = 5×1=5 또는 3×3=9). High 등급(영향 4+ × 가능성 4+) 부재.

본 PR 머지 전략:
- 사용자 squash merge (#26·#28·#29·#30·#31·#32과 동일 패턴)
- 머지 후 Sprint 1 milestone 진행률 5/5 표시 (#1·#2·#3·#4·#5 완료) → Sprint 2 진입 가능
- 본 PR 머지 후 매 PR이 `pnpm smoke:3profiles` 결과를 Manual verification 1줄로 첨부 가능 — ADR-0037 v1.1 6번째 축 N/A 위임 0건 baseline

## 4. 데이터 영속성 변경

- **DB schema 변경**: 없음 — 본 PR은 부팅 자산만. #3 schema 그대로.
- **데이터 마이그레이션 스크립트**: N/A.
- **revert 시 데이터 보존**: 본 PR revert 시 dev.db·stg.db·prod.db 완전 잔존 (smoke는 GET read-only). scripts/smoke.ts 삭제 + package.json scripts diff 원복만.
- **stg/prod DB 신설**: smoke가 stg.db·prod.db 파일 자동 생성하지 않음 (사용자가 LOCAL.md §2 5) "선택" 단계에서 명시적 prisma db push 필요). F-RISK-04 완화 참조.
- **백업 권고**: dev — 불필요. stg/prod — 사용자 자체 백업 책임 (MVP는 학습용).

## 5. 15-risk.md 갱신 항목

- F-RISK-01·02·03·04·05·07·09 (7건) — 15-risk.md "Backend Infra" 항목에 fan-in 등록 (P13 docs-update에서 처리). F-RISK-06·08은 Low/완화 충분으로 fan-in 생략 (요약만 언급).
- 본 PR이 R-N-04 (3 profile 부팅 검증) 정식 충족 완료 → 15-risk.md "R-N-04 dev only PASS + stg/prod N/A 위임" 행을 "Sprint 1 #5 PR #N으로 3 profile 실 PASS 정식 충족"으로 갱신.
- smoke 패턴 정착 — Sprint 2+ 모든 PR이 `pnpm smoke:3profiles` 결과를 Manual verification 1줄로 첨부 가능 → 15-risk.md "기술 패턴" 항목에 등록.

## 발견 사항 (Found Issues) — 파생 이슈 후보

### A. Derived (3축 OX 모두 ✅ — 별 follow-up 이슈 등록 후보)

#### Found-1: CI smoke job (.github/workflows/smoke.yml) 신설
- [x] Q1. in_scope == False (DoD-6 "선택" + contract §6 비목표 명시)
- [x] Q2. blocks_parent_merge == False (본 PR 머지에 CI smoke 필수 아님 — 로컬 smoke PASS만으로 6번째 축 충족)
- [x] Q3. same_area == False (.github/workflows/ 디렉토리, 본 PR scripts/ + package.json과 다른 영역)
- **3축 통과 → 파생 이슈 등록 후보**
- 권장 Command: `/flow-feature "feat(infra): GitHub Actions smoke 워크플로 신설 (act 호환 + PR 트리거 + 3 profile matrix)"`
- 근거: F-RISK-01 모니터링 (CI runner 측정) + ADR-0047 양축 검증 N/A 사유 영구 해소
- Origin 5필드 (ADR-0021 §2.4): Discovered-by=`/risk-check`, Parent-PR=`#5-PR`, Discovered-at=`2026-05-26`, Rationale=`DoD-6 "선택" + AI 게이트 ADR-0047 N/A 위임 영구 해소 필요`, Linked-RISK=`F-RISK-01`

#### Found-2: GitHub Actions 0 runs 진단 + 트리거 설정 수정
- [x] Q1. in_scope == False (#1~#5 모두 별도 관심)
- [x] Q2. blocks_parent_merge == False (본 PR과 무관)
- [x] Q3. same_area == False (.github/workflows/ + GitHub Settings)
- **3축 통과 → 파생 이슈 등록 후보** (이미 last_session.missing_inputs 메모로 인식됨, 정식 이슈화 필요)
- 권장 Command: `/flow-feature --mode=bug "bug(infra): GitHub Actions workflows 0 runs — 트리거 설정 점검 + sync-issue-labels.yml 동작 복구"`
- Origin: Discovered-by=`/context-loader 누적`, Parent-PR=`#5-PR`, Linked-RISK=`(none) — 운영 결함`

#### Found-3: smoke timeout configurable env 정식 옵션화 + CI runner 측정
- [ ] Q1. in_scope == False (본 PR `SMOKE_TIMEOUT_MS` env 기본값만 도입, 정식 cli option·문서화는 별)
- [x] Q2. blocks_parent_merge == False
- [x] Q3. same_area == False (CI/measurement 도구 영역)
- **Q1 미통과 (본 PR 내 일부 구현) → 같은 PR 보정으로 분류 (아래 §B 참조)**

### B. 같은 PR 보정 필요 (3축 OX 미통과 — 본 PR 추가 커밋으로 처리)

- **F-RISK-04 완화 — LOCAL.md §2 5) stg/prod DB push 안내 1줄 추가** (commit 4 LOCAL.md 갱신에 통합)
- **F-RISK-01 완화 — `SMOKE_TIMEOUT_MS` env 기본값 5000 + smoke.ts 본문에 env 읽기 1줄** (commit 1 smoke.ts 신설에 통합)
- **F-RISK-05 완화 — smoke.ts 사전 PORT 점유 검사 1 함수** (commit 1 smoke.ts 신설에 통합)
- **F-RISK-07 완화 — smoke.ts 출력 화이트리스트 (profile/PORT/ready time/HTTP status만)** (commit 1 smoke.ts 신설에 통합)

### C. Bug (별 이슈)

해당 없음 — 본 risk-check에서 발견된 결함 0건. (Found-2 GitHub Actions 0 runs는 운영 결함이지만 본 PR 무관 — A. Derived로 분류)

