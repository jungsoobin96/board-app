---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: reviewer-agent@board-app.local
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-04]
  F-ID: [F-09]
  supersedes: null
---

# feat-3profile-smoke — Code Review

> Issue #5 . mode=add . P9 산출. reviewer-agent 독립 코드 리뷰 (Generator!=Evaluator).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | reviewer-agent | 초안 (P9 code-review, 8단계 정적 분석) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: reviewer-agent@board-app.local (Claude)
- **review_at**: 2026-05-26
- **note**: MAJOR 0건, MINOR 2건, INFO 3건. MINOR 항목은 모두 후속 이슈 파생으로 충분하며 본 PR 머지를 차단할 수준이 아님. contract 13항목 + plan 6 commit + acceptance AC-01~06 모두 코드에 정합.

## 1. 컨트랙트 충실도

contract.md section 2 Before/After 13항목 대비 코드 매핑:

| # | 항목 | 충족 | 근거 |
|---|---|---|---|
| 1 | `scripts/smoke.ts` 신설 | O | 172줄 신설 확인 (git diff --stat) |
| 2 | `backend/package.json` +3 scripts (`start:stg`, `start:prod`, `smoke`) | O | diff line +3 확인 |
| 3 | `package.json` (root) +4 scripts (`smoke:dev`, `smoke:stg`, `smoke:prod`, `smoke:3profiles`) | O | diff line +4 확인. contract는 `smoke:3profiles` 1줄 예시지만 실제로 per-profile 3줄 + 통합 1줄 = 4줄. contract 원본보다 더 세분화된 구현 (개선 방향) |
| 4 | root devDeps tsx 추가 | O/N | contract 예시에서 tsx devDeps 추가 언급 but 실제 diff에 devDependencies 변경 없음. 이미 backend devDeps에 tsx 존재 + root scripts에서 `pnpm --filter @app/backend exec` 경유 호출하므로 root devDeps 불필요. 실 동작 무방 |
| 5 | `.env.dev.example` 무변경 | O | diff 미포함 |
| 6 | `.env.stg.example` 무변경 | O | diff 미포함 |
| 7 | `.env.prod.example` 무변경 | O | diff 미포함 |
| 8 | LOCAL.md section 3.1/3.2/3.3 smoke 1줄씩 | O | diff 확인: 3곳에 `**smoke 검증**` bullet 추가 |
| 9 | LOCAL.md section 4 부팅 자산 표 +1행 | O | diff 확인: smoke 자동화 행 추가 |
| 10 | LOCAL.md 변경 이력 v0.3 | O | diff 확인 |
| 11 | 12-scaffolding section 5 smoke 명령 정합 갱신 | O | diff: 4행 prefigure -> 6행 실 동작 명령으로 교체 |
| 12 | 12-scaffolding section 7 부팅 자산 표 +1행 | O | diff 확인: smoke 자동화 행 추가 |
| 13 | 12-scaffolding 변경 이력 v0.2 | O | diff 확인 |

**결론: 13/13 충족. contract 4번(root devDeps tsx) 미추가는 실질적 개선 (불필요 의존 회피).**

## 2. 테스트 커버리지

- **단위 테스트 추가**: 0건 (Issue body 명시 "단위: N/A . 통합: smoke 자체가 통합 검증" 정합)
- **통합 테스트**: smoke 스크립트 자체가 통합 검증 (부팅 + HTTP polling + cleanup)
- **기존 테스트 회귀**: 본 PR은 runtime 코드 무변경이므로 기존 30+ 단위 + 11 통합 회귀 없음 (정적 검증)
- **plan section 1 commit DAG 7건 vs 실제 6 commit**: commit 7 (postinstall 비도입)은 plan에서 "(선택, 비도입)" 명시. 실제 6 commit 정합

**결론: 테스트 전략 정합. 단위 테스트 N/A 합리적 (smoke는 외부 프로세스 spawn + HTTP polling 특성상 단위 테스트 부적합, 자체가 통합 검증).**

## 3. 보안 / 시크릿

8개 항목 정적 grep 검증:

| # | 점검 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | `console.log(process.env` 패턴 smoke.ts 내 0건 | PASS | grep 결과: 0 matches |
| 2 | `DATABASE_URL` 직접 출력 0건 | PASS | grep 결과: 주석에만 1건 (line 17 "DATABASE_URL 등 시크릿 절대 출력 금지" -- 경고 문구) |
| 3 | `JWT_SECRET` 패턴 0건 | PASS | grep 결과: 0 matches |
| 4 | PR diff에 `.env.dev`/`.env.stg`/`.env.prod` 실파일 staged 0건 | PASS | git diff --name-only에 .env 실파일 없음 |
| 5 | .gitignore에 `.env.*` 등록 | PASS | .gitignore line 19: `.env.*` + line 20-21: `!.env.example` / `!.env.*.example` (example만 허용) |
| 6 | LOCAL.md 본문에 시크릿 placeholder 0건 | PASS | 실값 없음, `file:./prisma/dev.db` 등 경로만 |
| 7 | 12-scaffolding 본문에 시크릿 0건 | PASS | section 6 환경변수 표에 placeholder만 |
| 8 | smoke.ts 출력 화이트리스트 준수 | PASS | console.log/error 6건 모두 profile/port/ms/status만 출력 (F-RISK-07 정합) |

**결론: 보안 위반 0건.**

## 4. 가독성 / 단순성

**코드 품질 (scripts/smoke.ts, 172줄)**:

