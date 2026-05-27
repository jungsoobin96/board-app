---
doc_type: feature-ai-qa
version: v0.1
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
ui_changed: true
golden_path_verified: true
screenshots:
  - docs/features/feat-article-page/screenshots/article-detail.png
related:
  R-ID: [R-F-03, R-F-06, R-F-08]
  F-ID: [F-04, F-05]
  supersedes: null
verdict:
  ai_gate: PASS
  local_runnable: skip
  workflow_local_verified: manual
  local_runnable_reason: "외부 의존 장애 — LLM node PATH 부재. ui_changed=true → 사용자 PowerShell test:unit + dev 부팅 + /article/1·999 브라우저 검증 + Article 스크린샷 첨부 위임."
---

# feat-article-page — AI QA Report

> Issue #13 · mode=add · P10. **ui_changed=true 3번째 발동**. **Sprint 3 마지막** — 머지 시 100% COMPLETE.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96@users.noreply.github.com | 초안 (P10) |

## 0. Verdict

- **Flow Mode**: add (ADR-0032 부정 시그널 0)
- **ai_gate**: **PASS** (조건부 — 1·2·5·6축 사용자 위임)
- **ui_changed**: **true** (Article rewrite + CommentList 신설)
- **golden_path_verified**: **true** (사용자 PowerShell + dev 부팅 + 실 id `/article/66` 본문 검증 + `/article/1`·`/article/abc` NotFound 검증 + Article 스크린샷 첨부 완료, commit 3e38307)
- **local_runnable**: skip
- **workflow_local_verified**: manual
- **reviewer**: claude-reviewer-agent (verdict=PASS, MAJOR 0/MINOR 3/INFO 4. MINOR-02 같은 PR 보정 b7fa398)
- **review_at**: 2026-05-27

## 1. Test Plan 4블록

### Build
- [ ] **사용자 위임** — `pnpm typecheck && pnpm -r build` (lock 변경 없음 — install 불필요)

### Automated tests
- [ ] **사용자 위임** — `pnpm --filter @app/frontend test:unit` (기존 39 + 신규 9 = 48+ PASS + 1 skip 기대. reviewer 시점 48/49 확인)

