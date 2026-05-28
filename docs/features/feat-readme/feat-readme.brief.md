---
doc_type: feature-brief
version: v0.2 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-03, R-N-04, R-N-07]
  F-ID: [F-09, F-12]
  supersedes: null
---

# feat-readme — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 8 섹션 채움 (mode=add, slug=feat-readme, issue #22) |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

새 PC + Node 20 학습자가 README의 절차만으로 board-app dev/stg/prod 3 profile을 부팅하고 평가 기준 7항을 1:1로 매핑·통과할 수 있도록 한다.

## 2. 사용자 가치

- **학습자 (Primary)**: clone → `pnpm install` → `pnpm dev:local` 단일 절차로 풀스택 흐름(DB ↔ API ↔ 화면)을 체험. 평가 기준 7항을 README에서 직접 확인.
- **검토자 (Secondary)**: 보안 한·영 병기로 "공개 데모용 / 운영 사용 금지" 경계를 즉시 인지. 평가 기준 매핑으로 합격선을 1분 안에 판단.
- **운영자 (Tertiary)**: LOCAL.md cross-reference로 profile별 환경 변수·트러블슈팅을 빠르게 안내. 학습 트랙 절로 입문자가 다음 단계(Phase 2 향후 확장)를 자체 학습.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| README.md | 부재 (placeholder 없음) | 10 섹션 신설 (§개요·§기술·§폴더·§설치·§실행 3 profile·§평가 기준·§보안·§학습 가이드·§yq·§Phase 2) |
| 평가 기준 노출 | RFP §10 7항 (개발자만 접근) | README §평가 기준에 1:1 매핑 + 통과 방법 + UC-06 수동 시도 절차 |
| 보안 경계 표시 | LOCAL.md §6에 일부 | README §보안에 한국어/영문 병기 ("공개 데모용, 운영 사용 금지") |
| 설치·실행 진입점 | LOCAL.md 단독 (유저 facing) | README §설치·§실행에서 LOCAL.md §2·§3로 cross-reference (정본 양축 보존) |
| 학습 트랙 | RFP §11 향후 확장 (개발자만 접근) | README §학습 가이드 + §Phase 2 향후 확장 |
| yq 의존 안내 | 분산 (12-scaffolding §4 + scaffold-doc.sh 메시지) | README §설치 §사전 요구사항에서 yq 권고 1줄 |

## 4. 모드 자동 감지 결과

- **결정 모드**: `add` (mode auto)
- **결정 근거 (ADR-0032)**:
  - 부정 시그널 점검:
    - bug 키워드: 0건 (이슈 본문에 "에러"·"안 돼"·"고장" 없음)
    - design 키워드: 0건 (UI/token/리브랜딩/다크모드 없음)
    - modify 키워드: 0건 (기존 동작 변경 없음, README 신설)
  - 부정 시그널 합계: 0건 → 규칙 4 기본값 발동 → **mode=add**
- **이슈 라벨 정합**: `type:docs` + `area:docs` (type:bug 부재 → bug 모드 자동 배제, type:feature 부재해도 ADR-0032 §2.2에 따라 add 유지)
- **slug**: `feat-readme` (mode 접두 `feat-` 적용, document-manifest §3.2 + feature-*.schema.yaml filename_pattern 정합)
- **branch**: `feat/readme-issue-22` (ADR-0044 §1.3, base=main)

## 5. 영향 범위

- **신설 파일 (1건)**:
  - `README.md` (루트, 10 섹션 신설)
- **신설 docs 묶음 (8건)**:
  - `docs/features/feat-readme/feat-readme.{brief,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md`
- **참조 (read-only, 변경 없음)**:
  - `RFP.md` §1.2·§6·§10·§11 (학습 목적·기술·평가 기준·향후 확장)
  - `LOCAL.md` §2·§3·§4·§6 (설치·profile 실행·자산·보안 — cross-ref 정본)
  - `docs/planning/12-scaffolding/typescript.md` §5 (빌드·실행 SoT)
  - `docs/planning/14-wbs/14-wbs.md` (Sprint 6)
  - `package.json` + `pnpm-workspace.yaml` (기술 스택·폴더 구조 발췌)
- **변경 없음**:
  - frontend/backend/shared/e2e 모든 src 코드 (`ui_changed=false`)
  - `LOCAL.md` (이번 PR에서는 갱신 없음 — 부팅 자산 무변경)
  - 모든 워크플로 `.github/workflows/*.yml` 무변경

## 6. 비목표

- LOCAL.md를 README에 흡수하지 않음 — 정본 양축 보존 (README=overview/평가·LOCAL=profile별 부팅 상세). ADR-0040 §2.4 동기 진화 원칙 준수.
- README에 평가 기준 통과 결과(스크린샷·시도 로그)를 박지 않음 — UC-06 수동 시도 결과는 `test-final-golden-path` 후속 이슈가 처리.
- README에 코드 정의서 / API 스펙 본문 복제 금지 — `docs/planning/09-lld-api-spec/` 참조 링크만.
- README가 새 의존성(`yq`)을 강제 설치하지 않음 — *권고만*. RUNBOOK §4 fallback 안내.
- 영어 전체 번역본 비목표 — §보안 1단락만 한·영 병기 (RFP 학습자가 한국어 위주임을 가정).
- AI 게이트 6번째 축(로컬 부팅 가능성)을 README에 명시 안 함 — 운영 절차이므로 LOCAL.md §3 정본.

## 7. Open Questions

- O-22-1: 평가 기준 §10 7항 중 #4 "페이지네이션"은 board-app v1에 미구현(F-13 백로그) — README에 "Phase 2 예정" 명시 또는 평가 기준 매핑 자체에서 N/A 표기? → **결정**: README §평가 기준 표의 #4 행에 "⚠️ Phase 2 예정 (F-13)" 명시. 매핑 자체는 유지 (RFP 추적성 보존).
- O-22-2: §학습 가이드의 분량 — RFP §6.5 "코드 한국어 주석" 위주 가이드 vs 학습 트랙(Phase 2 4단계 + 외부 학습 자료) → **결정**: 학습 트랙 위주 (Phase 2 4단계 + Next 권고 1줄). 코드 주석 가이드는 별도 문서 백로그.
- O-22-3: README에 라이선스 명시 → **결정**: 본 PR scope 밖. 별도 이슈로 백로그 (라이선스 결정 시점에 추가).
