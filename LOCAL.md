# board-app — 로컬에서 켜기

> **목적**: 이 저장소를 처음 clone한 사람이 *이 파일 1개*만 따라 하면 dev/stg/prod 3 profile 모두 로컬에서 부팅 가능하도록 한다.
> **정본 위치**: 이 파일은 newProject 루트의 *유저 facing* 정본. 부팅 자산 *정의*의 SoT는 [`docs/planning/12-scaffolding/typescript.md`](docs/planning/12-scaffolding/typescript.md) §7. 본 LOCAL.md와 12-scaffolding은 매 PR에서 동기 갱신된다 (ADR-0037 v1.1 + ADR-0040).
> **진화 규칙**: 부팅 자산(`.env.{dev,stg,prod}.example`·migrations·lockfile·setup scripts·부팅 명령)이 변경되면 본 파일도 같은 PR에서 갱신. AI 게이트 6번째 축이 동기 누락을 BLOCK한다.

---

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 — flow-design Phase 2/4에서 12-scaffolding/typescript.md §7과 동시 작성. Conduit Lite (TS + React/Express/Prisma/SQLite, pnpm workspaces monorepo). |
| v0.2 | 2026-05-25 | woosung.ahn@bespinglobal.com | Issue #3 — `seed:dev` script 정식 도입(`pnpm --filter @app/backend seed:dev`) + §3.1 dev profile에 DB 초기화 reminder 1줄 추가 (ADR-0040 동기). |

---

## 1. 사전 요구사항

> 본 절은 12-scaffolding §1 디렉토리 트리 + §2 패키지 명명 규칙에서 도출.

- **언어/런타임**: Node.js 20 LTS
- **패키지 매니저**: pnpm 9 (corepack로 활성 권장)
- **컨테이너 (선택)**: Phase 2+ 후보 — 본 MVP는 native 부팅
- **DB**: SQLite 3 (별도 설치 불필요, Prisma가 파일 자동 생성)
- **OS 가정**: macOS / Linux / WSL2 / Windows (PowerShell)

---

## 1.5 흔한 함정 — *사전* 안내

### 1.5.1 monorepo + root `.env.{profile}` cwd 미스매치

본 프로젝트 채택: **(b) dotenv-cli 래핑** — backend의 npm scripts(`prisma:push`·`dev`·`seed:dev` 등)는 모두 `dotenv -e ../.env.{profile} --` 로 root env를 명시 로드한다. workspace cwd(`backend/`)에서 `npx prisma ...` 직접 호출 시 `DATABASE_URL` 누락 발생할 수 있으므로 항상 `pnpm --filter @app/backend <script>` 형태로 호출한다.

> 예외: Vite는 cwd의 `.env.{mode}` 자동 로드 — frontend는 자기 워크스페이스에 `.env.{p}.example` 추가 비권장 (root .env가 정본).

### 1.5.2 ORM 최초 migration 부재 — **(a) 분리형 채택**

본 프로젝트는 Prisma **(a) 분리형** 채택 (12-scaffolding §7 footnote).
- dev: `pnpm --filter @app/backend prisma db push` (빠른 schema → DB 동기, 최초 부팅 시 1회)
- 정식 migration 흐름 (최초 1회만): `pnpm --filter @app/backend prisma migrate dev --name init`
- stg/prod release: `prisma migrate deploy` (기존 migration 파일만 적용)
- ⚠️ 함정: `migrate deploy`는 *기존 파일만* 적용. 최초 부팅 시 `migrations/` 비어 있으면 DB 빈 상태로 남음 — 위 `db push` 또는 `migrate dev --name init` 으로 시드 후 진행.

### 1.5.3 stg/prod 부팅용 정적 서버 가정 (SPA frontend)

본 MVP는 SPA(React + Vite). stg/prod는 빌드 산출(`dist/`) + `vite preview` 활용. `serve` 같은 별 도구 미사용. backend는 `dotenv-cli`로 `.env.{stg,prod}` 명시 로드.

### 1.5.4 컨테이너 베이스 이미지 함정 (N/A)

본 MVP는 Dockerfile 미사용. Phase 2+에서 도입 시 본 절을 채운다.

### 1.5.5 multi-stack 의존성 설치 함정 (N/A)

본 MVP는 단일 stack (TypeScript + pnpm 단일 도구체인). multi-stack(Gradle/Maven 등) 함정 N/A.

---

## 2. 처음 한 번 셋업 (Initial Setup)

