# board-app — Conduit Lite (학습용 게시판)

새 컴퓨터에서 clone 하면 곧장 풀스택 흐름(DB ↔ API ↔ 화면)을 학습할 수 있는 게시판 MVP다. 글·댓글·태그 CRUD 만으로 구성하여 입문자가 한 번에 끝까지 따라갈 수 있도록 의도적으로 단순화했다.

> 본 README는 *학습자 + 검토자* 진입점이다. 부팅 절차의 상세 정본은 [`LOCAL.md`](LOCAL.md)에, 설계·정책 정본은 [`docs/planning/`](docs/planning/)에 분리되어 있다. README는 양쪽으로 단방향 링크만 제공한다 (ADR-0040 §2.4 동기 진화).

---

## 1. 개요

- **목적**: RealWorld의 약 40% (게시글·댓글 중심)만 구현하여, 학습자가 "DB 모델링 → REST API → 컴포넌트 렌더" 한 사이클을 끝까지 체험.
- **빠지는 것**: 인증·팔로우·개인화 피드·즐겨찾기·검색·알림 (RFP §3.2 — 인증·관계 모델링은 난이도가 급격히 올라가는 영역이라 의도적 제외).
- **대상**: 풀스택 입문자(주), 합격 여부를 빠르게 판단하려는 검토자(부), 학습 트랙을 안내하는 운영자(부).

상세 컨텍스트는 [`RFP.md`](RFP.md) §1·§3·§11 참조.

## 2. 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 언어 | TypeScript 5.6 | 단일 언어로 BE/FE 정합 (학습 부담 최소) |
| 패키지 매니저 | pnpm 9 (corepack) + workspaces | monorepo 4 패키지 일원 관리 |
| Backend | Express 4 + Prisma 5 | 라우팅 친숙·ORM 학습용 적합 |
| Frontend | React 18 + Vite 5 + React Router 6 | hot reload·path routing |
| 스타일링 | Tailwind CSS 3 + PostCSS | utility-first, 학습 비용 ↓ |
| DB | SQLite 3 | 별도 설치 불필요, 파일 1개로 동작 (RFP §6.2) |
| 테스트 | vitest + supertest + Playwright | 단위·통합·E2E 모두 1 도구 계열 |

설계 정본은 [`docs/planning/06-architecture/`](docs/planning/06-architecture/) + [`docs/planning/07-hld/`](docs/planning/07-hld/) 참조.

## 3. 폴더 구조

```
board-app/
├── README.md                  ← 본 파일 (학습자/검토자 진입점)
├── LOCAL.md                   ← 부팅 절차 상세 정본 (양축)
├── RFP.md                     ← 요구사항 / 평가 기준 / 향후 로드맵
├── CLAUDE.md                  ← 개발 운영 규칙 (필수 규칙·보안·FSM)
├── package.json               ← root workspace + smoke scripts
├── pnpm-workspace.yaml        ← 4 패키지 정의
├── .env.{dev,stg,prod}.example← 3 profile 환경 변수 템플릿
├── backend/                   ← @app/backend (Express + Prisma)
├── frontend/                  ← @app/frontend (React + Vite + Tailwind)
├── shared/                    ← @app/shared (DTO·에러 코드)
├── e2e/                       ← @app/e2e (Playwright 5 spec + global-setup)
├── scripts/                   ← smoke.ts 등 운영 보조
├── docs/
│   ├── planning/              ← 15+ 1수준 정본 산출 (SRS·PRD·HLD·LLD·ADR 등)
│   └── features/              ← 이슈 단위 산출 묶음 (brief·contract·plan…)
└── .claude/                   ← agent-toolkit (commands·schemas·scripts·hooks)
```

## 4. 설치

### 4.1 사전 요구사항

- **Node.js 20 LTS** (필수)
- **pnpm 9** (필수, `corepack enable` 후 자동 활성)
- **OS**: macOS / Linux / WSL2 / Windows (PowerShell) — 모두 지원
- **DB**: SQLite — 별도 설치 불필요 (Prisma가 파일 자동 생성)
- **yq (mikefarah/yq v4+)** *권고* — `.claude/schemas/*.yaml` 검증·`scaffold-doc.sh` 사용 시 필요. 미설치 시 [`.claude/runbook.md`](.claude/runbook.md) §4 fallback 절차 참조 (학습만이 목적이라면 yq 없이도 README §5 실행 가능).

