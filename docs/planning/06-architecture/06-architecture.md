---
doc_type: architecture
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12]
  supersedes: null
---

# Conduit Lite — System Architecture

> NEW_PROJECT Gate C. 02 Feasibility leaning과 04 SRS·05 PRD를 입력으로 시스템 컨텍스트·Stack·컨테이너 경계를 확정. ADR-0031에 따라 모듈 분해는 07 HLD로 위임.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4, ADR-0031 본체 축소) |

## Stack Decision

| 항목 | 결정 | 근거 |
|---|---|---|
| 언어 | TypeScript 5.x | 02 Feasibility leaning — 타입 안전 학습 가치 + 자동완성/리팩토링 도구 체인. JS-only는 README fallback 가이드로 보조. |
| 프레임워크 (FE) | React 18 + Vite 5 | 입문자 자료 풍부, 빠른 HMR, 단순 설정. SPA path 라우팅 (RFP §4). |
| 프레임워크 (BE) | Node.js 20 LTS + Express 4 | REST API 패턴 직관적, SQLite/Prisma 조합 자료 풍부. middleware 패턴이 Phase 2 세션 인증 확장에 적합. |
| ORM | Prisma 5.x | schema 시각화 + 마이그레이션 + 타입 자동 생성. 학습용으로 적합 (02 §2). |
| 데이터베이스 | SQLite 3 (file-based) | 별도 설치 없이 파일 1개로 동작 (RFP §6.2). dev/stg/prod profile별 파일 분리 또는 단일 환경 운영 N/A. |
| 패키지 매니저 | pnpm 9 (workspaces) | monorepo 학습 가치 + 빠른 install. frontend/backend 분리. |
| 빌드·번들 | Vite (FE) / tsc + tsx (BE) | FE는 Vite 표준. BE는 dev에 `tsx watch`, 빌드는 `tsc` 출력. |
| 테스트 | Vitest + Supertest + Playwright | 단위·통합·E2E 3축. Playwright는 E2E gstack QA 자동화 보완 후보. |
| Lint·Format | ESLint 9 (flat config) + Prettier 3 | 학습용 룰셋 단순화 — TypeScript-eslint recommended + Prettier 기본값. |
| 스타일링 | Tailwind CSS 3 + CSS Variables | ADR-0038 §3 디자인 토큰과 schema-level 매핑. 입문자 자료 풍부, JIT 빌드. 10 LLD §3 토큰을 `tailwind.config.ts` theme.extend에 매핑. |
| 라우팅 (FE) | React Router 6 (BrowserRouter) | RFP §4 — path 라우팅 강제. hash 라우팅 금지. |
| Runtime 외부 의존 | 없음 | RFP §2.3 — 인증·외부 API·이미지 업로드 모두 out-of-scope. |

## 1. 시스템 컨텍스트

```
                  ┌─────────────────────────────────┐
                  │       사용자 (3 페르소나)         │
                  │  · Hana — 학습자 (글 작성·삭제)   │
                  │  · Min  — 방문자 (탐색·댓글)      │
                  │  · Park — 평가자 (README 재현)    │
                  └────────────┬────────────────────┘
                               │ HTTPS (localhost dev)
                               ▼
                  ┌─────────────────────────────────┐
                  │     Conduit Lite (단일 시스템)    │
                  │                                  │
                  │  Frontend (React + Vite)         │
                  │       ↕ /api (JSON)             │
                  │  Backend (Express + Prisma)     │
                  │       ↕                          │
                  │  SQLite (파일)                   │
                  └─────────────────────────────────┘

외부 시스템: 없음 (RFP §2.3 out-of-scope, R-N-07)
```