```bash
# 1) clone
git clone <repo-url>
cd board-app

# 2) 의존성 설치 (pnpm workspaces가 frontend·backend·shared·e2e 모두 한 번에)
#    corepack로 pnpm 9 핀:
corepack enable && corepack prepare pnpm@9.15.4 --activate
pnpm install --frozen-lockfile

# 3) 환경 변수 파일 준비 — profile별 3벌 (root 통합)
cp .env.dev.example  .env.dev
cp .env.stg.example  .env.stg
cp .env.prod.example .env.prod
# 각 .env.{dev,stg,prod} 안의 값을 환경에 맞게 채움 (MVP는 시크릿 없음)
# 단일 환경 운영 시 .env.stg / .env.prod는 dev 사본 또는 N/A 표기

# 4) Prisma client 생성 + dev DB 스키마 적용 (최초 1회)
pnpm --filter @app/backend prisma generate
pnpm --filter @app/backend prisma db push         # dev DB(prisma/dev.db) schema 적용
# 정식 migration 흐름 시작 (최초 1회만):
pnpm --filter @app/backend prisma migrate dev --name init
# ⚠️ 함정: `migrate deploy` CLI는 *기존 migration 파일만* 적용. 위 init 미수행 시 빈 DB로 남음.

# 5) seed 데이터 (dev profile)
pnpm --filter @app/backend seed:dev
# (예시 글 5건·댓글 10건·태그 8종 자동 삽입, idempotent)
```

---

## 3. Profile별 부팅 명령

> **profile 3분기 강제 (ADR-0037 v1.1)** — 매 PR에서 3 profile 모두 부팅 검증된다. 본 절의 명령이 그대로 AI 게이트 6번째 축에서 실행된다.

### 3.1 dev profile (로컬 개발)

```bash
# (최초 1회만, §2 셋업 미완료 시) DB 초기화 + seed
pnpm --filter @app/backend prisma:push        # backend/prisma/dev.db schema 적용
pnpm --filter @app/backend seed:dev           # 글 5·댓글 10·태그 8 삽입 (idempotent)

# 옵션 A — frontend + backend 각각 (2 터미널, hot reload O)
NODE_ENV=development pnpm --filter @app/backend  dev    # tsx watch → :3000
NODE_ENV=development pnpm --filter @app/frontend dev    # vite      → :5173

# 옵션 B — 통합 실행 (1 터미널)
pnpm -r --parallel run dev
```

- 기대 출력: backend `[server] Listening on http://localhost:3000 (profile=development)` + frontend `Local: http://localhost:5173/`
- 환경 변수 출처: 루트 `.env.dev` (backend는 dotenv-cli 래핑, frontend는 Vite 자동 로드)
- DB: `backend/prisma/dev.db` (Prisma 자동 생성)
- Hot reload: O (backend tsx watch + Vite HMR)

### 3.2 stg profile (스테이징 — 로컬에서 stg 흉내)

```bash
# 빌드 → 실행 (stg는 빌드 산출물 기반)
pnpm -r build                                                  # tsc + vite build (FE: dist/)

NODE_ENV=staging  pnpm --filter @app/backend  start:stg        # node dist/server.js → :3000
NODE_ENV=staging  pnpm --filter @app/frontend preview:stg      # vite preview --port 4173
```

- 기대 출력: backend `[server] Listening on http://localhost:3000 (profile=staging)` + frontend `vite preview → :4173`
- 환경 변수 출처: 루트 `.env.stg`
- DB: `backend/prisma/stg.db` (별 파일, 또는 단일 환경 운영 시 dev 공유 N/A)
- Hot reload: X (빌드 산출물)
- ⚠️ 흔한 함정 (§1.5.3): `serve` 같은 별 정적 서버 미설치 — Vite preview 사용
- **단일 환경 운영 시**: 본 절을 "N/A — stg=prod 공유" 표기 가능

### 3.3 prod profile (로컬에서 prod 흉내)

```bash
pnpm -r build

NODE_ENV=production pnpm --filter @app/backend  start:prod
NODE_ENV=production pnpm --filter @app/frontend preview:prod   # vite preview --port 4173
```

- 기대 출력: backend `[server] Listening on http://localhost:3000 (profile=production)` + frontend preview 4173
- 환경 변수 출처: 루트 `.env.prod` (운영 환경에서는 secret manager 권장 — Phase 2+ 도입 시)
- DB: `backend/prisma/prod.db` (별 인스턴스 권장, MVP는 로컬 파일)
- Hot reload: X
- **단일 환경 운영 시**: N/A 표기 허용

---

## 4. 부팅 자산 (Runnability Assets)

> 본 표는 [`docs/planning/12-scaffolding/typescript.md`](docs/planning/12-scaffolding/typescript.md) §7과 동기. 자산이 변경되면 양쪽 모두 갱신.

