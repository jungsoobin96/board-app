---
doc_type: feature-contract
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

# feat-readme — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §0~§6 채움 (ADR-0018 §0 5행 포함) |
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 본 contract가 건드리는 게이트 C 정본을 명시.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs | R-N-03, R-N-04, R-N-07 |
| F-ID (기능) | docs/planning/05-prd | F-09, F-12 |
| 영향 모듈 | docs/planning/08-lld-module-spec | (none) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec | (none) |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions | §1 명명 (마크다운 제목·앵커) |

## 1. 변경 의도

루트 `README.md`를 신설하여 새 PC + Node 20 학습자가 RFP §10 평가 기준 7항을 1:1 매핑·통과할 수 있는 설치·실행·평가·보안·학습 진입점을 제공한다.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| 루트 README.md | 부재 | 10 섹션 신설 (§개요·§기술·§폴더·§설치·§실행 3 profile·§평가 기준·§보안·§학습 가이드·§yq·§Phase 2) |
| 평가 기준 노출 | RFP §10 7항만 (학습자 미접근) | README §평가 기준 표 (7행 × {기준·통과 방법·구현 위치·상태}) |
| 보안 경계 표시 | LOCAL.md §6 일부 | README §보안 1단락 한국어/영문 병기 ("공개 데모용, 운영 사용 금지" / "Public demo only — NOT for production") |
| 설치·실행 진입 | LOCAL.md 단독 | README §설치·§실행 요약 + LOCAL.md §2·§3·§4·§5 cross-reference (정본 양축 보존, ADR-0040) |
| 학습 트랙 | RFP §11 (학습자 미접근) | README §Phase 2 향후 확장 (4 단계 + 외부 학습 자료 link) + §학습 가이드 1단락 |
| yq 사전 요구사항 | 분산 (12-scaffolding §4 + scaffold-doc.sh 메시지) | README §설치 §사전 요구사항에서 yq 권고 1줄 + fallback link |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| LOCAL.md §1 (Quickstart 메모) | README가 cross-ref 소스가 됨 (역참조 1회) | LOCAL.md 본문 변경 없음 (현 §1에 이미 "전체 가이드는 README 참조" 포함) |
| RFP.md §10 7항 | README가 매핑 대상이 됨 | RFP 본문 변경 없음 (README가 단방향 참조) |
| docs/planning/12-scaffolding/typescript.md §5 | README §실행이 native script 인용 (ADR-0041) | 12-scaffolding 본문 변경 없음 (README가 단방향 참조) |
| docs/planning/14-wbs/14-wbs.md Sprint 6 #22 행 | issue close 시 DoD 6항 ✅ | WBS 본문 변경 없음 (이슈 자체에 DoD 체크리스트 존재) |
| GitHub Repo 메인 페이지 | README 신설로 자동 노출 (지금까지 placeholder 없음) | 사용자 영향 없음 — 신설은 새 화면 추가만 |

## 4. Backward Compatibility

- **Breaking: no**
- **마이그레이션 필요: no**
- **이유**: 신설 파일 (Before=부재). 기존 동작·API·UI 무변경. LOCAL.md를 흡수하지 않고 cross-reference만 추가 (정본 양축 ADR-0040 §2.4 준수).
- **deprecation 일정**: N/A — 폐기 대상 없음.
- **버전 영향**: README 신설은 internal docs change → semver patch 등급 (board-app v1.x.y).

## 5. Rollback 전략

- **revert 가능: yes**
- **rollback 절차** (3단계):
  1. `git revert <merge-commit-sha>` — merge commit 한 건만 되돌리면 README 삭제 + docs/features/feat-readme/ 전체 삭제.
  2. `git push origin main` — origin 동기.
  3. (선택) GitHub Repo 메인 페이지 캐시 새로고침 — 본 단계 미실행해도 다음 push에서 자동 갱신.
- **데이터 손상 위험**: 없음. 코드·DB·런타임 상태 무변경 (docs only).
- **rollback trigger**: README 본문 사실 오류 발견 (예: 평가 기준 매핑 오류·보안 한·영 오역) → hotfix(같은 PR 추가 커밋) 우선, revert는 최후 수단.

## 6. 비목표

- LOCAL.md를 README에 흡수 — **금지** (정본 양축 보존, ADR-0040 §2.4).
- README에 평가 기준 통과 결과(스크린샷·시도 로그) 박기 — **금지** (UC-06 수동 시도는 `test-final-golden-path` 후속 이슈).
- API 스펙 / 코드 정의서 본문 복제 — **금지** (`docs/planning/09-lld-api-spec/` 단방향 link만).
- 전체 영어 번역본 — **비대상**. §보안 1단락만 한·영 병기.
- 라이선스 명시 — **본 PR scope 밖**. 별도 백로그 이슈로 분리.
- README에 yq 강제 설치 — **금지**. 권고 + fallback 안내만 (`.claude/runbook.md` §4 참조).
- AI 게이트 6번째 축(부팅 가능성) 본문 명시 — LOCAL.md §3 정본. README §실행은 요약 + cross-ref만.