| 관점 | 평가 | 상세 |
|---|---|---|
| 구조 | 양호 | 단일 파일, 5 함수 (fail/ensurePortFree/spawnBackend/pollReady/killChild) + main. 각 함수 20줄 이내. 역할 분리 명확 |
| cleanup handler | 양호 | SIGTERM -> 1초 SIGKILL fallback (killChild). SIGINT handler 등록 (line 149-151). try/catch/finally 패턴으로 fail path에도 cleanup 보장 |
| PORT 사전 검사 | 양호 | ensurePortFree (line 51-66) -- net.createServer 시도 후 EADDRINUSE 감지. 정확한 구현 |
| 화이트리스트 출력 | 양호 | 6개 console 출력 모두 profile/port/ms/status만. 시크릿 노출 경로 없음 |
| timeout 핸들링 | 양호 | SMOKE_TIMEOUT_MS env configurable (default 5000). warmup 500ms + polling deadline 기반 |
| 에러 메시지 | 양호 | fail() 함수가 profile 이름 + 실패 사유 + child stderr 마지막 5줄 출력. 진단 충분 |
| Windows 호환 | 양호 | `shell: process.platform === "win32"` (line 78). Windows에서 pnpm 호출 시 shell 필요 |
| dotenv-cli 위임 단순화 | 양호 | smoke.ts 내부에서 dotenv 직접 로드하지 않고 root scripts에서 `dotenv -e ../.env.<p> --` 위임. 관심사 분리 정합 |
| `import.meta.dirname` | 주의 | Node 20.11+ 지원. tsx 런타임에서는 polyfill. engines `>=20.0.0`과 미세 불일치이나 tsx 경유 실행이므로 실질 문제 없음 (INFO) |

**MINOR 발견: `pollReady` 함수에서 `res.status === 200` 검사만 수행. 응답 body를 소비(consume)하지 않아 keep-alive 연결이 누적될 가능성 미세하게 있음. `res.body?.cancel()` 또는 `await res.text()` 호출 권고. 단, 5초 내 최대 20회 polling이므로 실질 위험 낮음.**

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| MINOR-01: `pollReady`에서 fetch 응답 body 미소비 -- keep-alive 연결 누적 가능성 | False | False | True | A. Derived -- 후속 개선 이슈 후보. 실질 위험 낮음 (20회 max) |
| MINOR-02: stg/prod smoke 실행 시 사전 `pnpm -r build` 미수행 안내 부재 -- smoke.ts 주석/로그에 빌드 전제 조건 미명시 | False | False | True | A. Derived -- LOCAL.md section 3.2/3.3에 build 명령이 명시되어 있어 사용자 혼란 제한적. smoke.ts 주석에 1줄 보강 권고 |
| INFO-01: `import.meta.dirname` Node 20.0~20.10 미지원 -- tsx 경유 실행이므로 실질 무방 | False | False | True | A. Derived -- engines 필드 `>=20.11.0` 정정 또는 `fileURLToPath(import.meta.url)` fallback 후보 |
| INFO-02: contract section 2 항목 4 (root devDeps tsx 추가) 미반영 -- root scripts가 `pnpm --filter @app/backend exec` 경유하므로 불필요 | N/A | False | N/A | 코드가 contract보다 개선됨. contract 원본과 차이 있으나 유익한 방향 |
| INFO-03: CI smoke job (.github/workflows/smoke.yml) 미포함 -- contract section 6 비목표 명시 정합 | N/A | False | N/A | Found-1 (risk.md)과 동일. 파생 이슈 등록 필요 |

### A. Derived (3축 O -- 별 follow-up 이슈 등록 후보)

1. **MINOR-01**: pollReady fetch 응답 body 소비 (res.body?.cancel()) -- 안정성 소폭 개선
2. **MINOR-02**: smoke.ts 주석에 stg/prod 빌드 전제 조건 1줄 추가 -- 사용자 진단 편의
3. **INFO-01**: engines 필드 또는 import.meta.dirname fallback -- 엄격 호환성
4. **INFO-03**: CI smoke job 신설 -- ADR-0047 N/A 해소

### B. 같은 PR 보정 필요

해당 없음 -- MINOR 2건 모두 blocks_merge=False, 본 PR 머지를 차단하지 않음.

### C. Bug

해당 없음.

## 6. NEEDS-WORK 항목

없음. verdict=PASS.

---

### 검토 항목별 OX 요약

| 검토 축 | 결과 | 비고 |
|---|---|---|
| contract Before/After 13항목 정합 | O | 13/13 충족 (항목 4는 유익 개선) |
| plan commit DAG 6건 매핑 | O | 7건 중 6건 실 commit (commit 7 비도입 = plan 결정) |
| acceptance AC-01~06 코드 검증 가능 | O | AC-01 smoke:3profiles, AC-02 LOCAL.md section 3, AC-03 fail-fast &&, AC-04 killChild, AC-05 회귀 0, AC-06 양축 동기 |
| 보안 grep 검증 (F-RISK-07/09) | O | 시크릿 출력 0건, .env 실파일 staged 0건, .gitignore 정합 |
| 코드 품질 (cleanup/PORT/whitelist/timeout) | O | 5 함수 역할 분리, SIGTERM+SIGKILL, PORT 사전 검사, 화이트리스트 출력 |
| scope creep 0건 | O | 변경 11파일 모두 Issue #5 범위 내 |
| 회귀 위험 (backward compat) | O | 기존 start/dev/dev:stg scripts 무변경 |
| 문서 정합 (LOCAL.md + 12-scaffolding 양축 SoT) | O | v0.3 + v0.2 변경 이력, section 3/4/5/7 동기 |
| frontmatter 7필드 6파일 | O | validate-doc.sh 6/6 OK |
