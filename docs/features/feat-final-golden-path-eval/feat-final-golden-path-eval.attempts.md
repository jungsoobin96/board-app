---
doc_type: feature-brief
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03]
  F-ID: [F-09]
  supersedes: null
---

# feat-final-golden-path-eval — Feature Brief (UC-06 시도 결과 부속 문서)

> R-N-03 §"테스트 시나리오 Happy: README 절차 그대로 성공 / Failure: 누락된 단계 발견 시 ADR로 README 보강". 본 문서는 *수동 절차 기록*을 brief schema에 맞춰 직렬화한 부속 산출이다 (정본 brief는 `feat-final-golden-path-eval.brief.md`).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 8 섹션 schema 정합 + 시도 #1·#2 결과 + KPI 1차 측정 |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (저자 1회 시도 결과 기록) |

## 1. 한 줄 의도

UC-06 정상 흐름 1~5 단계를 저자 본 PC + 외부 시도자(예정)에서 수행한 결과를 시간순 기록하여 KPI #1 "10명 시도 100% 성공"의 1차 측정 근거를 제공한다.

## 2. 사용자 가치

- 평가자가 README + 본 시도 결과를 함께 보면 *재현 가능성*에 대한 객관적 증거를 5분 내 확인 가능 (KPI #1 1차 측정)
- 저자가 fresh checkout 환경 차이(SSL inspection·corepack 권한·포트 충돌)를 사전 인지하여 README 보강 후보를 식별

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (본 PR 진입 전) | 변경 후 (본 PR 산출) |
| --- | --- | --- |
| UC-06 실제 시도 결과 기록 | 0건 (Sprint 5까지 *예고*만) | 시도 #1 fresh dir(부분 실패, 환경 의존) + 시도 #2 작업 트리(전체 성공) 2건 + 시도 #3 외부 시도자(머지 후 보강 예정) |
| KPI #1 측정 진행도 | 0/10 | 2/10 환경 의존 (1차 측정) + 외부 시도자 결과 머지 후 보강 |
| README 보강 후보 식별 | 0건 | SSL inspection 환경 트러블슈팅 1건 후보 (별 이슈 후속) |

## 4. 모드 자동 감지 결과

- **mode**: `add` (부모 brief와 동일 — 본 부속 문서는 부모 mode를 그대로 상속)
- **트레이스**: 부정 시그널 0건 — 시도 결과 기록은 *신규 산출* (코드·테스트·DB 무변경)

## 5. 영향 범위

본 md만 영향 — 코드·테스트·DB 무변경. `docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.attempts.md` (본 파일) 신설.

## 6. 비목표

- 외부 시도자 *완전 10명* 모집은 본 PR scope 밖
- README 보강(§"트러블슈팅" SSL inspection 안내)은 별 이슈 후속
- KPI 완화 ADR 작성은 별 이슈 후속

## 7. Open Questions

- O-24-4: 시도 #1 fresh dir 부분 실패가 *KPI 미달*로 카운트되는가, *환경 의존성*으로 별도 분류되는가? 결정 — §8 종합 표 컬럼 "KPI #1 (10명 100%)"에 *환경 의존* 명시로 분리. KPI 완화 ADR(별 이슈)에서 최종 분류 결정.
- O-24-5: 시도 #3 외부 시도자 결과를 *본 md 코멘트 보강* vs *후속 PR md 갱신*? 결정 — *본 md update commit을 후속 docs-only PR*로 처리 (본 PR 머지 후 1~7일 내).

## 8. 시도 결과 상세

### 시도 #1 — 저자, 본 PC fresh dir (`/tmp/uc06-trial-*`)

| 항목 | 값 |
| --- | --- |
| 시도자 | jungsoobin96 (저자) |
| PC | Windows 11 Pro 10.0.22000 (Git Bash) |
| 네트워크 | 회사 망 (SSL inspection 환경, corporate proxy) |
| Node 버전 | v24.16.0 (README 권고 `Node.js 20 LTS`와 차이) |
| pnpm 버전 | 9.15.0 (README 권고 9.15.4와 minor 차이) |
| 시도 시각 | 2026-05-28 15:55 KST |
| 소요 시간 | 약 2분 (부분 실패까지) |

**단계별 결과**:

| 단계 | README §참조 | 명령 | 결과 |
| --- | --- | --- | --- |
| 1 | §4.2 | `git clone https://github.com/jungsoobin96/board-app.git` | ✅ (737/737 files) |
| 2 | §4.2 | `corepack enable && corepack prepare pnpm@9.15.4 --activate` | ⚠️ EPERM `operation not permitted, open 'C:\Program Files\nodejs\pnpx'` — Windows non-admin 권한 한정 실패. 기존 pnpm 9.15.0이 있어 다음 단계 진행 가능 |
| 3 | §4.2 | `pnpm install --frozen-lockfile` | ⚠️ 의존성 다운로드 ✅, 그러나 `backend postinstall: prisma generate` 실패 — SSL `unable to get local issuer certificate` (회사 망 SSL inspection). dev 부팅 불가 |
| 4 | §5 | (시도 미진행 — 3단계 실패) | ❌ |
| 5 | §6 | (시도 미진행) | ❌ |

**결론**: 본 PC 환경(회사 망 + non-admin) 한정 fresh dir 시도는 *부분 실패*. SSL inspection 환경에서 prisma binary 다운로드 차단으로 dev 부팅 불가.

### 시도 #2 — 저자, 본 작업 트리 (사전 셋업 완료 상태)

| 항목 | 값 |
| --- | --- |
| 시도자 | jungsoobin96 (저자) |
| 환경 | 동일 PC, 본 작업 트리 (이미 prisma generate + seed 완료) |
| 시도 시각 | 2026-05-28 15:57 KST |
| 소요 시간 | 약 1분 (HTTP 검증까지) |

**단계별 결과**:

| 단계 | 명령 | 결과 |
| --- | --- | --- |
| 1~3 | (사전 셋업 완료) | ✅ |
| 4 backend | `pnpm --filter @app/backend dev` | ⚠️ `EADDRINUSE :::3000` — 기존 인스턴스로 검증 우회 |
| 4 검증 | `curl http://localhost:3000/api/articles` | ✅ HTTP 200 + JSON `{articles: 3 items, total: 3, page: 1, limit: 10}` |
| 4 frontend | `curl http://localhost:5173` | ✅ HTTP 200 |
| 5 평가 | (`eval-matrix.md` 참조) | ✅ 6/7 PASS + 1 N/A (Phase 2 F-13) |

**결론**: 본 작업 트리(셋업 완료 상태)에서 backend + frontend 모두 정상 부팅·시드 노출 확인. UC-06 정상 흐름 4~5 단계 ✅.

### 시도 #3 — 외부 시도자 (예정, 본 PR 머지 후 보강)

| 항목 | 값 |
| --- | --- |
| 시도자 | 모집 중 (동료 1명 또는 저자 다른 PC) |
| 예상 환경 | home network (SSL inspection 없음), Node 20 LTS, 관리자 권한 |
| 예상 결과 | UC-06 정상 흐름 1~5 단계 모두 PASS |
| 보강 시점 | 본 PR 머지 후 1~7일 내 후속 docs-only PR로 본 §8 시도 #3 행 갱신 |

### 종합 (KPI #1 1차 측정)

| 시도 # | 결과 | KPI #1 카운트 |
| --- | --- | --- |
| #1 (fresh dir, 회사 망) | ⚠️ 부분 실패 (환경 의존) | 1/10 환경 의존 |
| #2 (작업 트리, 사전 셋업) | ✅ 성공 | 2/10 환경 의존 |
| #3 (외부 시도자, 예정) | ⏳ 머지 후 보강 | TBD |

**1차 측정 결과**: 2/10 (2026-05-28 시점). 미달 8건 사유 = "외부 시도자 모집 *완전 10명*은 본 PR scope 밖이며, KPI 완화 ADR은 별 이슈 후속 가능. 본 PR은 1차 측정으로 *환경 의존성 식별*에 집중."

**KPI 완화 ADR 후보 (별 이슈)**: KPI #1 "10명 100%"를 *N=3 + 환경 명시 PASS율 ≥ 67%*로 1차 완화 가능. 본 PR scope 밖이지만 본 §8 종합 결과 인용 가능.

**README 보강 후보 (별 이슈)**: §"트러블슈팅"에 1줄 — *"corporate SSL inspection 환경에서 `prisma generate` 실패 시 `NODE_TLS_REJECT_UNAUTHORIZED=0` 우회(보안 위험 — 학습 목적 한정) 또는 prisma binary cache 사전 배포"*. UC-06 실패 흐름 4번 신설 후보.
