---
doc_type: feature-eng-review
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Engineering Review

> Issue #6 · mode=add · P5 게이트 (contract + plan PASS 후 implement 진입 허가).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P5 plan-eng-review FEATURE mode self) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: woosung.ahn@bespinglobal.com
- **review_at**: 2026-05-26
- **note**: Generator≠Evaluator의 본격 적용은 P9 code-review reviewer agent. 본 P5는 contract/plan 문서 정합성 + 작업 범위 합리성 검토 (self). articles(#4) 패턴 답습이라 회귀 위험 낮음.

## 1. Contract 검토

- ✅ §0 Referenced-IDs 5행 — R-F-05·R-F-06 R-ID BLOCK PASS (R-F-07은 #4에서 검증 완료로 분리 명시), F-05 명시, 영향 모듈 M5·M6·M7·M8·M9 정확, 09 §3 댓글 3 엔드포인트 직 인용, 11 §2 PREFIX 신규 `VAL_COMMENT_*`·`NOT_FOUND_COMMENT` + 12 §5 빌드·실행 절 명시
- ✅ §2 Before/After — 14 항목, src·tests·smoke·부팅 자산·09 spec 정합·라인 추가·의존성 확인 모두
- ✅ §3 Call Sites — app.ts 1줄 추가 + article.service 우회 결정 + article.repo.findById 재사용 + 후수 #7·FE #N + 불변(M10·M11·schema) 매핑 완전
- ✅ §4 Backward Compatibility — Breaking=no, 마이그=no, 기존 호출자 0, 신규 PREFIX 충돌 0
- ✅ §5 Rollback — revert=yes, 절차 3단계, 데이터 손상 0 (schema 영향 없음, cascade schema-level)
- ✅ §6 비목표 — 9 항목, 후속 슬라이스(#7·FE Sprint 4) 분리 합리

## 2. Plan 검토

- ✅ §1 7 commit — articles(#4) 8 commit 대비 적음 (tag·articleTag 결정 없음 → 합리). 커밋 단위 atomic, 메시지 `feat(backend):`/`test(backend):`/`docs(plan):` prefix 정합 (11 §2 + ADR-0021 정규식)
- ✅ §2 DAG — C1·C2 → C3 → C4 → C5 → C6 → C7. 순환 없음. 라우터 마운트(C5) 후 통합 테스트(C6) 순서 정합
- ✅ §3 테스트 매핑 — validator 7 / service 5 / integration 7+ = 19+ 신규. AC 4건 1:1 매핑 (AC-1·2·3a·3b·3c·4 + cascade fan-in 회귀)
- ✅ §4 빌드·실행 검증 — 12-scaffolding §5 native script 직호출 (ADR-0041), smoke:3profiles 추가, curl 수동 검증 절차 명시
- ✅ §5 결정 10건 — path mounting / PREFIX 신설 / GET list 404 / DELETE mismatch / article.repo 재사용 / 트랜잭션 불필요 / 정렬 / 격리 / cascade fan-in / mergeParams. 모두 09 spec + articles 답습 + 일관성 근거
- ✅ §5 회귀 안전망 6 (F-RISK-03~07·12) — Sprint 1·#4 산출 흔적 fan-in 명시

## 3. UX 검토

- N/A — BE-only. UI는 Sprint 4 `feat-comment-create-delete-ui` (Blocked-by 본 PR)에서.

## 4. 6단계 폴더링 충족

- ✅ `docs/features/feat-comments-api/` — slug 접두 `feat-` 정합 (`feature-*.schema.yaml` `filename_pattern` 정합)
- ✅ frontmatter 7필드: doc_type · version · status · author · date · gate · related (R-ID/F-ID) 모두 채움

## 5. frontmatter / Manifest 검증

- ✅ brief — `validate-doc.sh` PASS
- ✅ contract — `validate-doc.sh` PASS (§0 5행 BLOCK 통과)
- ✅ plan — `validate-doc.sh` PASS
- ✅ eng-review — 본 문서 (작성 후 validate 예정)

## 6. 발견 사항 (3축 OX)

본 P5 review에서 인식된 인접 작업 후보 없음. 13/02-catalog fan-in은 P13 docs-update 단계에서 ADR-0035 check로 처리.

| Q | 답 | 처리 |
| --- | --- | --- |
| Q1. in_scope == False | N/A — 후보 없음 | 없음 |
| Q2. blocks_parent_merge == False | N/A | 없음 |
| Q3. same_area == False | N/A | 없음 |

## 7. NEEDS-WORK 항목

없음. P6 acceptance-criteria 진입 허가.
