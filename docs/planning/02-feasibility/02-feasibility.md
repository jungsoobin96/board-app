---
doc_type: feasibility
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: A
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit Lite — Feasibility

> Gate A 입력. 01 Project Brief의 Open Question(스택·언어·ORM)을 사실 기반 leaning으로 응축. ≤ 1장.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-init Phase 1) |

## 1. 시장·환경 검토

- **참조 스펙**: RealWorld (https://github.com/gothinkster/realworld) — 35k+ stars, 다양한 언어/프레임워크 reference 구현체 보유. 학습 입문자의 풀스택 학습 표준으로 자리 잡았다.
- **본 프로젝트 차별점**: 원본 스펙의 약 60%(인증·팔로우·피드)를 제거한 *Lite* 버전. "끝까지 완주"가 핵심 KPI.
- **유사 학습 자산**: TodoMVC(범위 협소), JS30(프론트 위주). 풀스택 + DB + 페이지네이션을 한 번에 학습 가능한 자산은 부족.
- **수요**: 한국어 부트캠프·독학 학습자에게 한국어 주석 + README 친화 + 인증 없음의 조합은 희소.

## 2. 기술 타당성

- **Frontend**: React + Vite (leaning). 입문자에게 진입장벽 낮고 자료가 풍부. 대안 — 순수 HTML/JS는 학습 단순성↑이나 SPA 라우팅/상태 학습이 누락됨. React 18 + Vite 5는 빠른 HMR과 단순한 설정으로 입문자 친화.
- **Backend**: Node.js 20 LTS + Express 4. SQLite와의 조합이 가장 자료가 많고, REST API 패턴이 직관적.
- **DB**: SQLite 3 + Prisma ORM. 별도 설치 없이 파일 1개로 동작, Prisma schema는 학습용 시각화에 적합. 대안 — better-sqlite3 직사용은 마법성이 적지만 마이그레이션·시드를 별도 구현 필요.
- **언어**: TypeScript 권장. 입문자가 타입 안전에 노출되는 첫 경험을 제공하고, 자동 완성/리팩토링 도구 체인을 학습할 수 있음. JS-only 모드도 README에 fallback 가이드를 추가한다.
- **테스트**: Vitest(FE+BE 공통) + Supertest(API). E2E는 Playwright 후보(고려용, MVP 미적용 가능).
- **번들·빌드**: pnpm workspaces(monorepo) — frontend/backend 분리 폴더. multi-module 학습에도 도움.

## 3. 비용·리소스 추정

| 항목 | 추정 | 비고 |
|---|---|---|
| 인력 | 학습자 1명(개발) + 리뷰어 1명(코드 리뷰) | 본 RFP §9 일정 기준 |
| 일정 | 약 2주 (M1~M6) | RFP §9와 동일 |
| 인프라 비용 | 0원 | 로컬 SQLite + 로컬 dev 서버 |
| 외부 의존 | npm registry, Node.js 20 LTS, Git, GitHub | 모두 무료 |
| 학습 자료 비용 | 0원 | RealWorld 공식 docs + Prisma docs + React docs |

## 4. 기대 효과

- **학습 KPI 달성** — 풀스택 1주기 완주율 100% (참여자 기준), 골든 패스 콘솔 에러 0건.
- **재현성** — README만으로 새 환경에서 동작 (Project Brief KPI #1).
- **확장 가능성** — 세션 인증 추가(Phase 2) 시 코드 수정 면적 ≤ 20%.
- **부산물** — 한국어 주석된 풀스택 reference 코드베이스 (≥ 80% 핵심 모듈 커버리지).
- **부트캠프 교재화 가능성** — README + 코드 + ADR이 함께 묶이므로 강의 자료 전환 비용 낮음.

## 5. 검토된 대안

| 대안 | 장점 | 단점 | 채택 여부 |
|---|---|---|---|
| 순수 HTML + Vanilla JS + Express + SQLite | 진입장벽 최소, 학습 단순 | SPA 라우팅·상태 학습 누락, 모던 FE 생태계 노출 부족 | 미채택 (대안 보조 가이드만 README에 명시) |
| Next.js + Prisma (full-stack one framework) | 한 프레임워크로 끝, 학습 자산 풍부 | 본 RFP "DB ↔ API ↔ 화면 분리 학습" 의도와 어긋남 (서버 컴포넌트 마법) | 미채택 |
| **React + Vite + Express + Prisma + SQLite (leaning)** | 입문 자료·생태계 풍부, FE/BE 명확 분리, monorepo 패턴 학습 | Vite/Prisma 설정 step 1회 학습 비용 | **채택** |
| Spring Boot + JPA + H2 | 엔터프라이즈 패턴 학습 | RFP 권장 스택 아님, 한국어 학습자 풀이 협소(JS 대비) | 미채택 |
| Django + SQLite | 풀스택 일체형, 관리자 패널 보너스 | RFP 권장 스택 아님, 학습 곡선이 React+Express 대비 좁음 | 미채택 |

## 6. 추천

**React + Vite + Express + Prisma + SQLite (TypeScript)** 스택을 채택한다. 근거:
1. RFP §7 권장 스택과 일치하면서 TypeScript로 격상해 타입 안전 학습 가치 추가.
2. 본 Brief KPI(README 재현 100%, 골든 패스 콘솔 0건) 달성에 가장 자료가 풍부.
3. Phase 2(세션 인증) 확장 시 Express middleware 패턴이 가장 단순.
4. monorepo(pnpm workspaces)로 frontend/backend 분리 학습 추가 가치.
5. 리스크 — Vite/Prisma 설정 학습 비용은 README와 한국어 주석으로 완화.

다음 단계 — 03 User Scenarios에서 페르소나·플로우를 확정하고, 04 SRS에서 R-ID·테스트 시나리오를 카탈로그한다. 05 PRD에서 F-ID·MVP Cut을 확정한다. 본 leaning은 Gate C(`/flow-design`)에서 06 Architecture·07 HLD로 구체화된다.