| 자산 | 경로 | 변경 trigger | 갱신 책임 |
|---|---|---|---|
| 환경 변수 템플릿 | `.env.dev.example`·`.env.stg.example`·`.env.prod.example` | 새 환경 변수 추가 | 변수를 도입한 이슈 |
| 스키마 적용 (dev iteration) | `backend/package.json scripts.prisma:push` → `prisma db push` | dev schema 변경 | 모델 변경 이슈 |
| DB migrations (stg/prod release) | `backend/prisma/migrations/` 디렉토리 + `prisma migrate deploy` | 운영 release migration | 운영 release 이슈 |
| lockfile | `pnpm-lock.yaml` (root 단일 — workspaces가 공유) | 의존성 추가/변경 | 의존성 도입 이슈 |
| 설치/seed scripts | `package.json` scripts: `prepare`, `prisma:push`, `seed:dev` 외 | seed 데이터 변경 | seed 변경 이슈 |
| 부팅 명령 | 본 LOCAL.md §3 + `package.json` scripts (`dev`, `start:stg`, `start:prod` 등) | 명령 변경 | 명령 변경 이슈 |
| 컨테이너 정의 (선택, Phase 2+) | `Dockerfile`·`docker-compose.{dev,stg,prod}.yml` | infra 변경 | infra 이슈 |

> **Prisma 분류 (ADR-0037 v1.3)**: 본 프로젝트는 **(a) 분리형** — dev iteration은 `prisma db push`, stg/prod release는 `prisma migrate deploy`. Spring Boot + Flyway integration 류 단일 메커니즘 아님.

---

## 5. 자주 발생하는 문제 (Troubleshooting)

### 5.1 포트 충돌 (`EADDRINUSE`)

```bash
# macOS / Linux
lsof -i :3000        # backend
lsof -i :5173        # frontend dev
lsof -i :4173        # frontend stg/prod preview

# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000
```

해결: 점유 프로세스 종료 또는 `.env.{dev,stg,prod}` `PORT` 값 변경.

### 5.2 환경 변수 누락 (`Environment variable not found: DATABASE_URL`)

- 3 profile *모든* `.env.example`에 키가 있는지 확인 (`.env.dev.example`·`.env.stg.example`·`.env.prod.example`)
- 실제 `.env.{dev,stg,prod}` 파일이 cp 됐는지 확인
- backend 호출 시 `pnpm --filter @app/backend <script>` 형태 유지 (dotenv-cli 래핑이 root env 로드)

### 5.3 DB 연결 실패

- 본 MVP는 SQLite — DB 컨테이너 없음. `backend/prisma/{profile}.db` 파일이 존재하는지 확인 (cwd가 root여야 path 맞음)
- 스키마 미적용 시: `pnpm --filter @app/backend prisma db push` 재실행
- 정식 migration 흐름 시작 안 된 상태: `pnpm --filter @app/backend prisma migrate dev --name init`
- ⚠️ `migrate deploy`는 *기존 migration 파일만* 적용 — `migrations/` 비어 있으면 빈 DB

### 5.4 monorepo cwd에서 직접 prisma 호출 시 env 누락

증상:
```
$ cd backend && npx prisma migrate deploy
Error: Environment variable not found: DATABASE_URL.
```

원인 — workspace cwd에서 도구를 직접 호출하면 root `.env.{profile}`이 자동 로드되지 않음.

해결: 항상 root에서 `pnpm --filter @app/backend <script>` 형태로 호출 (npm scripts가 dotenv-cli 래핑). 직접 `prisma ...` CLI 호출 금지.

### 5.5 컨테이너 베이스 이미지 함정 (N/A — Dockerfile 미사용)

본 MVP는 native 부팅. Phase 2+ 컨테이너화 도입 시 본 절 채움.

### 5.6 multi-stack 의존성 함정 (N/A — 단일 TS stack)

본 MVP는 단일 stack. Gradle/Maven multi-project syntax 함정 N/A.

### 5.7 Tailwind 클래스 미적용

- `frontend/postcss.config.js`에 `tailwindcss` + `autoprefixer` 플러그인 있는지 확인
- `frontend/tailwind.config.ts`의 `content: ["./index.html", "./src/**/*.{ts,tsx}"]` glob이 실제 파일을 커버하는지
- `frontend/src/styles.css`에 `@tailwind base; @tailwind components; @tailwind utilities;` 3 directives 모두 있는지
- main entrypoint(`main.tsx`)에서 `import "./styles.css"` 호출 여부

---

## 6. 외부 의존 (선택)

본 MVP는 외부 시스템 의존 없음 (06 Architecture §3). Phase 2+에서 인증·이미지 업로드·메일 등 추가 시 본 절에 셋업 절차 명시.

---

## 7. 본 문서 갱신 책임 (메타)

- **누가**: 부팅 자산을 변경하는 이슈의 PR 작성자(에이전트 또는 사람)
- **언제**: 같은 PR 안에서 갱신. 별 hotfix PR로 미루지 않음 (ADR-0037 §2.3)
- **검증**: AI 게이트 6번째 축이 (a) 부팅 자산 diff 여부, (b) 본 LOCAL.md 갱신 여부를 동시 확인. 한쪽만 변경 시 BLOCK
- **상위 SoT 동기**: 본 절차가 [`docs/planning/12-scaffolding/typescript.md`](docs/planning/12-scaffolding/typescript.md) §7과 다르면 `/docs-update`가 정합 검수에서 WARN. 양쪽 동기가 우선