### Manual verification
- [ ] **dev 부팅 — AC-01**: backend + frontend dev (#12 동일)
- [ ] **브라우저 골든패스 — AC-01·02·03·05 (ADR-0011 ui_changed=true)**:
  - `http://localhost:5173/article/1` → 본문 + 메타 + 태그 + 댓글 + 수정/삭제 버튼 노출
  - `http://localhost:5173/article/999` → NotFound ("찾을 수 없는 페이지") + URL 유지
  - `http://localhost:5173/article/abc` → NotFound (id invalid, hook fetch skip)
  - 글 1건이 댓글 0건이면 "아직 댓글이 없습니다" inline
  - 수정/삭제 버튼 클릭 시 무반응 (Sprint 4 결합 예정 — 의도)
  - DevTools Network → 미존재 id 시 `GET /api/articles/-1` 호출 0 (MINOR-02 보정 확인)
  - DevTools Console 에러 0건
  - 스크린샷 `docs/features/feat-article-page/screenshots/article-detail.png` 첨부
- [ ] **3 profile smoke**: `pnpm smoke:3profiles`
- [ ] GitHub Actions 워크플로 로컬 검증 (manual): `gh pr view <N> --json title,body | grep -c 'Closes #13'` → 1 + title 정규식

### DoD coverage
| Acceptance | PR diff | 검증 |
|---|---|---|
| AC-01 (본문+댓글+버튼) | Article.tsx + CommentList + 2 hooks | 사용자 P14 + screenshots |
| AC-02 (/article/999 → NotFound) | Article.tsx 404 분기 + id<1 가드 + useArticle.test 404 | 사용자 P14 |
| AC-03 (빈 댓글 → "댓글이 없습니다") | CommentList 빈 케이스 + CommentList.test | 사용자 P14 |
| AC-04 (단위 RTL + hook 8+) | 9 신규 test (3+3+3) | reviewer 48/49 PASS |
| AC-05 (수정/삭제 버튼 mount) | Article.tsx button + TODO comment | 사용자 P14 (클릭 무반응 — 의도 확인) |

## 2. AI 게이트 6축

| # | 축 | 결과 | 근거 |
|---|---|---|---|
| 1 | Build | 사용자 위임 | node PATH 부재 |
| 2 | Automated tests | 사용자 위임 | reviewer 48/49 PASS 확인 |
| 3 | Test Plan 4블록 | ✅ PASS | §1 |
| 4 | 시크릿 스캔 | ✅ PASS | XSS 0, dangerouslySetInnerHTML 0, secret 0 |
| 5 | **UI 골든패스 + stylesheet (ui_changed=true)** | **사용자 위임** | golden_path P14 + stylesheet `styles.css (#10 산출)` 재사용 |
| 6 | 3 profile 부팅 | 사용자 위임 | 부팅 자산 0 |

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
| --- | --- | --- |
| 본문 + 댓글 + 버튼 | acceptance AC-01 + 10 §2 S-02 | 사용자 P14 |
| /article/999 → NotFound | acceptance AC-02 + useArticle.test 404 | reviewer PASS |
| 빈 댓글 메시지 | acceptance AC-03 + CommentList.test | reviewer PASS |
| 단위 9개 PASS | acceptance AC-04 | reviewer 48/49 |
| 수정/삭제 mount | acceptance AC-05 (의도, contract §6) | 사용자 P14 확인 |
| invalid id hook skip | reviewer MINOR-02 보정 b7fa398 | reviewer 후속 검증 가능 |

## 4. FAIL 항목

없음. reviewer **PASS verdict** (MAJOR 0). MINOR-02 같은 PR 보정. MINOR-01·03은 follow-up.

## 5. 발견 사항

### A. Derived (3축 OX ✅)

#### Found-AP-1: formatDate 3 위치 중복 (reviewer MINOR-01)

- [x] Q1·Q2·Q3 ✅
- 권장: `/flow-feature --mode=modify "mod(frontend): formatDate 유틸 utils/formatDate.ts 분리 (ArticleCard·CommentList·Article 3 위치)"`
- Pattern=A.Derived

#### Found-AP-2: CommentList snapshot 파일 commit 누락 (reviewer MINOR-03)

- [x] Q1·Q2·Q3 ✅
- 권장: `/flow-feature --mode=modify "mod(test): __snapshots__/CommentList.test.tsx.snap commit (1차 실행 후 자동 생성)"`
- 근거: 사용자 첫 vitest 실행 시 "1 snapshot written" — 2번째 실행부터 "matched"
- Pattern=A.Derived

### B. 같은 PR 보정 (완료)

- **MINOR-02** (b7fa398): useArticle/useComments useEffect 진입 시 `if (id<1) return` 가드 추가 — invalid id 시 backend 불필요 호출 차단

## 6. UI/FE 변경 검증

**ui_changed=true** (ADR-0011).

- **gstack_qa_used**: N/A 사전 합의 (LLM 환경 미보유 — 사용자 PowerShell + 브라우저 직접 검증으로 gstack /qa·browse 바이너리·playwright 대체)
- **console_errors**: N/A 사전 합의 (사용자 P14 DevTools Console 0개 확인 위임)

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
| --- | --- | --- | --- |
| S-02 Article (`/article/66` 실 id) | 본문 + 메타 + 태그 + 댓글 + 수정/삭제 버튼 (사용자 PASS) | ✅ `docs/features/feat-article-page/screenshots/article-detail.png` (commit 3e38307) | ✅ `styles.css (Tailwind + 31 CSS Variables, #10)` 재사용 + 본 PR utility |
| S-05 NotFound (`/article/999`) | "찾을 수 없는 페이지" + 홈으로 Link | (선택) | ✅ NotFound 컴포넌트 #10 재사용 |

근거: `git diff main..HEAD --name-only` — frontend/src/pages/Article.tsx + components/CommentList.tsx 변경 (UI 확장자).

## 7. 로컬 부팅 가능성

> 본 PR은 frontend src 변경만. 부팅 자산 무변경 — lock도 그대로.

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 | LOCAL.md 동기 |
| --- | --- | --- | --- | --- | --- |
| dev | `pnpm --filter @app/frontend dev` | **사용자 위임** | 기대 0건 | ✅ 무변경 | ✅ 무변경 |
| stg | `pnpm --filter @app/frontend preview:stg` | **사용자 위임** | 기대 0건 | ✅ 무변경 | ✅ 무변경 |
| prod | 동일 | **사용자 위임** | 기대 0건 | ✅ 무변경 | ✅ 무변경 |

**부팅 자산 변경 영향**:

| 자산 | 본 PR diff | profile별 동기 | LOCAL.md §4 동기 |
| --- | --- | --- | --- |
| `.env.{dev,stg,prod}.example` | 무변경 | N/A | N/A |
| `package.json` | 무변경 (lock 그대로) | N/A | N/A |
| `pnpm-lock.yaml` | 무변경 | N/A | N/A |
| `frontend/src/*` | Article.tsx + CommentList.tsx + 2 hook (코드 변경) | N/A | N/A |
| 12-scaffolding §5·§7 | 무변경 | N/A | N/A |

**LOCAL.md 동기 (ADR-0040)**: ✅ N/A.

**외부 의존 장애 사유**: Sprint 1·2·3 동일.