- **시스템 경계**: 단일 호스트(localhost)에서 FE dev 서버(5173)와 BE dev 서버(3000)가 분리 포트로 동시 동작. 운영 시 reverse-proxy로 단일 origin 가정.
- **데이터 정본**: SQLite 파일. profile별 분리 — `prisma/dev.db`·`prisma/stg.db`·`prisma/prod.db` 또는 단일 환경 운영 시 1개 (ADR-0037 N/A 허용).
- **외부 통신**: 없음. 모든 호출은 동일 호스트 안에서 종료.
- **인증 경계**: MVP 미적용 (R-N-07). 모든 사용자가 동일 권한. README에 "공개 데모용, 운영 사용 금지" 명시.

## 2. 컨테이너 구조

본 시스템은 *컨테이너(container)* 관점에서 3개 단위로 구성된다 (C4 Model 컨테이너 레이어).

```
┌──────────────────────────────────────────────────────────────┐
│  Container 1: frontend (React SPA)                            │
│    · Vite dev server (포트 5173)                              │
│    · React Router 6 / pages / components                     │
│    · 빌드 산출 — dist/ → stg/prod에서 `vite preview` 호스팅   │
│    · 환경 변수: VITE_API_URL                                   │
└──────────────────────────────────────────────────────────────┘
                          │  fetch /api/*
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Container 2: backend (Express API)                           │
│    · tsx watch (dev) / node dist/server.js (stg/prod)         │
│    · /api/articles · /api/articles/:id/comments · /api/tags  │
│    · controllers → services → repositories → Prisma client    │
│    · 글로벌 에러 핸들러 (R-N-02 통일 schema)                   │
│    · 환경 변수: DATABASE_URL, PORT, NODE_ENV                   │
└──────────────────────────────────────────────────────────────┘
                          │  Prisma client (TS)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Container 3: database (SQLite file)                          │
│    · prisma/{profile}.db                                      │
│    · prisma/schema.prisma (정본)                              │
│    · prisma/migrations/ (stg/prod release용)                  │
│    · cascade ON DELETE 강제 (R-F-07)                          │
└──────────────────────────────────────────────────────────────┘
```

- **컨테이너 1 (frontend)**: SPA. 빌드 후 정적 산출. dev는 Vite HMR, stg/prod는 `vite preview` 또는 backend가 정적 산출 서빙(선택 — LOCAL.md §3 분기).
- **컨테이너 2 (backend)**: REST API. 단일 프로세스. 미들웨어 체인 — `express.json()` → CORS(dev only) → 라우터 → 글로벌 에러 핸들러.
- **컨테이너 3 (database)**: SQLite 파일. 프로세스 외부 의존 없음. Prisma client가 동일 host의 파일을 직접 open.
- **monorepo 레이아웃**: pnpm workspaces. 디렉토리 트리·빌드 명령·env 분리 상세는 12 Scaffolding `typescript.md` §1·§5·§6.
- **profile 적용 (ADR-0037 v1.1)**: dev / stg / prod 3 profile. dev는 hot reload + sample SQLite 파일, stg/prod는 빌드 산출물 + 분리 DB 파일 또는 단일 환경 N/A. 자세한 부팅 명령은 LOCAL.md §3.

## 3. 외부 시스템 / 경계

- **외부 시스템 의존**: 없음. RFP §2.3 — 인증 외부 IdP·이미지 업로드 S3·메일 발송 등 모두 out-of-scope.
- **빌드·CI 의존 (개발 시간)**: npm registry, GitHub, Node.js 공식 배포 채널. 런타임 의존 아님.
- **브라우저**: 최신 Chrome/Firefox/Safari/Edge. legacy 브라우저(IE 등) 지원 안 함.
- **운영 환경 가정**: 본 MVP는 *로컬 실행*이 목적. 호스팅 배포(Vercel·Netlify·AWS 등) 결정은 Phase 2+ ADR로 처리.
- **시간·날짜**: 서버 timezone은 시스템 default. createdAt/updatedAt은 UTC ISO 8601로 저장하고 FE에서 사용자 locale로 표시.
- **언어·문자**: UTF-8 일관. README와 핵심 모듈 주석은 한국어(R-N-05).
