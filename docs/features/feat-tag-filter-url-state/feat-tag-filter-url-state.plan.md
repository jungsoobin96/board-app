---
doc_type: feature-plan
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# 태그 필터 UX 마무리 + URL state (Issue 18) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 1 commit(TagList 1줄 + RTL 2건 + 8 feature docs) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `feat(frontend): TagList active 칩 재클릭 해제 + URL state 마무리 (#18)` | `frontend/src/components/TagList.tsx` (active 분기 1줄) + `frontend/tests/unit/components/TagList.test.tsx` (RTL +2 it) + `docs/features/feat-tag-filter-url-state/*.md` (8 docs) | RTL 2 it (active 재클릭 해제 / 비-active 선택 회귀) | Low — TagList prop 시그니처 무변경, 시각 변화 없음, Home handleTagClick(null) 분기 이미 처리 |

## 2. 의존성 그래프

```
[P0 context-loader] frontend/components/TagList + pages/Home + tests/unit/components/TagList 식별
   │
   ▼
[P1 brief] mode=add 결정 + 사용자 가치 + Before/After 식별
   │
   ▼
[P3 contract] §0 R-F-01/R-F-04 + F-02/F-08 + §2 9행 Before/After + §3 호출자 7행
   │
   ▼
[P4 plan] 본 문서 (1 commit)
   │
   ▼
[P5 eng-review] PASS
   │
   ▼
[P6 acceptance] AC-01/02/03 + DoD 8항
   │
   ▼
[P7 risk] 3 F-RISK Low
   │
   ▼
[P8 implement] TagList.tsx line 38 1줄 + TagList.test.tsx +2 it → pnpm test 85 passed 확인 → 1 commit
   │
   ▼
[P9 reviewer] code-review.md verdict
   │
   ▼
[P10 qa-test --ai] 6축 + 3 profile smoke + workflow 양축 + ui_changed=true (TagList.tsx 매칭) → gstack /qa 의무 → 사용자 위임 + 스크린샷
                  → PR open + Closes #18
   │
   ▼
[P11 자동] sync-issue-labels.yml status:in-progress → status:in-review
   │
   ▼
[P14 human] Manual + DoD + Approve + 머지
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 | `frontend/tests/unit/components/TagList.test.tsx` it 5 | **active 태그 재클릭 시 onTagClick(null) 호출 (해제, #18)**: Given selectedTag="javascript" + sampleTags, When `screen.getByRole('button', { name: /javascript/ }).click()`, Then `expect(onTagClick).toHaveBeenCalledWith(null)` |
| 1 | 동일 it 6 | **비-active 태그 클릭 시 onTagClick(name) 호출 (선택 회귀, #18)**: Given selectedTag="javascript" + sampleTags, When `screen.getByRole('button', { name: /typescript/ }).click()`, Then `expect(onTagClick).toHaveBeenCalledWith('typescript')` (기존 동작 회귀 보호) |
| 1 | 기존 4 it 회귀 | snapshot + selectedTag 노출 + onTagClick(name) + 빈 배열 모두 PASS 유지 |
| (skipped) | `frontend/tests/integration/home.integration.test.tsx` | MSW + vitest jsdom 통합은 #11 follow-up으로 skipped 그대로. 본 PR scope 밖 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 8 docs)
for f in docs/features/feat-tag-filter-url-state/*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 모두 OK

# 단계 B: typecheck
pnpm typecheck
# 기대: 0 errors (pre-existing TS 3건 #48 외 신규 0건)

# 단계 C: frontend 단위 테스트
pnpm --filter @app/frontend run test:unit
# 기대: 85 passed + 1 skipped (Sprint 4 83 baseline + 2 신규 #18)

# 단계 D: 3 profile smoke (R-OPS-SMOKE 자기 검증)
pnpm run smoke:3profiles
# 기대: 3/3 PASS

# 단계 E: workflow 양축 manual reproduction (R-OPS-WORKFLOW)
PR_BODY="Closes #18"
ISSUES=$(printf '%s' "$PR_BODY" | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "18 "

# 단계 F: ui_changed=true → gstack /qa 또는 사용자 위임 + 스크린샷
# Home 사이드바 → "javascript" 칩 클릭 → ?tag=javascript → active 시각 + 글 필터링
# 같은 칩 재클릭 → ?tag 제거 → 전체 목록 노출
# 스크린샷: docs/features/feat-tag-filter-url-state/screenshots/{before,active,after-toggle}.png (사용자 위임)
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — 본 PR은 작은 mode=add 동작 추가. 기존 TagList API 유지. modify Strict Rule N/A
- **사용자 승인 필요 X**: 본 PR은 단순 UX 마무리. P14 표준 휴먼 게이트 진행
- **결정 사항**: active 칩 재클릭 = 해제 (toggle 패턴) — ConfirmModal(#15 PR #43) confirmTarget discriminated union 패턴과 일관
- **PR title**: `feat(frontend): TagList active 칩 재클릭 해제 + URL state 마무리 (#18)` — ADR-0021 정규식 `(feat|fix|chore|docs|test|refactor)` 정합 (`feat` prefix), branch `feat/` prefix 정합 (#56 발견 영향 없음)
- **gstack /qa**: ui_changed=true → 사용자 위임 (LLM 환경 미구성, Sprint 5 인프라 이슈 후보)
- **BLOCKED 분기**: pnpm test가 85 미달 시 BLOCKED, gstack /qa 위임 스크린샷 누락 시 BLOCKED