### 4.2 셋업 (최초 1회)

```bash
git clone <repo-url>
cd board-app
corepack enable && corepack prepare pnpm@9.15.4 --activate
pnpm install --frozen-lockfile
cp .env.dev.example .env.dev   # stg / prod도 동일하게 복사
pnpm --filter @app/backend prisma generate
pnpm --filter @app/backend prisma db push
pnpm --filter @app/backend seed:dev   # 글 5 / 댓글 10 / 태그 8 idempotent
```

> 상세 절차 (3 profile 모두 셋업·monorepo cwd 함정·정식 migration 흐름)는 [`LOCAL.md`](LOCAL.md) §2 참조. 본 README는 dev profile 진입 기준 요약만 둔다.

## 5. 실행 — 3 profile

| profile | 부팅 명령 | 포트 | 용도 |
|---|---|---|---|
| **dev** | `pnpm --filter @app/backend dev` + `pnpm --filter @app/frontend dev` | backend `:3000` / frontend `:5173` | 학습·개발 (hot reload O) |
| **stg** | `pnpm -r build` → `pnpm --filter @app/backend start:stg` + `pnpm --filter @app/frontend preview:stg` | backend `:3000` / preview `:4173` | 스테이징 흉내 (빌드 산출 검증) |
| **prod** | `pnpm -r build` → `pnpm --filter @app/backend start:prod` + `pnpm --filter @app/frontend preview:prod` | backend `:3000` / preview `:4173` | 운영 흉내 (빌드 산출 검증) |
| **3 profile 일괄 smoke** | `pnpm smoke:3profiles` | — | AI 게이트 6번째 축 자동 검증 |

> 명령 본문·환경 변수·트러블슈팅(포트 충돌·DB 연결 실패·Tailwind 미적용)은 [`LOCAL.md`](LOCAL.md) §3 + §5 정본. 본 README는 진입점 표만 둔다.

학습 시작은 dev profile만으로 충분하다. 브라우저에서 `http://localhost:5173` 열면 시드 글 5건이 노출된다.

## 6. 평가 기준 (RFP §10 1:1 매핑)

| # | RFP §10 평가 기준 | 통과 방법 | 구현 위치 | 상태 |
|---|---|---|---|---|
| 1 | 글을 작성하면 목록에 즉시 나타난다 | dev profile 부팅 → `/editor` → 발행 → `/`에서 신규 글 노출 | `e2e/specs/article-create.spec.ts` | ✅ Sprint 5 #21 |
| 2 | 글 상세 페이지에서 댓글을 달 수 있다 | `/article/:id` → 댓글 폼 작성 → 목록 갱신 | `e2e/specs/article-detail-comment.spec.ts` | ✅ Sprint 5 #21 |
| 3 | 태그를 클릭하면 해당 태그의 글만 보인다 | `/` 우측 인기 태그 클릭 → URL `?tag=...` + 필터 적용 | `e2e/specs/tag-filter.spec.ts` | ✅ Sprint 5 #21 |
| 4 | 페이지네이션이 동작한다 | (백로그 F-13) — `?page=2` 쿼리 + UI 페이지 칩 | TBD | ⚠️ Phase 2 예정 (F-13) |
| 5 | 글 수정 후 다시 들어가면 수정된 내용이 보인다 | `/editor/:id` → 수정·저장 → `/article/:id` 재진입 | `frontend/src/pages/EditorPage.tsx` (편집 모드) | ✅ Sprint 4 #16 |
| 6 | 글 삭제 시 목록에서 사라지고 댓글도 함께 제거된다 | `/article/:id` → 삭제 모달 → `/` 이동 + 댓글 cascade | `e2e/specs/article-delete-cascade.spec.ts` | ✅ Sprint 5 #21 |
| 7 | README의 절차만으로 새 컴퓨터에서 로컬 실행 가능 | 본 README §4·§5 따라 dev 부팅 + 시드 노출 | 본 README + [`LOCAL.md`](LOCAL.md) | ✅ 본 PR (#22) |

> 통과 결과(스크린샷·시도 로그)는 후속 이슈 `test-final-golden-path-and-eval-criteria`에서 기록한다. 본 README는 매핑·통과 방법·구현 위치 3방향만 명시.

## 7. 보안 / Security

**한국어** — 본 프로젝트는 **공개 데모용**이다. 인증·권한·세션 관리·HTTPS·secret manager 등 운영 환경에서 필수인 보안 메커니즘이 의도적으로 제외되어 있다. **운영 환경 사용 금지**. `.env.{dev,stg,prod}`는 절대 커밋 금지 (`.gitignore`로 차단됨).

**English** — This project is a **public demo only — NOT for production**. Authentication, authorization, session management, HTTPS, and secret manager integrations are intentionally omitted to keep learning focused. **Do not deploy to the public internet without security hardening**. `.env.*` files must never be committed (already blocked by `.gitignore`).

상세 보안 규칙은 [`CLAUDE.md`](CLAUDE.md) §보안 (절대 규칙) 1~6 참조.

## 8. 학습 가이드

본 프로젝트는 다음 순서로 따라가면 풀스택 입문 1 사이클이 완성된다.

1. **부팅 + 시드 확인** — §4·§5 dev profile만으로 시드 글 5건 노출 확인. 코드 한 줄 안 봐도 됨.
2. **데이터 모델** — [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) 읽기 (Article·Comment·Tag 3 모델, 관계 1줄씩).
3. **API 계약** — [`docs/planning/09-lld-api-spec/`](docs/planning/09-lld-api-spec/) §1 엔드포인트 표 + [`shared/`](shared/) DTO 정의.
4. **컴포넌트 흐름** — [`frontend/src/pages/`](frontend/src/pages/) 5개 페이지 + [`frontend/src/components/`](frontend/src/components/) 카드/폼/모달.
5. **테스트로 검증** — `pnpm --filter @app/backend test` (36건) + `pnpm --filter @app/frontend test` (86건) + `pnpm --filter @app/e2e test` (5건) 순서로 실행하며 시나리오 읽기.
6. **다음 단계** — §10 Phase 2 향후 확장.

> 코드에는 핵심 로직마다 한국어 주석이 포함되어 있다 (RFP §6.5 학습 친화성).

## 9. yq 도구 (선택, 권고)

`.claude/` agent-toolkit의 schema 검증·골격 생성을 사용하려면 [yq (mikefarah)](https://github.com/mikefarah/yq) v4+ 설치를 권고한다.

```bash
# macOS
brew install yq

# Linux
sudo snap install yq

# Windows (winget)
winget install MikeFarah.yq
```

- 미설치여도 학습 / §5 실행에는 영향 없음.
- agent-toolkit 명령(예: `bash .claude/scripts/scaffold-doc.sh`)을 직접 호출할 때만 필요.
- 미설치 시 fallback 절차 — [`.claude/runbook.md`](.claude/runbook.md) §4.

## 10. Phase 2 — 향후 확장 (RFP §11)

본 v1 완성 후 단계적으로 추가하기 좋은 기능:

1. **글 목록 페이지네이션 (F-13)** — `?page=N&limit=M` 쿼리 + UI 페이지 칩. 평가 기준 §6 #4 백로그.
2. **세션 기반 간단 로그인** (bcrypt + express-session)
3. **본인 글만 수정/삭제** (권한 체크)
4. **프로필 페이지** (사용자별 작성 글 모아 보기)
5. **JWT 인증으로 전환** (현대적 인증 방식 학습)
6. **팔로우 / 언팔로우 + 개인화 피드**
7. **즐겨찾기(Favorite)**

상세 단계별 학습 포인트는 [`RFP.md`](RFP.md) §11 참조. 본 v1의 평가 기준 7개 1:1 결과(6/7 PASS + 1 N/A)는 [`docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md`](docs/features/feat-final-golden-path-eval/feat-final-golden-path-eval.eval-matrix.md) §8 참조.

---

## 참조

- 부팅 절차 상세: [`LOCAL.md`](LOCAL.md)
- 요구사항 / 평가 기준 / 로드맵: [`RFP.md`](RFP.md)
- 개발 운영 규칙 / 보안: [`CLAUDE.md`](CLAUDE.md)
- 설계 정본: [`docs/planning/`](docs/planning/) (15+ 1수준 산출)
- 이슈별 산출: [`docs/features/`](docs/features/)
- ADR: [`docs/planning/adr/`](docs/planning/adr/)
